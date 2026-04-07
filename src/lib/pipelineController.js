import { ANALYSIS_AGENT_COUNT } from './analysisAgents';
import { buildMarkdownProjectIndex } from './markdownIndex';
import { buildMarkdownProjectGraph } from './projectGraph';
import { runDeterministicRuleEngine } from './ruleEngine/index';
import { createFileBatches, runAnalysisBatch } from './agentMeshRuntime';
import {
  DEFAULT_SESSION_TOKEN_BUDGET,
  RECOMMENDED_BATCH_TARGET_TOKENS,
  BATCH_TOKEN_BUFFER,
  MIN_CHUNK_CHARS,
  normalizeTokenBudget
} from './runtimeConfig';

function buildProjectGraphDiagnostics(projectGraph) {
  const summary = projectGraph?.summary || {};
  const headingGroupCount = summary.headingGroupCount || 0;
  const glossaryTermGroupCount = summary.glossaryTermGroupCount || 0;
  const identifierGroupCount = summary.identifierGroupCount || 0;
  const workflowGroupCount = summary.workflowGroupCount || 0;
  const requirementGroupCount = summary.requirementGroupCount || 0;
  const stateGroupCount = summary.stateGroupCount || 0;
  const apiGroupCount = summary.apiGroupCount || 0;
  const actorGroupCount = summary.actorGroupCount || 0;
  const referenceCount = summary.referenceCount || 0;
  const referenceGroupCount = summary.referenceGroupCount || 0;

  return {
    project_graph_document_count: summary.documentCount || 0,
    project_graph_heading_group_count: headingGroupCount,
    project_graph_glossary_term_group_count: glossaryTermGroupCount,
    project_graph_identifier_group_count: identifierGroupCount,
    project_graph_workflow_group_count: workflowGroupCount,
    project_graph_requirement_group_count: requirementGroupCount,
    project_graph_state_group_count: stateGroupCount,
    project_graph_api_group_count: apiGroupCount,
    project_graph_actor_group_count: actorGroupCount,
    project_graph_reference_count: referenceCount,
    project_graph_reference_group_count: referenceGroupCount,
    project_graph_total_group_count:
      headingGroupCount
      + glossaryTermGroupCount
      + identifierGroupCount
      + workflowGroupCount
      + requirementGroupCount
      + stateGroupCount
      + apiGroupCount
      + actorGroupCount
      + referenceGroupCount
  };
}

export function runIndexingAndProjectGraphStages({
  files,
  diagnostics,
  updateProgressState
}) {
  const markdownIndex = buildMarkdownProjectIndex(files);
  diagnostics.indexed_document_count = markdownIndex.summary.documentCount;
  diagnostics.indexed_heading_count = markdownIndex.summary.headingCount;
  updateProgressState({
    stage: 'indexing',
    totalFiles: files.length,
    indexedFiles: markdownIndex.summary.documentCount,
    message: `Indexed ${markdownIndex.summary.documentCount} documents and ${markdownIndex.summary.headingCount} headings`
  });

  updateProgressState({
    stage: 'project_graph',
    totalFiles: files.length,
    indexedFiles: markdownIndex.summary.documentCount,
    graphDocuments: markdownIndex.summary.documentCount,
    message: 'Building cross-file Markdown project graph'
  });

  const projectGraph = buildMarkdownProjectGraph(files);
  Object.assign(diagnostics, buildProjectGraphDiagnostics(projectGraph));

  updateProgressState({
    stage: 'project_graph',
    totalFiles: files.length,
    indexedFiles: markdownIndex.summary.documentCount,
    graphDocuments: diagnostics.project_graph_document_count,
    graphGroups: diagnostics.project_graph_total_group_count,
    graphReferences: diagnostics.project_graph_reference_count,
    message: `Resolved ${diagnostics.project_graph_total_group_count} graph groups across ${diagnostics.project_graph_document_count} documents`
  });

  return { markdownIndex, projectGraph };
}

export function runDeterministicRuleStage({
  files,
  projectGraph,
  markdownIndex,
  diagnostics,
  updateProgressState
}) {
  updateProgressState({
    stage: 'rule_engine',
    totalFiles: files.length,
    indexedFiles: markdownIndex.summary.documentCount,
    graphDocuments: diagnostics.project_graph_document_count,
    graphGroups: diagnostics.project_graph_total_group_count,
    graphReferences: diagnostics.project_graph_reference_count,
    message: 'Running deterministic subcategory-aware rules'
  });

  const deterministicRuleResult = runDeterministicRuleEngine({ files, projectGraph, diagnostics });

  updateProgressState({
    stage: 'rule_engine',
    totalFiles: files.length,
    indexedFiles: markdownIndex.summary.documentCount,
    graphDocuments: diagnostics.project_graph_document_count,
    graphGroups: diagnostics.project_graph_total_group_count,
    graphReferences: diagnostics.project_graph_reference_count,
    deterministicRuleIssues: deterministicRuleResult.issues.length,
    deterministicRuleRuns: diagnostics.deterministic_rule_runs || 1,
    message: `Deterministic rules emitted ${deterministicRuleResult.issues.length} findings`
  });

  return deterministicRuleResult;
}

export async function runAgentMeshStage({
  files,
  config,
  diagnostics,
  markdownIndex,
  projectGraph,
  deterministicRuleResult,
  agentPromptEntries,
  maxSystemTokens,
  estimateTokens,
  updateProgressState,
  callAPI
}) {
  const reusedCount = 0;
  const reanalyzedCount = files.length;
  const filesToAnalyze = [...files];
  const finalBatchResults = [];
  const analysisMeshRuns = [];
  const batches = createFileBatches(filesToAnalyze, {
    recommendedBatchTargetTokens: RECOMMENDED_BATCH_TARGET_TOKENS,
    maxSystemTokens,
    batchTokenBuffer: BATCH_TOKEN_BUFFER,
    minChunkChars: MIN_CHUNK_CHARS
  });
  const totalAgentPasses = Math.max(batches.length * ANALYSIS_AGENT_COUNT, 0);
  let completedAgentPasses = 0;

  if (filesToAnalyze.length > 0) {
    const { total } = estimateTokens(filesToAnalyze);
    const sessionTokenBudget = normalizeTokenBudget(config.tokenBudget || DEFAULT_SESSION_TOKEN_BUDGET);
    if (sessionTokenBudget && total > sessionTokenBudget) {
      throw new Error(`Estimated ${total.toLocaleString()} tokens for new files exceeds session budget of ${sessionTokenBudget.toLocaleString()}.`);
    }

    updateProgressState({
      stage: 'agent_mesh',
      totalFiles: files.length,
      indexedFiles: markdownIndex.summary.documentCount,
      totalBatches: batches.length,
      currentBatch: batches.length > 0 ? 1 : 0,
      totalAgentPasses,
      completedAgentPasses: 0,
      deterministicRuleIssues: deterministicRuleResult.issues.length,
      deterministicRuleRuns: diagnostics.deterministic_rule_runs || 1,
      graphDocuments: projectGraph.summary.documentCount,
      graphGroups: diagnostics.project_graph_total_group_count,
      graphReferences: diagnostics.project_graph_reference_count,
      message: 'Running analysis mesh'
    });

    for (let index = 0; index < batches.length; index += 1) {
      const result = await runAnalysisBatch({
        batch: batches[index],
        batchIndex: index,
        totalBatches: batches.length,
        totalAgentPasses,
        diagnostics,
        detectorExecutionReceipts: deterministicRuleResult.summary?.detector_execution_receipts || [],
        agentPromptEntries,
        config,
        callAPI,
        updateProgressState
      });

      completedAgentPasses += result._agentPasses || 0;
      analysisMeshRuns.push(...(result._analysisMeshRuns || []));
      finalBatchResults.push(result);

      updateProgressState({
        stage: 'agent_mesh',
        totalFiles: files.length,
        indexedFiles: markdownIndex.summary.documentCount,
        totalBatches: batches.length,
        currentBatch: index + 1,
        totalAgentPasses,
        completedAgentPasses,
        deterministicRuleIssues: deterministicRuleResult.issues.length,
        deterministicRuleRuns: diagnostics.deterministic_rule_runs || 1,
        graphDocuments: projectGraph.summary.documentCount,
        graphGroups: diagnostics.project_graph_total_group_count,
        graphReferences: diagnostics.project_graph_reference_count,
        message: `Completed batch ${index + 1}/${batches.length}`
      });
    }
  }

  return {
    filesToAnalyze,
    finalBatchResults,
    analysisMeshRuns,
    batches,
    totalAgentPasses,
    completedAgentPasses,
    reusedCount,
    reanalyzedCount
  };
}

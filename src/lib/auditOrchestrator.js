import { ANALYSIS_AGENT_COUNT } from './analysisAgents';
import { compareAudits, createInitialDiagnostics } from './detectorMetadata';
import { finalizeAuditResults } from './resultAggregator';
import {
  runIndexingAndProjectGraphStages,
  runDeterministicRuleStage,
  runAgentMeshStage
} from './pipelineController';
import { createProgressState } from './executionStateController';

export async function runAuditOrchestrator({
  files,
  config,
  capturedPrevious = null,
  agentPromptEntries,
  maxSystemTokens,
  estimateTokens,
  updateProgressState,
  callAPI,
  createDiagnostics = createInitialDiagnostics
}) {
  const diagnostics = createDiagnostics();
  diagnostics.analysis_mesh_agents_configured = ANALYSIS_AGENT_COUNT;

  try {
    const { markdownIndex, projectGraph } = runIndexingAndProjectGraphStages({
      files,
      diagnostics,
      updateProgressState
    });

    const deterministicRuleResult = runDeterministicRuleStage({
      files,
      projectGraph,
      markdownIndex,
      diagnostics,
      updateProgressState
    });

    const agentMeshOutcome = await runAgentMeshStage({
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
    });

    updateProgressState({
      stage: 'merge',
      totalFiles: files.length,
      indexedFiles: markdownIndex.summary.documentCount,
      totalAgentPasses: agentMeshOutcome.totalAgentPasses,
      completedAgentPasses: agentMeshOutcome.completedAgentPasses,
      deterministicRuleIssues: deterministicRuleResult.issues.length,
      deterministicRuleRuns: diagnostics.deterministic_rule_runs || 1,
      graphDocuments: projectGraph.summary.documentCount,
      graphGroups: diagnostics.project_graph_total_group_count,
      graphReferences: diagnostics.project_graph_reference_count,
      message: 'Merging deterministic rules and fresh agent results'
    });

    const merged = finalizeAuditResults({
      finalBatchResults: agentMeshOutcome.finalBatchResults,
      deterministicRuleResult,
      analysisMeshRuns: agentMeshOutcome.analysisMeshRuns,
      markdownIndex,
      projectGraph,
      diagnostics,
      completedAgentPasses: agentMeshOutcome.completedAgentPasses
    });

    updateProgressState({
      stage: 'finalize',
      totalFiles: files.length,
      indexedFiles: markdownIndex.summary.documentCount,
      totalAgentPasses: agentMeshOutcome.totalAgentPasses,
      completedAgentPasses: agentMeshOutcome.completedAgentPasses,
      deterministicRuleIssues: deterministicRuleResult.issues.length,
      deterministicRuleRuns: diagnostics.deterministic_rule_runs || 1,
      proofChainEdges: merged.summary.proof_chain_edges || 0,
      ownedDetectorHits: merged.summary.analysis_mesh_owned_detector_hits || 0,
      checkedOwnedDetectors: merged.summary.analysis_mesh_owned_detector_checked_count || 0,
      cleanOwnedDetectors: merged.summary.analysis_mesh_owned_detector_clean_count || 0,
      untouchedOwnedDetectors: merged.summary.analysis_mesh_owned_detector_untouched_count || 0,
      outOfOwnedScopeIssues: merged.summary.analysis_mesh_out_of_owned_scope_issues || 0,
      graphDocuments: projectGraph.summary.documentCount,
      graphGroups: diagnostics.project_graph_total_group_count,
      graphReferences: diagnostics.project_graph_reference_count,
      message: `Finalized ${merged.summary.total} issues with ${merged.root_causes?.length || 0} root causes`
    });

    return {
      merged,
      diagnostics,
      analysisStats: {
        reused: agentMeshOutcome.reusedCount,
        reanalyzed: agentMeshOutcome.reanalyzedCount,
        agentPasses: agentMeshOutcome.completedAgentPasses
      },
      diffSummary: capturedPrevious ? compareAudits(merged, capturedPrevious) : null
    };
  } catch (error) {
    error.diagnostics = diagnostics;
    error.progressState = createProgressState({
      stage: 'finalize',
      totalFiles: files.length,
      indexedFiles: diagnostics.indexed_document_count,
      graphDocuments: diagnostics.project_graph_document_count,
      graphGroups: diagnostics.project_graph_total_group_count,
      graphReferences: diagnostics.project_graph_reference_count,
      deterministicRuleIssues: diagnostics.deterministic_rule_issue_count,
      deterministicRuleRuns: diagnostics.deterministic_rule_runs,
      ownedDetectorHits: diagnostics.analysis_mesh_owned_detector_hit_count,
      outOfOwnedScopeIssues: diagnostics.analysis_mesh_out_of_owned_scope_issue_count,
      totalAgentPasses: diagnostics.analysis_mesh_agents_configured,
      completedAgentPasses: diagnostics.analysis_mesh_passes_completed,
      message: 'Analysis stopped due to an error'
    });
    throw error;
  }
}

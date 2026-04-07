import { MAX_AGENT_RESPONSE_ATTEMPTS } from './agentMeshRuntime';

export const ANALYSIS_STAGES = [
  { id: 'indexing', label: 'Indexing Markdown' },
  { id: 'project_graph', label: 'Building Project Graph' },
  { id: 'rule_engine', label: 'Running Deterministic Rules' },
  { id: 'agent_mesh', label: 'Running Analysis Mesh' },
  { id: 'merge', label: 'Merging Findings' },
  { id: 'finalize', label: 'Finalizing Results' }
];

export function getProgressStage(stageId) {
  const index = ANALYSIS_STAGES.findIndex((stage) => stage.id === stageId);
  if (index === -1) {
    return {
      id: stageId || 'idle',
      label: 'Idle',
      stageIndex: 0,
      stageCount: ANALYSIS_STAGES.length
    };
  }

  const stage = ANALYSIS_STAGES[index];
  return {
    ...stage,
    stageIndex: index + 1,
    stageCount: ANALYSIS_STAGES.length
  };
}

export function createProgressState(overrides = {}) {
  const stage = getProgressStage(overrides.stage || 'idle');
  const baseState = {
    stage: stage.id,
    stageLabel: stage.label,
    stageIndex: stage.stageIndex,
    stageCount: stage.stageCount,
    totalFiles: 0,
    indexedFiles: 0,
    currentBatch: 0,
    totalBatches: 0,
    filesInCurrentBatch: 0,
    currentAgentId: '',
    currentAgentLabel: '',
    currentAgentOwnedLayers: 0,
    currentAgentOwnedSubcategories: 0,
    currentAgentOwnedDetectors: 0,
    currentAttempt: 0,
    maxAttempts: MAX_AGENT_RESPONSE_ATTEMPTS,
    completedAgentPasses: 0,
    totalAgentPasses: 0,
    deterministicRuleIssues: 0,
    deterministicRuleRuns: 0,
    proofChainEdges: 0,
    ownedDetectorHits: 0,
    checkedOwnedDetectors: 0,
    cleanOwnedDetectors: 0,
    untouchedOwnedDetectors: 0,
    outOfOwnedScopeIssues: 0,
    graphGroups: 0,
    graphDocuments: 0,
    graphReferences: 0,
    message: ''
  };

  return {
    ...baseState,
    ...overrides,
    stage: stage.id,
    stageLabel: stage.label,
    stageIndex: stage.stageIndex,
    stageCount: stage.stageCount
  };
}

export function buildAnalysisStartProgressState(totalFiles = 0) {
  return createProgressState({
    stage: 'indexing',
    totalFiles,
    indexedFiles: 0,
    message: 'Building deterministic Markdown index'
  });
}

export function buildAnalysisErrorProgressState({
  totalFiles = 0,
  diagnostics = {},
  message = 'Analysis stopped due to an error'
} = {}) {
  return createProgressState({
    stage: 'finalize',
    totalFiles,
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
    message
  });
}

const BASE_LAYERS = [
  { id: 'contradiction', label: 'Contradiction & Consistency', color: '#E24B4A', bg: '#FCEBEB', border: '#F09595' },
  { id: 'logical', label: 'Logical Integrity', color: '#A32D2D', bg: '#F7C1C1', border: '#F09595' },
  { id: 'structural', label: 'Structural & Organizational', color: '#BA7517', bg: '#FAEEDA', border: '#FAC775' },
  { id: 'semantic', label: 'Semantic & Clarity', color: '#854F0B', bg: '#FAC775', border: '#EF9F27' },
  { id: 'factual', label: 'Factual & Evidence', color: '#185FA5', bg: '#E6F1FB', border: '#85B7EB' },
  { id: 'functional', label: 'Functional & Practical', color: '#0C447C', bg: '#B5D4F4', border: '#378ADD' },
  { id: 'temporal', label: 'Temporal & State', color: '#3B6D11', bg: '#EAF3DE', border: '#97C459' },
  { id: 'architectural', label: 'Architectural & System Design', color: '#085041', bg: '#9FE1CB', border: '#5DCAA5' },
  { id: 'completeness', label: 'Completeness & Coverage', color: '#534AB7', bg: '#EEEDFE', border: '#AFA9EC' },
  { id: 'intent', label: 'Intent, Goal & Alignment', color: '#3C3489', bg: '#CECBF6', border: '#AFA9EC' },
  { id: 'metacognition', label: 'Meta-Cognition', color: '#5F5E5A', bg: '#F1EFE8', border: '#B4B2A9' },
  { id: 'adversarial', label: 'Adversarial Analysis', color: '#444441', bg: '#D3D1C7', border: '#B4B2A9' },
  { id: 'knowledge_graph', label: 'Knowledge Graph', color: '#993C1D', bg: '#FAECE7', border: '#F0997B' },
  { id: 'quantitative', label: 'Quantitative Reasoning', color: '#712B13', bg: '#F5C4B3', border: '#F0997B' },
  { id: 'requirement', label: 'Requirement Integrity', color: '#E24B4A', bg: '#FCEBEB', border: '#F09595' },
  { id: 'state_machine', label: 'State Machine', color: '#A32D2D', bg: '#F7C1C1', border: '#F09595' },
  { id: 'api_contract', label: 'API Contract', color: '#BA7517', bg: '#FAEEDA', border: '#FAC775' },
  { id: 'dependency_graph', label: 'Dependency Graph', color: '#854F0B', bg: '#FAC775', border: '#EF9F27' },
  { id: 'data_flow', label: 'Data Flow', color: '#185FA5', bg: '#E6F1FB', border: '#85B7EB' },
  { id: 'execution_path', label: 'Execution Path', color: '#0C447C', bg: '#B5D4F4', border: '#378ADD' },
  { id: 'configuration', label: 'Configuration', color: '#3B6D11', bg: '#EAF3DE', border: '#97C459' },
  { id: 'error_handling', label: 'Error Handling', color: '#085041', bg: '#9FE1CB', border: '#5DCAA5' },
  { id: 'security', label: 'Security', color: '#534AB7', bg: '#EEEDFE', border: '#AFA9EC' },
  { id: 'performance', label: 'Performance', color: '#3C3489', bg: '#CECBF6', border: '#AFA9EC' },
  { id: 'testability', label: 'Testability & Verification', color: '#059669', bg: '#D1FAE5', border: '#6EE7B7' },
  { id: 'maintainability', label: 'Maintainability', color: '#7C3AED', bg: '#EDE9FE', border: '#A78BFA' },
  { id: 'usability', label: 'Usability & UX', color: '#DC2626', bg: '#FEE2E2', border: '#FCA5A5' },
  { id: 'interoperability', label: 'Interoperability', color: '#0891B2', bg: '#CFFAFE', border: '#67E8F9' },
  { id: 'governance', label: 'Governance & Compliance', color: '#65A30D', bg: '#ECFCCB', border: '#BEF264' },
  { id: 'resilience', label: 'Resilience & Fault Tolerance', color: '#EA580C', bg: '#FFEDD5', border: '#FDBA74' },
  { id: 'observability', label: 'Observability & Monitoring', color: '#993C1D', bg: '#FAECE7', border: '#F0997B' },
  { id: 'evolution', label: 'Evolution & Future-Proofing', color: '#712B13', bg: '#F5C4B3', border: '#F0997B' },
  { id: 'specification_formalism', label: 'Specification Formalism', color: '#1E3A8A', bg: '#DBEAFE', border: '#93C5FD' },
  { id: 'simulation_verification', label: 'Simulation & Verification', color: '#065F46', bg: '#D1FAE5', border: '#6EE7B7' },
  { id: 'memory_world_model', label: 'Memory & World Model', color: '#701A75', bg: '#FCE7F3', border: '#F9A8D4' },
  { id: 'agent_orchestration', label: 'Agent Orchestration', color: '#9A3412', bg: '#FCE7F3', border: '#F472B6' },
  { id: 'tool_execution_safety', label: 'Tool & Execution Safety', color: '#991B1B', bg: '#FFEDD5', border: '#FDBA74' },
  { id: 'deployment_contract', label: 'Deployment Contract', color: '#166534', bg: '#DCFCE7', border: '#6EE7B7' },
  { id: 'platform_abstraction', label: 'Platform Abstraction', color: '#3730A3', bg: '#E0E7FF', border: '#A5B4FC' },
  { id: 'context_orchestration', label: 'Context Orchestration', color: '#0F766E', bg: '#D1FAE5', border: '#6EE7B7' },
  { id: 'reasoning_integrity', label: 'Reasoning Integrity', color: '#7C3AED', bg: '#F5F3FF', border: '#C4B5FD' },
  { id: 'ui_surface_contract', label: 'UI Surface Contract', color: '#DB2777', bg: '#FDF2F8', border: '#F9A8D4' },
  { id: 'deterministic_execution', label: 'Deterministic Execution', color: '#059669', bg: '#F0FDF4', border: '#6EE7B7' },
  { id: 'control_plane_authority', label: 'Control Plane Authority', color: '#4F46E5', bg: '#EEF2FF', border: '#A5B4FC' },
  { id: 'world_state_governance', label: 'World State Governance', color: '#D97706', bg: '#FFFBEB', border: '#FCD34D' },
  { id: 'ontology_vocabulary_governance', label: 'Ontology & Vocabulary Governance', color: '#9D174D', bg: '#FCE7F3', border: '#F9A8D4' },
  { id: 'workflow_lifecycle_integrity', label: 'Workflow & Lifecycle Integrity', color: '#1D4ED8', bg: '#DBEAFE', border: '#93C5FD' },
  { id: 'authority_path_integrity', label: 'Authority Path Integrity', color: '#7C2D12', bg: '#FFEDD5', border: '#FDBA74' },
  { id: 'artifact_reproducibility', label: 'Artifact Reproducibility', color: '#166534', bg: '#DCFCE7', border: '#86EFAC' },
  { id: 'environment_toolchain_isolation', label: 'Environment & Toolchain Isolation', color: '#0F766E', bg: '#CCFBF1', border: '#5EEAD4' },
  { id: 'knowledge_source_authority', label: 'Knowledge Source Authority', color: '#92400E', bg: '#FEF3C7', border: '#FCD34D' },
  { id: 'failure_recovery_integrity', label: 'Failure Recovery Integrity', color: '#991B1B', bg: '#FEE2E2', border: '#FCA5A5' },
  { id: 'operational_ux_contract', label: 'Operational UX Contract', color: '#6D28D9', bg: '#EDE9FE', border: '#C4B5FD' }
];

export const LAYERS = BASE_LAYERS.map((layer, index) => ({
  ...layer,
  number: index + 1,
  icon: `L${index + 1}`
}));

export const TOTAL_LAYER_COUNT = LAYERS.length;
export const ORDERED_LAYER_IDS = LAYERS.map((layer) => layer.id);
export const LAYER_NUMBER_BY_ID = Object.fromEntries(LAYERS.map((layer) => [layer.id, layer.number]));
export const LAYER_ID_BY_NUMBER = Object.fromEntries(LAYERS.map((layer) => [String(layer.number), layer.id]));

export const SEVERITY_STYLE = {
  critical: { color: '#A32D2D', bg: '#FCEBEB', border: '#F09595', order: 0 },
  high: { color: '#854F0B', bg: '#FAEEDA', border: '#FAC775', order: 1 },
  medium: { color: '#0C447C', bg: '#E6F1FB', border: '#85B7EB', order: 2 },
  low: { color: '#27500A', bg: '#EAF3DE', border: '#97C459', order: 3 }
};

export function getLayerById(id) {
  return LAYERS.find((layer) => layer.id === id) || {
    id,
    label: id,
    number: null,
    icon: '?',
    color: '#888',
    bg: '#333',
    border: '#555'
  };
}

export function getLayerNumber(layerId) {
  return LAYER_NUMBER_BY_ID[layerId] || null;
}

export function getLayerIdByNumber(layerNumber) {
  return LAYER_ID_BY_NUMBER[String(layerNumber)] || null;
}

export function buildLayerRegistryPrompt(layerIds = null) {
  const scopedIds = Array.isArray(layerIds) && layerIds.length > 0 ? new Set(layerIds) : null;
  const scopedLayers = scopedIds ? LAYERS.filter((layer) => scopedIds.has(layer.id)) : LAYERS;
  const lines = scopedLayers.map((layer) => `${layer.number}. ${layer.id} = ${layer.label}`);
  const scopeSuffix = scopedIds ? ` (${scopedLayers.length}/${TOTAL_LAYER_COUNT} in scope)` : '';
  return `LAYER REGISTRY${scopeSuffix}:\n${lines.join('\n')}`;
}

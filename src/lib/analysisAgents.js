export const ANALYSIS_AGENT_MESH = [
  {
    id: 'spec_absoluteness_agent',
    label: 'Spec Absoluteness Agent',
    focusLayers: [
      'semantic',
      'requirement',
      'specification_formalism',
      'ontology_vocabulary_governance',
      'knowledge_source_authority'
    ],
    mission: 'Prioritize specification absoluteness, canonical vocabulary, closed-world validation, and requirement precision.'
  },
  {
    id: 'architecture_authority_agent',
    label: 'Architecture & Authority Agent',
    focusLayers: [
      'architectural',
      'control_plane_authority',
      'authority_path_integrity',
      'platform_abstraction',
      'agent_orchestration'
    ],
    mission: 'Scrutinize authority boundaries, delegation paths, architectural separation, and invalid control/runtime mixing.'
  },
  {
    id: 'ui_operational_agent',
    label: 'UI & Operational UX Agent',
    focusLayers: [
      'ui_surface_contract',
      'usability',
      'operational_ux_contract',
      'workflow_lifecycle_integrity',
      'state_machine'
    ],
    mission: 'Focus on user-visible state integrity, calm-state UX contracts, workflow clarity, and fatal-state exposure.'
  },
  {
    id: 'execution_simulation_agent',
    label: 'Execution & Simulation Agent',
    focusLayers: [
      'execution_path',
      'deterministic_execution',
      'simulation_verification',
      'workflow_lifecycle_integrity',
      'failure_recovery_integrity'
    ],
    mission: 'Stress execution ordering, simulation gates, determinism, retries, and lifecycle no-skip guarantees.'
  },
  {
    id: 'memory_world_state_agent',
    label: 'Memory & World State Agent',
    focusLayers: [
      'memory_world_model',
      'world_state_governance',
      'data_flow',
      'knowledge_graph',
      'authority_path_integrity'
    ],
    mission: 'Prioritize snapshot integrity, mutation-gateway exclusivity, world-state atomicity, and state lineage.'
  },
  {
    id: 'tool_deployment_agent',
    label: 'Tool, Environment & Deployment Agent',
    focusLayers: [
      'tool_execution_safety',
      'deployment_contract',
      'artifact_reproducibility',
      'environment_toolchain_isolation',
      'platform_abstraction'
    ],
    mission: 'Prioritize tool isolation, export determinism, reproducible artifacts, and environment leakage prevention.'
  },
  {
    id: 'reasoning_evidence_agent',
    label: 'Reasoning & Evidence Agent',
    focusLayers: [
      'reasoning_integrity',
      'factual',
      'metacognition',
      'knowledge_source_authority',
      'ontology_vocabulary_governance'
    ],
    mission: 'Scrutinize evidence binding, uncertainty propagation, assumption leakage, and unsupported conclusions.'
  },
  {
    id: 'cross_layer_synthesis_agent',
    label: 'Cross-Layer Synthesis Agent',
    focusLayers: [
      'contradiction',
      'governance',
      'resilience',
      'failure_recovery_integrity',
      'workflow_lifecycle_integrity'
    ],
    mission: 'Correlate root causes across layers, collapse duplicates, and emphasize escalation-worthy cross-layer interactions.'
  }
];

export const ANALYSIS_AGENT_COUNT = ANALYSIS_AGENT_MESH.length;
export const ANALYSIS_MESH_VERSION = 'taxonomy-v2-53x701-a8-universal';

export function getAnalysisAgent(agentId) {
  return ANALYSIS_AGENT_MESH.find((agent) => agent.id === agentId) || null;
}

export function getAnalysisAgentFocusLayers(agentId) {
  const agent = getAnalysisAgent(agentId);
  return agent ? [...agent.focusLayers] : [];
}

export function buildAnalysisAgentPrompt(agentId) {
  const agent = getAnalysisAgent(agentId);
  if (!agent) {
    return `ANALYSIS MESH: Deterministic 8-agent audit mesh enabled. Evaluate the full taxonomy and remain consistent with the canonical merge contract.`;
  }

  return `ANALYSIS MESH ROLE: ${agent.label}
Focus layers: ${agent.focusLayers.join(', ')}
Mission: ${agent.mission}
Execution rule: Evaluate the full taxonomy, but apply extra scrutiny, correlation depth, and evidence discipline to the focus layers above.
Traceability rule: Tag every emitted issue with analysis_agent="${agent.id}".`;
}

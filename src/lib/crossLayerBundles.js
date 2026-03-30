export const CROSS_LAYER_BUNDLES = [
  {
    id: 'security_data_governance',
    name: 'Security, Data Flow & Governance',
    layers: ['security', 'data_flow', 'governance'],
    description: 'Evaluates the lifecycle of sensitive data from entry to storage, ensuring trust boundaries and compliance policies are met.',
    escalation_rule: 'If an issue touches PII or credentials across these layers, escalate to High/Critical.'
  },
  {
    id: 'functional_execution',
    name: 'Functional, Completeness & Execution Path',
    layers: ['functional', 'completeness', 'execution_path'],
    description: 'Verifies that workflows are logically complete, all preconditions are met, and dead ends are avoided.',
    escalation_rule: 'If a workflow is documented but functionally impossible or misses a critical branch, escalate to High.'
  },
  {
    id: 'architecture_dependencies',
    name: 'Architectural, Dependencies & Interoperability',
    layers: ['architectural', 'dependency_graph', 'interoperability'],
    description: 'Analyzes system boundaries, external contracts, and the graph of internal/external dependencies.',
    escalation_rule: 'If a dependency conflict breaks a stated architectural boundary or interoperability protocol, escalate to High.'
  },
  {
    id: 'config_resilience',
    name: 'Configuration, Error Handling & Resilience',
    layers: ['configuration', 'error_handling', 'resilience'],
    description: 'Checks how the system handles misconfiguration, partial failures, and recovery strategies.',
    escalation_rule: 'If an error path lacks a fallback or misconfiguration leads to silent failure, escalate to High.'
  },
  {
    id: 'observability_performance',
    name: 'Observability, Resilience & Performance',
    layers: ['observability', 'resilience', 'performance'],
    description: 'Ensures the system can be monitored under load and degrades gracefully without catastrophic resource exhaustion.',
    escalation_rule: 'If a performance bottleneck lacks observability or breaks resilience guarantees, escalate to Critical.'
  },
  {
    id: 'requirements_testability',
    name: 'Requirement, Testability & Maintainability',
    layers: ['requirement', 'testability', 'maintainability'],
    description: 'Validates that requirements are clear, verifiable, and implemented in a way that avoids technical debt.',
    escalation_rule: 'If a core requirement is unverifiable or heavily couples distinct modules, flag as Medium/High.'
  },
  {
    id: 'tool_safety_agent_governance',
    name: 'Tool Safety, Agent Orchestration & Governance',
    layers: ['tool_execution_safety', 'agent_orchestration', 'governance'],
    description: 'Evaluates whether tool invocations respect agent authority boundaries and governance enforcement paths.',
    escalation_rule: 'If a tool bypasses agent authority or governance checkpoint, escalate to Critical.'
  },
  {
    id: 'world_state_memory',
    name: 'World State, Memory & PSG Invariants',
    layers: ['world_state_governance', 'memory_world_model', 'specification_formalism'],
    description: 'Validates that world state mutations go through the PSG gateway, are bound to commit hashes, and respect snapshot isolation.',
    escalation_rule: 'If a direct state write bypasses the PSG gateway or violates snapshot isolation, escalate to Critical.'
  },
  {
    id: 'control_plane_architecture',
    name: 'Control Plane, Architectural & Governance',
    layers: ['control_plane_authority', 'architectural', 'governance'],
    description: 'Verifies that control plane authority is properly separated from data plane and that governance enforces the separation.',
    escalation_rule: 'If UI or data-plane directly modifies control-plane configuration, escalate to Critical.'
  },
  {
    id: 'reasoning_metacognition',
    name: 'Reasoning Integrity & Metacognition',
    layers: ['reasoning_integrity', 'metacognition', 'adversarial'],
    description: 'Checks that reasoning traces are evidence-bound, uncertainty is propagated, and self-correction loops are bounded.',
    escalation_rule: 'If a reasoning chain has unbound evidence or unbounded self-correction, escalate to High.'
  },
  {
    id: 'ui_state_usability',
    name: 'UI Surface Contract, State Machine & Usability',
    layers: ['ui_surface_contract', 'state_machine', 'usability'],
    description: 'Validates that UI components map correctly to system states, fatal states are not exposed, and mandatory components exist.',
    escalation_rule: 'If a fatal system state is exposed in the UI or a mandatory component is missing, escalate to High/Critical.'
  },
  {
    id: 'deterministic_execution_resilience',
    name: 'Deterministic Execution, Resilience & Error Handling',
    layers: ['deterministic_execution', 'resilience', 'error_handling'],
    description: 'Ensures execution is deterministic, retry policies are bounded, and error recovery paths are defined.',
    escalation_rule: 'If scheduling non-determinism or deadlock risk combines with missing error recovery, escalate to Critical.'
  },
  {
    id: 'deployment_platform',
    name: 'Deployment Contract & Platform Abstraction',
    layers: ['deployment_contract', 'platform_abstraction', 'interoperability'],
    description: 'Verifies that local export contracts are enforced, platform targets are locked, and cross-platform behavior is consistent.',
    escalation_rule: 'If remote deployment is required for a local system or platform exclusion is violated, escalate to Critical.'
  }
];

export function getCrossLayerBundlesPrompt() {
  let prompt = `CROSS-LAYER BUNDLES (Use for correlation and escalation):\n`;
  CROSS_LAYER_BUNDLES.forEach(bundle => {
    prompt += `- ${bundle.name} (${bundle.layers.join(' + ')}): ${bundle.description} ${bundle.escalation_rule}\n`;
  });
  return prompt;
}

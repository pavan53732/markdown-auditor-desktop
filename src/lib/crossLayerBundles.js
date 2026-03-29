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
  }
];

export function getCrossLayerBundlesPrompt() {
  let prompt = `CROSS-LAYER BUNDLES (Use for correlation and escalation):\n`;
  CROSS_LAYER_BUNDLES.forEach(bundle => {
    prompt += `- ${bundle.name} (${bundle.layers.join(' + ')}): ${bundle.description} ${bundle.escalation_rule}\n`;
  });
  return prompt;
}

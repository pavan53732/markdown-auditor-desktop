export const DOMAIN_PROFILES = {
  auto: {
    id: 'auto',
    label: 'Auto (Default)',
    description: 'General-purpose evaluation balanced for clarity, consistency, and structure.',
    emphasis: ['contradiction', 'logical', 'structural', 'semantic', 'factual']
  },
  prd: {
    id: 'prd',
    label: 'Product Requirements Document (PRD)',
    description: 'Focuses on user intent, business goals, and measurable acceptance criteria.',
    emphasis: ['intent', 'requirement', 'completeness', 'factual', 'usability']
  },
  api_docs: {
    id: 'api_docs',
    label: 'API Documentation',
    description: 'Strict validation of API contracts, data flow, error handling, and security.',
    emphasis: ['api_contract', 'data_flow', 'error_handling', 'security', 'functional']
  },
  runbook: {
    id: 'runbook',
    label: 'Runbook / SOP',
    description: 'Prioritizes execution paths, temporal sequences, observability, and resilience.',
    emphasis: ['execution_path', 'temporal', 'observability', 'resilience', 'functional']
  },
  architecture_doc: {
    id: 'architecture_doc',
    label: 'Architecture Document',
    description: 'Evaluates structural dependencies, component boundaries, and non-functional requirements.',
    emphasis: ['architectural', 'dependency_graph', 'performance', 'evolution', 'maintainability']
  },
  compliance_doc: {
    id: 'compliance_doc',
    label: 'Compliance & Governance',
    description: 'Focuses on policy traceability, security, data flow, and auditability.',
    emphasis: ['governance', 'security', 'data_flow', 'factual', 'requirement']
  },
  onboarding_doc: {
    id: 'onboarding_doc',
    label: 'Onboarding Document',
    description: 'Evaluates readability, task order, cognitive load, and missing prerequisites.',
    emphasis: ['usability', 'structural', 'semantic', 'functional', 'knowledge_graph']
  }
};

export function getDomainProfilePrompt(profileId) {
  const profile = DOMAIN_PROFILES[profileId] || DOMAIN_PROFILES.auto;
  return `DOMAIN PROFILE: ${profile.label}
Description: ${profile.description}
Emphasis Layers: ${profile.emphasis.join(', ')}
Instruction: Prioritize your analysis and adjust your severity thresholds based on this profile's goals. Issues in the emphasis layers should be scrutinized more deeply.`;
}

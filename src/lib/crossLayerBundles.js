export const CROSS_LAYER_BUNDLES = [
  {
    id: 'security_data_governance',
    name: 'Security, Data Flow & Governance',
    layers: ['security', 'data_flow', 'governance'],
    description: 'Evaluates the lifecycle of sensitive data from entry to storage, ensuring trust boundaries and compliance policies are met.',
    escalation_rule: 'Escalate to CRITICAL if a trust-boundary gap (L23) coincides with missing PII handling rules (L19) or governance bypass (L29).'
  },
  {
    id: 'execution_safety_resilience',
    name: 'Execution Safety & System Resilience',
    layers: ['execution_path', 'error_handling', 'resilience', 'tool_execution_safety'],
    description: 'Audits the reliability of automated workflows, ensuring safe recovery from failure and prevention of state corruption.',
    escalation_rule: 'Escalate to CRITICAL if a missing rollback path (L20) exists alongside non-idempotent retry risk (L30) or sandbox breach (L37).'
  },
  {
    id: 'architectural_determinism',
    name: 'Architectural Integrity & Determinism',
    layers: ['architectural', 'state_machine', 'deterministic_execution', 'control_plane_authority'],
    description: 'Verifies the core system design, looking for race conditions, deadlock risks, and authority confusion.',
    escalation_rule: 'Escalate to CRITICAL if control-plane authority confusion (L44) occurs in a non-deterministic execution environment (L43).'
  },
  {
    id: 'world_state_governance_memory',
    name: 'World State Governance & Memory',
    layers: ['world_state_governance', 'memory_world_model', 'data_flow'],
    description: 'Ensures the integrity of the system world model, focusing on atomic updates, snapshot isolation, and PSG exclusivity.',
    escalation_rule: 'Escalate to CRITICAL if state mutation gateway bypass (L45) is detected alongside snapshot isolation gaps (L35).'
  },
  {
    id: 'spec_formalism_completeness',
    name: 'Specification Formalism & Completeness',
    layers: ['specification_formalism', 'completeness', 'requirement'],
    description: 'Audits the rigor of the specification itself, looking for undefined behavior, input domain non-closure, and vocabulary drift.',
    escalation_rule: 'Escalate to HIGH if input domain non-closure (L33) leaves major requirements (L15) undefined or unverifiable.'
  },
  {
    id: 'ui_usability_contract',
    name: 'UI Surface Contract & Usability',
    layers: ['ui_surface_contract', 'usability', 'state_machine'],
    description: 'Verifies that the user interface correctly reflects system state and provides a safe, deterministic user experience.',
    escalation_rule: 'Escalate to HIGH if a mandatory UI component is missing (L42) or if UI state mapping (L42) leads to a fatal state (L16).'
  },
  {
    id: 'platform_deployment_contract',
    name: 'Platform & Deployment Contracts',
    layers: ['platform_abstraction', 'deployment_contract', 'configuration'],
    description: 'Audits the boundary between the system and its environment, focusing on local-run capabilities and platform isolation.',
    escalation_rule: 'Escalate to CRITICAL if a remote deployment requirement (L38) violates a platform-neutral architecture (L39) or local-only constraint.'
  },
  {
    id: 'reasoning_logical_integrity',
    name: 'Reasoning Integrity & Logical Flow',
    layers: ['reasoning_integrity', 'logical', 'contradiction', 'factual'],
    description: 'Audits the internal logic of the document, ensuring evidence-based reasoning, uncertainty propagation, and global consistency.',
    escalation_rule: 'Escalate to HIGH if an evidence binding gap (L41) allows a factual contradiction (L1) to persist in the reasoning chain.'
  },
  {
    id: 'temporal_causality_flow',
    name: 'Temporal Flow & Causality',
    layers: ['temporal', 'execution_path', 'state_machine'],
    description: 'Verifies the timeline of events and causal relationships between system actions, ensuring no temporal violations.',
    escalation_rule: 'Escalate to CRITICAL if a temporal causality violation (L7) is detected in a critical execution path (L20).'
  },
  {
    id: 'agent_orchestration_safety',
    name: 'Agent Orchestration & Tool Safety',
    layers: ['agent_orchestration', 'tool_execution_safety', 'control_plane_authority'],
    description: 'Audits the interaction between autonomous agents and external tools, ensuring strict authority boundaries and safe invocation.',
    escalation_rule: 'Escalate to CRITICAL if unauthorized agent writes (L36) occur through unsafe tool execution paths (L37).'
  },
  {
    id: 'observability_performance',
    name: 'Observability & Performance Integrity',
    layers: ['observability', 'performance', 'resilience'],
    description: 'Ensures the system can be monitored under load and degrades gracefully without catastrophic resource exhaustion.',
    escalation_rule: 'Escalate to CRITICAL if a performance bottleneck (L24) lacks observability coverage (L31) or breaks resilience SLAs (L30).'
  },
  {
    id: 'state_machine_determinism',
    name: 'State Machine & Execution Determinism',
    layers: ['state_machine', 'deterministic_execution', 'temporal'],
    description: 'Audits the consistency of state transitions against temporal causality and deterministic execution rules.',
    escalation_rule: 'Escalate to CRITICAL if non-deterministic transitions (L16) occur within a time-sensitive execution path (L7).'
  },
  {
    id: 'governance_authority_delegation',
    name: 'Governance & Authority Delegation',
    layers: ['governance', 'control_plane_authority', 'architectural'],
    description: 'Evaluates how authority is delegated and enforced across architectural boundaries.',
    escalation_rule: 'Escalate to CRITICAL if authority delegation ambiguity (L44) allows for governance bypass paths (L29).'
  },
  {
    id: 'deployment_platform_isolation',
    name: 'Deployment & Platform Isolation',
    layers: ['deployment_contract', 'platform_abstraction', 'tool_execution_safety'],
    description: 'Audits the safety of tool execution within platform-specific deployment environments.',
    escalation_rule: 'Escalate to CRITICAL if platform exclusion violations (L39) occur through unsafe tool paths (L37) in a deployment package (L38).'
  },
  {
    id: 'memory_consistency_data_flow',
    name: 'Memory Consistency & Data Provenance',
    layers: ['memory_world_model', 'data_flow', 'world_state_governance'],
    description: 'Verifies the lineage and consistency of data as it moves through the world model and state governance layers.',
    escalation_rule: 'Escalate to CRITICAL if data provenance gaps (L19) coincide with memory temporal inconsistency (L35) or invariant breaches (L45).'
  },
  {
    id: 'usability_accessibility_contract',
    name: 'UX Accessibility & Interface Contract',
    layers: ['usability', 'ui_surface_contract', 'functional'],
    description: 'Ensures the user interface fulfills its functional contract while adhering to accessibility and cognitive load standards.',
    escalation_rule: 'Escalate to HIGH if UI-to-system state mapping gaps (L42) prevent users from completing critical functional workflows (L6).'
  },
  {
    id: 'reasoning_trace_integrity',
    name: 'Reasoning Trace & Evidence Integrity',
    layers: ['reasoning_integrity', 'specification_formalism', 'metacognition'],
    description: 'Audits the enforceability of reasoning traces against the formal specification and metacognitive tradeoff analysis.',
    escalation_rule: 'Escalate to HIGH if unenforceable reasoning traces (L41) depend on unstated specification assumptions (L33).'
  }
];

export function getCrossLayerBundlesPrompt() {
  let prompt = `CROSS-LAYER BUNDLES (Use for correlation and escalation):\n`;
  CROSS_LAYER_BUNDLES.forEach(bundle => {
    prompt += `- ${bundle.name} (${bundle.layers.join(' + ')}): ${bundle.description} ${bundle.escalation_rule}\n`;
  });
  return prompt;
}

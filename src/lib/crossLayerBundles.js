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
    escalation_rule: 'Escalate to CRITICAL if state mutation gateway bypass (L45) is detected alongside snapshot isolation gaps (L35) or data flow invariant violations (L19) that corrupt world model state.'
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
  },
  {
    id: 'simulation_governance_determinism',
    name: 'Simulation, Governance & Deterministic Execution',
    layers: ['simulation_verification', 'governance', 'deterministic_execution'],
    description: 'Ensures simulation gates are enforced deterministically with proper governance oversight and post-simulation validation.',
    escalation_rule: 'Escalate to CRITICAL if simulation gate omission (L34) coincides with governance bypass path (L29) in a deterministic execution context (L43). Escalate to CRITICAL if simulation results contradict governance constraints without explicit override justification or rollback plan.'
  },
  {
    id: 'control_plane_architectural_execution',
    name: 'Control Plane Authority & Architectural Execution',
    layers: ['control_plane_authority', 'architectural', 'execution_path'],
    description: 'Verifies control-plane authority is properly delegated across architectural boundaries and execution paths.',
    escalation_rule: 'Escalate to CRITICAL if control-plane separation breach (L44) enables unauthorized execution path access (L20) through architectural boundary leaks (L8). Escalate to CRITICAL if control plane decisions conflict with execution path requirements, creating authority ambiguity that could lead to unsafe state transitions.'
  },
  {
    id: 'tool_safety_deployment_platform',
    name: 'Tool Execution Safety & Deployment Platform',
    layers: ['tool_execution_safety', 'deployment_contract', 'platform_abstraction'],
    description: 'Audits tool execution safety within deployment contracts and platform abstraction boundaries.',
    escalation_rule: 'Escalate to CRITICAL if sandbox isolation breach (L37) occurs alongside remote deployment violation (L38) with platform abstraction leakage (L39). Escalate to CRITICAL if tool side-effects leak through platform abstraction, violating deployment contract isolation guarantees.'
  },
  {
    id: 'reasoning_contradiction_metacognition',
    name: 'Reasoning Integrity, Contradiction & Metacognition',
    layers: ['reasoning_integrity', 'contradiction', 'factual', 'metacognition'],
    description: 'Ensures reasoning integrity by detecting contradictions, factual gaps, and metacognitive failures in evidence chains.',
    escalation_rule: 'Escalate to HIGH if evidence-free escalation (L41) coincides with factual contradiction (L1) and unverifiable metacognitive claims (L11). Escalate to CRITICAL if reasoning contradicts established facts without explicit acknowledgment or uncertainty propagation.'
  },
  {
    id: 'ui_state_machine_usability',
    name: 'UI Surface Contract & State Machine Usability',
    layers: ['ui_surface_contract', 'state_machine', 'usability'],
    description: 'Verifies UI surface contracts align with state machine transitions and usability requirements.',
    escalation_rule: 'Escalate to HIGH if UI fatal-state exposure (L42) coincides with fatal-state state machine exposure (L16) and usability feedback gaps (L27). Escalate to CRITICAL if UI states expose fatal error conditions to users without safe recovery paths or clear error communication.'
  },
  {
    id: 'agent_memory_coordination',
    name: 'Agent Memory Coordination',
    layers: ['agent_orchestration', 'memory_world_model'],
    description: 'Ensures agent coordination relies on consistent world model state, preventing decisions based on stale or conflicting memory.',
    escalation_rule: 'Escalate to CRITICAL if agent orchestration decisions (L36) are based on inconsistent or stale world model state (L35), leading to coordination failures or conflicting actions.'
  },
  {
    id: 'context_orchestration_execution',
    name: 'Context Orchestration & Execution Path',
    layers: ['context_orchestration', 'execution_path'],
    description: 'Verifies context boundaries align with execution requirements, preventing context contamination or execution leakage.',
    escalation_rule: 'Escalate to CRITICAL if context orchestration boundaries (L41) conflict with execution path requirements (L20), causing context contamination or unauthorized cross-context execution.'
  },
  {
    id: 'deployment_resilience_contract',
    name: 'Deployment Resilience Contract',
    layers: ['deployment_contract', 'resilience'],
    description: 'Ensures deployment constraints do not undermine system resilience guarantees such as retry budgets, circuit breakers, and graceful degradation.',
    escalation_rule: 'Escalate to CRITICAL if deployment contract constraints (L38) undermine resilience guarantees (L30), such as insufficient retry budgets, missing circuit breakers, or inability to degrade gracefully under deployment-imposed resource limits.'
  },
  {
    id: 'vocabulary_reasoning_authority',
    name: 'Vocabulary, Reasoning & Source Authority',
    layers: ['ontology_vocabulary_governance', 'specification_formalism', 'reasoning_integrity', 'knowledge_source_authority'],
    description: 'Verifies canonical vocabulary, formal specification rigor, evidence binding, and source-of-truth ranking operate as one coherent contract.',
    escalation_rule: 'Escalate to HIGH if vocabulary drift (L46) or undefined terms (L33/L4) cause evidence-free reasoning (L41) or authority inversion in the accepted source set (L51).'
  },
  {
    id: 'workflow_execution_recovery',
    name: 'Workflow, Execution & Recovery',
    layers: ['workflow_lifecycle_integrity', 'execution_path', 'deterministic_execution', 'failure_recovery_integrity'],
    description: 'Audits step ordering, no-skip guarantees, deterministic execution, and bounded recovery when workflow contracts fail.',
    escalation_rule: 'Escalate to CRITICAL if a no-skip workflow breach (L47) combines with non-deterministic execution (L43) or unbounded recovery loops (L52).'
  },
  {
    id: 'authority_governance_world_state',
    name: 'Authority, Governance & World State',
    layers: ['authority_path_integrity', 'control_plane_authority', 'governance', 'world_state_governance'],
    description: 'Ensures authority paths, governance checkpoints, and world-state mutation boundaries cannot be bypassed or duplicated.',
    escalation_rule: 'Escalate to CRITICAL if duplicated authority paths (L48) or governance bypass (L29) can mutate world state outside the canonical gateway (L45).'
  },
  {
    id: 'artifact_environment_deployment',
    name: 'Artifacts, Environment & Deployment',
    layers: ['artifact_reproducibility', 'environment_toolchain_isolation', 'deployment_contract', 'tool_execution_safety'],
    description: 'Verifies reproducible artifacts depend on isolated toolchains, safe tools, and deterministic deployment/export contracts.',
    escalation_rule: 'Escalate to CRITICAL if host-environment leakage (L50) or unsafe tools (L37) make deployment artifacts non-reproducible (L49) or violate export constraints (L38).'
  },
  {
    id: 'knowledge_memory_context',
    name: 'Knowledge, Memory & Context',
    layers: ['knowledge_source_authority', 'memory_world_model', 'context_orchestration', 'reasoning_integrity'],
    description: 'Ensures retrieved context, memory, and evidence originate from ranked sources and remain valid inside the reasoning flow.',
    escalation_rule: 'Escalate to HIGH if stale memory or context contamination (L40/L35) overrides higher-authority evidence sources (L51) or corrupts reasoning traces (L41).'
  },
  {
    id: 'operational_ui_surface',
    name: 'Operational UX & Surface Contracts',
    layers: ['operational_ux_contract', 'ui_surface_contract', 'usability', 'state_machine'],
    description: 'Checks whether the user-facing surface projects safe operational state, hides forbidden raw internals, and preserves actionable recovery UX.',
    escalation_rule: 'Escalate to HIGH if operational UX contracts (L53) expose fatal UI states (L42/L16) or degrade usability in critical flows (L27).'
  }
];

export function getCrossLayerBundlesPrompt(options = {}) {
  const { layerIds = null } = options;
  const scopedLayers = Array.isArray(layerIds) && layerIds.length > 0 ? new Set(layerIds) : null;
  const bundles = scopedLayers
    ? CROSS_LAYER_BUNDLES.filter((bundle) => bundle.layers.some((layerId) => scopedLayers.has(layerId)))
    : CROSS_LAYER_BUNDLES;

  let prompt = `CROSS-LAYER BUNDLES (Use for correlation and escalation): ${bundles.length}/${CROSS_LAYER_BUNDLES.length} bundles in scope.\n`;
  bundles.forEach((bundle) => {
    prompt += `- ${bundle.name} (${bundle.layers.join(' + ')}): ${bundle.description} ${bundle.escalation_rule}\n`;
  });

  if (scopedLayers) {
    prompt += `Scoped bundle note: bundles outside the active focus layers are omitted here but still apply during final cross-layer synthesis when evidence supports them.\n`;
  }

  return prompt;
}

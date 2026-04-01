export const LAYER_SUBCATEGORIES = {
  contradiction: ['direct conflicts', 'configuration precedence conflicts', 'version drift', 'terminology drift', 'state-logic contradiction', 'diagram-text mismatch'],
  logical: ['invalid assumptions', 'causality gaps', 'circular reasoning', 'scope leaps', 'invariant violation logic', 'logic-state mismatch'],
  structural: ['broken hierarchy', 'orphan sections', 'duplicate sections', 'missing prerequisites', 'execution-path gaps', 'undocumented flow'],
  semantic: ['semantic ambiguity', 'vague quantifiers', 'undefined terms', 'overloaded terms', 'ambiguous references', 'terminology registry gaps', 'forbidden-term violations', 'interpretation leakage', 'canonical vocabulary drift', 'symbol ambiguity', 'type ambiguity', 'semantic drift detection', 'interpretation consistency'],
  factual: ['unsupported claims', 'citation gaps', 'stale-vs-citation distinction', 'norm-vs-description confusion', 'stale facts', 'misinterpreted data'],
  functional: ['impossible workflows', 'incomplete procedures', 'hidden prerequisites', 'structural missing-prerequisite cases', 'missing outcomes', 'workflow dead-end'],
  temporal: ['sequence conflicts', 'lifecycle drift', 'stale timelines', 'invalid timing windows', 'async race conditions', 'temporal causality violation'],
  architectural: ['responsibility overlap', 'missing components', 'boundary leaks', 'topology inconsistency', 'cross-system boundary gaps', 'control-plane/data-plane separation', 'data-plane isolation', 'subsystem-to-UI mapping gaps', 'internal-visible boundary leakage', 'hidden execution authority', 'control-plane/runtime authority confusion', 'cross-system interface mismatch', 'arbitration ambiguity', 'agent role overlap'],
  completeness: ['missing edge cases', 'missing branches', 'missing postconditions', 'missing rollback', 'outcome omission', 'execution-path gaps'],
  intent: ['scope creep', 'business-vs-implementation mismatch', 'goal drift', 'audience mismatch', 'objective ambiguity', 'implicit requirement gaps'],
  metacognition: ['unverifiable conclusions', 'shallow tradeoff analysis', 'overconfidence', 'unjustified certainty', 'ambiguous certainty', 'reasoning chain gap', 'unverifiable claims'],
  adversarial: ['risky defaults', 'bypass scenarios', 'abuse paths', 'misuse opportunities', 'threat-model gaps', 'collusion risk'],
  knowledge_graph: ['orphan entities', 'relationship gaps', 'circular references', 'alias drift', 'role confusion', 'entity attribute drift'],
  quantitative: ['numeric inconsistency', 'unit mismatch', 'vague measurements', 'impossible thresholds', 'scaling boundary ambiguity', 'precision mismatch'],
  requirement: ['ambiguous acceptance criteria', 'traceability gaps', 'closed-world violations', 'undefined obligations', 'RFC2119 misuse', 'priority ambiguity', 'implicit dependencies', 'spec completeness', 'contract incompleteness', 'acceptance-proof gaps', 'acceptance criteria omission', 'requirement stability', 'requirement evolution tracking', 'requirement conflict resolution'],
  state_machine: ['impossible transitions', 'missing terminal states', 'retry loops', 'fatal-state exposure', 'no-exit loops', 'concurrency conflicts', 'dead-end states', 'lifecycle-state gaps', 'transition illegality', 'progression-order violations', 'non-deterministic transition', 'deadlock/livelock risks', 'fatal UI state exposure'],
  api_contract: ['schema mismatch', 'error-contract omissions', 'auth ambiguity', 'idempotency gaps', 'backward-compatibility breaks', 'rate-limit ambiguity'],
  dependency_graph: ['circular dependencies', 'undeclared dependencies', 'version conflicts', 'ownership ambiguity', 'transitive mismatches', 'dependency lifecycle gap'],
  data_flow: ['source-sink mismatch', 'missing transformations', 'retention ambiguity', 'PII flow gaps', 'data-lifecycle gaps', 'data provenance gap'],
  execution_path: ['unreachable paths', 'branch omissions', 'dead ends', 'rollback path gaps', 'execution-path gaps', 'non-deterministic execution', 'path dependency cycles', 'rollback path absence', 'idempotency gaps', 'execution order determinism', 'path state preservation', 'conditional execution determinism', 'execution branching logic'],
  configuration: ['default ambiguity', 'precedence conflicts', 'env drift', 'secret-handling errors', 'config schema gap', 'configuration precedence conflicts'],
  error_handling: ['missing recovery', 'unclear operator actions', 'retry storms', 'error state contamination', 'partial-failure gaps', 'error-handling recovery ambiguity'],
  security: ['secret exposure', 'authz ambiguity', 'trust-boundary gaps', 'unsafe input handling', 'crypto-lifecycle gaps', 'privilege escalation path'],
  performance: ['unbounded work', 'large-document cost blowups', 'expensive retries', 'resource-leak ambiguity', 'concurrency bottleneck', 'scale assumptions'],
  testability: ['unverifiable conclusions', 'test-environment drift', 'weak expected outputs', 'validation blind spots', 'missing examples', 'test isolation failure', 'unverifiable claims'],
  maintainability: ['duplication', 'missing conventions', 'brittle coupling', 'technical-debt ambiguity', 'refactoring risk', 'hidden ownership', 'hidden ownership detail'],
  usability: ['jargon overload', 'poor examples', 'confusing task order', 'accessibility/readability issues', 'cognitive-load gaps', 'missing mandatory UI components', 'fatal UI state exposure', 'UI feedback gap', 'UI state machine correctness', 'UI-state mapping', 'mandatory UI surface gaps', 'UI interactivity gaps', 'exposed fatal-state UX violations'],
  interoperability: ['format assumptions', 'protocol mismatch', 'backward-compatibility gaps', 'integration ambiguity', 'interoperability compatibility mismatches', 'schema version mismatch', 'integration ambiguity detail'],
  governance: ['policy traceability', 'approval gates', 'auditability', 'retention/compliance gaps', 'compliance-scope ambiguity', 'fail-safe condition ambiguity', 'override ambiguity', 'policy-priority conflicts', 'checkpoint omissions', 'governance bypass path', 'enforcement-path gaps', 'governance checkpoint gaps', 'PSG mutation bypass', 'missing commit-hash binding', 'unauthorized agent writes'],
  resilience: ['single points of failure', 'backup/restore gaps', 'degraded-mode gaps', 'failover-ambiguity', 'rollback infeasibility', 'fail-safe absence', 'non-idempotent retries', 'state recovery indeterminism', 'emergency recovery ambiguity', 'outage handling', 'recovery journal gaps', 'simulation gate omissions', 'simulation mutation risk', 'outage handling detail'],
  observability: ['missing logs', 'metrics gaps', 'tracing gaps', 'correlation IDs and alert-threshold gaps', 'blind-spot gaps', 'observability blind spot'],
  evolution: ['versioning gaps', 'evolution/versioning migration scenarios', 'deprecation policy gaps', 'compatibility promises', 'migration gaps', 'migration gap detail'],
  specification_formalism: ['input domain closure', 'canonical vocabulary enforcement', 'state-space definition', 'output contract determinism', 'spec completeness', 'terminology registry', 'type/entity rigor', 'symbol consistency', 'symbol consistency violation', 'formal terminology registry enforcement', 'input/output contract determinism'],
  simulation_verification: ['mandatory simulation', 'simulation non-mutation', 'pre-simulation governance', 'verification completeness', 'risk classification', 'light-vs-heavy simulation correctness', 'formal verification boundary', 'verification completeness', 'simulation gate omission', 'post-simulation governance', 'simulation result validation', 'simulation scope completeness'],
  memory_world_model: ['temporal consistency', 'PSG mutation gateway exclusivity', 'PSG snapshot isolation', 'PSG commit binding', 'memory conflict resolution', 'read/write authority', 'snapshot/version invariants', 'PSG write atomicity', 'memory taxonomy', 'garbage collection determinism', 'PSG read consistency', 'memory temporal inconsistency', 'audit trail requirements'],
  agent_orchestration: ['role non-overlap', 'agent I/O contracts', 'communication protocol', 'arbitration strategy', 'failure isolation', 'composability', 'authority boundaries', 'agent mutation prohibitions', 'unauthorized agent writes', 'arbitration ambiguity', 'agent_coordination'],
  tool_execution_safety: ['tool invocation contract', 'sandbox isolation', 'side-effect validation', 'idempotency', 'rollback rules', 'unsafe execution paths', 'forbidden direct write paths', 'execution authority violations', 'sandbox isolation breach', 'side-effect validation', 'tool_result_validation', 'sandbox isolation boundaries', 'direct tool side-effect leakage'],
  deployment_contract: ['remote deployment prohibition', 'export structure completeness', 'export atomicity', 'offline-run capability', 'export path determinism', 'executable validation', 'deployment-term misuse', 'local export enforcement', 'remote deployment violation', 'remote deployment prohibition rigor', 'export path determinism detail'],
  platform_abstraction: ['platform-exclusion enforcement', 'abstraction leakage', 'target lock invariants', 'implementation divergence', 'platform-neutral architecture', 'cross-platform consistency', 'output-target mismatch', 'compiler mapping correctness', 'compiler mapping mismatch'],
  context_orchestration: ['token budget enforcement', 'context contamination / leakage', 'decision lock hierarchy', 'drift correction', 'deterministic context assembly', 'retrieval validation', 'conflict detection', 'context truncation', 'retrieval validation', 'context contamination'],
  reasoning_integrity: ['evidence binding', 'uncertainty propagation', 'reasoning trace enforceability', 'multi-step reasoning validation', 'global contradiction detection', 'self-correction loop boundedness', 'reasoning trace completeness', 'uncertainty propagation failure', 'evidence binding gap', 'evidence binding rigor', 'uncertainty propagation failure cases', 'bounded self-correction loop rules', 'evidence-free escalation'],
  ui_surface_contract: ['mandatory UI component existence', 'UI interactivity enforcement', 'UI-to-system-state mapping', 'no fatal state exposure', 'component state-machine correctness', 'UI accessibility contract', 'UI layout contract', 'mandatory UI component missing', 'mandatory UI component contract enforcement', 'UI fatal-state exposure'],
  deterministic_execution: ['transition determinism', 'concurrency model definition', 'deadlock / livelock prevention', 'scheduling determinism', 'retry and backoff policy', 'deterministic replay capability', 'timing dependency', 'resource ordering', 'scheduling non-determinism', 'deterministic replay requirements', 'deadlock livelock risk articulation'],
  control_plane_authority: ['control-plane separation', 'authority delegation rules', 'override conditions', 'execution owner boundary', 'policy enforcement points', 'escalation path', 'audit trail requirements', 'control plane separation violation', 'control-plane override conditions', 'execution owner boundary clarity'],
  world_state_governance: ['state mutation invariants', 'mutation gateway exclusivity', 'commit_hash binding', 'read/write atomicity', 'graph consistency / acyclicity', 'state isolation', 'temporal state consistency', 'state mutation invariant gap', 'snapshot isolation atomicity', 'state mutation invariants detail'],
};

const rawMetadata = {
  'L1-01': { name: 'direct contradictions', sub: 'direct conflicts', trigger: 'Two statements explicitly negate each other.', evidence: 'Conflict.', fp: 'Context.', floor: 'high' },
  'L1-02': { name: 'indirect contradictions', sub: 'configuration precedence conflicts', trigger: 'Inferred conclusions conflict.', evidence: 'Conflict.', fp: 'Context.', floor: 'medium', ceiling: 'high' },
  'L1-03': { name: 'cross-section contradictions', sub: 'version drift', trigger: 'Section A vs B drift.', evidence: 'Drift.', fp: 'Context.', floor: 'medium' },
  'L1-04': { name: 'terminology inconsistency', sub: 'terminology drift', trigger: 'Different terms same concept.', evidence: 'Drift.', fp: 'Context.', floor: 'low' },
  'L1-05': { name: 'numerical inconsistency', sub: 'version drift', trigger: 'Different values same constant.', evidence: 'Conflict.', fp: 'Context.', floor: 'high' },
  'L1-06': { name: 'definition drift', sub: 'terminology drift', trigger: 'Definition shifts.', evidence: 'Drift.', fp: 'Context.', floor: 'medium' },
  'L1-07': { name: 'circular contradictions', sub: 'direct conflicts', trigger: 'Cycle to impossible state.', evidence: 'Cycle.', fp: 'Context.', floor: 'high' },
  'L1-08': { name: 'hidden implied contradictions', sub: 'direct conflicts', trigger: 'Goal vs impl conflict.', evidence: 'Conflict.', fp: 'Context.', floor: 'medium' },
  'L1-09': { name: 'diagram-text mismatch', sub: 'diagram-text mismatch', trigger: 'Diagram vs text.', evidence: 'Mismatch.', fp: 'Context.', floor: 'medium' },
  'L1-10': { name: 'state-logic contradiction', sub: 'state-logic contradiction', trigger: 'Impossible state logic.', evidence: 'Conflict.', fp: 'Context.', floor: 'high' },
  'L1-11': { name: 'cross-epoch contradiction', sub: 'direct conflicts', trigger: 'Rules across epochs clash.', evidence: 'Conflict.', fp: 'Context.', floor: 'high' },
  'L1-12': { name: 'cross-domain definition clash', sub: 'direct conflicts', trigger: 'Domain A vs B term clash.', evidence: 'Clash.', fp: 'Context.', floor: 'medium' },
  'L1-13': { name: 'indirect contradiction detail', sub: 'configuration precedence conflicts', trigger: 'Deep precedence conflict.', evidence: 'Clash.', fp: 'Context.', floor: 'medium' },
  'L2-01': { name: 'invalid premises', sub: 'invalid assumptions', trigger: 'False fact relies.', evidence: 'Premise.', fp: 'Context.', floor: 'high' },
  'L2-02': { name: 'missing premises', sub: 'causality gaps', trigger: 'Jump in logic.', evidence: 'Gap.', fp: 'Context.', floor: 'medium' },
  'L2-03': { name: 'non-sequitur reasoning', sub: 'causality gaps', trigger: 'Unrelated transition.', evidence: 'Gap.', fp: 'Context.', floor: 'medium' },
  'L2-04': { name: 'circular reasoning', sub: 'circular reasoning', trigger: 'Logic loop.', evidence: 'Loop.', fp: 'Context.', floor: 'medium' },
  'L2-05': { name: 'false causality', sub: 'causality gaps', trigger: 'Correlation vs causation.', evidence: 'Gap.', fp: 'Context.', floor: 'medium' },
  'L2-06': { name: 'overgeneralization', sub: 'scope leaps', trigger: 'Broad claim small sample.', evidence: 'Leap.', fp: 'Context.', floor: 'low' },
  'L2-07': { name: 'logical gaps', sub: 'causality gaps', trigger: 'Skip state change.', evidence: 'Gap.', fp: 'Context.', floor: 'high' },
  'L2-08': { name: 'contradictory inference chains', sub: 'invalid assumptions', trigger: 'Paths to opposite results.', evidence: 'Conflict.', fp: 'Context.', floor: 'high' },
  'L2-09': { name: 'logic-state mismatch', sub: 'logic-state mismatch', trigger: 'Logic vs behavior drift.', evidence: 'Drift.', fp: 'Context.', floor: 'high' },
  'L2-10': { name: 'invariant violation logic', sub: 'invariant violation logic', trigger: 'Breach invariant.', evidence: 'Violation.', fp: 'Context.', floor: 'critical' },
  'L2-11': { name: 'logic loop deadlock', sub: 'circular reasoning', trigger: 'Deadlock logic chain.', evidence: 'Cycle.', fp: 'Context.', floor: 'high' },
  'L2-12': { name: 'invalid assumption detail', sub: 'invalid assumptions', trigger: 'Deep assumption flaw.', evidence: 'Premise.', fp: 'Context.', floor: 'high' },
  'L3-01': { name: 'broken heading hierarchy', sub: 'broken hierarchy', trigger: 'Bad H level.', evidence: 'Hierarchy.', fp: 'Context.', floor: 'low' },
  'L3-02': { name: 'orphan sections', sub: 'orphan sections', trigger: 'No refs.', evidence: 'Orphan.', fp: 'Context.', floor: 'low' },
  'L3-03': { name: 'redundant sections', sub: 'duplicate sections', trigger: 'Identical content.', evidence: 'Redundant.', fp: 'Context.', floor: 'medium' },
  'L3-04': { name: 'improper ordering', sub: 'missing prerequisites', trigger: 'Prereq after action.', evidence: 'Order.', fp: 'Context.', floor: 'high' },
  'L3-05': { name: 'content fragmentation', sub: 'broken hierarchy', trigger: 'Scattered info.', evidence: 'Hierarchy.', fp: 'Context.', floor: 'low' },
  'L3-06': { name: 'overloaded sections', sub: 'broken hierarchy', trigger: 'Too many topics.', evidence: 'Hierarchy.', fp: 'Context.', floor: 'medium' },
  'L3-07': { name: 'misplaced content', sub: 'broken hierarchy', trigger: 'Context mismatch.', evidence: 'Hierarchy.', fp: 'Context.', floor: 'medium' },
  'L3-08': { name: 'structural asymmetry', sub: 'broken hierarchy', trigger: 'Pattern break.', evidence: 'Hierarchy.', fp: 'Context.', floor: 'low' },
  'L3-09': { name: 'undocumented execution path', sub: 'execution-path gaps', trigger: 'Referenced but missing path.', evidence: 'Gap.', fp: 'Context.', floor: 'high' },
  'L3-10': { name: 'undocumented flow', sub: 'undocumented flow', trigger: 'Mentioned existing flow no steps.', evidence: 'Gap.', fp: 'Context.', floor: 'high' },
  'L3-11': { name: 'broken hierarchy detail', sub: 'broken hierarchy', trigger: 'Structural compromise.', evidence: 'Hierarchy.', fp: 'Context.', floor: 'low' },
  'L3-12': { name: 'missing prerequisites detail', sub: 'missing prerequisites', trigger: 'Task omitted prereqs.', evidence: 'Order.', fp: 'Context.', floor: 'medium' },
  'L4-01': { name: 'ambiguous wording', sub: 'semantic ambiguity', trigger: 'Vague context.', evidence: 'Ambiguity.', fp: 'Context.', floor: 'medium' },
  'L4-02': { name: 'vague language', sub: 'vague quantifiers', trigger: 'No metrics.', evidence: 'Vague.', fp: 'Context.', floor: 'low' },
  'L4-03': { name: 'undefined terms', sub: 'undefined terms', trigger: 'No definition.', evidence: 'Term.', fp: 'Context.', floor: 'medium' },
  'L4-04': { name: 'polysemy conflicts', sub: 'overloaded terms', trigger: 'Conflicting usage.', evidence: 'Clash.', fp: 'Context.', floor: 'medium' },
  'L4-05': { name: 'misleading phrasing', sub: 'ambiguous references', trigger: 'Grammar relationship.', evidence: 'Vague.', fp: 'Context.', floor: 'medium' },
  'L4-06': { name: 'incomplete explanation', sub: 'undefined terms', trigger: 'Concept not explained.', evidence: 'Term.', fp: 'Context.', floor: 'medium' },
  'L4-07': { name: 'unstated assumptions', sub: 'ambiguous references', trigger: 'Hidden knowledge.', evidence: 'Vague.', fp: 'Context.', floor: 'medium' },
  'L4-08': { name: 'context drift', sub: 'ambiguous references', trigger: 'Subject unclear.', evidence: 'Vague.', fp: 'Context.', floor: 'low' },
  'L4-09': { name: 'terminology registry gap', sub: 'terminology registry gaps', trigger: 'Unregistered term.', evidence: 'Term.', fp: 'Context.', floor: 'low' },
  'L4-10': { name: 'forbidden term violation', sub: 'forbidden-term violations', trigger: 'Banned term used.', evidence: 'Violation.', fp: 'Context.', floor: 'medium' },
  'L4-11': { name: 'interpretation leakage', sub: 'interpretation leakage', trigger: 'Impl leak.', evidence: 'Leak.', fp: 'Context.', floor: 'medium' },
  'L4-12': { name: 'canonical vocabulary drift', sub: 'canonical vocabulary drift', trigger: 'Glossary vs usage mismatch.', evidence: 'Drift.', fp: 'Context.', floor: 'medium' },
  'L4-13': { name: 'symbol ambiguity', sub: 'symbol ambiguity', trigger: 'Overloaded symbol.', evidence: 'Ambiguity.', fp: 'Context.', floor: 'medium' },
  'L4-14': { name: 'type ambiguity', sub: 'type ambiguity', trigger: 'Ambiguous type.', evidence: 'Ambiguity.', fp: 'Context.', floor: 'medium' },
  'L4-15': { name: 'semantic drift detection', sub: 'semantic drift detection', trigger: 'Meaning shifts.', evidence: 'Drift.', fp: 'Context.', floor: 'low' },
  'L4-16': { name: 'interpretation consistency violation', sub: 'interpretation consistency', trigger: 'Rule interpreted incompatibly.', evidence: 'Violation.', fp: 'Context.', floor: 'medium' },
  'L4-17': { name: 'semantic boundary leakage', sub: 'semantic ambiguity', trigger: 'Domain language mix.', evidence: 'Ambiguity.', fp: 'Context.', floor: 'medium' },
  'L5-01': { name: 'unsupported claims', sub: 'unsupported claims', trigger: 'No evidence.', evidence: 'Claim.', fp: 'Context.', floor: 'medium' },
  'L5-02': { name: 'missing citations', sub: 'citation gaps', trigger: 'No source.', evidence: 'Citation.', fp: 'Context.', floor: 'low' },
  'L5-03': { name: 'outdated info risk', sub: 'stale-vs-citation distinction', trigger: 'Deprecated reference.', evidence: 'Date.', fp: 'Context.', floor: 'high' },
  'L5-04': { name: 'hallucination risk', sub: 'unsupported claims', trigger: 'False feature.', evidence: 'Violation.', fp: 'Context.', floor: 'critical' },
  'L5-05': { name: 'misinterpreted facts', sub: 'norm-vs-description confusion', trigger: 'Wrong rule application.', evidence: 'Fact.', fp: 'Context.', floor: 'medium' },
  'L5-06': { name: 'inconsistent references', sub: 'citation gaps', trigger: 'Dead resource link.', evidence: 'Citation.', fp: 'Context.', floor: 'medium' },
  'L5-07': { name: 'evidence mismatch', sub: 'unsupported claims', trigger: 'Evidence not supporting.', evidence: 'Claim.', fp: 'Context.', floor: 'medium' },
  'L5-08': { name: 'unverifiable claims', sub: 'unsupported claims', trigger: 'Untestable.', evidence: 'Claim.', fp: 'Context.', floor: 'low' },
  'L5-09': { name: 'stale fact risk', sub: 'stale facts', trigger: 'Likely changed state.', evidence: 'Fact.', fp: 'Context.', floor: 'medium' },
  'L5-10': { name: 'misinterpreted data', sub: 'misinterpreted data', trigger: 'Stats misuse.', evidence: 'Data.', fp: 'Context.', floor: 'medium' },
  'L5-11': { name: 'unsupported claim detail', sub: 'unsupported claims', trigger: 'No empirical support.', evidence: 'Claim.', fp: 'Context.', floor: 'medium' },
  'L5-12': { name: 'citation gap detail', sub: 'citation gaps', trigger: 'Missing referenced source.', evidence: 'Citation.', fp: 'Context.', floor: 'low' },
  'L6-01': { name: 'impossible workflows', sub: 'impossible workflows', trigger: 'Access blocked.', evidence: 'Workflow.', fp: 'Context.', floor: 'critical' },
  'L6-02': { name: 'missing execution step', sub: 'incomplete procedures', trigger: 'Followed fail.', evidence: 'Gap.', fp: 'Context.', floor: 'high' },
  'L6-03': { name: 'dependency gaps', sub: 'hidden prerequisites', trigger: 'Missing library.', evidence: 'Gap.', fp: 'Context.', floor: 'medium' },
  'L6-04': { name: 'resource conflicts', sub: 'impossible workflows', trigger: 'Shared resource incompatibility.', evidence: 'Workflow.', fp: 'Context.', floor: 'high' },
  'L6-05': { name: 'operational impossibility', sub: 'impossible workflows', trigger: '100% uptime assumption.', evidence: 'Workflow.', fp: 'Context.', floor: 'medium' },
  'L6-06': { name: 'invalid sequence', sub: 'incomplete procedures', trigger: 'Data loss order.', evidence: 'Gap.', fp: 'Context.', floor: 'high' },
  'L6-07': { name: 'untriggerable state', sub: 'impossible workflows', trigger: 'Impossible condition.', evidence: 'Workflow.', fp: 'Context.', floor: 'medium' },
  'L6-08': { name: 'missing preconditions', sub: 'structural missing-prerequisite cases', trigger: 'Action no setup.', evidence: 'Gap.', fp: 'Context.', floor: 'high' },
  'L6-09': { name: 'missing workflow outcome', sub: 'missing outcomes', trigger: 'No exit state.', evidence: 'Gap.', fp: 'Context.', floor: 'high' },
  'L6-10': { name: 'workflow dead-end', sub: 'workflow dead-end', trigger: 'No exit point.', evidence: 'Gap.', fp: 'Context.', floor: 'medium' },
  'L6-11': { name: 'hidden prerequisites detail', sub: 'hidden prerequisites', trigger: 'Tool not listed.', evidence: 'Gap.', fp: 'Context.', floor: 'medium' },
  'L6-12': { name: 'incomplete procedures detail', sub: 'incomplete procedures', trigger: 'Steps gap core task.', evidence: 'Gap.', fp: 'Context.', floor: 'high' },
  'L7-01': { name: 'timeline contradictions', sub: 'sequence conflicts', trigger: 'A before and after B.', evidence: 'Conflict.', fp: 'Context.', floor: 'high' },
  'L7-02': { name: 'event ordering errors', sub: 'sequence conflicts', trigger: 'Broken flow.', evidence: 'Conflict.', fp: 'Context.', floor: 'medium' },
  'L7-03': { name: 'state transition breaks', sub: 'lifecycle drift', trigger: 'No valid path jump.', evidence: 'Drift.', fp: 'Context.', floor: 'high' },
  'L7-04': { name: 'version inconsistencies', sub: 'stale timelines', trigger: 'Incompatible version refs.', evidence: 'Date.', fp: 'Context.', floor: 'medium' },
  'L7-05': { name: 'causality violations', sub: 'sequence conflicts', trigger: 'Effect before cause.', evidence: 'Conflict.', fp: 'Context.', floor: 'critical' },
  'L7-06': { name: 'missing state definition', sub: 'lifecycle drift', trigger: 'Undefined state.', evidence: 'Drift.', fp: 'Context.', floor: 'medium' },
  'L7-07': { name: 'temporal ambiguity', sub: 'invalid timing windows', trigger: 'Vague windows.', evidence: 'Vague.', fp: 'Context.', floor: 'low' },
  'L7-08': { name: 'lifecycle gaps', sub: 'lifecycle drift', trigger: 'Beginning/end undefined.', evidence: 'Drift.', fp: 'Context.', floor: 'medium' },
  'L7-09': { name: 'async race condition risk', sub: 'async race conditions', trigger: 'Unsynchronized access.', evidence: 'Conflict.', fp: 'Context.', floor: 'high' },
  'L7-10': { name: 'temporal causality violation', sub: 'temporal causality violation', trigger: 'Action causes previous event.', evidence: 'Conflict.', fp: 'Context.', floor: 'critical' },
  'L7-11': { name: 'sequence conflict detail', sub: 'sequence conflicts', trigger: 'Logical order clash.', evidence: 'Conflict.', fp: 'Context.', floor: 'high' },
  'L7-12': { name: 'lifecycle drift detail', sub: 'lifecycle drift', trigger: 'Divergent transitions.', evidence: 'Drift.', fp: 'Context.', floor: 'medium' },
  'L8-01': { name: 'component overlap', sub: 'responsibility overlap', trigger: 'Same role claim.', evidence: 'Clash.', fp: 'Context.', floor: 'medium' },
  'L8-02': { name: 'missing component', sub: 'missing components', trigger: 'Not in architecture.', evidence: 'Gap.', fp: 'Context.', floor: 'high' },
  'L8-03': { name: 'responsibility conflict', sub: 'responsibility overlap', trigger: 'Mixed concerns.', evidence: 'Clash.', fp: 'Context.', floor: 'medium' },
  'L8-04': { name: 'tight coupling', sub: 'boundary leaks', trigger: 'Lock-step change.', evidence: 'Leak.', fp: 'Context.', floor: 'medium' },
  'L8-05': { name: 'interface mismatch', sub: 'boundary leaks', trigger: 'Producer Consumer mismatch.', evidence: 'Leak.', fp: 'Context.', floor: 'high' },
  'L8-06': { name: 'circular dependency', sub: 'topology inconsistency', trigger: 'A B A loop.', evidence: 'Cycle.', fp: 'Context.', floor: 'high' },
  'L8-07': { name: 'ownership ambiguity', sub: 'responsibility overlap', trigger: 'Unclear data owner.', evidence: 'Clash.', fp: 'Context.', floor: 'medium' },
  'L8-08': { name: 'boundary violation', sub: 'boundary leaks', trigger: 'Exposed internal state.', evidence: 'Leak.', fp: 'Context.', floor: 'medium' },
  'L8-09': { name: 'cross-system boundary gap', sub: 'cross-system boundary gaps', trigger: 'No interface spec.', evidence: 'Gap.', fp: 'Context.', floor: 'high' },
  'L8-10': { name: 'plane separation breach', sub: 'control-plane/data-plane separation', trigger: 'Intermixed logic.', evidence: 'Clash.', fp: 'Context.', floor: 'critical' },
  'L8-11': { name: 'data-plane isolation gap', sub: 'data-plane isolation', trigger: 'Shared mutable state.', evidence: 'Gap.', fp: 'Context.', floor: 'high' },
  'L8-12': { name: 'subsystem-to-UI mapping gap', sub: 'subsystem-to-UI mapping gaps', trigger: 'No UI mapping.', evidence: 'Gap.', fp: 'Context.', floor: 'medium' },
  'L8-13': { name: 'internal boundary leakage', sub: 'internal-visible boundary leakage', trigger: 'Leaked API.', evidence: 'Leak.', fp: 'Context.', floor: 'high' },
  'L8-14': { name: 'hidden execution authority', sub: 'hidden execution authority', trigger: 'Undocumented capability.', evidence: 'Clash.', fp: 'Context.', floor: 'critical' },
  'L8-15': { name: 'control-plane/runtime authority confusion', sub: 'control-plane/runtime authority confusion', trigger: 'Authority leak.', evidence: 'Clash.', fp: 'Context.', floor: 'critical' },
  'L8-16': { name: 'cross-system interface mismatch', sub: 'cross-system interface mismatch', trigger: 'Incompatible protocols.', evidence: 'Mismatch.', fp: 'Context.', floor: 'high' },
  'L8-17': { name: 'arbitration ambiguity', sub: 'arbitration ambiguity', trigger: 'No arbiter.', evidence: 'Ambiguity.', fp: 'Context.', floor: 'high' },
  'L8-18': { name: 'internal boundary leakage detail', sub: 'internal-visible boundary leakage', trigger: 'Public leaky abstraction.', evidence: 'Leak.', fp: 'Context.', floor: 'medium' },
  'L8-19': { name: 'agent role overlap', sub: 'agent role overlap', trigger: 'Redundant agent roles.', evidence: 'Clash.', fp: 'Context.', floor: 'high' },
  'L9-01': { name: 'missing edge cases', sub: 'missing edge cases', trigger: 'Happy-path only.', evidence: 'Gap.', fp: 'Context.', floor: 'medium' },
  'L9-02': { name: 'missing error handling', sub: 'missing edge cases', trigger: 'No guidance failure.', evidence: 'Gap.', fp: 'Context.', floor: 'high' },
  'L9-03': { name: 'incomplete workflow', sub: 'missing branches', trigger: 'Truncated process.', evidence: 'Branch.', fp: 'Context.', floor: 'high' },
  'L9-04': { name: 'missing constraints', sub: 'missing postconditions', trigger: 'Unbounded limits.', evidence: 'Post.', fp: 'Context.', floor: 'medium' },
  'L9-05': { name: 'uncovered requirement', sub: 'missing edge cases', trigger: 'No steps spec.', evidence: 'Gap.', fp: 'Context.', floor: 'medium' },
  'L9-06': { name: 'reasoning gap', sub: 'missing edge cases', trigger: 'Context leap.', evidence: 'Gap.', fp: 'Context.', floor: 'low' },
  'L9-07': { name: 'missing validation', sub: 'missing postconditions', trigger: 'No sanity checks.', evidence: 'Post.', fp: 'Context.', floor: 'medium' },
  'L9-08': { name: 'undefined behavior', sub: 'missing postconditions', trigger: 'Action result unknown.', evidence: 'Post.', fp: 'Context.', floor: 'medium' },
  'L9-09': { name: 'missing rollback plan', sub: 'missing rollback', trigger: 'Irreversible steps.', evidence: 'Rollback.', fp: 'Context.', floor: 'high' },
  'L9-10': { name: 'outcome omission', sub: 'outcome omission', trigger: 'Undefined completion state.', evidence: 'Outcome.', fp: 'Context.', floor: 'medium' },
  'L9-11': { name: 'execution-path gaps', sub: 'execution-path gaps', trigger: 'Skipped flow step.', evidence: 'Gap.', fp: 'Context.', floor: 'high' },
  'L9-12': { name: 'missing branch detail', sub: 'missing branches', trigger: 'Omitted path.', evidence: 'Branch.', fp: 'Context.', floor: 'high' },
  'L10-01': { name: 'scope creep', sub: 'scope creep', trigger: 'Unrelated content.', evidence: 'Intent.', fp: 'Context.', floor: 'low' },
  'L10-02': { name: 'goal mismatch', sub: 'business-vs-implementation mismatch', trigger: 'Hinders goal.', evidence: 'Mismatch.', fp: 'Context.', floor: 'high' },
  'L10-03': { name: 'conflicting goals', sub: 'goal drift', trigger: 'Goal clash.', evidence: 'Conflict.', fp: 'Context.', floor: 'high' },
  'L10-04': { name: 'irrelevant content', sub: 'scope creep', trigger: 'No audience value.', evidence: 'Intent.', fp: 'Context.', floor: 'low' },
  'L10-05': { name: 'solution misalignment', sub: 'business-vs-implementation mismatch', trigger: 'Wrong problem answer.', evidence: 'Mismatch.', fp: 'Context.', floor: 'medium' },
  'L10-06': { name: 'requirement drift', sub: 'goal drift', trigger: 'Requirement ignored.', evidence: 'Conflict.', fp: 'Context.', floor: 'medium' },
  'L10-07': { name: 'priority inversion', sub: 'goal drift', trigger: 'Focus imbalance.', evidence: 'Conflict.', fp: 'Context.', floor: 'low' },
  'L10-08': { name: 'ambiguous objective', sub: 'business-vs-implementation mismatch', trigger: 'Vague achievement.', evidence: 'Mismatch.', fp: 'Context.', floor: 'medium' },
  'L10-09': { name: 'audience mismatch', sub: 'audience mismatch', trigger: 'Wrong expertise.', evidence: 'Mismatch.', fp: 'Context.', floor: 'medium' },
  'L10-10': { name: 'objective ambiguity', sub: 'objective ambiguity', trigger: 'Vague goal section.', evidence: 'Objective.', fp: 'Context.', floor: 'medium' },
  'L10-11': { name: 'implicit requirement gaps', sub: 'implicit requirement gaps', trigger: 'Core logic dependency.', evidence: 'Gap.', fp: 'Context.', floor: 'medium' },
  'L10-12': { name: 'goal drift detail', sub: 'goal drift', trigger: 'Shift in topic focus.', evidence: 'Conflict.', fp: 'Context.', floor: 'low' },
  'L11-01': { name: 'unjustified claims', sub: 'unverifiable claims', trigger: 'Best unique no data.', evidence: 'Conclusion.', fp: 'Context.', floor: 'low' },
  'L11-02': { name: 'shallow reasoning', sub: 'shallow tradeoff analysis', trigger: 'Oversimplification.', evidence: 'Tradeoff.', fp: 'Context.', floor: 'medium' },
  'L11-03': { name: 'overconfidence', sub: 'overconfidence', trigger: 'Risk dismissal.', evidence: 'Certainty.', fp: 'Context.', floor: 'medium' },
  'L11-04': { name: 'missing rationale', sub: 'unverifiable conclusions', trigger: 'No explain why.', evidence: 'Conclusion.', fp: 'Context.', floor: 'medium' },
  'L11-05': { name: 'assumption stacking', sub: 'unjustified certainty', trigger: 'Chain of if no verification.', evidence: 'Certainty.', fp: 'Context.', floor: 'high' },
  'L11-06': { name: 'weak justification', sub: 'unverifiable conclusions', trigger: 'Irrelevant evidence.', evidence: 'Conclusion.', fp: 'Context.', floor: 'medium' },
  'L11-07': { name: 'circular logic in reasoning', sub: 'unverifiable conclusions', trigger: 'Logic loop.', evidence: 'Conclusion.', fp: 'Context.', floor: 'high' },
  'L11-08': { name: 'reasoning inconsistency', sub: 'unverifiable conclusions', trigger: 'Logic shift.', evidence: 'Conclusion.', fp: 'Context.', floor: 'medium' },
  'L11-09': { name: 'ambiguous certainty marker', sub: 'ambiguous certainty', trigger: 'Hedging terms critical path.', evidence: 'Certainty.', fp: 'Context.', floor: 'low' },
  'L11-10': { name: 'reasoning chain gap', sub: 'reasoning chain gap', trigger: 'Missing middle link.', evidence: 'Gap.', fp: 'Context.', floor: 'medium' },
  'L11-11': { name: 'unverifiable claim detail', sub: 'unverifiable claims', trigger: 'Untestable premise.', evidence: 'Conclusion.', fp: 'Context.', floor: 'medium' },
  'L11-12': { name: 'overconfidence detail', sub: 'overconfidence', trigger: 'Dismiss edge cases.', evidence: 'Certainty.', fp: 'Context.', floor: 'medium' },
  'L12-01': { name: 'fragile assumptions', sub: 'risky defaults', trigger: 'Assumed truth break.', evidence: 'Defaults.', fp: 'Context.', floor: 'high' },
  'L12-02': { name: 'missing failure mode', sub: 'bypass scenarios', trigger: 'Missing fail handle.', evidence: 'Bypass.', fp: 'Context.', floor: 'high' },
  'L12-03': { name: 'counterexample vulnerability', sub: 'abuse paths', trigger: 'Single case disproves rule.', evidence: 'Abuse.', fp: 'Context.', floor: 'medium' },
  'L12-04': { name: 'stress breakage', sub: 'misuse opportunities', trigger: 'Load volume fail.', evidence: 'Misuse.', fp: 'Context.', floor: 'high' },
  'L12-05': { name: 'boundary condition failure', sub: 'bypass scenarios', trigger: 'Off-by-one limit.', evidence: 'Bypass.', fp: 'Context.', floor: 'high' },
  'L12-06': { name: 'unhandled edge collapse', sub: 'bypass scenarios', trigger: 'Multiple minor fail cascade.', evidence: 'Bypass.', fp: 'Context.', floor: 'medium' },
  'L12-07': { name: 'robustness gap', sub: 'misuse opportunities', trigger: 'Perfect format assumption.', evidence: 'Misuse.', fp: 'Context.', floor: 'medium' },
  'L12-08': { name: 'exploitability', sub: 'misuse opportunities', trigger: 'Instruction bypass security.', evidence: 'Misuse.', fp: 'Context.', floor: 'critical' },
  'L12-09': { name: 'threat-model gap', sub: 'threat-model gaps', trigger: 'No threat model.', evidence: 'Model.', fp: 'Context.', floor: 'high' },
  'L12-10': { name: 'collusion risk', sub: 'collusion risk', trigger: 'Multi-agent bypass.', evidence: 'Collusion.', fp: 'Context.', floor: 'high' },
  'L12-11': { name: 'input saturation vulnerability', sub: 'bypass scenarios', trigger: 'Overflow risk buffers.', evidence: 'Bypass.', fp: 'Context.', floor: 'medium' },
  'L12-12': { name: 'timing side-channel', sub: 'threat-model gaps', trigger: 'Response time leak.', evidence: 'Model.', fp: 'Context.', floor: 'medium' },
  'L13-01': { name: 'orphan entities', sub: 'orphan entities', trigger: 'No refs isolated term.', evidence: 'Entity.', fp: 'Context.', floor: 'low' },
  'L13-02': { name: 'missing relationships', sub: 'relationship gaps', trigger: 'Implicit link gap.', evidence: 'Gap.', fp: 'Context.', floor: 'medium' },
  'L13-03': { name: 'circular references', sub: 'circular references', trigger: 'A B A loop.', evidence: 'Cycle.', fp: 'Context.', floor: 'medium' },
  'L13-04': { name: 'entity duplication', sub: 'alias drift', trigger: 'Duplicates domain aliases.', evidence: 'Drift.', fp: 'Context.', floor: 'medium' },
  'L13-05': { name: 'broken linkage', sub: 'relationship gaps', trigger: 'Dead ref entity.', evidence: 'Gap.', fp: 'Context.', floor: 'high' },
  'L13-06': { name: 'hierarchy conflict', sub: 'role confusion', trigger: 'Inverted tree roles.', evidence: 'Confusion.', fp: 'Context.', floor: 'medium' },
  'L13-07': { name: 'dependency ambiguity', sub: 'relationship gaps', trigger: 'Vague link nature.', evidence: 'Gap.', fp: 'Context.', floor: 'medium' },
  'L13-08': { name: 'concept drift', sub: 'alias drift', trigger: 'Attribute shift sections.', evidence: 'Drift.', fp: 'Context.', floor: 'medium' },
  'L13-09': { name: 'alias collision risk', sub: 'alias drift', trigger: 'Name clash entities.', evidence: 'Drift.', fp: 'Context.', floor: 'low' },
  'L13-10': { name: 'entity attribute drift', sub: 'entity attribute drift', trigger: 'Attribute conflict redefine.', evidence: 'Drift.', fp: 'Context.', floor: 'medium' },
  'L13-11': { name: 'relationship gap detail', sub: 'relationship gaps', trigger: 'Missing link system relationships.', evidence: 'Gap.', fp: 'Context.', floor: 'medium' },
  'L13-12': { name: 'relationship direction mismatch', sub: 'relationship gaps', trigger: 'Inverted direction owner-of.', evidence: 'Gap.', fp: 'Context.', floor: 'medium' },
  'L14-01': { name: 'calculation error', sub: 'numeric inconsistency', trigger: 'Wrong math text.', evidence: 'Conflict.', fp: 'Context.', floor: 'high' },
  'L14-02': { name: 'unit mismatch', sub: 'unit mismatch', trigger: 'Conflicting units MB GB.', evidence: 'Mismatch.', fp: 'Context.', floor: 'high' },
  'L14-03': { name: 'scale inconsistency', sub: 'numeric inconsistency', trigger: 'Non-linear claim gap.', evidence: 'Conflict.', fp: 'Context.', floor: 'medium' },
  'L14-04': { name: 'unsupported statistics', sub: 'vague measurements', trigger: 'Stat base data missing.', evidence: 'Vague.', fp: 'Context.', floor: 'low' },
  'L14-05': { name: 'numeric contradiction', sub: 'numeric inconsistency', trigger: 'Impossible range Min Max.', evidence: 'Conflict.', fp: 'Context.', floor: 'critical' },
  'L14-06': { name: 'rounding ambiguity', sub: 'numeric inconsistency', trigger: 'Precision gap estimates.', evidence: 'Conflict.', fp: 'Context.', floor: 'low' },
  'L14-07': { name: 'range inconsistency', sub: 'numeric inconsistency', trigger: 'Intentional gaps ranges.', evidence: 'Conflict.', fp: 'Context.', floor: 'medium' },
  'L14-08': { name: 'metric misinterpretation', sub: 'vague measurements', trigger: 'Metric choice choice summaries.', evidence: 'Vague.', fp: 'Context.', floor: 'medium' },
  'L14-09': { name: 'impossible threshold', sub: 'impossible thresholds', trigger: 'Breach theoretical maximum.', evidence: 'Threshold.', fp: 'Context.', floor: 'high' },
  'L14-10': { name: 'scaling boundary ambiguity', sub: 'scaling boundary ambiguity', trigger: 'Missing breakpoint asymptotic.', evidence: 'Scale.', fp: 'Context.', floor: 'medium' },
  'L14-11': { name: 'precision mismatch', sub: 'precision mismatch', trigger: 'Precision drift display.', evidence: 'Mismatch.', fp: 'Context.', floor: 'low' },
  'L14-12': { name: 'unit mismatch detail', sub: 'unit mismatch', trigger: 'Unit clash industry shorthand.', evidence: 'Mismatch.', fp: 'Context.', floor: 'high' },
  'L15-01': { name: 'requirement ambiguity', sub: 'ambiguous acceptance criteria', trigger: 'Vague requirement should must.', evidence: 'Acceptance.', fp: 'Context.', floor: 'medium' },
  'L15-02': { name: 'requirement contradiction', sub: 'ambiguous acceptance criteria', trigger: 'Requirement A vs B clash.', evidence: 'Acceptance.', fp: 'Context.', floor: 'high' },
  'L15-03': { name: 'missing acceptance criteria', sub: 'ambiguous acceptance criteria', trigger: 'Untestable requirement goal.', evidence: 'Acceptance.', fp: 'Context.', floor: 'high' },
  'L15-04': { name: 'unverifiable requirement', sub: 'ambiguous acceptance criteria', trigger: 'Subjective UI UX req.', evidence: 'Acceptance.', fp: 'Context.', floor: 'medium' },
  'L15-05': { name: 'implicit requirement', sub: 'ambiguous acceptance criteria', trigger: 'Implicit standard gap.', evidence: 'Acceptance.', fp: 'Context.', floor: 'medium' },
  'L15-06': { name: 'duplicated requirement', sub: 'ambiguous acceptance criteria', trigger: 'Redundancy drift list.', evidence: 'Acceptance.', fp: 'Context.', floor: 'low' },
  'L15-07': { name: 'requirement dependency missing', sub: 'traceability gaps', trigger: 'Traceability gap standard.', evidence: 'Traceability.', fp: 'Context.', floor: 'medium' },
  'L15-08': { name: 'requirement scope leakage', sub: 'ambiguous acceptance criteria', trigger: 'Scope leak context req.', evidence: 'Acceptance.', fp: 'Context.', floor: 'low' },
  'L15-09': { name: 'closed-world violation', sub: 'closed-world violations', trigger: 'Open input set enums.', evidence: 'Violation.', fp: 'Context.', floor: 'high' },
  'L15-10': { name: 'undefined obligation', sub: 'undefined obligations', trigger: 'Orphaned duty implicit.', evidence: 'Obligation.', fp: 'Context.', floor: 'medium' },
  'L15-11': { name: 'RFC2119 misuse', sub: 'RFC2119 misuse', trigger: 'Misused keyword informal.', evidence: 'RFC2119.', fp: 'Context.', floor: 'medium' },
  'L15-12': { name: 'priority ambiguity', sub: 'priority ambiguity', trigger: 'Missing priority labels clash.', evidence: 'Priority.', fp: 'Context.', floor: 'medium' },
  'L15-13': { name: 'implicit dependency detail', sub: 'implicit dependencies', trigger: 'Unreferenced dependency self-contained.', evidence: 'Dependencies.', fp: 'Context.', floor: 'high' },
  'L15-14': { name: 'spec incompleteness', sub: 'spec completeness', trigger: 'Missing domain narrowly scoped.', evidence: 'Spec.', fp: 'Context.', floor: 'high' },
  'L15-15': { name: 'contract incompleteness', sub: 'contract incompleteness', trigger: 'Incomplete contract draft.', evidence: 'Contract.', fp: 'Context.', floor: 'high' },
  'L15-16': { name: 'acceptance-proof gap', sub: 'acceptance-proof gaps', trigger: 'Unverifiable requirement goal.', evidence: 'Proof.', fp: 'Context.', floor: 'high' },
  'L15-17': { name: 'acceptance criteria omission', sub: 'acceptance criteria omission', trigger: 'Missing verification criteria.', evidence: 'Acceptance.', fp: 'Context.', floor: 'high' },
  'L15-18': { name: 'spec completeness gap', sub: 'spec completeness', trigger: 'Reference null spec roadmap.', evidence: 'Spec.', fp: 'Context.', floor: 'critical' },
  'L15-19': { name: 'requirement stability risk', sub: 'requirement stability', trigger: 'Volatile requirement beta.', evidence: 'Stability.', fp: 'Context.', floor: 'low' },
  'L15-20': { name: 'requirement evolution tracking gap', sub: 'requirement evolution tracking', trigger: 'Untraced req change draft.', evidence: 'Tracking.', fp: 'Context.', floor: 'low' },
  'L15-21': { name: 'requirement conflict resolution omission', sub: 'requirement conflict resolution', trigger: 'Unresolved req conflict draft.', evidence: 'Conflict.', fp: 'Context.', floor: 'high' },
  'L16-01': { name: 'undefined states', sub: 'impossible transitions', trigger: 'State X definition gap.', evidence: 'Transition.', fp: 'Context.', floor: 'high' },
  'L16-02': { name: 'invalid transitions', sub: 'impossible transitions', trigger: 'Forbidden path bypass.', evidence: 'Transition.', fp: 'Context.', floor: 'high' },
  'L16-03': { name: 'unreachable states', sub: 'impossible transitions', trigger: 'Isolated error-only state.', evidence: 'Transition.', fp: 'Context.', floor: 'medium' },
  'L16-04': { name: 'terminal state missing', sub: 'missing terminal states', trigger: 'Loop no exit machine.', evidence: 'Terminal.', fp: 'Context.', floor: 'medium' },
  'L16-05': { name: 'multiple initial states', sub: 'impossible transitions', trigger: 'Machine start point ambiguity.', evidence: 'Transition.', fp: 'Context.', floor: 'medium' },
  'L16-06': { name: 'transition ambiguity', sub: 'impossible transitions', trigger: 'Same trigger multiple states.', evidence: 'Transition.', fp: 'Context.', floor: 'medium' },
  'L16-07': { name: 'state condition conflict', sub: 'impossible transitions', trigger: 'State entry impossible.', evidence: 'Transition.', fp: 'Context.', floor: 'high' },
  'L16-08': { name: 'state lifecycle gap', sub: 'retry loops', trigger: 'Resource cleanup gap machine.', evidence: 'Retry.', fp: 'Context.', floor: 'medium' },
  'L16-09': { name: 'fatal-state exposure', sub: 'fatal-state exposure', trigger: 'No recovery state reachable.', evidence: 'Fatal.', fp: 'Context.', floor: 'critical' },
  'L16-10': { name: 'no-exit loop', sub: 'no-exit loops', trigger: 'Inescapable cycle intentional.', evidence: 'Loop.', fp: 'Context.', floor: 'high' },
  'L16-11': { name: 'concurrency conflict risk', sub: 'concurrency conflicts', trigger: 'Unsynchronized combined state.', evidence: 'Conflict.', fp: 'Context.', floor: 'critical' },
  'L16-12': { name: 'unreachable terminal state', sub: 'dead-end states', trigger: 'Isolated terminal node error-only.', evidence: 'Dead-end.', fp: 'Context.', floor: 'high' },
  'L16-13': { name: 'lifecycle-state gap', sub: 'lifecycle-state gaps', trigger: 'Missing lifecycle state simple.', evidence: 'Lifecycle.', fp: 'Context.', floor: 'high' },
  'L16-14': { name: 'transition illegality', sub: 'transition illegality', trigger: 'Forbidden transition override.', evidence: 'Transition.', fp: 'Context.', floor: 'critical' },
  'L16-15': { name: 'progression-order violation', sub: 'progression-order violations', trigger: 'Skipped prerequisite state stages.', evidence: 'Progression.', fp: 'Context.', floor: 'high' },
  'L16-16': { name: 'non-deterministic transition', sub: 'non-deterministic transition', trigger: 'Unstable logic external seeds.', evidence: 'Transition.', fp: 'Context.', floor: 'high' },
  'L16-17': { name: 'deadlock risk', sub: 'deadlock/livelock risks', trigger: 'Resource cycle circular wait.', evidence: 'Deadlock.', fp: 'Context.', floor: 'critical' },
  'L16-18': { name: 'livelock risk', sub: 'deadlock/livelock risks', trigger: 'State oscillation active waiting.', evidence: 'Deadlock.', fp: 'Context.', floor: 'high' },
  'L16-19': { name: 'fatal UI state exposure risk', sub: 'fatal UI state exposure', trigger: 'Locked UI state error modals.', evidence: 'UI State.', fp: 'Context.', floor: 'high' },
  'L17-01': { name: 'undefined parameters', sub: 'schema mismatch', trigger: 'Example uses missing param.', evidence: 'Mismatch.', fp: 'Context.', floor: 'high' },
  'L17-02': { name: 'inconsistent parameter types', sub: 'schema mismatch', trigger: 'Schema says example mismatch.', evidence: 'Mismatch.', fp: 'Context.', floor: 'critical' },
  'L17-03': { name: 'missing return schema', sub: 'schema mismatch', trigger: 'Return gap empty success.', evidence: 'Mismatch.', fp: 'Context.', floor: 'high' },
  'L17-04': { name: 'undocumented error response', sub: 'error-contract omissions', trigger: 'Hidden error 4xx 5xx.', evidence: 'Errors.', fp: 'Context.', floor: 'medium' },
  'L17-05': { name: 'inconsistent naming', sub: 'schema mismatch', trigger: 'Case mismatch style drift.', evidence: 'Mismatch.', fp: 'Context.', floor: 'low' },
  'L17-06': { name: 'breaking contract change', sub: 'schema mismatch', trigger: 'Breaking change major version.', evidence: 'Mismatch.', fp: 'Context.', floor: 'critical' },
  'L17-07': { name: 'request-response mismatch', sub: 'schema mismatch', trigger: 'Mismatch standard metadata.', evidence: 'Mismatch.', fp: 'Context.', floor: 'medium' },
  'L17-08': { name: 'versioning conflict', sub: 'auth ambiguity', trigger: 'Version mix backward compat.', evidence: 'Auth.', fp: 'Context.', floor: 'high' },
  'L17-09': { name: 'idempotency gap', sub: 'idempotency gaps', trigger: 'Missing idempotency spec ops.', evidence: 'Idempotency.', fp: 'Context.', floor: 'high' },
  'L17-10': { name: 'backward-compatibility break', sub: 'backward-compatibility breaks', trigger: 'Breaking change major bump.', evidence: 'Compatibility.', fp: 'Context.', floor: 'critical' },
  'L17-11': { name: 'rate-limit ambiguity', sub: 'rate-limit ambiguity', trigger: 'Vague rate limits uncapped.', evidence: 'Rate-limit.', fp: 'Context.', floor: 'medium' },
  'L17-12': { name: 'auth ambiguity detail', sub: 'auth ambiguity', trigger: 'Missing auth mechanism internal.', evidence: 'Auth.', fp: 'Context.', floor: 'high' },
  'L18-01': { name: 'circular dependency', sub: 'circular dependencies', trigger: 'Peer-to-peer circle dependency.', evidence: 'Circle.', fp: 'Context.', floor: 'high' },
  'L18-02': { name: 'hidden dependency', sub: 'undeclared dependencies', trigger: 'Tool gap setup OS tools.', evidence: 'Dependencies.', fp: 'Context.', floor: 'medium' },
  'L18-03': { name: 'missing dependency', sub: 'undeclared dependencies', trigger: 'Gap piece built-in module.', evidence: 'Dependencies.', fp: 'Context.', floor: 'high' },
  'L18-04': { name: 'dependency ordering violation', sub: 'undeclared dependencies', trigger: 'Order error parallel installs.', evidence: 'Dependencies.', fp: 'Context.', floor: 'medium' },
  'L18-05': { name: 'optional vs required confusion', sub: 'undeclared dependencies', trigger: 'Ambiguity feature sets dep.', evidence: 'Dependencies.', fp: 'Context.', floor: 'low' },
  'L18-06': { name: 'transitive dependency conflict', sub: 'version conflicts', trigger: 'Multi-version OS clash tree.', evidence: 'Conflicts.', fp: 'Context.', floor: 'high' },
  'L18-07': { name: 'redundant dependency', sub: 'undeclared dependencies', trigger: 'Extra dep pre-caching use.', evidence: 'Dependencies.', fp: 'Context.', floor: 'low' },
  'L18-08': { name: 'dependency version ambiguity', sub: 'version conflicts', trigger: 'Latest tag simple scripts.', evidence: 'Conflicts.', fp: 'Context.', floor: 'medium' },
  'L18-09': { name: 'ownership ambiguity', sub: 'ownership ambiguity', trigger: 'Unowned dependency core libs.', evidence: 'Ownership.', fp: 'Context.', floor: 'medium' },
  'L18-10': { name: 'transitive dependency mismatch', sub: 'transitive mismatches', trigger: 'Pinned transitive version conflict.', evidence: 'Mismatch.', fp: 'Context.', floor: 'high' },
  'L18-11': { name: 'dependency lifecycle gap', sub: 'dependency lifecycle gap', trigger: 'Missing lifecycle steps setup.', evidence: 'Lifecycle.', fp: 'Context.', floor: 'medium' },
  'L18-12': { name: 'transitive version conflict detail', sub: 'version conflicts', trigger: 'Diamond dependency clash tree.', evidence: 'Conflicts.', fp: 'Context.', floor: 'high' },
  'L18-13': { name: 'dependency ownership gap', sub: 'ownership ambiguity', trigger: 'Orphaned dep core module.', evidence: 'Ownership.', fp: 'Context.', floor: 'medium' },
  'L19-01': { name: 'missing data producer', sub: 'source-sink mismatch', trigger: 'Data gap external input.', evidence: 'Data Flow.', fp: 'Context.', floor: 'high' },
  'L19-02': { name: 'missing data consumer', sub: 'source-sink mismatch', trigger: 'Orphan data logging only.', evidence: 'Data Flow.', fp: 'Context.', floor: 'medium' },
  'L19-03': { name: 'data transformation ambiguity', sub: 'missing transformations', trigger: 'Black box standard encoding.', evidence: 'Transform.', fp: 'Context.', floor: 'low' },
  'L19-04': { name: 'inconsistent data shape', sub: 'source-sink mismatch', trigger: 'Shape mismatch schema-less.', evidence: 'Data Flow.', fp: 'Context.', floor: 'high' },
  'L19-05': { name: 'data lifecycle gap', sub: 'retention ambiguity', trigger: 'Retention gap infinite storage.', evidence: 'Retention.', fp: 'Context.', floor: 'medium' },
  'L19-06': { name: 'data duplication', sub: 'source-sink mismatch', trigger: 'Duplication read replica state.', evidence: 'Data Flow.', fp: 'Context.', floor: 'medium' },
  'L19-07': { name: 'invalid data propagation', sub: 'source-sink mismatch', trigger: 'Wrong path passthrough data.', evidence: 'Data Flow.', fp: 'Context.', floor: 'medium' },
  'L19-08': { name: 'stale data risk', sub: 'retention ambiguity', trigger: 'Staleness gap cache rules.', evidence: 'Retention.', fp: 'Context.', floor: 'high' },
  'L19-09': { name: 'PII flow undetected', sub: 'PII flow gaps', trigger: 'Unprotected PII path rules.', evidence: 'PII Flow.', fp: 'Context.', floor: 'critical' },
  'L19-10': { name: 'data-lifecycle gap', sub: 'data-lifecycle gaps', trigger: 'Missing lifecycle ephemeral data.', evidence: 'Lifecycle.', fp: 'Context.', floor: 'high' },
  'L19-11': { name: 'data provenance gap', sub: 'data provenance gap', trigger: 'Untraced data source constant.', evidence: 'Provenance.', fp: 'Context.', floor: 'medium' },
  'L19-12': { name: 'data transformation loss', sub: 'missing transformations', trigger: 'Lossy transform filtering fields.', evidence: 'Transform.', fp: 'Context.', floor: 'high' },
  'L19-13': { name: 'PII leakage path', sub: 'PII flow gaps', trigger: 'Unsafe PII sink anonymized.', evidence: 'PII Flow.', fp: 'Context.', floor: 'critical' },
  'L20-01': { name: 'unreachable execution path', sub: 'unreachable paths', trigger: 'Dead code safety fallback.', evidence: 'Execution.', fp: 'Context.', floor: 'medium' },
  'L20-02': { name: 'missing trigger', sub: 'branch omissions', trigger: 'Trigger gap manual start.', evidence: 'Branch.', fp: 'Context.', floor: 'high' },
  'L20-03': { name: 'conflicting triggers', sub: 'branch omissions', trigger: 'Conflict overloading starting path.', evidence: 'Branch.', fp: 'Context.', floor: 'medium' },
  'L20-04': { name: 'incomplete execution branch', sub: 'branch omissions', trigger: 'Missing branch happy-path only.', evidence: 'Branch.', fp: 'Context.', floor: 'high' },
  'L20-05': { name: 'dead-end workflow', sub: 'dead ends', trigger: 'Dead end completion state.', evidence: 'Path.', fp: 'Context.', floor: 'critical' },
  'L20-06': { name: 'infinite loop risk', sub: 'rollback path gaps', trigger: 'Recursion loop A B A.', evidence: 'Path.', fp: 'Context.', floor: 'high' },
  'L20-07': { name: 'conditional ambiguity', sub: 'unreachable paths', trigger: 'Ambiguity dynamic vars logic.', evidence: 'Execution.', fp: 'Context.', floor: 'critical' },
  'L20-08': { name: 'execution ordering violation', sub: 'unreachable paths', trigger: 'Order error async flows.', evidence: 'Execution.', fp: 'Context.', floor: 'high' },
  'L20-09': { name: 'missing rollback path', sub: 'rollback path gaps', trigger: 'No rollback spec irreversible.', evidence: 'Rollback.', fp: 'Context.', floor: 'high' },
  'L20-10': { name: 'execution-path gap', sub: 'execution-path gaps', trigger: 'Skipped step implicit defaults.', evidence: 'Gap.', fp: 'Context.', floor: 'high' },
  'L20-13': { name: 'non-deterministic execution', sub: 'non-deterministic execution', trigger: 'Variable outcome user input.', evidence: 'Execution.', fp: 'Context.', floor: 'critical' },
  'L20-14': { name: 'path dependency cycle', sub: 'path dependency cycles', trigger: 'Execution cycle recursive flows.', evidence: 'Path.', fp: 'Context.', floor: 'high' },
  'L20-15': { name: 'rollback path absence', sub: 'rollback path absence', trigger: 'One-way execution path safe.', evidence: 'Rollback.', fp: 'Context.', floor: 'high' },
  'L20-16': { name: 'idempotency gap', sub: 'idempotency gaps', trigger: 'Non-idempotent path side effects.', evidence: 'Execution.', fp: 'Context.', floor: 'critical' },
  'L20-17': { name: 'execution order indeterminism', sub: 'execution order determinism', trigger: 'Unstable step sequence parallel.', evidence: 'Execution.', fp: 'Context.', floor: 'high' },
  'L20-18': { name: 'path state preservation gap', sub: 'path state preservation', trigger: 'Volatile path state fire-and-forget.', evidence: 'Execution.', fp: 'Context.', floor: 'medium' },
  'L20-19': { name: 'conditional execution indeterminism', sub: 'conditional execution determinism', trigger: 'Hidden decision branch user.', evidence: 'Execution.', fp: 'Context.', floor: 'high' },
  'L20-20': { name: 'execution branching logic ambiguity', sub: 'execution branching logic', trigger: 'Vague branch rule exhaustive.', evidence: 'Execution.', fp: 'Context.', floor: 'medium' },
  'L21-01': { name: 'missing config key', sub: 'default ambiguity', trigger: 'Missing key optional keys.', evidence: 'Config.', fp: 'Context.', floor: 'high' },
  'L21-02': { name: 'conflicting config', sub: 'precedence conflicts', trigger: 'Conflict standard override CLI.', evidence: 'Conflicts.', fp: 'Context.', floor: 'medium' },
  'L21-03': { name: 'undocumented config', sub: 'default ambiguity', trigger: 'Secret config developer-only.', evidence: 'Config.', fp: 'Context.', floor: 'low' },
  'L21-04': { name: 'default ambiguity', sub: 'default ambiguity', trigger: 'Default gap system defaults.', evidence: 'Config.', fp: 'Context.', floor: 'medium' },
  'L21-05': { name: 'config dependency missing', sub: 'precedence conflicts', trigger: 'Dependency independent keys.', evidence: 'Conflicts.', fp: 'Context.', floor: 'medium' },
  'L21-06': { name: 'invalid fallback logic', sub: 'precedence conflicts', trigger: 'Bad fallback safe defaults.', evidence: 'Conflicts.', fp: 'Context.', floor: 'high' },
  'L21-07': { name: 'environment mismatch', sub: 'env drift', trigger: 'Env mismatch hybrid envs.', evidence: 'Drift.', fp: 'Context.', floor: 'medium' },
  'L21-08': { name: 'config validation gap', sub: 'default ambiguity', trigger: 'Validation gap trusted internals.', evidence: 'Config.', fp: 'Context.', floor: 'medium' },
  'L21-09': { name: 'secret-handling error', sub: 'secret-handling errors', trigger: 'Exposed secret path env var.', evidence: 'Secrets.', fp: 'Context.', floor: 'critical' },
  'L21-10': { name: 'env-variable collision', sub: 'env drift', trigger: 'Env var clash shared global.', evidence: 'Drift.', fp: 'Context.', floor: 'medium' },
  'L21-11': { name: 'config schema gap', sub: 'config schema gap', trigger: 'Missing config schema pairs.', evidence: 'Schema.', fp: 'Context.', floor: 'medium' },
  'L21-12': { name: 'default configuration bypass', sub: 'default ambiguity', trigger: 'Insecure bypass developer-only.', evidence: 'Config.', fp: 'Context.', floor: 'high' },
  'L21-13': { name: 'configuration precedence conflict', sub: 'configuration precedence conflicts', trigger: 'Conflicting config rules source.', evidence: 'Conflicts.', fp: 'Context.', floor: 'high' },
  'L22-01': { name: 'silent failure risk', sub: 'missing recovery', trigger: 'Empty catch intentional ignore.', evidence: 'Recovery.', fp: 'Context.', floor: 'critical' },
  'L22-02': { name: 'unclear error action', sub: 'unclear operator actions', trigger: 'Vague error technical logs.', evidence: 'Actions.', fp: 'Context.', floor: 'medium' },
  'L22-03': { name: 'missing retry policy', sub: 'retry storms', trigger: 'Call non-critical network.', evidence: 'Retry.', fp: 'Context.', floor: 'medium' },
  'L22-04': { name: 'error state leak', sub: 'missing recovery', trigger: 'State leak stateless apps.', evidence: 'Recovery.', fp: 'Context.', floor: 'high' },
  'L22-05': { name: 'generic error catch', sub: 'missing recovery', trigger: 'Catch all global handlers.', evidence: 'Recovery.', fp: 'Context.', floor: 'low' },
  'L22-06': { name: 'incomplete cleanup', sub: 'missing recovery', trigger: 'Resource leak auto-release.', evidence: 'Recovery.', fp: 'Context.', floor: 'high' },
  'L22-07': { name: 'error masking', sub: 'missing recovery', trigger: 'Masked error wrapping original.', evidence: 'Recovery.', fp: 'Context.', floor: 'medium' },
  'L22-08': { name: 'unlogged failures', sub: 'missing recovery', trigger: 'Silence user-facing only.', evidence: 'Recovery.', fp: 'Context.', floor: 'medium' },
  'L22-09': { name: 'error-handling recovery ambiguity', sub: 'error-handling recovery ambiguity', trigger: 'Vague recovery automatic retry.', evidence: 'Ambiguity.', fp: 'Context.', floor: 'medium' },
  'L22-10': { name: 'retry storm risk', sub: 'retry storms', trigger: 'Retry storm low-frequency tasks.', evidence: 'Retry.', fp: 'Context.', floor: 'high' },
  'L22-11': { name: 'error state contamination', sub: 'error state contamination', trigger: 'Cross-component error leak global.', evidence: 'Contamination.', fp: 'Context.', floor: 'high' },
  'L22-12': { name: 'partial-failure gap', sub: 'partial-failure gaps', trigger: 'Incomplete failure spec atomic.', evidence: 'Gap.', fp: 'Context.', floor: 'high' },
  'L22-13': { name: 'error-handling recovery ambiguity detail', sub: 'error-handling recovery ambiguity', trigger: 'Vague recovery path retry fail.', evidence: 'Ambiguity.', fp: 'Context.', floor: 'medium' },
  'L23-01': { name: 'plaintext secrets', sub: 'secret exposure', trigger: 'Secret placeholders in example.', evidence: 'Security.', fp: 'Context.', floor: 'critical' },
  'L23-02': { name: 'missing auth check', sub: 'authz ambiguity', trigger: 'Gap public pages sensitive.', evidence: 'Auth.', fp: 'Context.', floor: 'critical' },
  'L23-03': { name: 'unsafe defaults', sub: 'trust-boundary gaps', trigger: 'Bad default local-only setup.', evidence: 'Trust.', fp: 'Context.', floor: 'high' },
  'L23-04': { name: 'injection risk', sub: 'unsafe input handling', trigger: 'Direct usage sanitized input.', evidence: 'Input.', fp: 'Context.', floor: 'critical' },
  'L23-05': { name: 'broken trust boundary', sub: 'trust-boundary gaps', trigger: 'Boundary leak validated data.', evidence: 'Trust.', fp: 'Context.', floor: 'high' },
  'L23-06': { name: 'weak encryption', sub: 'crypto-lifecycle gaps', trigger: 'Weak algo integrity checks.', evidence: 'Crypto.', fp: 'Context.', floor: 'high' },
  'L23-07': { name: 'excessive permissions', sub: 'authz ambiguity', trigger: 'Over-privilege system tools tasks.', evidence: 'Auth.', fp: 'Context.', floor: 'medium' },
  'L23-08': { name: 'missing audit log', sub: 'authz ambiguity', trigger: 'Audit gap local apps record.', evidence: 'Auth.', fp: 'Context.', floor: 'medium' },
  'L23-09': { name: 'crypto-lifecycle gap', sub: 'crypto-lifecycle gaps', trigger: 'Missing key lifecycle session.', evidence: 'Crypto.', fp: 'Context.', floor: 'high' },
  'L23-10': { name: 'unsafe input handling detail', sub: 'unsafe input handling', trigger: 'Unsanitized input path trusted.', evidence: 'Input.', fp: 'Context.', floor: 'critical' },
  'L23-11': { name: 'privilege escalation path', sub: 'privilege escalation path', trigger: 'Escalation sequence intentional delegation.', evidence: 'Security.', fp: 'Context.', floor: 'critical' },
  'L23-12': { name: 'authz ambiguity detail', sub: 'authz ambiguity', trigger: 'Vague permission spec public.', evidence: 'Auth.', fp: 'Context.', floor: 'high' },
  'L24-01': { name: 'N+1 query risk', sub: 'unbounded work', trigger: 'Loop small lists fetches.', evidence: 'Performance.', fp: 'Context.', floor: 'high' },
  'L24-02': { name: 'unbounded memory', sub: 'large-document cost blowups', trigger: 'Full load small files RAM.', evidence: 'Performance.', fp: 'Context.', floor: 'medium' },
  'L24-03': { name: 'missing timeout', sub: 'expensive retries', trigger: 'No timeout local files wait.', evidence: 'Performance.', fp: 'Context.', floor: 'medium' },
  'L24-04': { name: 'resource leak', sub: 'resource-leak ambiguity', trigger: 'Leak path managed resources.', evidence: 'Performance.', fp: 'Context.', floor: 'high' },
  'L24-05': { name: 'expensive loop', sub: 'unbounded work', trigger: 'Big O risk small N.', evidence: 'Performance.', fp: 'Context.', floor: 'low' },
  'L24-06': { name: 'missing cache', sub: 'expensive retries', trigger: 'No cache fast calcs.', evidence: 'Performance.', fp: 'Context.', floor: 'low' },
  'L24-07': { name: 'blocking UI', sub: 'unbounded work', trigger: 'UI freeze CLI tools thread.', evidence: 'Performance.', fp: 'Context.', floor: 'medium' },
  'L24-08': { name: 'redundant work', sub: 'expensive retries', trigger: 'Duplicate work safety checks.', evidence: 'Performance.', fp: 'Context.', floor: 'low' },
  'L24-09': { name: 'large-document cost blowup', sub: 'large-document cost blowups', trigger: 'Unbounded growth fixed-size input.', evidence: 'Performance.', fp: 'Context.', floor: 'high' },
  'L24-10': { name: 'concurrency bottleneck detail', sub: 'concurrency bottleneck', trigger: 'Contention point serial tasks.', evidence: 'Concurrency.', fp: 'Context.', floor: 'medium' },
  'L24-11': { name: 'concurrency bottleneck', sub: 'concurrency bottleneck', trigger: 'Contention point serial locks.', evidence: 'Concurrency.', fp: 'Context.', floor: 'medium' },
  'L24-12': { name: 'scale assumption violation', sub: 'scale assumptions', trigger: 'Under-scaled architecture experimental.', evidence: 'Scale.', fp: 'Context.', floor: 'high' },
  'L25-01': { name: 'untestable logic', sub: 'unverifiable conclusions', trigger: 'Test gap simple UI state.', evidence: 'Testability.', fp: 'Context.', floor: 'medium' },
  'L25-02': { name: 'missing mock strategy', sub: 'test-environment drift', trigger: 'Live dependency integration tests.', evidence: 'Testability.', fp: 'Context.', floor: 'high' },
  'L25-03': { name: 'weak assertions', sub: 'weak expected outputs', trigger: 'Weak check smoke tests.', evidence: 'Testability.', fp: 'Context.', floor: 'low' },
  'L25-04': { name: 'unreliable tests', sub: 'test-environment drift', trigger: 'Flake risk external APIs.', evidence: 'Testability.', fp: 'Context.', floor: 'high' },
  'L25-05': { name: 'missing unit coverage', sub: 'validation blind spots', trigger: 'Coverage gap thin wrappers.', evidence: 'Testability.', fp: 'Context.', floor: 'medium' },
  'L25-06': { name: 'hardcoded test data', sub: 'test-environment drift', trigger: 'Brittle data fixed constants.', evidence: 'Testability.', fp: 'Context.', floor: 'medium' },
  'L25-07': { name: 'hidden test requirements', sub: 'missing examples', trigger: 'Gap standard runners tools.', evidence: 'Testability.', fp: 'Context.', floor: 'medium' },
  'L25-08': { name: 'slow test suite', sub: 'test-environment drift', trigger: 'Duration heavy ML sim.', evidence: 'Testability.', fp: 'Context.', floor: 'low' },
  'L25-09': { name: 'test-environment drift detail', sub: 'test-environment drift', trigger: 'Env-specific test containerized.', evidence: 'Testability.', fp: 'Context.', floor: 'medium' },
  'L25-10': { name: 'missing test specification', sub: 'missing examples', trigger: 'No example self-evident features.', evidence: 'Testability.', fp: 'Context.', floor: 'medium' },
  'L25-11': { name: 'test isolation failure', sub: 'test isolation failure', trigger: 'Cross-test contamination fixtures.', evidence: 'Isolation.', fp: 'Context.', floor: 'high' },
  'L25-12': { name: 'unverifiable claim', sub: 'unverifiable claims', trigger: 'Untestable proof claim goal.', evidence: 'Claims.', fp: 'Context.', floor: 'medium' },
  'L26-01': { name: 'logic duplication', sub: 'duplication', trigger: 'Copy decoupled systems rule.', evidence: 'Maintainability.', fp: 'Context.', floor: 'medium' },
  'L26-02': { name: 'magic numbers', sub: 'missing conventions', trigger: 'Number well known constants.', evidence: 'Maintainability.', fp: 'Context.', floor: 'low' },
  'L26-03': { name: 'deep nesting', sub: 'brittle coupling', trigger: 'Nesting depth complex logic.', evidence: 'Maintainability.', fp: 'Context.', floor: 'medium' },
  'L26-04': { name: 'missing comments', sub: 'technical-debt ambiguity', trigger: 'How gap self-doc code.', evidence: 'Debt.', fp: 'Context.', floor: 'low' },
  'L26-05': { name: 'large components', sub: 'brittle coupling', trigger: 'Size core engines class.', evidence: 'Maintainability.', fp: 'Context.', floor: 'medium' },
  'L26-06': { name: 'inconsistent naming', sub: 'missing conventions', trigger: 'Style drift legacy glue.', evidence: 'Maintainability.', fp: 'Context.', floor: 'low' },
  'L26-07': { name: 'dead code', sub: 'duplication', trigger: 'Unused code library exports.', evidence: 'Maintainability.', fp: 'Context.', floor: 'low' },
  'L26-08': { name: 'hidden dependencies', sub: 'brittle coupling', trigger: 'Global use environment globals.', evidence: 'Maintainability.', fp: 'Context.', floor: 'high' },
  'L26-09': { name: 'maintainability gap', sub: 'technical-debt ambiguity', trigger: 'Spaghetti path optimized hot-paths.', evidence: 'Debt.', fp: 'Context.', floor: 'medium' },
  'L26-10': { name: 'hidden ownership detail', sub: 'hidden ownership detail', trigger: 'Orphaned module standard utils.', evidence: 'Ownership.', fp: 'Context.', floor: 'low' },
  'L26-11': { name: 'refactoring risk', sub: 'refactoring risk', trigger: 'Shotgun surgery cross-cutting.', evidence: 'Refactoring.', fp: 'Context.', floor: 'medium' },
  'L26-12': { name: 'hidden ownership', sub: 'hidden ownership', trigger: 'Orphaned code core shared.', evidence: 'Ownership.', fp: 'Context.', floor: 'low' },
  'L27-01': { name: 'jargon without help', sub: 'jargon overload', trigger: 'Term industry standard help.', evidence: 'Usability.', fp: 'Context.', floor: 'medium' },
  'L27-02': { name: 'missing feedback', sub: 'poor examples', trigger: 'Feedback gap background tasks.', evidence: 'Usability.', fp: 'Context.', floor: 'low' },
  'L27-03': { name: 'confusing navigation', sub: 'confusing task order', trigger: 'Step sequence wizard flows.', evidence: 'Navigation.', fp: 'Context.', floor: 'medium' },
  'L27-04': { name: 'poor error recovery', sub: 'accessibility/readability issues', trigger: 'Reset risk security resets.', evidence: 'Recovery.', fp: 'Context.', floor: 'high' },
  'L27-05': { name: 'accessibility gap', sub: 'accessibility/readability issues', trigger: 'No alt-text msg tools.', evidence: 'A11y.', fp: 'Context.', floor: 'medium' },
  'L27-06': { name: 'inconsistent terminology', sub: 'jargon overload', trigger: 'Term drift domain synonyms.', evidence: 'Usability.', fp: 'Context.', floor: 'low' },
  'L27-07': { name: 'overwhelming options', sub: 'cognitive-load gaps', trigger: 'Choice overload expert mode.', evidence: 'Load.', fp: 'Context.', floor: 'medium' },
  'L27-08': { name: 'slow response time', sub: 'accessibility/readability issues', trigger: 'Delay instant tasks indicator.', evidence: 'UX.', fp: 'Context.', floor: 'medium' },
  'L27-09': { name: 'mandatory UI component gap', sub: 'missing mandatory UI components', trigger: 'Missing UI element CLI-only.', evidence: 'UI Contract.', fp: 'Context.', floor: 'high' },
  'L27-10': { name: 'exposed fatal state UX', sub: 'fatal UI state exposure', trigger: 'Raw error display developer.', evidence: 'Fatal UX.', fp: 'Context.', floor: 'high' },
  'L27-11': { name: 'UI feedback gap', sub: 'UI feedback gap', trigger: 'Missing UI update background.', evidence: 'Feedback.', fp: 'Context.', floor: 'medium' },
  'L27-12': { name: 'UI state machine correctness gap', sub: 'UI state machine correctness', trigger: 'Broken UI logic simple.', evidence: 'UI Logic.', fp: 'Context.', floor: 'medium' },
  'L27-13': { name: 'UI-state mapping inconsistency', sub: 'UI-state mapping', trigger: 'UI-backend drift local-only.', evidence: 'Mapping.', fp: 'Context.', floor: 'high' },
  'L27-14': { name: 'mandatory UI surface gap', sub: 'mandatory UI surface gaps', trigger: 'Hidden feature in UI.', evidence: 'UI Surface.', fp: 'Context.', floor: 'high' },
  'L27-15': { name: 'UI interactivity gap', sub: 'UI interactivity gaps', trigger: 'Dead UI elements static.', evidence: 'Interactivity.', fp: 'Context.', floor: 'low' },
  'L27-16': { name: 'exposed fatal-state UX violation', sub: 'exposed fatal-state UX violations', trigger: 'Poor fatal UX technical.', evidence: 'Fatal UX.', fp: 'Context.', floor: 'medium' },
  'L28-01': { name: 'format mismatch', sub: 'format assumptions', trigger: 'Mismatch transformers JSON XML.', evidence: 'Interop.', fp: 'Context.', floor: 'high' },
  'L28-02': { name: 'protocol gap', sub: 'protocol mismatch', trigger: 'Protocol gap polling fallback.', evidence: 'Protocol.', fp: 'Context.', floor: 'high' },
  'L28-03': { name: 'backward compatibility break', sub: 'backward-compatibility gaps', trigger: 'Break major version data.', evidence: 'Compatibility.', fp: 'Context.', floor: 'critical' },
  'L28-04': { name: 'hardcoded endpoints', sub: 'integration ambiguity', trigger: 'Hardcoded IP local dev.', evidence: 'Integration.', fp: 'Context.', floor: 'medium' },
  'L28-05': { name: 'encoding mismatch', sub: 'format assumptions', trigger: 'Encoding gap auto-detect UTF.', evidence: 'Format.', fp: 'Context.', floor: 'medium' },
  'L28-06': { name: 'time zone ambiguity', sub: 'format assumptions', trigger: 'Date local-only apps UTC.', evidence: 'Format.', fp: 'Context.', floor: 'medium' },
  'L28-07': { name: 'missing schema version', sub: 'format assumptions', trigger: 'Version gap static data.', evidence: 'Format.', fp: 'Context.', floor: 'medium' },
  'L28-08': { name: 'third-party dependency', sub: 'integration ambiguity', trigger: 'Hidden dep core OS.', evidence: 'Integration.', fp: 'Context.', floor: 'high' },
  'L28-09': { name: 'compatibility mismatch', sub: 'interoperability compatibility mismatches', trigger: 'Version mismatch negotiated.', evidence: 'Compatibility.', fp: 'Context.', floor: 'high' },
  'L28-10': { name: 'backward-compatibility gap', sub: 'backward-compatibility gaps', trigger: 'Undocumented breaking change.', evidence: 'Compatibility.', fp: 'Context.', floor: 'high' },
  'L28-11': { name: 'schema version mismatch', sub: 'schema version mismatch', trigger: 'Cross-version data drift.', evidence: 'Schema.', fp: 'Context.', floor: 'high' },
  'L28-12': { name: 'integration ambiguity detail', sub: 'integration ambiguity detail', trigger: 'Missing integration spec common.', evidence: 'Integration.', fp: 'Context.', floor: 'medium' },
  'L29-01': { name: 'policy violation', sub: 'policy traceability', trigger: 'Violation policy updates forbidden.', evidence: 'Governance.', fp: 'Context.', floor: 'critical' },
  'L29-02': { name: 'missing approval gate', sub: 'approval gates', trigger: 'Gap solo apps high-risk.', evidence: 'Gates.', fp: 'Context.', floor: 'high' },
  'L29-03': { name: 'untraceable change', sub: 'auditability', trigger: 'Audit gap temp files modified.', evidence: 'Audit.', fp: 'Context.', floor: 'high' },
  'L29-04': { name: 'retention violation', sub: 'retention/compliance gaps', trigger: 'Over-retention anonymized PII.', evidence: 'Retention.', fp: 'Context.', floor: 'critical' },
  'L29-05': { name: 'compliance gap', sub: 'compliance-scope ambiguity', trigger: 'Gap non-regulated requirement.', evidence: 'Compliance.', fp: 'Context.', floor: 'critical' },
  'L29-06': { name: 'unclear ownership', sub: 'policy traceability', trigger: 'Ownership gap shared data.', evidence: 'Ownership.', fp: 'Context.', floor: 'medium' },
  'L29-07': { name: 'missing fail-safe', sub: 'fail-safe condition ambiguity', trigger: 'No fail-safe manual breach.', evidence: 'Safety.', fp: 'Context.', floor: 'high' },
  'L29-08': { name: 'override ambiguity', sub: 'override ambiguity', trigger: 'Authority gap root admin.', evidence: 'Override.', fp: 'Context.', floor: 'medium' },
  'L29-09': { name: 'policy-priority conflict detail', sub: 'policy-priority conflicts', trigger: 'Policy clash implicit ordering.', evidence: 'Priority.', fp: 'Context.', floor: 'high' },
  'L29-10': { name: 'checkpoint omission detail', sub: 'checkpoint omissions', trigger: 'Gate omission internal-only.', evidence: 'Checkpoint.', fp: 'Context.', floor: 'critical' },
  'L29-11': { name: 'policy-priority conflict', sub: 'policy-priority conflicts', trigger: 'Unresolved policy clash priority.', evidence: 'Priority.', fp: 'Context.', floor: 'high' },
  'L29-12': { name: 'checkpoint omission', sub: 'checkpoint omissions', trigger: 'Missing gate automated pipes.', evidence: 'Checkpoint.', fp: 'Context.', floor: 'critical' },
  'L29-13': { name: 'compliance-scope ambiguity detail', sub: 'compliance-scope ambiguity', trigger: 'Unclear scope single-reg.', evidence: 'Compliance.', fp: 'Context.', floor: 'high' },
  'L29-14': { name: 'enforcement-path gap detail', sub: 'enforcement-path gaps', trigger: 'Unenforced policy voluntary.', evidence: 'Enforcement.', fp: 'Context.', floor: 'high' },
  'L29-15': { name: 'governance bypass path', sub: 'governance bypass path', trigger: 'Audit-free path break-glass.', evidence: 'Bypass.', fp: 'Context.', floor: 'critical' },
  'L29-16': { name: 'compliance gate omission', sub: 'checkpoint omissions', trigger: 'Missing compliance check internal.', evidence: 'Checkpoint.', fp: 'Context.', floor: 'critical' },
  'L29-17': { name: 'enforcement-path gap', sub: 'enforcement-path gaps', trigger: 'Unenforced policy informal.', evidence: 'Enforcement.', fp: 'Context.', floor: 'high' },
  'L29-18': { name: 'governance checkpoint gap', sub: 'governance checkpoint gaps', trigger: 'Missing audit gate automation.', evidence: 'Checkpoint.', fp: 'Context.', floor: 'critical' },
  'L29-19': { name: 'PSG mutation bypass detail', sub: 'PSG mutation bypass', trigger: 'Unchecked mutation path bootstrap.', evidence: 'Bypass.', fp: 'Context.', floor: 'critical' },
  'L29-20': { name: 'missing commit-hash binding detail', sub: 'missing commit-hash binding', trigger: 'Unbound decision informal.', evidence: 'Binding.', fp: 'Context.', floor: 'medium' },
  'L29-21': { name: 'unauthorized agent write detail', sub: 'unauthorized agent writes', trigger: 'Authority breach delegation.', evidence: 'Security.', fp: 'Context.', floor: 'critical' },
  'L30-01': { name: 'SPOF risk', sub: 'single points of failure', trigger: 'SPOF trivial apps system.', evidence: 'SPOF.', fp: 'Context.', floor: 'critical' },
  'L30-02': { name: 'no recovery plan', sub: 'backup/restore gaps', trigger: 'No restore stateless apps.', evidence: 'Recovery.', fp: 'Context.', floor: 'high' },
  'L30-03': { name: 'degraded mode gap', sub: 'degraded-mode gaps', trigger: 'Crash real-time only database.', evidence: 'Degraded.', fp: 'Context.', floor: 'medium' },
  'L30-04': { name: 'failover delay', sub: 'failover-ambiguity', trigger: 'Delay manual failover SLA.', evidence: 'Failover.', fp: 'Context.', floor: 'high' },
  'L30-05': { name: 'data loss risk', sub: 'backup/restore gaps', trigger: 'Write gap consistency async.', evidence: 'Data loss.', fp: 'Context.', floor: 'high' },
  'L30-06': { name: 'untested restore', sub: 'backup/restore gaps', trigger: 'Verification gap simple logs.', evidence: 'Restore.', fp: 'Context.', floor: 'medium' },
  'L30-07': { name: 'circuit breaker missing', sub: 'degraded-mode gaps', trigger: 'Storm low traffic calls.', evidence: 'Circuit.', fp: 'Context.', floor: 'high' },
  'L30-08': { name: 'stale state on resume', sub: 'degraded-mode gaps', trigger: 'Staleness static data outage.', evidence: 'State.', fp: 'Context.', floor: 'medium' },
  'L30-09': { name: 'rollback infeasibility', sub: 'rollback infeasibility', trigger: 'Irreversible action append-only.', evidence: 'Rollback.', fp: 'Context.', floor: 'high' },
  'L30-10': { name: 'fail-safe absence', sub: 'fail-safe absence', trigger: 'No safe state fail-open.', evidence: 'Safety.', fp: 'Context.', floor: 'high' },
  'L30-11': { name: 'backup-restore gap', sub: 'backup/restore gaps', trigger: 'Missing backup spec stateless.', evidence: 'Backup.', fp: 'Context.', floor: 'high' },
  'L30-12': { name: 'failover ambiguity', sub: 'failover-ambiguity', trigger: 'Vague failover single-instance.', evidence: 'Failover.', fp: 'Context.', floor: 'high' },
  'L30-13': { name: 'non-idempotent retry risk', sub: 'non-idempotent retries', trigger: 'Duplicate side effects ops.', evidence: 'Retry.', fp: 'Context.', floor: 'critical' },
  'L30-14': { name: 'outage handling detail', sub: 'outage handling detail', trigger: 'Missing DR plan internal.', evidence: 'Outage.', fp: 'Context.', floor: 'high' },
  'L30-15': { name: 'state recovery indeterminism', sub: 'state recovery indeterminism', trigger: 'Unstable recovery state heuristic.', evidence: 'Recovery.', fp: 'Context.', floor: 'high' },
  'L30-16': { name: 'emergency recovery ambiguity', sub: 'emergency recovery ambiguity', trigger: 'Vague recovery path general.', evidence: 'Recovery.', fp: 'Context.', floor: 'high' },
  'L30-17': { name: 'outage handling gap', sub: 'outage handling', trigger: 'No DR spec low-SLA.', evidence: 'Outage.', fp: 'Context.', floor: 'high' },
  'L30-18': { name: 'recovery journal gap', sub: 'recovery journal gaps', trigger: 'No journal stateless apps.', evidence: 'Journal.', fp: 'Context.', floor: 'high' },
  'L30-19': { name: 'simulation gate omission detail', sub: 'simulation gate omissions', trigger: 'Skipped simulation emergency.', evidence: 'Simulation.', fp: 'Context.', floor: 'critical' },
  'L30-20': { name: 'simulation mutation risk detail', sub: 'simulation mutation risk', trigger: 'Unsafe simulation replicas.', evidence: 'Simulation.', fp: 'Context.', floor: 'critical' },
  'L31-01': { name: 'missing logging', sub: 'missing logs', trigger: 'Logging gap noisy logs.', evidence: 'Logs.', fp: 'Context.', floor: 'medium' },
  'L31-02': { name: 'missing metrics', sub: 'metrics gaps', trigger: 'Metrics gap external monitor.', evidence: 'Metrics.', fp: 'Context.', floor: 'medium' },
  'L31-03': { name: 'missing tracing', sub: 'tracing gaps', trigger: 'Trace gap monoliths services.', evidence: 'Tracing.', fp: 'Context.', floor: 'low' },
  'L31-04': { name: 'missing alerting', sub: 'correlation IDs and alert-threshold gaps', trigger: 'Alert gap manual monitor.', evidence: 'Alerts.', fp: 'Context.', floor: 'high' },
  'L31-05': { name: 'missing dashboard', sub: 'metrics gaps', trigger: 'Viz gap CLI only.', evidence: 'Dash.', fp: 'Context.', floor: 'low' },
  'L31-06': { name: 'missing SLI/SLO', sub: 'correlation IDs and alert-threshold gaps', trigger: 'SLO gap best effort.', evidence: 'SLA.', fp: 'Context.', floor: 'medium' },
  'L31-07': { name: 'missing incident response', sub: 'correlation IDs and alert-threshold gaps', trigger: 'IR gap small teams.', evidence: 'Response.', fp: 'Context.', floor: 'medium' },
  'L31-08': { name: 'missing runbook', sub: 'missing logs', trigger: 'Runbook gap self-healing fix.', evidence: 'Runbook.', fp: 'Context.', floor: 'high' },
  'L31-09': { name: 'observability blind spot', sub: 'blind-spot gaps', trigger: 'Unmonitored path internal components.', evidence: 'Visibility.', fp: 'Context.', floor: 'high' },
  'L31-10': { name: 'alert-threshold gap', sub: 'correlation IDs and alert-threshold gaps', trigger: 'No alerting spec dashboard.', evidence: 'Alerts.', fp: 'Context.', floor: 'high' },
  'L31-11': { name: 'blind-spot gap detail', sub: 'blind-spot gaps', trigger: 'Unmonitored subsystem low-impact.', evidence: 'Visibility.', fp: 'Context.', floor: 'high' },
  'L31-12': { name: 'tracing gap', sub: 'tracing gaps', trigger: 'Trace-free path monoliths distributed.', evidence: 'Tracing.', fp: 'Context.', floor: 'medium' },
  'L31-13': { name: 'observability cost risk', sub: 'metrics gaps', trigger: 'Oversampling debug logging verbose.', evidence: 'Logs.', fp: 'Context.', floor: 'low' },
  'L31-14': { name: 'observability blind spot detail', sub: 'observability blind spot', trigger: 'Unmonitored path simple utils.', evidence: 'Visibility.', fp: 'Context.', floor: 'high' },
  'L32-01': { name: 'missing versioning strategy', sub: 'versioning gaps', trigger: 'Version gap single release.', evidence: 'Evolution.', fp: 'Context.', floor: 'medium' },
  'L32-02': { name: 'missing migration path', sub: 'evolution/versioning migration scenarios', trigger: 'Migration gap greenfield deployments.', evidence: 'Migration.', fp: 'Context.', floor: 'critical' },
  'L32-03': { name: 'missing deprecation policy', sub: 'deprecation policy gaps', trigger: 'Deprecation gap internal beta.', evidence: 'Evolution.', fp: 'Context.', floor: 'medium' },
  'L32-04': { name: 'missing backward compatibility', sub: 'compatibility promises', trigger: 'Compat break major breaks.', evidence: 'Compatibility.', fp: 'Context.', floor: 'high' },
  'L32-05': { name: 'missing extensibility', sub: 'migration gaps', trigger: 'Extensibility gap proprietary.', evidence: 'Migration.', fp: 'Context.', floor: 'low' },
  'L32-06': { name: 'missing plugin architecture', sub: 'migration gaps', trigger: 'Hook gap monolithic architecture.', evidence: 'Migration.', fp: 'Context.', floor: 'low' },
  'L32-07': { name: 'missing feature flags', sub: 'migration gaps', trigger: 'Flag gap small features.', evidence: 'Migration.', fp: 'Context.', floor: 'medium' },
  'L32-08': { name: 'missing rollout strategy', sub: 'migration gaps', trigger: 'Rollout gap internal apps.', evidence: 'Migration.', fp: 'Context.', floor: 'medium' },
  'L32-09': { name: 'deprecation policy gap detail', sub: 'deprecation policy gaps', trigger: 'Vague sunset beta deletions.', evidence: 'Evolution.', fp: 'Context.', floor: 'medium' },
  'L32-10': { name: 'versioning strategy gap', sub: 'versioning gaps', trigger: 'Version drift risk tight monorepos.', evidence: 'Evolution.', fp: 'Context.', floor: 'medium' },
  'L32-11': { name: 'evolution/versioning migration scenario', sub: 'evolution/versioning migration scenarios', trigger: 'Missing migration spec new installs.', evidence: 'Migration.', fp: 'Context.', floor: 'high' },
  'L32-12': { name: 'migration gap detail', sub: 'migration gap detail', trigger: 'Missing migration steps fresh installs.', evidence: 'Migration.', fp: 'Context.', floor: 'medium' },
  'L33-01': { name: 'missing input domain closure', sub: 'input domain closure', trigger: 'Open-ended input string fields.', evidence: 'Spec.', fp: 'Context.', floor: 'medium' },
  'L33-02': { name: 'canonical vocabulary gap', sub: 'canonical vocabulary enforcement', trigger: 'Undefined term common words.', evidence: 'Vocab.', fp: 'Context.', floor: 'low' },
  'L33-03': { name: 'state-space undefined', sub: 'state-space definition', trigger: 'Implicit state stateless logic.', evidence: 'States.', fp: 'Context.', floor: 'high' },
  'L33-04': { name: 'output contract non-determinism', sub: 'output contract determinism', trigger: 'Vague output logs defined.', evidence: 'Output.', fp: 'Context.', floor: 'high' },
  'L33-05': { name: 'spec completeness violation', sub: 'spec completeness', trigger: 'Undefined behavior zone default.', evidence: 'Spec.', fp: 'Context.', floor: 'medium' },
  'L33-06': { name: 'terminology registry gap', sub: 'terminology registry', trigger: 'Unregistered term industry standard.', evidence: 'Vocab.', fp: 'Context.', floor: 'medium' },
  'L33-07': { name: 'type entity rigor gap', sub: 'type/entity rigor', trigger: 'Informal type simple types.', evidence: 'Types.', fp: 'Context.', floor: 'medium' },
  'L33-08': { name: 'symbol consistency violation', sub: 'symbol consistency', trigger: 'Symbol reuse renamed symbols.', evidence: 'Symbols.', fp: 'Context.', floor: 'medium' },
  'L33-09': { name: 'input domain non-closure detail', sub: 'input domain closure', trigger: 'Open input domain well-typed.', evidence: 'Spec.', fp: 'Context.', floor: 'high' },
  'L33-10': { name: 'output contract indeterminism', sub: 'output contract determinism', trigger: 'Non-deterministic output stochastic.', evidence: 'Output.', fp: 'Context.', floor: 'critical' },
  'L33-11': { name: 'canonical vocabulary enforcement detail', sub: 'canonical vocabulary enforcement', trigger: 'Vocab misuse creative writing.', evidence: 'Vocab.', fp: 'Context.', floor: 'medium' },
  'L33-12': { name: 'state-space definition gap', sub: 'state-space definition', trigger: 'Undefined state usage ephemeral.', evidence: 'States.', fp: 'Context.', floor: 'medium' },
  'L33-13': { name: 'symbol consistency violation detail', sub: 'symbol consistency violation', trigger: 'Symbol clash local scoping.', evidence: 'Symbols.', fp: 'Context.', floor: 'medium' },
  'L34-01': { name: 'mandatory simulation gap', sub: 'mandatory simulation', trigger: 'Direct execution read-only flows.', evidence: 'Simulation.', fp: 'Context.', floor: 'high' },
  'L34-02': { name: 'simulation mutation risk', sub: 'simulation non-mutation', trigger: 'Mutation in sim local sandbox.', evidence: 'Simulation.', fp: 'Context.', floor: 'critical' },
  'L34-03': { name: 'pre-simulation governance gap', sub: 'pre-simulation governance', trigger: 'Missing policy open tools.', evidence: 'Governance.', fp: 'Context.', floor: 'medium' },
  'L34-04': { name: 'verification completeness gap', sub: 'verification completeness', trigger: 'Unchecked results ad-hoc runs.', evidence: 'Verification.', fp: 'Context.', floor: 'high' },
  'L34-05': { name: 'risk classification missing', sub: 'risk classification', trigger: 'Missing risk tier low-risk.', evidence: 'Risk.', fp: 'Context.', floor: 'high' },
  'L34-06': { name: 'simulation gate bypass', sub: 'light-vs-heavy simulation correctness', trigger: 'Wrong sim tier read-only ops.', evidence: 'Simulation.', fp: 'Context.', floor: 'high' },
  'L34-07': { name: 'formal verification boundary undefined', sub: 'formal verification boundary', trigger: 'Undefined boundary informal systems.', evidence: 'Verification.', fp: 'Context.', floor: 'medium' },
  'L34-08': { name: 'post-simulation validation absence', sub: 'post-simulation governance', trigger: 'No post-check visual inspection.', evidence: 'Governance.', fp: 'Context.', floor: 'high' },
  'L34-09': { name: 'pre-simulation check absence', sub: 'pre-simulation governance', trigger: 'No pre-check open environments.', evidence: 'Governance.', fp: 'Context.', floor: 'medium' },
  'L34-10': { name: 'simulation gate omission detail', sub: 'pre-simulation governance', trigger: 'Missing gate low-risk actions.', evidence: 'Governance.', fp: 'Context.', floor: 'critical' },
  'L34-11': { name: 'simulation mutation risk detail', sub: 'simulation non-mutation', trigger: 'Live mutation read-only sims.', evidence: 'Simulation.', fp: 'Context.', floor: 'critical' },
  'L34-12': { name: 'verification completeness detail', sub: 'verification completeness', trigger: 'Partial verification targeted verification.', evidence: 'Verification.', fp: 'Context.', floor: 'high' },
  'L34-13': { name: 'formal verification gap', sub: 'formal verification boundary', trigger: 'Unproven claim heuristic verification.', evidence: 'Verification.', fp: 'Context.', floor: 'high' },
  'L34-14': { name: 'simulation gate omission detail 2', sub: 'simulation gate omission', trigger: 'Missing gate spec read-only.', evidence: 'Simulation.', fp: 'Context.', floor: 'high' },
  'L35-01': { name: 'memory temporal inconsistency', sub: 'temporal consistency', trigger: 'Epoch mismatch eventual consistency.', evidence: 'Consistency.', fp: 'Context.', floor: 'high' },
  'L35-02': { name: 'PSG mutation exclusivity violation', sub: 'PSG mutation gateway exclusivity', trigger: 'Direct write cache updates.', evidence: 'Gateway.', fp: 'Context.', floor: 'critical' },
  'L35-03': { name: 'snapshot isolation gap', sub: 'PSG snapshot isolation', trigger: 'Dirty read analytics state.', evidence: 'Isolation.', fp: 'Context.', floor: 'high' },
  'L35-04': { name: 'commit binding gap', sub: 'PSG commit binding', trigger: 'Unbound write ephemeral state.', evidence: 'Binding.', fp: 'Context.', floor: 'medium' },
  'L35-05': { name: 'memory conflict resolution undefined', sub: 'memory conflict resolution', trigger: 'No resolution single-writer state.', evidence: 'Conflicts.', fp: 'Context.', floor: 'high' },
  'L35-06': { name: 'read write authority gap', sub: 'read/write authority', trigger: 'Unrestricted access public state.', evidence: 'Authority.', fp: 'Context.', floor: 'high' },
  'L35-07': { name: 'snapshot version drift', sub: 'snapshot/version invariants', trigger: 'Version mismatch async replication.', evidence: 'Invariants.', fp: 'Context.', floor: 'high' },
  'L35-08': { name: 'PSG write atomicity gap', sub: 'PSG write atomicity', trigger: 'Partial write single-field updates.', evidence: 'Atomicity.', fp: 'Context.', floor: 'high' },
  'L35-09': { name: 'memory taxonomy undefined', sub: 'memory taxonomy', trigger: 'Flat memory model simple stores.', evidence: 'Taxonomy.', fp: 'Context.', floor: 'medium' },
  'L35-10': { name: 'garbage collection determinism', sub: 'garbage collection determinism', trigger: 'Non-deterministic GC manual cleanup.', evidence: 'GC.', fp: 'Context.', floor: 'medium' },
  'L35-11': { name: 'PSG read consistency gap', sub: 'PSG read consistency', trigger: 'Inconsistent read eventually consistent.', evidence: 'Consistency.', fp: 'Context.', floor: 'high' },
  'L35-12': { name: 'PSG write atomicity breach', sub: 'PSG write atomicity', trigger: 'Non-atomic write single-variable.', evidence: 'Atomicity.', fp: 'Context.', floor: 'high' },
  'L35-13': { name: 'memory temporal inconsistency detail', sub: 'memory temporal inconsistency', trigger: 'Stale read risk eventually consistent.', evidence: 'Consistency.', fp: 'Context.', floor: 'high' },
  'L36-01': { name: 'agent role overlap', sub: 'role non-overlap', trigger: 'Role conflict backup agents.', evidence: 'Roles.', fp: 'Context.', floor: 'high' },
  'L36-02': { name: 'arbitration ambiguity', sub: 'arbitration strategy', trigger: 'Missing arbiter independent agents.', evidence: 'Arbitration.', fp: 'Context.', floor: 'high' },
  'L36-03': { name: 'agent authority violation', sub: 'authority boundaries', trigger: 'Over-permission super-agents.', evidence: 'Authority.', fp: 'Context.', floor: 'critical' },
  'L36-04': { name: 'composability constraints missing', sub: 'composability', trigger: 'Silent failure simple chains.', evidence: 'Composability.', fp: 'Context.', floor: 'medium' },
  'L36-05': { name: 'agent role boundary violation', sub: 'role non-overlap', trigger: 'Scope violation super-agents.', evidence: 'Roles.', fp: 'Context.', floor: 'high' },
  'L36-06': { name: 'failure isolation missing', sub: 'failure isolation', trigger: 'Uncontained failure monolithic agents.', evidence: 'Isolation.', fp: 'Context.', floor: 'high' },
  'L36-07': { name: 'agent I/O contract gap', sub: 'agent I/O contracts', trigger: 'Missing I/O spec simple agents.', evidence: 'Contracts.', fp: 'Context.', floor: 'medium' },
  'L36-08': { name: 'agent mutation prohibition gap', sub: 'agent mutation prohibitions', trigger: 'Mutation violation write-agents.', evidence: 'Mutation.', fp: 'Context.', floor: 'critical' },
  'L36-09': { name: 'communication protocol undefined', sub: 'communication protocol', trigger: 'Ad-hoc messaging direct calls.', evidence: 'Protocol.', fp: 'Context.', floor: 'medium' },
  'L36-10': { name: 'authority boundary overlap', sub: 'authority boundaries', trigger: 'Overlapping domains single agent.', evidence: 'Authority.', fp: 'Context.', floor: 'high' },
  'L36-11': { name: 'unauthorized agent writes detail', sub: 'unauthorized agent writes', trigger: 'Unauthorized write system-level admin.', evidence: 'Authority.', fp: 'Context.', floor: 'critical' },
  'L36-12': { name: 'unauthorized agent write', sub: 'unauthorized agent writes', trigger: 'Unauthorized write attempt overrides.', evidence: 'Authority.', fp: 'Context.', floor: 'critical' },
  'L36-13': { name: 'agent role non-overlap violation', sub: 'role non-overlap', trigger: 'Role collision backup redundancy.', evidence: 'Roles.', fp: 'Context.', floor: 'high' },
  'L36-14': { name: 'arbitration ambiguity detail', sub: 'arbitration ambiguity', trigger: 'Missing arbitration rules single agent.', evidence: 'Arbitration.', fp: 'Context.', floor: 'high' },
  'L36-15': { name: 'agent orchestration detail', sub: 'agent_coordination', trigger: 'Orchestration gap single-agent contexts.', evidence: 'Orchestration.', fp: 'Context.', floor: 'medium', ceiling: 'high' },
  'L37-01': { name: 'sandbox isolation breach', sub: 'sandbox isolation', trigger: 'Unsafe API approved core tools.', evidence: 'Sandbox.', fp: 'Context.', floor: 'critical' },
  'L37-02': { name: 'idempotency guarantee missing', sub: 'idempotency', trigger: 'Blind execution read-only tools.', evidence: 'Idempotency.', fp: 'Context.', floor: 'high' },
  'L37-03': { name: 'rollback path missing', sub: 'rollback rules', trigger: 'One-way tool irreversible actions.', evidence: 'Rollback.', fp: 'Context.', floor: 'high' },
  'L37-04': { name: 'forbidden direct write', sub: 'forbidden direct write paths', trigger: 'Direct DB access admin tools.', evidence: 'Direct Write.', fp: 'Context.', floor: 'critical' },
  'L37-05': { name: 'execution authority violation', sub: 'execution authority violations', trigger: 'Over-privileged execution admin tools.', evidence: 'Authority.', fp: 'Context.', floor: 'critical' },
  'L37-06': { name: 'unsafe execution path', sub: 'unsafe execution paths', trigger: 'Unguarded path atomic operations.', evidence: 'Safety.', fp: 'Context.', floor: 'high' },
  'L37-07': { name: 'tool invocation contract gap', sub: 'tool invocation contract', trigger: 'Contract gap validated calls.', evidence: 'Contract.', fp: 'Context.', floor: 'high' },
  'L37-08': { name: 'side effect validation absence', sub: 'side-effect validation', trigger: 'Unchecked side effect read-only tools.', evidence: 'Validation.', fp: 'Context.', floor: 'high' },
  'L37-09': { name: 'sandbox isolation breach detail 2', sub: 'sandbox isolation', trigger: 'Sandbox breakout path system tools.', evidence: 'Sandbox.', fp: 'Context.', floor: 'critical' },
  'L37-10': { name: 'tool safety check detail', sub: 'tool invocation contract', trigger: 'Safety rule clash internal diagnostic.', evidence: 'Safety.', fp: 'Context.', floor: 'high' },
  'L37-11': { name: 'forbidden direct write path', sub: 'forbidden direct write paths', trigger: 'Bypassed gateway admin maintenance.', evidence: 'Direct Write.', fp: 'Context.', floor: 'critical' },
  'L37-12': { name: 'sandbox isolation breach detail', sub: 'sandbox isolation breach', trigger: 'Sandbox leak path privileged tools.', evidence: 'Sandbox.', fp: 'Context.', floor: 'critical' },
  'L37-13': { name: 'tool safety detail', sub: 'tool_result_validation', trigger: 'Tool safety gap read-only tools.', evidence: 'Safety.', fp: 'Context.', floor: 'high', ceiling: 'high' },
  'L38-01': { name: 'remote deployment prohibition violation', sub: 'remote deployment prohibition', trigger: 'Cloud requirement local network.', evidence: 'Deployment.', fp: 'Context.', floor: 'critical' },
  'L38-02': { name: 'local export structure gap', sub: 'export structure completeness', trigger: 'Incomplete bundle partial exports.', evidence: 'Export.', fp: 'Context.', floor: 'high' },
  'L38-03': { name: 'export atomicity gap', sub: 'export atomicity', trigger: 'Partial write streamed exports.', evidence: 'Export.', fp: 'Context.', floor: 'medium' },
  'L38-04': { name: 'offline-run inability', sub: 'offline-run capability', trigger: 'Network call license checks.', evidence: 'Offline.', fp: 'Context.', floor: 'high' },
  'L38-05': { name: 'export path non-determinism', sub: 'export path determinism', trigger: 'Variable path timestamped paths.', evidence: 'Export.', fp: 'Context.', floor: 'medium' },
  'L38-06': { name: 'executable validation absence', sub: 'executable validation', trigger: 'No validation step signed builds.', evidence: 'Validation.', fp: 'Context.', floor: 'high' },
  'L38-07': { name: 'deployment term misuse', sub: 'deployment-term misuse', trigger: 'Term confusion clear definitions.', evidence: 'Terms.', fp: 'Context.', floor: 'medium' },
  'L38-08': { name: 'local export enforcement gap', sub: 'local export enforcement', trigger: 'Export leakage cloud systems.', evidence: 'Enforcement.', fp: 'Context.', floor: 'critical' },
  'L38-09': { name: 'export structure incomplete', sub: 'export structure completeness', trigger: 'Missing export parts partial exports.', evidence: 'Export.', fp: 'Context.', floor: 'high' },
  'L38-10': { name: 'remote deployment violation detail', sub: 'remote deployment violation', trigger: 'Cloud dependency leak hybrid features.', evidence: 'Deployment.', fp: 'Context.', floor: 'high' },
  'L38-11': { name: 'deployment term misuse detail', sub: 'deployment-term misuse', trigger: 'Term drift informal build guides.', evidence: 'Terms.', fp: 'Context.', floor: 'low' },
  'L38-12': { name: 'export structure gap detail', sub: 'export structure completeness', trigger: 'Missing artifact parts minimalist.', evidence: 'Export.', fp: 'Context.', floor: 'high' },
  'L38-13': { name: 'artifact reproducibility gap', sub: 'export path determinism detail', trigger: 'Non-reproducible artifact build environment.', evidence: 'Reproducibility.', fp: 'Context.', floor: 'high' },
  'L39-01': { name: 'platform exclusion violation', sub: 'platform-exclusion enforcement', trigger: 'Platform mismatch shared libraries.', evidence: 'Exclusion.', fp: 'Context.', floor: 'high' },
  'L39-02': { name: 'abstraction leakage', sub: 'abstraction leakage', trigger: 'Leaky type platform extensions.', evidence: 'Abstraction.', fp: 'Context.', floor: 'medium' },
  'L39-03': { name: 'target lock invariants missing', sub: 'target lock invariants', trigger: 'Missing guard universal code.', evidence: 'Invariants.', fp: 'Context.', floor: 'medium' },
  'L39-04': { name: 'implementation divergence', sub: 'implementation divergence', trigger: 'Behavior gap native UI parity.', evidence: 'Divergence.', fp: 'Context.', floor: 'high' },
  'L39-05': { name: 'platform-neutral architecture violation', sub: 'platform-neutral architecture', trigger: 'Platform assumption specific features.', evidence: 'Architecture.', fp: 'Context.', floor: 'high' },
  'L39-06': { name: 'cross-platform consistency gap', sub: 'cross-platform consistency', trigger: 'Platform gap specific features.', evidence: 'Consistency.', fp: 'Context.', floor: 'high' },
  'L39-07': { name: 'output target mismatch', sub: 'output-target mismatch', trigger: 'Target mismatch multi-target builds.', evidence: 'Mismatch.', fp: 'Context.', floor: 'high' },
  'L39-08': { name: 'target lock bypass', sub: 'target lock invariants', trigger: 'Missing lock portable code.', evidence: 'Invariants.', fp: 'Context.', floor: 'medium' },
  'L39-09': { name: 'compiler mapping correctness gap', sub: 'compiler mapping correctness', trigger: 'Config mismatch cross-compilers.', evidence: 'Compiler.', fp: 'Context.', floor: 'high' },
  'L39-10': { name: 'compiler mapping mismatch detail', sub: 'compiler mapping mismatch', trigger: 'Flag mismatch custom build profiles.', evidence: 'Compiler.', fp: 'Context.', floor: 'medium' },
  'L39-11': { name: 'platform exclusion enforcement detail', sub: 'platform-exclusion enforcement', trigger: 'Binary leak optional platform optimized.', evidence: 'Exclusion.', fp: 'Context.', floor: 'high' },
  'L39-12': { name: 'platform abstraction leakage detail', sub: 'abstraction leakage', trigger: 'Leaky abstraction native optims.', evidence: 'Abstraction.', fp: 'Context.', floor: 'medium' },
  'L39-13': { name: 'compiler mapping mismatch detail 2', sub: 'compiler mapping mismatch', trigger: 'Build-target drift cross-platform toolchains.', evidence: 'Compiler.', fp: 'Context.', floor: 'medium' },
  'L40-01': { name: 'token budget violation', sub: 'token budget enforcement', trigger: 'Unbounded context local models.', evidence: 'Budget.', fp: 'Context.', floor: 'high' },
  'L40-02': { name: 'context contamination', sub: 'context contamination / leakage', trigger: 'Bad injection historical logs.', evidence: 'Contamination.', fp: 'Context.', floor: 'critical' },
  'L40-03': { name: 'decision lock hierarchy gap', sub: 'decision lock hierarchy', trigger: 'Race condition append-only logs.', evidence: 'Hierarchy.', fp: 'Context.', floor: 'high' },
  'L40-04': { name: 'drift correction missing', sub: 'drift correction', trigger: 'Stale context static analysis.', evidence: 'Drift.', fp: 'Context.', floor: 'medium' },
  'L40-05': { name: 'deterministic context assembly gap', sub: 'deterministic context assembly', trigger: 'Non-deterministic assembly static contexts.', evidence: 'Assembly.', fp: 'Context.', floor: 'high' },
  'L40-06': { name: 'retrieval validation missing', sub: 'retrieval validation', trigger: 'Unvalidated retrieval curated sources.', evidence: 'Retrieval.', fp: 'Context.', floor: 'medium' },
  'L40-07': { name: 'token budget absence', sub: 'token budget enforcement', trigger: 'Unbounded assembly local models.', evidence: 'Budget.', fp: 'Context.', floor: 'high' },
  'L40-08': { name: 'context conflict undetected', sub: 'conflict detection', trigger: 'Undetected conflict consistent sources.', evidence: 'Conflict.', fp: 'Context.', floor: 'high' },
  'L40-09': { name: 'context truncation strategy missing', sub: 'context truncation', trigger: 'Hard cut-off small contexts.', evidence: 'Truncation.', fp: 'Context.', floor: 'high' },
  'L40-10': { name: 'decision lock hierarchy missing', sub: 'decision lock hierarchy', trigger: 'Unresolved conflict append-only logs.', evidence: 'Hierarchy.', fp: 'Context.', floor: 'high' },
  'L40-11': { name: 'context contamination risk', sub: 'context contamination', trigger: 'Context leakage shared read-only.', evidence: 'Contamination.', fp: 'Context.', floor: 'critical' },
  'L40-12': { name: 'drift correction absence', sub: 'drift correction', trigger: 'Context drift short-lived runs.', evidence: 'Drift.', fp: 'Context.', floor: 'medium' },
  'L40-13': { name: 'retrieval relevance gap', sub: 'retrieval validation', trigger: 'Relevance dilution broad research.', evidence: 'Retrieval.', fp: 'Context.', floor: 'low' },
  'L41-01': { name: 'evidence binding gap', sub: 'evidence binding', trigger: 'Unbound conclusion obvious inferences.', evidence: 'Evidence.', fp: 'Context.', floor: 'high' },
  'L41-02': { name: 'uncertainty propagation failure', sub: 'uncertainty propagation', trigger: 'False certainty deterministic steps.', evidence: 'Reasoning.', fp: 'Context.', floor: 'high' },
  'L41-03': { name: 'reasoning trace enforceability gap', sub: 'reasoning trace enforceability', trigger: 'Untraceable step self-evident logic.', evidence: 'Trace.', fp: 'Context.', floor: 'high' },
  'L41-04': { name: 'multi-step reasoning validation failure', sub: 'multi-step reasoning validation', trigger: 'Logical gap in chain summaries.', evidence: 'Reasoning.', fp: 'Context.', floor: 'high' },
  'L41-05': { name: 'global contradiction undetected', sub: 'global contradiction detection', trigger: 'Cross-section reasoning clash contextual.', evidence: 'Conflict.', fp: 'Context.', floor: 'high' },
  'L41-06': { name: 'unbounded self-correction loop', sub: 'self-correction loop boundedness', trigger: 'Reasoning oscillation iterative refinement.', evidence: 'Reasoning.', fp: 'Context.', floor: 'medium' },
  'L41-07': { name: 'reasoning trace incomplete', sub: 'reasoning trace completeness', trigger: 'Unused premise alternative evidence.', evidence: 'Trace.', fp: 'Context.', floor: 'medium' },
  'L41-08': { name: 'uncertainty propagation gap', sub: 'uncertainty propagation failure', trigger: 'Ignored uncertainty high-confidence.', evidence: 'Reasoning.', fp: 'Context.', floor: 'high' },
  'L41-09': { name: 'reasoning trace gap', sub: 'reasoning trace completeness', trigger: 'Missing trace obvious conclusions.', evidence: 'Trace.', fp: 'Context.', floor: 'high' },
  'L41-10': { name: 'uncertainty propagation failure detail', sub: 'uncertainty propagation failure', trigger: 'Dropped uncertainty high-confidence inputs.', evidence: 'Reasoning.', fp: 'Context.', floor: 'high' },
  'L41-11': { name: 'reasoning trace enforceability marker', sub: 'reasoning trace enforceability', trigger: 'Unenforceable trace heuristic advice.', evidence: 'Trace.', fp: 'Context.', floor: 'high' },
  'L41-12': { name: 'evidence binding gap detail', sub: 'evidence binding gap', trigger: 'Unsupported inference self-evident logic.', evidence: 'Evidence.', fp: 'Context.', floor: 'medium' },
  'L42-01': { name: 'mandatory UI component existence gap', sub: 'mandatory UI component existence', trigger: 'Missing UI element CLI-only systems.', evidence: 'UI Contract.', fp: 'Context.', floor: 'high' },
  'L42-02': { name: 'UI interactivity enforcement gap', sub: 'UI interactivity enforcement', trigger: 'Static UI element read-only displays.', evidence: 'UI Contract.', fp: 'Context.', floor: 'medium' },
  'L42-03': { name: 'UI-to-system-state mapping gap', sub: 'UI-to-system-state mapping', trigger: 'State-UI mismatch async lag.', evidence: 'Mapping.', fp: 'Context.', floor: 'high' },
  'L42-04': { name: 'fatal state exposure in UI', sub: 'no fatal state exposure', trigger: 'Raw error display developer tools.', evidence: 'Fatal UX.', fp: 'Context.', floor: 'high' },
  'L42-05': { name: 'component state-machine mismatch', sub: 'component state-machine correctness', trigger: 'Invalid UI transition animation.', evidence: 'UI Logic.', fp: 'Context.', floor: 'medium' },
  'L42-06': { name: 'UI accessibility contract gap', sub: 'UI accessibility contract', trigger: 'A11y failure non-interactive display.', evidence: 'A11y.', fp: 'Context.', floor: 'high' },
  'L42-07': { name: 'UI layout contract violation', sub: 'UI layout contract', trigger: 'Layout break dynamic layouts.', evidence: 'UI Contract.', fp: 'Context.', floor: 'medium' },
  'L42-08': { name: 'mandatory UI component missing', sub: 'mandatory UI component existence', trigger: 'Functional UI gap optional UI.', evidence: 'UI Contract.', fp: 'Context.', floor: 'high' },
  'L42-09': { name: 'UI layout contract violation detail', sub: 'UI layout contract', trigger: 'Layout break detail dynamic layouts.', evidence: 'UI Contract.', fp: 'Context.', floor: 'medium' },
  'L42-10': { name: 'UI accessibility gap detail', sub: 'UI accessibility contract', trigger: 'A11y failure detail non-interactive.', evidence: 'A11y.', fp: 'Context.', floor: 'high' },
  'L42-11': { name: 'component state-machine gap', sub: 'component state-machine correctness', trigger: 'Missing UI state simple elements.', evidence: 'UI Logic.', fp: 'Context.', floor: 'medium' },
  'L42-12': { name: 'mandatory UI component missing detail', sub: 'mandatory UI component missing', trigger: 'Functional UI gap optional expert.', evidence: 'UI Contract.', fp: 'Context.', floor: 'high' },
  'L43-01': { name: 'transition non-determinism', sub: 'transition determinism', trigger: 'Variable transition intentional entropy.', evidence: 'Execution.', fp: 'Context.', floor: 'critical' },
  'L43-02': { name: 'concurrency model ambiguity', sub: 'concurrency model definition', trigger: 'Race condition risk single-threaded.', evidence: 'Concurrency.', fp: 'Context.', floor: 'high' },
  'L43-03': { name: 'deadlock livelock risk', sub: 'deadlock / livelock prevention', trigger: 'Lock cycle re-entrant locks.', evidence: 'Deadlock.', fp: 'Context.', floor: 'critical' },
  'L43-04': { name: 'input determinism gap', sub: 'scheduling determinism', trigger: 'Unstable input ordering dynamic priority.', evidence: 'Execution.', fp: 'Context.', floor: 'high' },
  'L43-05': { name: 'retry backoff indeterminism', sub: 'retry and backoff policy', trigger: 'Unstable retry exponential backoff.', evidence: 'Retry.', fp: 'Context.', floor: 'medium' },
  'L43-06': { name: 'deterministic replay impossible', sub: 'deterministic replay capability', trigger: 'Replay drift real-time only.', evidence: 'Replay.', fp: 'Context.', floor: 'high' },
  'L43-07': { name: 'timing dependency gap', sub: 'timing dependency', trigger: 'Race window generous timeouts.', evidence: 'Execution.', fp: 'Context.', floor: 'high' },
  'L43-08': { name: 'resource ordering gap', sub: 'resource ordering', trigger: 'Inconsistent lock order single-threaded.', evidence: 'Concurrency.', fp: 'Context.', floor: 'high' },
  'L43-09': { name: 'execution determinism gap', sub: 'scheduling determinism', trigger: 'Variable task order preemptive OS.', evidence: 'Execution.', fp: 'Context.', floor: 'high' },
  'L43-10': { name: 'deterministic replay impossible detail', sub: 'deterministic replay capability', trigger: 'Replay divergence live-only systems.', evidence: 'Replay.', fp: 'Context.', floor: 'high' },
  'L43-11': { name: 'transition determinism failure', sub: 'transition determinism', trigger: 'Non-deterministic transition random.', evidence: 'Execution.', fp: 'Context.', floor: 'critical' },
  'L43-12': { name: 'output determinism gap', sub: 'scheduling non-determinism', trigger: 'Unstable output ordering preemptive.', evidence: 'Execution.', fp: 'Context.', floor: 'high' },
  'L44-01': { name: 'control plane separation breach', sub: 'control-plane separation', trigger: 'Authority leak integrated proxies.', evidence: 'Control Plane.', fp: 'Context.', floor: 'critical' },
  'L44-02': { name: 'authority delegation ambiguity', sub: 'authority delegation rules', trigger: 'Delegation gap static authority.', evidence: 'Control Plane.', fp: 'Context.', floor: 'high' },
  'L44-03': { name: 'override condition gap', sub: 'override conditions', trigger: 'Permanent override manual reset.', evidence: 'Override.', fp: 'Context.', floor: 'high' },
  'L44-04': { name: 'execution owner boundary gap', sub: 'execution owner boundary', trigger: 'Owner ambiguity shared authority.', evidence: 'Execution.', fp: 'Context.', floor: 'high' },
  'L44-05': { name: 'policy enforcement point gap', sub: 'policy enforcement points', trigger: 'Unenforced policy self-governing.', evidence: 'Governance.', fp: 'Context.', floor: 'high' },
  'L44-06': { name: 'escalation path ambiguity', sub: 'escalation path', trigger: 'No escalation path fail-fast.', evidence: 'Escalation.', fp: 'Context.', floor: 'medium' },
  'L44-07': { name: 'audit trail requirement gap', sub: 'audit trail requirements', trigger: 'Missing audit trail read-only.', evidence: 'Audit.', fp: 'Context.', floor: 'critical' },
  'L44-08': { name: 'control-plane authority confusion', sub: 'control-plane separation', trigger: 'Authority confusion admin proxies.', evidence: 'Control Plane.', fp: 'Context.', floor: 'high' },
  'L44-09': { name: 'escalation path gap', sub: 'escalation path', trigger: 'No escalation spec automated.', evidence: 'Escalation.', fp: 'Context.', floor: 'high' },
  'L44-10': { name: 'audit trail omission', sub: 'audit trail requirements', trigger: 'Unlogged action read-only queries.', evidence: 'Audit.', fp: 'Context.', floor: 'critical' },
  'L44-11': { name: 'control plane authority leak', sub: 'control plane separation violation', trigger: 'Authority bypass unified interfaces.', evidence: 'Control Plane.', fp: 'Context.', floor: 'high' },
  'L45-01': { name: 'state mutation invariant gap', sub: 'state mutation invariants', trigger: 'Invariant breach transitional states.', evidence: 'State Governance.', fp: 'Context.', floor: 'critical' },
  'L45-02': { name: 'mutation gateway bypass', sub: 'mutation gateway exclusivity', trigger: 'Gateway bypass system recovery.', evidence: 'State Governance.', fp: 'Context.', floor: 'critical' },
  'L45-03': { name: 'commit hash binding gap', sub: 'commit_hash binding', trigger: 'Unbound mutation ephemeral state.', evidence: 'Binding.', fp: 'Context.', floor: 'high' },
  'L45-04': { name: 'read write atomicity failure', sub: 'read/write atomicity', trigger: 'Partial read independent fields.', evidence: 'Atomicity.', fp: 'Context.', floor: 'high' },
  'L45-05': { name: 'graph consistency gap', sub: 'graph consistency / acyclicity', trigger: 'Inconsistent graph flexible meshes.', evidence: 'State Graph.', fp: 'Context.', floor: 'medium' },
  'L45-06': { name: 'state isolation breach', sub: 'state isolation', trigger: 'Isolation leak global read-only.', evidence: 'Isolation.', fp: 'Context.', floor: 'high' },
  'L45-07': { name: 'temporal state inconsistency gap', sub: 'temporal state consistency', trigger: 'Anachronistic read eventually consistent.', evidence: 'Consistency.', fp: 'Context.', floor: 'high' },
  'L45-08': { name: 'state mutation invariant omission', sub: 'state mutation invariants', trigger: 'Missing invariant simple increments.', evidence: 'State Governance.', fp: 'Context.', floor: 'high' },
  'L45-09': { name: 'graph acyclicity gap', sub: 'graph consistency / acyclicity', trigger: 'Potential cycle DAG-enforced.', evidence: 'State Graph.', fp: 'Context.', floor: 'high' },
  'L45-10': { name: 'temporal state inconsistency', sub: 'temporal state consistency', trigger: 'Stale snapshot event-sourced.', evidence: 'Consistency.', fp: 'Context.', floor: 'high' },
  'L45-11': { name: 'state mutation gateway breach', sub: 'mutation gateway exclusivity', trigger: 'Gate bypass system bootstrap.', evidence: 'Gateway.', fp: 'Context.', floor: 'critical' },
  'L45-12': { name: 'state mutation invariant gap detail', sub: 'state mutation invariant gap', trigger: 'Missing invariant spec simple counters.', evidence: 'State Governance.', fp: 'Context.', floor: 'high' },
  'L34-15': { name: 'simulation result validation gap', sub: 'simulation result validation', trigger: 'Simulation results accepted without verification.', evidence: 'Simulation.', fp: 'Context.', floor: 'high' },
  'L34-16': { name: 'simulation scope completeness gap', sub: 'simulation scope completeness', trigger: 'Simulation covers subset of required scenarios.', evidence: 'Simulation.', fp: 'Context.', floor: 'high' },
  'L43-13': { name: 'deterministic replay requirements gap', sub: 'deterministic replay requirements', trigger: 'Replay prerequisites not documented.', evidence: 'Replay.', fp: 'Context.', floor: 'high' },
  'L43-14': { name: 'deadlock livelock risk articulation gap', sub: 'deadlock livelock risk articulation', trigger: 'Deadlock risk not articulated in spec.', evidence: 'Deadlock.', fp: 'Context.', floor: 'critical' },
  'L44-12': { name: 'control-plane override condition gap', sub: 'control-plane override conditions', trigger: 'Override conditions not specified.', evidence: 'Override.', fp: 'Context.', floor: 'high' },
  'L44-13': { name: 'execution owner boundary clarity gap', sub: 'execution owner boundary clarity', trigger: 'Execution ownership ambiguous.', evidence: 'Execution.', fp: 'Context.', floor: 'high' },
  'L45-13': { name: 'snapshot isolation atomicity gap', sub: 'snapshot isolation atomicity', trigger: 'Snapshot not atomic with mutation.', evidence: 'Isolation.', fp: 'Context.', floor: 'critical' },
  'L45-14': { name: 'state mutation invariants detail gap', sub: 'state mutation invariants detail', trigger: 'Invariant detail omitted for complex state.', evidence: 'State Governance.', fp: 'Context.', floor: 'high' },
  'L45-15': { name: 'state transition precondition missing', sub: 'state mutation invariants detail', trigger: 'Spec does not define preconditions for state changes.', evidence: 'State Governance.', fp: 'Context.', floor: 'high' },
  'L45-16': { name: 'state mutation postcondition gap', sub: 'state mutation invariants detail', trigger: 'Post-mutation state not specified for edge cases.', evidence: 'State Governance.', fp: 'Context.', floor: 'high' },
  'L44-14': { name: 'decision authority ambiguity', sub: 'control plane separation violation', trigger: 'Spec does not clarify who has authority to make a decision.', evidence: 'Control Plane.', fp: 'Context.', floor: 'high' },
  'L44-15': { name: 'control plane escalation gap', sub: 'control plane separation violation', trigger: 'No escalation path when control plane authority is contested.', evidence: 'Control Plane.', fp: 'Context.', floor: 'high' },
  'L37-14': { name: 'sandbox isolation boundary gap', sub: 'sandbox isolation boundaries', trigger: 'Sandbox boundary not enforced.', evidence: 'Sandbox.', fp: 'Context.', floor: 'critical' },
  'L37-15': { name: 'direct tool side-effect leakage', sub: 'direct tool side-effect leakage', trigger: 'Tool side effects leak to unrelated systems.', evidence: 'Side-effect.', fp: 'Context.', floor: 'critical' },
  'L38-14': { name: 'remote deployment prohibition rigor gap', sub: 'remote deployment prohibition rigor', trigger: 'Remote deployment not rigorously prohibited.', evidence: 'Deployment.', fp: 'Context.', floor: 'critical' },
  'L38-15': { name: 'export path determinism detail gap', sub: 'export path determinism detail', trigger: 'Export path varies by environment.', evidence: 'Export.', fp: 'Context.', floor: 'high' },
  'L41-13': { name: 'evidence binding rigor gap', sub: 'evidence binding rigor', trigger: 'Evidence binding lacks rigor.', evidence: 'Evidence.', fp: 'Context.', floor: 'high' },
  'L41-14': { name: 'uncertainty propagation failure case', sub: 'uncertainty propagation failure cases', trigger: 'Uncertainty dropped in chain.', evidence: 'Reasoning.', fp: 'Context.', floor: 'high' },
  'L41-15': { name: 'bounded self-correction loop rule gap', sub: 'bounded self-correction loop rules', trigger: 'Self-correction has no iteration limit.', evidence: 'Reasoning.', fp: 'Context.', floor: 'medium' },
  'L41-16': { name: 'evidence-free escalation', sub: 'evidence-free escalation', trigger: 'Escalation without supporting evidence.', evidence: 'Evidence.', fp: 'Context.', floor: 'high' },
  'L33-14': { name: 'formal terminology registry enforcement gap', sub: 'formal terminology registry enforcement', trigger: 'Terminology registry not enforced.', evidence: 'Terminology.', fp: 'Context.', floor: 'medium' },
  'L33-15': { name: 'input/output contract determinism gap', sub: 'input/output contract determinism', trigger: 'I/O contract non-deterministic.', evidence: 'Contract.', fp: 'Context.', floor: 'high' },
  'L35-14': { name: 'audit trail requirement gap', sub: 'audit trail requirements', trigger: 'State changes not auditable.', evidence: 'Audit.', fp: 'Context.', floor: 'high' },
  'L42-13': { name: 'mandatory UI component contract enforcement gap', sub: 'mandatory UI component contract enforcement', trigger: 'UI component contract not enforced.', evidence: 'UI Contract.', fp: 'Context.', floor: 'high' },
  'L42-14': { name: 'UI fatal-state exposure detail', sub: 'UI fatal-state exposure', trigger: 'Fatal state exposed without recovery.', evidence: 'Fatal UX.', fp: 'Context.', floor: 'critical' }
};

const RELATED_LAYERS_MAP = {
  // L33 specification_formalism → requirement, completeness, logical, contradiction, state_machine
  'L33': ['requirement', 'completeness', 'logical', 'contradiction', 'state_machine'],
  // L34 simulation_verification → governance, deterministic_execution, tool_execution_safety, resilience, control_plane_authority
  'L34': ['governance', 'deterministic_execution', 'tool_execution_safety', 'resilience', 'control_plane_authority'],
  // L35 memory_world_model → world_state_governance, data_flow, state_machine, deterministic_execution, agent_orchestration
  'L35': ['world_state_governance', 'data_flow', 'state_machine', 'deterministic_execution', 'agent_orchestration'],
  // L36 agent_orchestration → tool_execution_safety, control_plane_authority, memory_world_model, governance, architectural
  'L36': ['tool_execution_safety', 'control_plane_authority', 'memory_world_model', 'governance', 'architectural'],
  // L37 tool_execution_safety → deployment_contract, platform_abstraction, deterministic_execution, agent_orchestration, security
  'L37': ['deployment_contract', 'platform_abstraction', 'deterministic_execution', 'agent_orchestration', 'security'],
  // L38 deployment_contract → platform_abstraction, resilience, deterministic_execution, configuration, tool_execution_safety
  'L38': ['platform_abstraction', 'resilience', 'deterministic_execution', 'configuration', 'tool_execution_safety'],
  // L39 platform_abstraction → deployment_contract, configuration, architectural, tool_execution_safety, deterministic_execution
  'L39': ['deployment_contract', 'configuration', 'architectural', 'tool_execution_safety', 'deterministic_execution'],
  // L40 context_orchestration → execution_path, memory_world_model, deterministic_execution, reasoning_integrity, security
  'L40': ['execution_path', 'memory_world_model', 'deterministic_execution', 'reasoning_integrity', 'security'],
  // L41 reasoning_integrity → contradiction, logical, factual, metacognition, specification_formalism
  'L41': ['contradiction', 'logical', 'factual', 'metacognition', 'specification_formalism'],
  // L42 ui_surface_contract → state_machine, usability, functional, error_handling, architectural
  'L42': ['state_machine', 'usability', 'functional', 'error_handling', 'architectural'],
  // L43 deterministic_execution → state_machine, temporal, execution_path, resilience, control_plane_authority
  'L43': ['state_machine', 'temporal', 'execution_path', 'resilience', 'control_plane_authority'],
  // L44 control_plane_authority → architectural, governance, execution_path, security, agent_orchestration
  'L44': ['architectural', 'governance', 'execution_path', 'security', 'agent_orchestration'],
  // L45 world_state_governance → memory_world_model, data_flow, governance, state_machine, deterministic_execution
  'L45': ['memory_world_model', 'data_flow', 'governance', 'state_machine', 'deterministic_execution'],
};

export const DETECTOR_METADATA = {};

Object.entries(rawMetadata).forEach(([id, meta]) => {
  const layerNum = id.split('-')[0].replace('L', '');
  const layerIdx = parseInt(layerNum) - 1;
  const layerSlug = Object.keys(LAYER_SUBCATEGORIES)[layerIdx];
  const layerPrefix = `L${layerNum}`;

  if (!layerSlug) {
    console.warn(`Unknown layer for ID ${id}`);
    return;
  }

  DETECTOR_METADATA[id] = {
    id,
    name: meta.name,
    layer: layerSlug,
    subcategory: meta.sub,
    description: meta.name,
    trigger_pattern: meta.trigger,
    required_evidence: meta.evidence,
    false_positive_guards: meta.fp,
    severity_floor: meta.floor,
    severity_ceiling: meta.ceiling,
    remediation_template: meta.remediation || `Resolve the ${meta.name} by following best practices for ${layerSlug}.`,
    related_layers: RELATED_LAYERS_MAP[layerPrefix] || []
  };
});

export function getDetectorMetadata(id) {
  return DETECTOR_METADATA[id] || null;
}

export function isKnownDetectorId(id) {
  return !!DETECTOR_METADATA[id];
}

export function parseDetectorId(text) {
  if (!text) return null;
  const match = text.match(/\[(L\d+-\d+)\]/);
  return match ? match[1] : null;
}

export function getAvailableSubcategories(layer) {
  return LAYER_SUBCATEGORIES[layer] || [];
}

export function getAvailableDetectors(layer, subcategory) {
  return Object.values(DETECTOR_METADATA).filter(d => 
    d.layer === layer && (!subcategory || d.subcategory === subcategory)
  );
}

export function isSeverityWithinBounds(detectorId, severity) {
  const meta = getDetectorMetadata(detectorId);
  if (!meta) return true;
  
  const severityOrder = { critical: 3, high: 2, medium: 1, low: 0 };
  const val = severityOrder[severity?.toLowerCase()];
  const floor = severityOrder[meta.severity_floor?.toLowerCase()] || 0;
  
  if (val < floor) return false;
  if (meta.severity_ceiling) {
    const ceiling = severityOrder[meta.severity_ceiling?.toLowerCase()];
    if (val > ceiling) return false;
  }
  return true;
}

export function normalizeSeverityForDetector(detectorId, severity) {
  const meta = getDetectorMetadata(detectorId);
  if (!meta) return severity;

  const severityOrder = { critical: 3, high: 2, medium: 1, low: 0 };
  
  let val = severityOrder[severity?.toLowerCase()];
  if (val === undefined) val = 1;

  const floor = severityOrder[meta.severity_floor?.toLowerCase()] || 0;
  if (val < floor) return meta.severity_floor;

  if (meta.severity_ceiling) {
    const ceiling = severityOrder[meta.severity_ceiling?.toLowerCase()];
    if (val > ceiling) return meta.severity_ceiling;
  }

  return severity;
}

export function normalizeIssueFromDetector(issue, diagnostics = null) {
  if (!issue) return issue;
  
  const originalDetectorId = issue.detector_id;
  const parsedId = parseDetectorId(issue.description);
  const detectorId = originalDetectorId || parsedId;
  
  const meta = getDetectorMetadata(detectorId);
  
  if (diagnostics) {
    if (parsedId && !originalDetectorId) diagnostics.detector_id_parsed_from_description_count++;
    if (detectorId && !meta) diagnostics.unknown_detector_id_count++;
  }

  if (!meta) {
    if (diagnostics && !issue.category && !issue.subcategory) diagnostics.missing_taxonomy_after_normalization_count++;
    return issue;
  }

  const enriched = { ...issue };
  let normalizedCounted = false;
  
  if (!enriched.detector_id && detectorId) { enriched.detector_id = detectorId; normalizedCounted = true; }
  if (!enriched.detector_name) { enriched.detector_name = meta.name; normalizedCounted = true; }
  if (!enriched.subcategory) { enriched.subcategory = meta.subcategory; normalizedCounted = true; }
  if (!enriched.layer) { enriched.layer = meta.layer; normalizedCounted = true; }
  if (!enriched.category) { enriched.category = meta.layer; normalizedCounted = true; }

  if (diagnostics && normalizedCounted) diagnostics.normalized_from_detector_count++;

  const originalSeverity = enriched.severity;
  enriched.severity = normalizeSeverityForDetector(detectorId, enriched.severity);
  if (diagnostics && enriched.severity !== originalSeverity) diagnostics.severity_clamped_count++;

  return enriched;
}

export function createInitialDiagnostics() {
  return {
    normalized_from_detector_count: 0,
    detector_id_parsed_from_description_count: 0,
    unknown_detector_id_count: 0,
    severity_clamped_count: 0,
    missing_taxonomy_after_normalization_count: 0,
    total_issues_loaded: 0,
    warnings: []
  };
}

export function isValidSubcategory(layer, subcategory) {
  if (!LAYER_SUBCATEGORIES[layer]) return false;
  return LAYER_SUBCATEGORIES[layer].includes(subcategory);
}

export function isValidDetectorForLayer(detectorId, layer) {
  const meta = getDetectorMetadata(detectorId);
  return meta ? meta.layer === layer : true;
}

export function isValidDetectorForSubcategory(detectorId, subcategory) {
  const meta = getDetectorMetadata(detectorId);
  return meta ? meta.subcategory === subcategory : true;
}

export function buildDetectorPrompt() {
  const detectorCount = Object.keys(DETECTOR_METADATA).length;
  let prompt = `--- DETECTOR CATALOG (${detectorCount} DETECTORS) ---\n\n`;
  
  for (const [layerSlug, subcats] of Object.entries(LAYER_SUBCATEGORIES)) {
    const layerIdx = Object.keys(LAYER_SUBCATEGORIES).indexOf(layerSlug) + 1;
    prompt += `LAYER ${layerIdx} [${layerSlug}]\n`;
    const layerDetectors = Object.values(DETECTOR_METADATA).filter(d => d.layer === layerSlug);
    layerDetectors.sort((a, b) => a.id.localeCompare(b.id));
    layerDetectors.forEach(d => {
      prompt += `[${d.id}] ${d.name}\n`;
      prompt += `  - Subcategory: ${d.subcategory}\n`;
      prompt += `  - Trigger: ${d.trigger_pattern}\n`;
      prompt += `  - Evidence: ${d.required_evidence}\n`;
      prompt += `  - FP Guard: ${d.false_positive_guards}\n`;
      prompt += `  - Severity: ${d.severity_floor}+\n\n`;
    });
  }
  return prompt;
}

export function getSubcategoryPrompt() { return buildDetectorPrompt(); }

export function buildExportData(results, taxonomyDiagnostics) {
  if (!results) return null;
  return { ...results, taxonomyDiagnostics };
}

export function buildSessionData({ results, taxonomyDiagnostics, files, config }) {
  if (!results) return null;
  return {
    timestamp: new Date().toISOString(),
    config: { baseURL: config?.baseURL, model: config?.model },
    files: files || [],
    results,
    taxonomyDiagnostics
  };
}

export function resolveInitialCache(fileCache, legacyCacheString) {
  if (fileCache && Object.keys(fileCache).length > 0) return { cache: fileCache, shouldMigrate: false };
  if (legacyCacheString) {
    try {
      const parsed = JSON.parse(legacyCacheString);
      if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) return { cache: parsed, shouldMigrate: true };
    } catch (e) {}
  }
  return { cache: {}, shouldMigrate: false };
}

export const normalizeIdentityText = (text) => (text || '').replace(/\s+/g, ' ').trim().toLowerCase();

export const hashDescription = (text) => {
  let hash = 0;
  for (let i = 0; i < text.length; i++) { hash = ((hash << 5) - hash) + text.charCodeAt(i); hash = hash & hash; }
  return Math.abs(hash).toString(36);
};

export const getIssueIdentity = (issue) => {
  const detectorMatch = issue.description?.match(/\[L(\d+)-(\d+)\]/);
  const detectorId = issue.detector_id || (detectorMatch ? `L${detectorMatch[1]}-${detectorMatch[2]}` : 'unknown');
  const primaryFile = issue.files?.[0] || 'unknown';
  const section = issue.section || 'no-section';
  if (issue.line_number) return `${detectorId}::${primaryFile}::${section}::${issue.line_number}`;
  const description = normalizeIdentityText(issue.description);
  const evidenceSnippet = normalizeIdentityText(issue.evidence).slice(0, 240);
  const fingerprintSource = evidenceSnippet ? `${description}::${evidenceSnippet}` : description;
  return `${detectorId}::${primaryFile}::${section}::fp:${hashDescription(fingerprintSource)}`;
};

export const compareAudits = (current, previous) => {
  if (!previous || !current || !current.issues) return null;
  const currIssuesMap = new Map();
  current.issues.forEach(i => currIssuesMap.set(getIssueIdentity(i), i));
  const prevIssuesMap = new Map();
  (previous.issues || []).forEach(i => prevIssuesMap.set(getIssueIdentity(i), i));
  const newIssues = [];
  const resolvedIssues = [];
  const changedSeverity = [];
  const unchanged = [];
  currIssuesMap.forEach((issue, id) => {
    if (!prevIssuesMap.has(id)) newIssues.push({ ...issue, diffStatus: 'new' });
    else {
      const prev = prevIssuesMap.get(id);
      if (issue.severity !== prev.severity) changedSeverity.push({ ...issue, diffStatus: 'changed', prevSeverity: prev.severity });
      else unchanged.push({ ...issue, diffStatus: 'unchanged' });
    }
  });
  prevIssuesMap.forEach((issue, id) => { if (!currIssuesMap.has(id)) resolvedIssues.push({ ...issue, diffStatus: 'resolved' }); });
  return { new: newIssues, resolved: resolvedIssues, changed: changedSeverity, unchanged, totalNew: newIssues.length, totalResolved: resolvedIssues.length, totalChanged: changedSeverity.length };
};

export function normalizeLoadedSession(session) {
  if (!session || !session.results) return session;
  const diagnostics = createInitialDiagnostics();
  const normalized = { ...session };
  if (normalized.results.issues) {
    normalized.results.issues = normalized.results.issues.map(issue => {
      const enriched = normalizeIssueFromDetector(issue, diagnostics);
      diagnostics.total_issues_loaded++;
      return enriched;
    });
  }
  normalized.taxonomyDiagnostics = diagnostics;
  return normalized;
}

export function buildHistoryMetadata(results, files, config, domainProfileId, sourceType = 'fresh_analysis') {
  if (!results) return null;
  return {
    timestamp: new Date().toISOString(),
    title: `Audit ${new Date().toLocaleString()}`,
    note: '',
    sourceType,
    fileCount: files?.length || 0,
    fileNames: files?.map(f => f.name) || [],
    issuesCount: {
      critical: results.summary?.critical || 0,
      high: results.summary?.high || 0,
      medium: results.summary?.medium || 0,
      low: results.summary?.low || 0,
      total: results.summary?.total || 0
    },
    rootCauseCount: results.root_causes?.length || 0,
    model: config?.model || 'unknown',
    profile: domainProfileId || 'auto'
  };
}

export const LAYER_SUBCATEGORIES = {
  contradiction: ['direct conflicts', 'version drift', 'diagram-text mismatch', 'terminology drift', 'configuration precedence conflicts'],
  logical: ['causality gaps', 'circular reasoning', 'invalid assumptions', 'scope leaps', 'logic-state mismatch'],
  structural: ['broken hierarchy', 'orphan sections', 'duplicate sections', 'missing prerequisites', 'execution-path gaps'],
  semantic: ['undefined terms', 'vague quantifiers', 'overloaded terms', 'ambiguous references', 'semantic ambiguity', 'terminology registry gaps', 'canonical vocabulary drift', 'forbidden-term violations', 'symbol ambiguity', 'interpretation leakage'],
  factual: ['unsupported claims', 'stale facts', 'citation gaps', 'norm-vs-description confusion', 'stale-vs-citation distinction'],
  functional: ['impossible workflows', 'missing outcomes', 'hidden prerequisites', 'incomplete procedures', 'structural missing-prerequisite cases'],
  temporal: ['sequence conflicts', 'stale timelines', 'invalid timing windows', 'lifecycle drift', 'async race conditions'],
  architectural: ['missing components', 'boundary leaks', 'responsibility overlap', 'topology inconsistency', 'cross-system boundary gaps', 'control-plane/data-plane separation', 'data-plane isolation', 'subsystem-to-UI mapping gaps', 'internal-visible boundary leakage', 'hidden execution authority'],
  completeness: ['missing branches', 'missing rollback', 'missing edge cases', 'missing postconditions', 'execution-path gaps'],
  intent: ['audience mismatch', 'goal drift', 'scope creep', 'business-vs-implementation mismatch', 'implicit requirement gaps'],
  metacognition: ['overconfidence', 'unjustified certainty', 'shallow tradeoff analysis', 'unverifiable conclusions', 'ambiguous certainty'],
  adversarial: ['abuse paths', 'bypass scenarios', 'risky defaults', 'misuse opportunities', 'threat-model gaps'],
  knowledge_graph: ['orphan entities', 'relationship gaps', 'alias drift', 'role confusion', 'circular references'],
  quantitative: ['unit mismatch', 'impossible thresholds', 'numeric inconsistency', 'vague measurements', 'scaling boundary ambiguity'],
  requirement: ['ambiguous acceptance criteria', 'RFC2119 misuse', 'priority ambiguity', 'traceability gaps', 'implicit dependencies', 'spec completeness', 'contract incompleteness', 'closed-world violations', 'acceptance-proof gaps', 'undefined obligations'],
  state_machine: ['impossible transitions', 'missing terminal states', 'retry loops', 'concurrency conflicts', 'dead-end states', 'lifecycle-state gaps', 'transition illegality', 'fatal-state exposure', 'no-exit loops', 'progression-order violations'],
  api_contract: ['schema mismatch', 'auth ambiguity', 'idempotency gaps', 'error-contract omissions', 'backward-compatibility breaks'],
  dependency_graph: ['circular dependencies', 'undeclared dependencies', 'version conflicts', 'ownership ambiguity', 'transitive mismatches'],
  data_flow: ['source-sink mismatch', 'missing transformations', 'retention ambiguity', 'PII flow gaps', 'data-lifecycle gaps'],
  execution_path: ['unreachable paths', 'dead ends', 'branch omissions', 'rollback path gaps', 'execution-path gaps'],
  configuration: ['default ambiguity', 'precedence conflicts', 'env drift', 'secret-handling errors', 'configuration precedence conflicts'],
  error_handling: ['missing recovery', 'partial-failure gaps', 'retry storms', 'unclear operator actions', 'error-handling recovery ambiguity'],
  security: ['secret exposure', 'trust-boundary gaps', 'authz ambiguity', 'unsafe input handling', 'crypto-lifecycle gaps'],
  performance: ['scale assumptions', 'unbounded work', 'expensive retries', 'large-document cost blowups', 'resource-leak ambiguity'],
  testability: ['unverifiable claims', 'missing examples', 'weak expected outputs', 'validation blind spots', 'test-environment drift'],
  maintainability: ['duplication', 'brittle coupling', 'hidden ownership', 'missing conventions', 'technical-debt ambiguity'],
  usability: ['confusing task order', 'jargon overload', 'poor examples', 'accessibility/readability issues', 'cognitive-load gaps', 'UI state machine correctness', 'UI-state mapping', 'mandatory UI surface gaps', 'UI interactivity gaps', 'exposed fatal-state UX violations'],
  interoperability: ['protocol mismatch', 'format assumptions', 'backward-compatibility gaps', 'integration ambiguity', 'interoperability compatibility mismatches'],
  governance: ['policy traceability', 'approval gates', 'auditability', 'retention/compliance gaps', 'compliance-scope ambiguity', 'policy-priority conflicts', 'checkpoint omissions', 'override ambiguity', 'enforcement-path gaps', 'fail-safe condition ambiguity'],
  resilience: ['single points of failure', 'degraded-mode gaps', 'outage handling', 'backup/restore gaps', 'failover-ambiguity', 'rollback infeasibility', 'non-idempotent retries', 'fail-safe absence', 'recovery journal gaps', 'emergency recovery ambiguity'],
  observability: ['missing logs', 'metrics gaps', 'tracing gaps', 'correlation IDs and alert-threshold gaps', 'blind-spot gaps'],
  evolution: ['migration gaps', 'versioning gaps', 'deprecation policy gaps', 'compatibility promises', 'evolution/versioning migration scenarios'],
  specification_formalism: ['spec completeness', 'terminology registry', 'symbol consistency', 'type/entity rigor', 'state-space definition', 'input domain closure', 'output contract determinism', 'canonical vocabulary enforcement'],
  simulation_verification: ['mandatory simulation', 'risk classification', 'light-vs-heavy simulation correctness', 'simulation non-mutation', 'pre-simulation governance', 'post-simulation governance', 'formal verification boundary', 'verification completeness'],
  memory_world_model: ['memory taxonomy', 'read/write authority', 'temporal consistency', 'snapshot/version invariants', 'memory conflict resolution', 'garbage collection determinism', 'PSG snapshot isolation', 'PSG mutation gateway exclusivity', 'PSG commit binding', 'PSG read consistency', 'PSG write atomicity'],
  agent_orchestration: ['role non-overlap', 'agent I/O contracts', 'communication protocol', 'arbitration strategy', 'failure isolation', 'composability', 'authority boundaries', 'agent mutation prohibitions'],
  tool_execution_safety: ['tool invocation contract', 'sandbox isolation', 'side-effect validation', 'idempotency', 'rollback rules', 'unsafe execution paths', 'forbidden direct write paths', 'execution authority violations'],
  deployment_contract: ['local export enforcement', 'remote deployment prohibition', 'export path determinism', 'executable validation', 'export atomicity', 'offline-run capability', 'export structure completeness', 'deployment-term misuse'],
  platform_abstraction: ['platform-neutral architecture', 'compiler mapping correctness', 'cross-platform consistency', 'target lock invariants', 'platform exclusion enforcement', 'output-target mismatch', 'abstraction leakage', 'implementation divergence'],
  context_orchestration: ['deterministic context assembly', 'token budget enforcement', 'decision lock hierarchy', 'conflict detection', 'drift correction', 'context truncation', 'retrieval validation', 'context contamination / leakage'],
  reasoning_integrity: ['evidence binding', 'uncertainty propagation', 'reasoning trace enforceability', 'multi-step reasoning validation', 'global contradiction detection', 'self-correction loop boundedness', 'reasoning trace completeness', 'uncertainty propagation failure'],
  ui_surface_contract: ['mandatory UI component existence', 'UI interactivity enforcement', 'UI-to-system-state mapping', 'no fatal state exposure', 'component state-machine correctness', 'UI accessibility contract', 'UI layout contract'],
  deterministic_execution: ['transition determinism', 'concurrency model definition', 'deadlock / livelock prevention', 'scheduling determinism', 'retry and backoff policy', 'deterministic replay capability', 'timing dependency', 'resource ordering'],
  control_plane_authority: ['control-plane separation', 'authority delegation rules', 'override conditions', 'execution owner boundary', 'policy enforcement points', 'escalation path', 'audit trail requirements'],
  world_state_governance: ['state mutation invariants', 'mutation gateway exclusivity', 'commit_hash binding', 'read/write atomicity', 'graph consistency / acyclicity', 'state isolation', 'temporal state consistency']
};

/**
 * Full Detector Metadata Catalog (383 detectors)
 */
const rawMetadata = {
  // LAYER 1: Contradiction
  'L1-01': { name: 'direct contradictions', sub: 'direct conflicts', trigger: 'Two statements explicitly negate each other in the same scope.', evidence: 'Conflicting statements.', fp: 'Contextual alternatives.', floor: 'high', ceiling: 'critical' },
  'L1-02': { name: 'indirect contradictions', sub: 'configuration precedence conflicts', trigger: 'Inferred conclusions from two sections conflict, such as overriding defaults.', evidence: 'Supporting premises and overrides.', fp: 'Explicit exception rules.', floor: 'medium', ceiling: 'high', related_layers: ['L21'] },
  'L1-03': { name: 'cross-section contradictions', sub: 'version drift', trigger: 'Section A says X, Section B says Y for the same entity.', evidence: 'Section references.', fp: 'Intentional overrides.', floor: 'medium' },
  'L1-04': { name: 'terminology inconsistency', sub: 'terminology drift', trigger: 'Same concept described with different terms without aliases.', evidence: 'Term variations.', fp: 'Industry synonyms.', floor: 'low' },
  'L1-05': { name: 'numerical inconsistency', sub: 'version drift', trigger: 'Different values given for the same constant or limit.', evidence: 'Conflicting numbers.', fp: 'Unit variations.', floor: 'high' },
  'L1-06': { name: 'definition drift', sub: 'terminology drift', trigger: 'Definition of a term changes through the document.', evidence: 'Shifting definitions.', fp: 'Refined context.', floor: 'medium' },
  'L1-07': { name: 'circular contradictions', sub: 'direct conflicts', trigger: 'Chain of statements leads back to an impossible state.', evidence: 'The inference chain.', fp: 'Recursive workflows.', floor: 'high' },
  'L1-08': { name: 'hidden implied contradictions', sub: 'direct conflicts', trigger: 'Implementation details contradict stated high-level goals.', evidence: 'Goal vs implementation.', fp: 'Temporary workarounds.', floor: 'medium' },

  // LAYER 2: Logical
  'L2-01': { name: 'invalid premises', sub: 'invalid assumptions', trigger: 'Argument relies on a fact stated elsewhere as false.', evidence: 'The premise.', fp: 'Hypotheticals.', floor: 'high' },
  'L2-02': { name: 'missing premises', sub: 'causality gaps', trigger: 'Conclusion reached without supporting logical steps.', evidence: 'Jump in logic.', fp: 'Implicit knowledge.', floor: 'medium' },
  'L2-03': { name: 'non-sequitur reasoning', sub: 'causality gaps', trigger: 'Statement does not follow from the previous one.', evidence: 'Unrelated transition.', fp: 'Stylistic brevity.', floor: 'medium' },
  'L2-04': { name: 'circular reasoning', sub: 'circular reasoning', trigger: 'X is true because Y, Y is true because X.', evidence: 'The loop.', fp: 'Self-referential systems.', floor: 'medium' },
  'L2-05': { name: 'false causality', sub: 'causality gaps', trigger: 'Assuming A causes B just because they happen together.', evidence: 'Correlation as causation.', fp: 'Direct triggers.', floor: 'medium' },
  'L2-06': { name: 'overgeneralization', sub: 'scope leaps', trigger: 'Small sample size used to claim universal truth.', evidence: 'Broad claim.', fp: 'Architecture defaults.', floor: 'low' },
  'L2-07': { name: 'logical gaps', sub: 'causality gaps', trigger: 'Workflow skips a necessary state change.', evidence: 'Missing state.', fp: 'Automated transitions.', floor: 'high' },
  'L2-08': { name: 'contradictory inference chains', sub: 'invalid assumptions', trigger: 'Two logical paths lead to opposite results.', evidence: 'Both paths.', fp: 'Branching logic.', floor: 'high' },

  // LAYER 3: Structural
  'L3-01': { name: 'broken heading hierarchy', sub: 'broken hierarchy', trigger: 'H3 follows H1, or missing level.', evidence: 'Header levels.', fp: 'Flat structures.', floor: 'low' },
  'L3-02': { name: 'orphan sections', sub: 'orphan sections', trigger: 'Section not linked or referenced anywhere.', evidence: 'Isolated content.', fp: 'Appendices.', floor: 'low' },
  'L3-03': { name: 'redundant sections', sub: 'duplicate sections', trigger: 'Multiple sections cover identical content.', evidence: 'Duplicate content.', fp: 'Reference summaries.', floor: 'medium' },
  'L3-04': { name: 'improper ordering', sub: 'missing prerequisites', trigger: 'Prerequisite steps appear after actions, leading to failure.', evidence: 'Step sequence.', fp: 'Clearly marked appendices.', floor: 'high', ceiling: 'critical', related_layers: ['L6'] },
  'L3-05': { name: 'content fragmentation', sub: 'broken hierarchy', trigger: 'Topic split across too many small sections.', evidence: 'Scattered info.', fp: 'Modular design.', floor: 'low' },
  'L3-06': { name: 'overloaded sections', sub: 'broken hierarchy', trigger: 'Single section covers too many distinct topics.', evidence: 'Topic density.', fp: 'Overviews.', floor: 'medium' },
  'L3-07': { name: 'misplaced content', sub: 'broken hierarchy', trigger: 'API details in an onboarding guide (out of place).', evidence: 'Context mismatch.', fp: 'Deep links.', floor: 'medium' },
  'L3-08': { name: 'structural asymmetry', sub: 'broken hierarchy', trigger: 'Parallel features described with inconsistent structures.', evidence: 'Pattern break.', fp: 'Feature complexity.', floor: 'low' },

  // LAYER 4: Semantic
  'L4-01': { name: 'ambiguous wording', sub: 'semantic ambiguity', trigger: 'Sentences with multiple conflicting technical interpretations.', evidence: 'Vague sentence context.', fp: 'Overview summaries.', floor: 'medium', related_layers: ['L1'] },
  'L4-02': { name: 'vague language', sub: 'vague quantifiers', trigger: 'Use of "some", "often", "fast" without metrics.', evidence: 'Vague term.', fp: 'Marketing text.', floor: 'low' },
  'L4-03': { name: 'undefined terms', sub: 'undefined terms', trigger: 'Technical jargon used without definition or link.', evidence: 'The term.', fp: 'Industry standard.', floor: 'medium' },
  'L4-04': { name: 'polysemy conflicts', sub: 'overloaded terms', trigger: 'Same word used for two different technical meanings.', evidence: 'Conflicting usage.', fp: 'Common words.', floor: 'medium' },
  'L4-05': { name: 'misleading phrasing', sub: 'ambiguous references', trigger: 'Grammar suggests a relationship that doesn\'t exist.', evidence: 'The phrase.', fp: 'Stylistic choice.', floor: 'medium' },
  'L4-06': { name: 'incomplete explanation', sub: 'undefined terms', trigger: 'Concept introduced but never fully explained.', evidence: 'The concept.', fp: 'External refs.', floor: 'medium' },
  'L4-07': { name: 'unstated assumptions', sub: 'ambiguous references', trigger: 'Requires knowledge not mentioned or linked.', evidence: 'The gap.', fp: 'Expert level docs.', floor: 'medium' },
  'L4-08': { name: 'context drift', sub: 'ambiguous references', trigger: 'Subject of "it" or "this" becomes unclear.', evidence: 'The pronoun.', fp: 'Clear proximity.', floor: 'low' },
  'L4-09': { name: 'terminology registry gap', sub: 'terminology registry gaps', trigger: 'Term used without formal definition in a terminology registry.', evidence: 'Unregistered term.', fp: 'Common language.', floor: 'low' },
  'L4-10': { name: 'forbidden term violation', sub: 'forbidden-term violations', trigger: 'Document uses terms explicitly banned by the project vocabulary.', evidence: 'Banned term.', fp: 'Quoted sources.', floor: 'medium' },
  'L4-11': { name: 'interpretation leakage', sub: 'interpretation leakage', trigger: 'Specification leaks implementation details through interpretation language.', evidence: 'Implementation leak.', fp: 'Reference implementations.', floor: 'medium' },

  // LAYER 5: Factual
  'L5-01': { name: 'unsupported claims', sub: 'unsupported claims', trigger: 'Claim made without evidence or citation.', evidence: 'The claim.', fp: 'Obvious truths.', floor: 'medium' },
  'L5-02': { name: 'missing citations', sub: 'citation gaps', trigger: 'Data or quote provided without source.', evidence: 'Data point.', fp: 'Internal data.', floor: 'low' },
  'L5-03': { name: 'outdated info risk', sub: 'stale-vs-citation distinction', trigger: 'Reference to deprecated systems or old dates without modern context.', evidence: 'Date/Version mismatch.', fp: 'Historical context blocks.', floor: 'high', related_layers: ['L32'] },
  'L5-04': { name: 'hallucination risk', sub: 'unsupported claims', trigger: 'Claims about features that don\'t exist in current context.', evidence: 'False feature.', fp: 'Future roadmap.', floor: 'critical' },
  'L5-05': { name: 'misinterpreted facts', sub: 'norm-vs-description confusion', trigger: 'Incorrect application of a factual rule.', evidence: 'Misinterpretation.', fp: 'Nuanced cases.', floor: 'medium' },
  'L5-06': { name: 'inconsistent references', sub: 'citation gaps', trigger: 'Citation links to wrong or dead resource.', evidence: 'Dead link.', fp: 'Internal only.', floor: 'medium' },
  'L5-07': { name: 'evidence mismatch', sub: 'unsupported claims', trigger: 'Provided evidence doesn\'t support the claim.', evidence: 'Claim vs evidence.', fp: 'Partial support.', floor: 'medium' },
  'L5-08': { name: 'unverifiable claims', sub: 'unsupported claims', trigger: 'Claim cannot be tested or verified by users.', evidence: 'Untestable claim.', fp: 'Subjective UX.', floor: 'low' },

  // LAYER 6: Functional
  'L6-01': { name: 'impossible workflows', sub: 'impossible workflows', trigger: 'Steps require access or state that is blocked.', evidence: 'Blocker step.', fp: 'Admin overrides.', floor: 'critical' },
  'L6-02': { name: 'missing execution step', sub: 'incomplete procedures', trigger: 'Process fails if followed exactly as written.', evidence: 'The gap.', fp: 'Implicit defaults.', floor: 'high' },
  'L6-03': { name: 'dependency gaps', sub: 'hidden prerequisites', trigger: 'Tool or library needed but not mentioned.', evidence: 'Missing dependency.', fp: 'Standard env.', floor: 'medium' },
  'L6-04': { name: 'resource conflicts', sub: 'impossible workflows', trigger: 'Steps require same resource in incompatible ways.', evidence: 'The conflict.', fp: 'Multi-threading.', floor: 'high' },
  'L6-05': { name: 'operational impossibility', sub: 'impossible workflows', trigger: 'Logic requires 100% uptime or zero latency.', evidence: 'Impossible SLA.', fp: 'Idealized models.', floor: 'medium' },
  'L6-06': { name: 'invalid sequence', sub: 'incomplete procedures', trigger: 'Order of operations leads to data loss.', evidence: 'Wrong order.', fp: 'Commutative ops.', floor: 'high' },
  'L6-07': { name: 'untriggerable state', sub: 'impossible workflows', trigger: 'Conditional logic that can never be met.', evidence: 'Dead logic.', fp: 'Debug modes.', floor: 'medium' },
  'L6-08': { name: 'missing preconditions', sub: 'structural missing-prerequisite cases', trigger: 'Action taken without required setup or initialization.', evidence: 'Missing setup block.', fp: 'Standard environment assumptions.', floor: 'high', ceiling: 'critical', related_layers: ['L3'] },

  // LAYER 7: Temporal
  'L7-01': { name: 'timeline contradictions', sub: 'sequence conflicts', trigger: 'Event A said to happen before and after B.', evidence: 'Conflict.', fp: 'Cyclic events.', floor: 'high' },
  'L7-02': { name: 'event ordering errors', sub: 'sequence conflicts', trigger: 'Logical time flow is broken.', evidence: 'Order error.', fp: 'Concurrent events.', floor: 'medium' },
  'L7-03': { name: 'state transition breaks', sub: 'lifecycle drift', trigger: 'Object moves between states without valid path.', evidence: 'Invalid jump.', fp: 'Eventual consistency.', floor: 'high' },
  'L7-04': { name: 'version inconsistencies', sub: 'stale timelines', trigger: 'References to incompatible time-bound versions.', evidence: 'Version mix.', fp: 'Migration docs.', floor: 'medium' },
  'L7-05': { name: 'causality violations', sub: 'sequence conflicts', trigger: 'Effect happens before its cause.', evidence: 'Violation.', fp: 'Retroactive logic.', floor: 'critical' },
  'L7-06': { name: 'missing state definition', sub: 'lifecycle drift', trigger: 'Time-bound state mentioned but not defined.', evidence: 'The state.', fp: 'Ephemeral states.', floor: 'medium' },
  'L7-07': { name: 'temporal ambiguity', sub: 'invalid timing windows', trigger: 'Terms like "soon" or "later" without windows.', evidence: 'Vague time.', fp: 'Rough estimates.', floor: 'low' },
  'L7-08': { name: 'lifecycle gaps', sub: 'lifecycle drift', trigger: 'Beginning or end of an entity life is undefined.', evidence: 'Lifecycle gap.', fp: 'Infinite entities.', floor: 'medium' },

  // LAYER 8: Architectural
  'L8-01': { name: 'component overlap', sub: 'responsibility overlap', trigger: 'Two components claim same primary role.', evidence: 'Shared role.', fp: 'Redundancy.', floor: 'medium' },
  'L8-02': { name: 'missing component', sub: 'missing components', trigger: 'System relies on part not defined in architecture.', evidence: 'The gap.', fp: 'External infra.', floor: 'high' },
  'L8-03': { name: 'responsibility conflict', sub: 'responsibility overlap', trigger: 'Component forced to manage unrelated concerns.', evidence: 'Mixed concerns.', fp: 'Small systems.', floor: 'medium' },
  'L8-04': { name: 'tight coupling', sub: 'boundary leaks', trigger: 'Change in A requires lock-step change in B.', evidence: 'Coupling.', fp: 'Performance optims.', floor: 'medium' },
  'L8-05': { name: 'interface mismatch', sub: 'boundary leaks', trigger: 'Producer output doesn\'t match consumer input.', evidence: 'Mismatch.', fp: 'Adapters.', floor: 'high' },
  'L8-06': { name: 'circular dependency', sub: 'topology inconsistency', trigger: 'A->B->A architecture loop.', evidence: 'The circle.', fp: 'Event loops.', floor: 'high' },
  'L8-07': { name: 'ownership ambiguity', sub: 'responsibility overlap', trigger: 'Unclear which component owns a data set.', evidence: 'Ownership gap.', fp: 'Shared caches.', floor: 'medium' },
  'L8-08': { name: 'boundary violation', sub: 'boundary leaks', trigger: 'Internal state exposed to unrelated layers.', evidence: 'Leaky abstraction.', fp: 'Internal tools.', floor: 'medium' },

  // LAYER 9: Completeness
  'L9-01': { name: 'missing edge cases', sub: 'missing edge cases', trigger: 'Only happy path is documented.', evidence: 'Omitted cases.', fp: 'Intro docs.', floor: 'medium' },
  'L9-02': { name: 'missing error handling', sub: 'missing edge cases', trigger: 'No guidance for failure states.', evidence: 'Error gap.', fp: 'Simple scripts.', floor: 'high' },
  'L9-03': { name: 'incomplete workflow', sub: 'missing branches', trigger: 'Workflow stops before reaching goal.', evidence: 'Truncated process.', fp: 'To-be-continued.', floor: 'high' },
  'L9-04': { name: 'missing constraints', sub: 'missing postconditions', trigger: 'Limits or boundaries not defined.', evidence: 'The gap.', fp: 'Unbounded systems.', floor: 'medium' },
  'L9-05': { name: 'uncovered requirement', sub: 'missing edge cases', trigger: 'Stated requirement has no implementation steps.', evidence: 'Requirement gap.', fp: 'Non-functional reqs.', floor: 'medium' },
  'L9-06': { name: 'reasoning gap', sub: 'missing edge cases', trigger: 'Jump from data to conclusion is missing context.', evidence: 'Logic gap.', fp: 'Expert brevity.', floor: 'low' },
  'L9-07': { name: 'missing validation', sub: 'missing postconditions', trigger: 'Input accepted without sanity checks.', evidence: 'Validation gap.', fp: 'Trusted sources.', floor: 'medium' },
  'L9-08': { name: 'undefined behavior', sub: 'missing postconditions', trigger: 'Action result is "undefined" or "random".', evidence: 'The term.', fp: 'Expected entropy.', floor: 'medium' },

  // LAYER 10: Intent
  'L10-01': { name: 'scope creep', sub: 'scope creep', trigger: 'Document wanders into unrelated domains.', evidence: 'Unrelated content.', fp: 'Integrated systems.', floor: 'low' },
  'L10-02': { name: 'goal mismatch', sub: 'business-vs-implementation mismatch', trigger: 'Implementation hinders the stated goal.', evidence: 'Mismatch.', fp: 'Iterative dev.', floor: 'high' },
  'L10-03': { name: 'conflicting goals', sub: 'goal drift', trigger: 'Goal A requires NOT B, but Goal B is required.', evidence: 'Conflict.', fp: 'Tradeoff balance.', floor: 'high' },
  'L10-04': { name: 'irrelevant content', sub: 'scope creep', trigger: 'Significant portions add no value to target audience.', evidence: 'Irrelevant text.', fp: 'Background info.', floor: 'low' },
  'L10-05': { name: 'solution misalignment', sub: 'business-vs-implementation mismatch', trigger: 'Right answer to the wrong problem.', evidence: 'Misalignment.', fp: 'Pivot docs.', floor: 'medium' },
  'L10-06': { name: 'requirement drift', sub: 'goal drift', trigger: 'Initial requirements ignored in final design.', evidence: 'Requirement gap.', fp: 'Requirement updates.', floor: 'medium' },
  'L10-07': { name: 'priority inversion', sub: 'goal drift', trigger: 'Minor details given more space than core features.', evidence: 'Focus imbalance.', fp: 'Appendix density.', floor: 'low' },
  'L10-08': { name: 'ambiguous objective', sub: 'business-vs-implementation mismatch', trigger: 'Unclear what the document is trying to achieve.', evidence: 'Vague intent.', fp: 'Exploratory docs.', floor: 'medium' },

  // LAYER 11: Metacognition
  'L11-01': { name: 'unjustified claims', sub: 'unverifiable conclusions', trigger: 'Claims of "best" or "unique" without data.', evidence: 'Adjectives.', fp: 'Marketing context.', floor: 'low' },
  'L11-02': { name: 'shallow reasoning', sub: 'shallow tradeoff analysis', trigger: 'Complex choices described as "simple".', evidence: 'Oversimplification.', fp: 'Beginner guides.', floor: 'medium' },
  'L11-03': { name: 'overconfidence', sub: 'overconfidence', trigger: 'Dismissing risks without analysis.', evidence: 'Certainty markers.', fp: 'Proven systems.', floor: 'medium' },
  'L11-04': { name: 'missing rationale', sub: 'unverifiable conclusions', trigger: 'Choice made without explaining why.', evidence: 'The "why" gap.', fp: 'Standard patterns.', floor: 'medium' },
  'L11-05': { name: 'assumption stacking', sub: 'unjustified certainty', trigger: 'If A then B, if B then C... without verifying A.', evidence: 'Chain of ifs.', fp: 'Future planning.', floor: 'high' },
  'L11-06': { name: 'weak justification', sub: 'unverifiable conclusions', trigger: 'Evidence provided is irrelevant or weak.', evidence: 'The evidence.', fp: 'Heuristic choices.', floor: 'medium' },
  'L11-07': { name: 'incomplete evaluation', sub: 'shallow tradeoff analysis', trigger: 'Pros mentioned but no cons.', evidence: 'One-sided analysis.', fp: 'Selling a solution.', floor: 'medium' },
  'L11-08': { name: 'reasoning inconsistency', sub: 'unverifiable conclusions', trigger: 'Logic changes between similar sections.', evidence: 'Shifting logic.', fp: 'Different tradeoffs.', floor: 'medium' },

  // LAYER 12: Adversarial
  'L12-01': { name: 'fragile assumptions', sub: 'risky defaults', trigger: 'Logic breaks if a single non-guaranteed condition fails.', evidence: 'Assumed truth.', fp: 'Critical path.', floor: 'high' },
  'L12-02': { name: 'missing failure mode', sub: 'bypass scenarios', trigger: 'No description of what happens when X fails.', evidence: 'Missing "if fail".', fp: 'High availability.', floor: 'high' },
  'L12-03': { name: 'counterexample vulnerability', sub: 'abuse paths', trigger: 'A single valid case disproves the main rule.', evidence: 'Counterexample.', fp: '99% rules.', floor: 'medium' },
  'L12-04': { name: 'stress breakage', sub: 'misuse opportunities', trigger: 'Workflow fails under high volume or load.', evidence: 'Stress gap.', fp: 'Single user tools.', floor: 'high' },
  'L12-05': { name: 'boundary condition failure', sub: 'bypass scenarios', trigger: 'Logic fails exactly at the limit (e.g. N vs N+1).', evidence: 'Off-by-one.', fp: 'Flexible limits.', floor: 'high' },
  'L12-06': { name: 'unhandled edge collapse', sub: 'bypass scenarios', trigger: 'Multiple minor errors lead to total failure.', evidence: 'Cascading risk.', fp: 'Isolation layers.', floor: 'medium' },
  'L12-07': { name: 'robustness gap', sub: 'misuse opportunities', trigger: 'System expects perfectly formatted input.', evidence: 'Input assumption.', fp: 'Internal APIs.', floor: 'medium' },
  'L12-08': { name: 'exploitability', sub: 'misuse opportunities', trigger: 'Instructions show a path to bypass security.', evidence: 'Risk path.', fp: 'Security testing.', floor: 'critical' },

  // LAYER 13: Knowledge Graph
  'L13-01': { name: 'orphan entities', sub: 'orphan entities', trigger: 'Entity mentioned once and never referenced.', evidence: 'Isolated term.', fp: 'Self-contained refs.', floor: 'low' },
  'L13-02': { name: 'missing relationships', sub: 'relationship gaps', trigger: 'Two related entities have no defined link.', evidence: 'Implicit link.', fp: 'Weak coupling.', floor: 'medium' },
  'L13-03': { name: 'circular references', sub: 'circular references', trigger: 'A references B, B references A (no data).', evidence: 'The loop.', fp: 'Bi-directional links.', floor: 'medium' },
  'L13-04': { name: 'entity duplication', sub: 'alias drift', trigger: 'Same real-world object has two entity names.', evidence: 'Duplicates.', fp: 'Domain aliases.', floor: 'medium' },
  'L13-05': { name: 'broken linkage', sub: 'relationship gaps', trigger: 'Reference to an entity that doesn\'t exist.', evidence: 'Dead ref.', fp: 'Planned features.', floor: 'high' },
  'L13-06': { name: 'hierarchy conflict', sub: 'role confusion', trigger: 'Child entity claims to be parent of its parent.', evidence: 'Inverted tree.', fp: 'Mesh networks.', floor: 'medium' },
  'L13-07': { name: 'dependency ambiguity', sub: 'relationship gaps', trigger: 'Unclear if relationship is "has-a" or "is-a".', evidence: 'Vague link.', fp: 'Natural language.', floor: 'medium' },
  'L13-08': { name: 'concept drift', sub: 'alias drift', trigger: 'Attributes of an entity change across sections.', evidence: 'Shifting attributes.', fp: 'Entity evolution.', floor: 'medium' },

  // LAYER 14: Quantitative
  'L14-01': { name: 'calculation error', sub: 'numeric inconsistency', trigger: 'Math provided in text is incorrect.', evidence: 'Wrong math.', fp: 'Approximate numbers.', floor: 'high' },
  'L14-02': { name: 'unit mismatch', sub: 'unit mismatch', trigger: 'Mixing ms/s, MB/GB without conversion.', evidence: 'Conflicting units.', fp: 'Common shorthand.', floor: 'high' },
  'L14-03': { name: 'scale inconsistency', sub: 'numeric inconsistency', trigger: 'Performance claims don\'t scale linearly as implied.', evidence: 'Scale gap.', fp: 'Non-linear systems.', floor: 'medium' },
  'L14-04': { name: 'unsupported statistics', sub: 'vague measurements', trigger: 'Claims like "99.9%" without base data.', evidence: 'The stat.', fp: 'SLA targets.', floor: 'low' },
  'L14-05': { name: 'numeric contradiction', sub: 'numeric inconsistency', trigger: 'Min > Max in a range definition.', evidence: 'Impossible range.', fp: 'Dynamic bounds.', floor: 'critical' },
  'L14-06': { name: 'rounding ambiguity', sub: 'numeric inconsistency', trigger: 'Unclear if values are rounded up or down.', evidence: 'Precision gap.', fp: 'Estimated values.', floor: 'low' },
  'L14-07': { name: 'range inconsistency', sub: 'numeric inconsistency', trigger: 'Overlapping or gapped numeric ranges.', evidence: 'Broken range.', fp: 'Intentional gaps.', floor: 'medium' },
  'L14-08': { name: 'metric misinterpretation', sub: 'vague measurements', trigger: 'Using average when median is required.', evidence: 'Metric choice.', fp: 'General summaries.', floor: 'medium' },

  // LAYER 15: Requirement
  'L15-01': { name: 'requirement ambiguity', sub: 'ambiguous acceptance criteria', trigger: 'Requirement uses "should" vs "must" weakly.', evidence: 'Vague requirement.', fp: 'Guideline docs.', floor: 'medium' },
  'L15-02': { name: 'requirement contradiction', sub: 'ambiguous acceptance criteria', trigger: 'Requirement A forbids what B requires.', evidence: 'Conflict.', fp: 'Priority tiers.', floor: 'high' },
  'L15-03': { name: 'missing acceptance criteria', sub: 'ambiguous acceptance criteria', trigger: 'Requirement has no way to prove it is met.', evidence: 'Untestable req.', fp: 'High-level goals.', floor: 'high' },
  'L15-04': { name: 'unverifiable requirement', sub: 'ambiguous acceptance criteria', trigger: 'Requires external human subjective judgment.', evidence: 'Subjective req.', fp: 'UI/UX guidelines.', floor: 'medium' },
  'L15-05': { name: 'implicit requirement', sub: 'ambiguous acceptance criteria', trigger: 'Necessary action not stated as a requirement.', evidence: 'The gap.', fp: 'Implicit standards.', floor: 'medium' },
  'L15-06': { name: 'duplicated requirement', sub: 'ambiguous acceptance criteria', trigger: 'Requirement stated twice with slight drift.', evidence: 'Redundancy.', fp: 'Reference lists.', floor: 'low' },
  'L15-07': { name: 'requirement dependency missing', sub: 'traceability gaps', trigger: 'Req A needs B, but B is not defined.', evidence: 'Traceability gap.', fp: 'Standard reqs.', floor: 'medium' },
  'L15-08': { name: 'requirement scope leakage', sub: 'ambiguous acceptance criteria', trigger: 'Requirement covers items outside document scope.', evidence: 'Scope leak.', fp: 'Contextual reqs.', floor: 'low' },
  'L15-09': { name: 'closed-world violation', sub: 'closed-world violations', trigger: 'Spec assumes all possible inputs are enumerated when they are not.', evidence: 'Open input set.', fp: 'Closed enums.', floor: 'high' },
  'L15-10': { name: 'undefined obligation', sub: 'undefined obligations', trigger: 'System has responsibilities that no requirement explicitly assigns.', evidence: 'Orphaned duty.', fp: 'Implicit contracts.', floor: 'medium' },

  // LAYER 16: State Machine
  'L16-01': { name: 'undefined states', sub: 'impossible transitions', trigger: 'Machine moves to state X which has no definition.', evidence: 'The state.', fp: 'External states.', floor: 'high' },
  'L16-02': { name: 'invalid transitions', sub: 'impossible transitions', trigger: 'Path from A to B is logically forbidden.', evidence: 'The path.', fp: 'Bypass modes.', floor: 'high' },
  'L16-03': { name: 'unreachable states', sub: 'impossible transitions', trigger: 'State exists but no path leads to it.', evidence: 'Isolated state.', fp: 'Error-only states.', floor: 'medium' },
  'L16-04': { name: 'terminal state missing', sub: 'missing terminal states', trigger: 'Machine can loop forever without exit.', evidence: 'The loop.', fp: 'Long-running tasks.', floor: 'medium' },
  'L16-05': { name: 'multiple initial states', sub: 'impossible transitions', trigger: 'Ambiguity on where the machine starts.', evidence: 'Start points.', fp: 'Context-dependent.', floor: 'medium' },
  'L16-06': { name: 'transition ambiguity', sub: 'impossible transitions', trigger: 'Same trigger leads to two different states.', evidence: 'Ambiguity.', fp: 'Non-deterministic.', floor: 'medium' },
  'L16-07': { name: 'state condition conflict', sub: 'impossible transitions', trigger: 'Entry conditions for state X are impossible.', evidence: 'Conditions.', fp: 'Complex flags.', floor: 'high' },
  'L16-08': { name: 'state lifecycle gap', sub: 'retry loops', trigger: 'Resource cleanup not defined for terminal states.', evidence: 'Cleanup gap.', fp: 'Auto-GC systems.', floor: 'medium' },
  'L16-09': { name: 'fatal-state exposure', sub: 'fatal-state exposure', trigger: 'System can reach a state from which no recovery is possible.', evidence: 'Fatal state.', fp: 'Planned shutdown.', floor: 'critical' },
  'L16-10': { name: 'no-exit loop', sub: 'no-exit loops', trigger: 'State machine enters a cycle with no exit condition.', evidence: 'Inescapable loop.', fp: 'Intentional loops.', floor: 'high' },

  // LAYER 17: API Contract
  'L17-01': { name: 'undefined parameters', sub: 'schema mismatch', trigger: 'Code example uses parameter not in schema.', evidence: 'Missing param.', fp: 'Optional params.', floor: 'high' },
  'L17-02': { name: 'inconsistent parameter types', sub: 'schema mismatch', trigger: 'Schema says Int, Example shows String.', evidence: 'Type mismatch.', fp: 'Weak typing.', floor: 'critical' },
  'L17-03': { name: 'missing return schema', sub: 'schema mismatch', trigger: 'Success response defined but shape is missing.', evidence: 'Return gap.', fp: 'Empty 200 OK.', floor: 'high' },
  'L17-04': { name: 'undocumented error response', sub: 'error-contract omissions', trigger: 'System can return 4xx/5xx not in docs.', evidence: 'Hidden error.', fp: 'Standard HTTP.', floor: 'medium' },
  'L17-05': { name: 'inconsistent naming', sub: 'schema mismatch', trigger: 'CamelCase vs snake_case in same API.', evidence: 'Case mismatch.', fp: 'Legacy wrappers.', floor: 'low' },
  'L17-06': { name: 'breaking contract change', sub: 'schema mismatch', trigger: 'Instruction to remove field without deprecation.', evidence: 'Breaking change.', fp: 'Major versions.', floor: 'critical' },
  'L17-07': { name: 'request-response mismatch', sub: 'schema mismatch', trigger: 'Response implies data not requested.', evidence: 'The mismatch.', fp: 'Standard metadata.', floor: 'medium' },
  'L17-08': { name: 'versioning conflict', sub: 'auth ambiguity', trigger: 'V1 auth used with V2 endpoints.', evidence: 'Version mix.', fp: 'Backward compat.', floor: 'high' },

  // LAYER 18: Dependency Graph
  'L18-01': { name: 'circular dependency', sub: 'circular dependencies', trigger: 'A requires B, B requires A at same level.', evidence: 'The circle.', fp: 'Peer-to-peer.', floor: 'high' },
  'L18-02': { name: 'hidden dependency', sub: 'undeclared dependencies', trigger: 'Workflow requires tool not in "Setup".', evidence: 'The tool.', fp: 'Standard OS tools.', floor: 'medium' },
  'L18-03': { name: 'missing dependency', sub: 'undeclared dependencies', trigger: 'Component won\'t run without missing piece.', evidence: 'The gap.', fp: 'Built-in modules.', floor: 'high' },
  'L18-04': { name: 'dependency ordering violation', sub: 'undeclared dependencies', trigger: 'Installing B before A fails.', evidence: 'Order error.', fp: 'Parallel installs.', floor: 'medium' },
  'L18-05': { name: 'optional vs required confusion', sub: 'undeclared dependencies', trigger: 'Unclear if dep is needed for core or extra.', evidence: 'Ambiguity.', fp: 'Feature sets.', floor: 'low' },
  'L18-06': { name: 'transitive dependency conflict', sub: 'version conflicts', trigger: 'A needs Xv1, B needs Xv2.', evidence: 'Conflict.', fp: 'Multi-version OS.', floor: 'high' },
  'L18-07': { name: 'redundant dependency', sub: 'undeclared dependencies', trigger: 'Dependency included but never used.', evidence: 'Extra dep.', fp: 'Pre-caching.', floor: 'low' },
  'L18-08': { name: 'dependency version ambiguity', sub: 'version conflicts', trigger: '"Latest" used instead of semver.', evidence: '"latest" tag.', fp: 'Simple scripts.', floor: 'medium' },

  // LAYER 19: Data Flow
  'L19-01': { name: 'missing data producer', sub: 'source-sink mismatch', trigger: 'Consumer expects data that is never created.', evidence: 'Data gap.', fp: 'External input.', floor: 'high' },
  'L19-02': { name: 'missing data consumer', sub: 'source-sink mismatch', trigger: 'Data created but never used or stored.', evidence: 'Orphan data.', fp: 'Logging only.', floor: 'medium' },
  'L19-03': { name: 'data transformation ambiguity', sub: 'missing transformations', trigger: 'Unclear how A becomes B.', evidence: 'Black box.', fp: 'Standard encodings.', floor: 'low' },
  'L19-04': { name: 'inconsistent data shape', sub: 'source-sink mismatch', trigger: 'Shape changes between producer and consumer.', evidence: 'Shape mismatch.', fp: 'Schema-less.', floor: 'high' },
  'L19-05': { name: 'data lifecycle gap', sub: 'retention ambiguity', trigger: 'Unclear when data is deleted or expired.', evidence: 'Retention gap.', fp: 'Infinite storage.', floor: 'medium' },
  'L19-06': { name: 'data duplication', sub: 'source-sink mismatch', trigger: 'Same state stored in two sources of truth.', evidence: 'Duplication.', fp: 'Read replicas.', floor: 'medium' },
  'L19-07': { name: 'invalid data propagation', sub: 'source-sink mismatch', trigger: 'Data moved to component that cannot process it.', evidence: 'Wrong path.', fp: 'Passthrough.', floor: 'medium' },
  'L19-08': { name: 'stale data risk', sub: 'retention ambiguity', trigger: 'Cache used without invalidation rules.', evidence: 'Staleness gap.', fp: 'Static data.', floor: 'high' },

  // LAYER 20: Execution Path
  'L20-01': { name: 'unreachable execution path', sub: 'unreachable paths', trigger: 'Code block or branch that can never run.', evidence: 'Dead code.', fp: 'Safety fallbacks.', floor: 'medium' },
  'L20-02': { name: 'missing trigger', sub: 'branch omissions', trigger: 'Path exists but no event starts it.', evidence: 'Trigger gap.', fp: 'Manual start.', floor: 'high' },
  'L20-03': { name: 'conflicting triggers', sub: 'branch omissions', trigger: 'Two triggers starts same path with different params.', evidence: 'Conflict.', fp: 'Overloading.', floor: 'medium' },
  'L20-04': { name: 'incomplete execution branch', sub: 'branch omissions', trigger: 'Path starts but doesn\'t handle "else" or "fail".', evidence: 'Missing branch.', fp: 'Happy-path only.', floor: 'high' },
  'L20-05': { name: 'dead-end workflow', sub: 'dead ends', trigger: 'User reaches state with no forward or back path.', evidence: 'Dead end.', fp: 'Completion state.', floor: 'critical' },
  'L20-06': { name: 'infinite loop risk', sub: 'rollback path gaps', trigger: 'A calls B, B calls A without exit.', evidence: 'The loop.', fp: 'Recursion.', floor: 'high' },
  'L20-07': { name: 'conditional ambiguity', sub: 'unreachable paths', trigger: 'Logic like "If X and not X".', evidence: 'Ambiguity.', fp: 'Dynamic vars.', floor: 'critical' },
  'L20-08': { name: 'execution ordering violation', sub: 'unreachable paths', trigger: 'Step 3 depends on result of Step 4.', evidence: 'Order error.', fp: 'Async flows.', floor: 'high' },

  // LAYER 21: Configuration
  'L21-01': { name: 'missing config key', sub: 'default ambiguity', trigger: 'Required key not listed in defaults or example.', evidence: 'Missing key.', fp: 'Optional keys.', floor: 'high' },
  'L21-02': { name: 'conflicting config', sub: 'precedence conflicts', trigger: 'CLI flag conflicts with Env var rules.', evidence: 'Conflict.', fp: 'Standard override.', floor: 'medium' },
  'L21-03': { name: 'undocumented config', sub: 'default ambiguity', trigger: 'Hidden flags mentioned in tips but not list.', evidence: 'Secret config.', fp: 'Developer-only.', floor: 'low' },
  'L21-04': { name: 'default ambiguity', sub: 'default ambiguity', trigger: 'Unclear what happens if key is omitted.', evidence: 'Default gap.', fp: 'System defaults.', floor: 'medium' },
  'L21-05': { name: 'config dependency missing', sub: 'precedence conflicts', trigger: 'Key A requires Key B to be set.', evidence: 'Dependency.', fp: 'Independent keys.', floor: 'medium' },
  'L21-06': { name: 'invalid fallback logic', sub: 'precedence conflicts', trigger: 'Fallback leads to insecure or broken state.', evidence: 'Bad fallback.', fp: 'Safe defaults.', floor: 'high' },
  'L21-07': { name: 'environment mismatch', sub: 'env drift', trigger: 'Prod config used in Dev example.', evidence: 'Env mismatch.', fp: 'Hybrid envs.', floor: 'medium' },
  'L21-08': { name: 'config mutation risk', sub: 'env drift', trigger: 'Config changed at runtime without reload rules.', evidence: 'Mutation risk.', fp: 'Dynamic config.', floor: 'medium' },

  // LAYER 22: Error Handling
  'L22-01': { name: 'missing error path', sub: 'missing recovery', trigger: 'What to do if API returns 500 is not defined.', evidence: 'Path gap.', fp: 'Fail-fast.', floor: 'high' },
  'L22-02': { name: 'silent failure risk', sub: 'partial-failure gaps', trigger: 'Errors caught but not logged or returned.', evidence: 'Silence risk.', fp: 'Expected NOPs.', floor: 'critical' },
  'L22-03': { name: 'unhandled exception', sub: 'missing recovery', trigger: 'Known exceptions not covered in try/catch docs.', evidence: 'Exception gap.', fp: 'Global handlers.', floor: 'high' },
  'L22-04': { name: 'recovery path missing', sub: 'error-handling recovery ambiguity', trigger: 'Error identified but ambiguous or missing recovery path.', evidence: 'Recovery gap or vague instructions.', fp: 'Fatal unrecoverable errors.', floor: 'high', related_layers: ['L6'] },
  'L22-05': { name: 'retry logic missing', sub: 'retry storms', trigger: 'Network errors fail immediately without retry.', evidence: 'Retry gap.', fp: 'Non-idempotent.', floor: 'medium' },
  'L22-06': { name: 'user feedback missing', sub: 'unclear operator actions', trigger: 'Internal error happens with no UI update.', evidence: 'Feedback gap.', fp: 'Background tasks.', floor: 'low' },
  'L22-07': { name: 'partial failure undefined', sub: 'partial-failure gaps', trigger: '3 of 5 steps succeed; state is unknown.', evidence: 'Partial gap.', fp: 'Atomic transactions.', floor: 'high' },
  'L22-08': { name: 'cascading failure risk', sub: 'retry storms', trigger: 'One error triggers a storm of retries.', evidence: 'Cascade risk.', fp: 'Circuit breakers.', floor: 'high' },

  // LAYER 23: Security
  'L23-01': { name: 'secret exposure risk', sub: 'secret exposure', trigger: 'Raw keys orSk-... in examples.', evidence: 'Exposed secret.', fp: 'Dummy keys.', floor: 'critical' },
  'L23-02': { name: 'unsafe storage', sub: 'secret exposure', trigger: 'Storing PII in plain text or local storage.', evidence: 'Storage choice.', fp: 'Non-sensitive.', floor: 'high' },
  'L23-03': { name: 'privilege escalation path', sub: 'authz ambiguity', trigger: 'User A can perform User B actions.', evidence: 'Escalation path.', fp: 'Admin roles.', floor: 'critical' },
  'L23-04': { name: 'injection risk', sub: 'unsafe input handling', trigger: 'Passing raw user input to DB/Shell.', evidence: 'Injection gap.', fp: 'Sanitized input.', floor: 'critical' },
  'L23-05': { name: 'trust boundary violation', sub: 'trust-boundary gaps', trigger: 'Internal data passed to external without check.', evidence: 'Boundary leak.', fp: 'Public data.', floor: 'high' },
  'L23-06': { name: 'data leakage risk', sub: 'secret exposure', trigger: 'Error messages reveal internal stack/paths.', evidence: 'Leakage risk.', fp: 'Debug builds.', floor: 'medium' },
  'L23-07': { name: 'unsafe IPC usage', sub: 'trust-boundary gaps', trigger: 'Electron IPC without context isolation.', evidence: 'IPC risk.', fp: 'Main-only.', floor: 'high' },
  'L23-08': { name: 'sandbox bypass risk', sub: 'trust-boundary gaps', trigger: 'Feature allows escaping limited environment.', evidence: 'Bypass path.', fp: 'Internal tools.', floor: 'critical' },

  // LAYER 24: Performance
  'L24-01': { name: 'O(N²) workflow risk', sub: 'scale assumptions', trigger: 'Looping over large datasets in a single call.', evidence: 'Complexity risk.', fp: 'Small N.', floor: 'medium' },
  'L24-02': { name: 'memory growth risk', sub: 'unbounded work', trigger: 'Loading full files into memory without stream.', evidence: 'Memory risk.', fp: 'Small files.', floor: 'high' },
  'L24-03': { name: 'token overflow risk', sub: 'unbounded work', trigger: 'Sending unbounded text to LLM.', evidence: 'Token risk.', fp: 'Chunked input.', floor: 'high' },
  'L24-04': { name: 'blocking operation', sub: 'expensive retries', trigger: 'Sync operations on the main thread.', evidence: 'Blocking risk.', fp: 'Brief tasks.', floor: 'medium' },
  'L24-05': { name: 'concurrency conflict', sub: 'scale assumptions', trigger: 'Two threads writing to same file without lock.', evidence: 'Race risk.', fp: 'Read-only.', floor: 'high' },
  'L24-06': { name: 'scaling assumption invalid', sub: 'scale assumptions', trigger: '"Scales to millions" without infra details.', evidence: 'Scale claim.', fp: 'Proven tech.', floor: 'low' },
  'L24-07': { name: 'batching missing', sub: 'scale assumptions', trigger: '1000 API calls instead of 1 batched call.', evidence: 'Batching gap.', fp: 'Real-time reqs.', floor: 'medium' },
  'L24-08': { name: 'timeout handling missing', sub: 'expensive retries', trigger: 'No max-time for external requests.', evidence: 'Timeout gap.', fp: 'Instant responses.', floor: 'medium' },

  // LAYER 25: Testability
  'L25-01': { name: 'untestable claim', sub: 'unverifiable claims', trigger: 'Statements like "it works perfectly".', evidence: 'The claim.', fp: 'Subjective docs.', floor: 'low' },
  'L25-02': { name: 'missing test case', sub: 'missing examples', trigger: 'Feature has no example test or validation step.', evidence: 'Test gap.', fp: 'Internal only.', floor: 'medium' },
  'L25-03': { name: 'verification gap', sub: 'validation blind spots', trigger: 'No way to confirm a step succeeded.', evidence: 'Verification gap.', fp: 'Visual feedback.', floor: 'medium' },
  'L25-04': { name: 'assertion ambiguity', sub: 'weak expected outputs', trigger: '"Check if result is correct" without "correct" shape.', evidence: 'Ambiguity.', fp: 'Standard output.', floor: 'medium' },
  'L25-05': { name: 'missing coverage criteria', sub: 'validation blind spots', trigger: 'Unclear what level of testing is required.', evidence: 'Coverage gap.', fp: 'Exploratory.', floor: 'low' },
  'L25-06': { name: 'flaky test risk', sub: 'validation blind spots', trigger: 'Tests depend on external network or time.', evidence: 'Flakiness.', fp: 'Integration tests.', floor: 'medium' },
  'L25-07': { name: 'test isolation failure', sub: 'validation blind spots', trigger: 'Test A requires Test B state.', evidence: 'Isolation gap.', fp: 'End-to-end.', floor: 'medium' },
  'L25-08': { name: 'regression risk', sub: 'validation blind spots', trigger: 'Manual steps required for every release.', evidence: 'Manual risk.', fp: 'Final QA.', floor: 'medium' },

  // LAYER 26: Maintainability
  'L26-01': { name: 'code duplication risk', sub: 'duplication', trigger: 'Identical logic repeated in three places.', evidence: 'Duplication.', fp: 'Boilerplate.', floor: 'medium' },
  'L26-02': { name: 'tight coupling risk', sub: 'brittle coupling', trigger: 'Changes to UI break the DB layer.', evidence: 'Coupling.', fp: 'Small apps.', floor: 'high' },
  'L26-03': { name: 'missing abstraction', sub: 'brittle coupling', trigger: 'Low-level details in high-level logic.', evidence: 'Leaky logic.', fp: 'Performance code.', floor: 'low' },
  'L26-04': { name: 'technical debt indicator', sub: 'brittle coupling', trigger: '"TODO", "Fixme", or legacy hacks.', evidence: 'Debt marker.', fp: 'Roadmap items.', floor: 'medium' },
  'L26-05': { name: 'refactoring needed', sub: 'brittle coupling', trigger: 'Functions too long or complex to follow.', evidence: 'Complexity.', fp: 'Core algorithms.', floor: 'low' },
  'L26-06': { name: 'legacy pattern usage', sub: 'brittle coupling', trigger: 'Using callbacks in a Promise system.', evidence: 'Legacy pattern.', fp: 'Legacy compat.', floor: 'medium' },
  'L26-07': { name: 'missing documentation', sub: 'hidden ownership', trigger: 'Internal helper functions have no comments.', evidence: 'Doc gap.', fp: 'Self-doc code.', floor: 'low' },
  'L26-08': { name: 'complexity overload', sub: 'brittle coupling', trigger: 'Too many indirection layers.', evidence: 'Over-engineering.', fp: 'Large frameworks.', floor: 'low' },

  // LAYER 27: Usability
  'L27-01': { name: 'confusing workflow', sub: 'confusing task order', trigger: 'User jumps between unrelated screens.', evidence: 'Workflow jump.', fp: 'Expert tools.', floor: 'medium' },
  'L27-02': { name: 'missing user guidance', sub: 'poor examples', trigger: 'Screen has no labels or help text.', evidence: 'Guidance gap.', fp: 'Self-evident.', floor: 'medium' },
  'L27-03': { name: 'inconsistent UI pattern', sub: 'poor examples', trigger: 'Save button changes position or color.', evidence: 'Inconsistency.', fp: 'A/B testing.', floor: 'low' },
  'L27-04': { name: 'accessibility gap', sub: 'accessibility/readability issues', trigger: 'Color-only indicators, missing Alt text.', evidence: 'A11y gap.', fp: 'Internal prototypes.', floor: 'high' },
  'L27-05': { name: 'cognitive overload', sub: 'jargon overload', trigger: 'Presenting 50 options on one screen.', evidence: 'Density.', fp: 'Dashboard views.', floor: 'medium' },
  'L27-06': { name: 'missing feedback', sub: 'poor examples', trigger: 'Long action starts with no loading state.', evidence: 'Feedback gap.', fp: 'Fast actions.', floor: 'medium' },
  'L27-07': { name: 'error message quality', sub: 'accessibility/readability issues', trigger: '"An error occurred" (Error 0x01).', evidence: 'Vague error.', fp: 'System errors.', floor: 'medium' },
  'L27-08': { name: 'onboarding gap', sub: 'poor examples', trigger: 'No "Getting Started" or sample data.', evidence: 'onboarding gap', fp: 'Advanced tools.', floor: 'low' },
  'L27-09': { name: 'mandatory UI component gap', sub: 'mandatory UI surface gaps', trigger: 'Required interactive element not present in the documented UI surface.', evidence: 'Missing UI element.', fp: 'CLI-only systems.', floor: 'high' },
  'L27-10': { name: 'exposed fatal state UX', sub: 'exposed fatal-state UX violations', trigger: 'UI exposes raw fatal error state without user-friendly recovery path.', evidence: 'Raw error display.', fp: 'Developer tools.', floor: 'high' },

  // LAYER 28: Interoperability
  'L28-01': { name: 'protocol mismatch', sub: 'protocol mismatch', trigger: 'A uses REST, B expects GraphQL.', evidence: 'Mismatch.', fp: 'Gateways.', floor: 'high' },
  'L28-02': { name: 'format incompatibility', sub: 'format assumptions', trigger: 'JSON sent to XML consumer.', evidence: 'Format mismatch.', fp: 'Auto-converters.', floor: 'high' },
  'L28-03': { name: 'version conflict', sub: 'interoperability compatibility mismatches', trigger: 'API or protocol version mismatches leading to breaks.', evidence: 'Version gap details.', fp: 'Explicit backward compatibility layers.', floor: 'critical', related_layers: ['L32'] },
  'L28-04': { name: 'missing adapter', sub: 'integration ambiguity', trigger: 'Two systems cannot talk without a bridge.', evidence: 'Missing link.', fp: 'Direct coupling.', floor: 'medium' },
  'L28-05': { name: 'coupling to implementation', sub: 'integration ambiguity', trigger: 'Client depends on internal DB structure.', evidence: 'Leaky coupling.', fp: 'Shared libraries.', floor: 'high' },
  'L28-06': { name: 'missing abstraction layer', sub: 'integration ambiguity', trigger: 'Directly calling hardware/low-level.', evidence: 'Abstraction gap.', fp: 'Drivers.', floor: 'medium' },
  'L28-07': { name: 'integration test gap', sub: 'integration ambiguity', trigger: 'Systems never tested together.', evidence: 'Test gap.', fp: 'Mocked envs.', floor: 'medium' },
  'L28-08': { name: 'deployment mismatch', sub: 'integration ambiguity', trigger: 'Linux client for Windows service.', evidence: 'Env mismatch.', fp: 'Cross-platform.', floor: 'medium' },

  // LAYER 29: Governance
  'L29-01': { name: 'policy violation', sub: 'policy traceability', trigger: 'Steps violate documented security rules.', evidence: 'Violation.', fp: 'Emergency paths.', floor: 'high' },
  'L29-02': { name: 'regulatory gap', sub: 'retention/compliance gaps', trigger: 'No mention of GDPR/HIPAA where required.', evidence: 'Compliance gap.', fp: 'Non-regulated.', floor: 'critical' },
  'L29-03': { name: 'audit trail missing', sub: 'auditability', trigger: 'Critical actions not logged.', evidence: 'Audit gap.', fp: 'Ephemeral actions.', floor: 'high' },
  'L29-04': { name: 'access control gap', sub: 'approval gates', trigger: 'Unclear who approves resource access.', evidence: 'Access gap.', fp: 'Sole owner.', floor: 'medium' },
  'L29-05': { name: 'data retention issue', sub: 'retention/compliance gaps', trigger: 'Storing logs forever without policy.', evidence: 'Retention gap.', fp: 'Infinite storage.', floor: 'medium' },
  'L29-06': { name: 'consent management gap', sub: 'retention/compliance gaps', trigger: 'Collecting data without opt-in docs.', evidence: 'Consent gap.', fp: 'Internal only.', floor: 'high' },
  'L29-07': { name: 'transparency issue', sub: 'auditability', trigger: 'Hidden data collection or sharing.', evidence: 'Transparency gap.', fp: 'Standard telemetry.', floor: 'medium' },
  'L29-08': { name: 'accountability gap', sub: 'approval gates', trigger: 'Unclear who is responsible if system fails.', evidence: 'Ownership gap.', fp: 'Shared team.', floor: 'medium' },
  'L29-09': { name: 'override condition ambiguity', sub: 'override ambiguity', trigger: 'Override conditions described without clear triggers or revocation rules.', evidence: 'Vague override.', fp: 'Emergency protocols.', floor: 'high' },
  'L29-10': { name: 'enforcement path gap', sub: 'enforcement-path gaps', trigger: 'Policy exists but no mechanism enforces compliance.', evidence: 'Unenforced rule.', fp: 'Self-enforcing policies.', floor: 'high' },

  // LAYER 30: Resilience
  'L30-01': { name: 'single point of failure', sub: 'single points of failure', trigger: 'System fails if Component X is down.', evidence: 'SPOF.', fp: 'Redundant setup.', floor: 'critical' },
  'L30-02': { name: 'missing circuit breaker', sub: 'degraded-mode gaps', trigger: 'Failing service brings down caller.', evidence: 'Cascade risk.', fp: 'Low load.', floor: 'high' },
  'L30-03': { name: 'missing fallback', sub: 'degraded-mode gaps', trigger: 'No "Offline" or "Lite" mode.', evidence: 'Fallback gap.', fp: 'Online-only.', floor: 'medium' },
  'L30-04': { name: 'missing health check', sub: 'outage handling', trigger: 'Load balancer can\'t see if service is dead.', evidence: 'Health gap.', fp: 'Static routing.', floor: 'medium' },
  'L30-05': { name: 'graceful degradation gap', sub: 'degraded-mode gaps', trigger: 'System crashes instead of slowing down.', evidence: 'Crash risk.', fp: 'Fail-fast.', floor: 'medium' },
  'L30-06': { name: 'missing retry strategy', sub: 'outage handling', trigger: 'Retrying too fast or too slow.', evidence: 'Retry gap.', fp: 'Standard backoff.', floor: 'medium' },
  'L30-07': { name: 'missing backoff logic', sub: 'outage handling', trigger: 'Fixed retry interval without jitter.', evidence: 'Backoff gap.', fp: 'Small clusters.', floor: 'medium' },
  'L30-08': { name: 'missing dead letter queue', sub: 'outage handling', trigger: 'Failing messages are lost forever.', evidence: 'DLQ gap.', fp: 'Disposable data.', floor: 'high' },
  'L30-09': { name: 'rollback infeasibility', sub: 'rollback infeasibility', trigger: 'State change cannot be reversed after execution.', evidence: 'Irreversible action.', fp: 'Append-only logs.', floor: 'high' },
  'L30-10': { name: 'fail-safe absence', sub: 'fail-safe absence', trigger: 'System lacks a defined safe state for critical failures.', evidence: 'No safe state.', fp: 'Fail-open systems.', floor: 'high' },

  // LAYER 31: Observability
  'L31-01': { name: 'missing logging', sub: 'missing logs', trigger: 'Important events happen silently.', evidence: 'Logging gap.', fp: 'Noisy logs.', floor: 'medium' },
  'L31-02': { name: 'missing metrics', sub: 'metrics gaps', trigger: 'No counters for success/failure.', evidence: 'Metrics gap.', fp: 'External monitoring.', floor: 'medium' },
  'L31-03': { name: 'missing tracing', sub: 'tracing gaps', trigger: 'Request path through services is hidden.', evidence: 'Trace gap.', fp: 'Monoliths.', floor: 'low' },
  'L31-04': { name: 'missing alerting', sub: 'correlation IDs and alert-threshold gaps', trigger: 'System fails but no one is notified.', evidence: 'Alert gap.', fp: 'Manual monitor.', floor: 'high' },
  'L31-05': { name: 'missing dashboard', sub: 'metrics gaps', trigger: 'Metrics exist but are hard to visualize.', evidence: 'Viz gap.', fp: 'CLI only.', floor: 'low' },
  'L31-06': { name: 'missing SLI/SLO', sub: 'correlation IDs and alert-threshold gaps', trigger: 'No targets for "up" or "fast".', evidence: 'SLO gap.', fp: 'Best effort.', floor: 'medium' },
  'L31-07': { name: 'missing incident response', sub: 'correlation IDs and alert-threshold gaps', trigger: 'No plan for when alerts fire.', evidence: 'IR gap.', fp: 'Small teams.', floor: 'medium' },
  'L31-08': { name: 'missing runbook', sub: 'missing logs', trigger: 'Alert tells you X is broken, but not how to fix.', evidence: 'Runbook gap.', fp: 'Self-healing.', floor: 'high' },

  // LAYER 32: Evolution
  'L32-01': { name: 'missing versioning strategy', sub: 'versioning gaps', trigger: 'No path for v1 to v2.', evidence: 'Version gap.', fp: 'Single release.', floor: 'medium' },
  'L32-02': { name: 'missing migration path', sub: 'evolution/versioning migration scenarios', trigger: 'Missing migration steps for deprecated or older versions.', evidence: 'Migration gap details.', fp: 'Greenfield deployments.', floor: 'critical', related_layers: ['L28'] },
  'L32-03': { name: 'missing deprecation policy', sub: 'deprecation policy gaps', trigger: 'Features removed without warning.', evidence: 'Deprecation gap.', fp: 'Internal beta.', floor: 'medium' },
  'L32-04': { name: 'missing backward compatibility', sub: 'compatibility promises', trigger: 'Update breaks all existing clients.', evidence: 'Compat break.', fp: 'Major breaks.', floor: 'high' },
  'L32-05': { name: 'missing extensibility', sub: 'migration gaps', trigger: 'Hard-coded logic prevents plugins.', evidence: 'Extensibility gap.', fp: 'Proprietary.', floor: 'low' },
  'L32-06': { name: 'missing plugin architecture', sub: 'migration gaps', trigger: 'No hooks for external code.', evidence: 'Hook gap.', fp: 'Monolithic.', floor: 'low' },
  'L32-07': { name: 'missing feature flags', sub: 'migration gaps', trigger: 'Release is "all or nothing".', evidence: 'Flag gap.', fp: 'Small features.', floor: 'medium' },
  'L32-08': { name: 'missing rollout strategy', sub: 'migration gaps', trigger: 'No canary or staged release plan.', evidence: 'Rollout gap.', fp: 'Internal apps.', floor: 'medium' },

  // LAYER 33: Specification Formalism
  'L33-01': { name: 'missing input domain closure', sub: 'input domain closure', trigger: 'Inputs lack bounds or exhaustive enum constraints.', evidence: 'Open-ended input.', fp: 'String fields.', floor: 'medium' },
  'L33-02': { name: 'canonical vocabulary gap', sub: 'canonical vocabulary enforcement', trigger: 'Terms used without defining in terminology registry.', evidence: 'Undefined term.', fp: 'Common words.', floor: 'low' },
  'L33-03': { name: 'state-space undefined', sub: 'state-space definition', trigger: 'System state dimensions not fully mapped.', evidence: 'Implicit state.', fp: 'Stateless logic.', floor: 'high' },
  'L33-04': { name: 'output contract non-determinism', sub: 'output contract determinism', trigger: 'Outputs vaguely defined without exact shapes.', evidence: 'Vague output.', fp: 'Logs.', floor: 'high' },
  'L33-05': { name: 'spec completeness violation', sub: 'spec completeness', trigger: 'Spec leaves behavior undefined for valid input ranges.', evidence: 'Undefined behavior zone.', fp: 'Default behavior.', floor: 'medium' },
  'L33-06': { name: 'terminology registry gap', sub: 'terminology registry', trigger: 'Core terms used without formal definition in a registry.', evidence: 'Unregistered term.', fp: 'Industry standards.', floor: 'medium' },
  'L33-07': { name: 'type entity rigor gap', sub: 'type/entity rigor', trigger: 'Types or entities described in prose without formal constraints.', evidence: 'Informal type.', fp: 'Simple types.', floor: 'medium' },
  'L33-08': { name: 'symbol consistency violation', sub: 'symbol consistency', trigger: 'Same symbol used for different concepts without resolution.', evidence: 'Symbol reuse.', fp: 'Renamed symbols.', floor: 'medium' },
  
  // LAYER 34: Simulation & Verification
  'L34-01': { name: 'mandatory simulation gap', sub: 'mandatory simulation', trigger: 'Execution specs lack pre-run simulation steps.', evidence: 'Direct execution.', fp: 'Read-only queries.', floor: 'high' },
  'L34-02': { name: 'simulation mutation risk', sub: 'simulation non-mutation', trigger: 'Simulation path allows side-effects.', evidence: 'Mutation in sim.', fp: 'Local sandbox.', floor: 'critical' },
  'L34-03': { name: 'pre-simulation governance gap', sub: 'pre-simulation governance', trigger: 'Simulation can run without policy checks.', evidence: 'Missing policy.', fp: 'Open tools.', floor: 'medium' },
  'L34-04': { name: 'verification completeness gap', sub: 'verification completeness', trigger: 'Post-simulation output lacks validation assertions.', evidence: 'Unchecked results.', fp: 'Ad-hoc runs.', floor: 'high' },
  'L34-05': { name: 'risk classification missing', sub: 'risk classification', trigger: 'High-risk operations lack simulation risk tier.', evidence: 'Missing risk tier.', fp: 'Low-risk ops.', floor: 'high' },
  'L34-06': { name: 'simulation gate bypass', sub: 'light-vs-heavy simulation correctness', trigger: 'Execution proceeds without passing correct simulation tier for its risk level.', evidence: 'Wrong sim tier.', fp: 'Read-only ops.', floor: 'high' },
  'L34-07': { name: 'formal verification boundary undefined', sub: 'formal verification boundary', trigger: 'No boundary between simulated and formally verified behavior.', evidence: 'Undefined boundary.', fp: 'Informal systems.', floor: 'medium' },
  'L34-08': { name: 'post-simulation validation absence', sub: 'post-simulation governance', trigger: 'Simulation results consumed without post-validation assertions.', evidence: 'No post-check.', fp: 'Visual inspection.', floor: 'high' },
  'L34-09': { name: 'pre-simulation check absence', sub: 'pre-simulation governance', trigger: 'No pre-simulation policy or resource check before running.', evidence: 'No pre-check.', fp: 'Open environments.', floor: 'medium' },

  // LAYER 35: Memory & World Model
  'L35-01': { name: 'memory temporal inconsistency', sub: 'temporal consistency', trigger: 'State reads span multiple epochs without locking.', evidence: 'Epoch mismatch.', fp: 'Eventual consistency.', floor: 'high' },
  'L35-02': { name: 'PSG mutation exclusivity violation', sub: 'PSG mutation gateway exclusivity', trigger: 'Direct writes to state bypass the gateway.', evidence: 'Direct write.', fp: 'Cache updates.', floor: 'critical' },
  'L35-03': { name: 'snapshot isolation gap', sub: 'PSG snapshot isolation', trigger: 'Agent reads state while another writes.', evidence: 'Dirty read.', fp: 'Analytics.', floor: 'high' },
  'L35-04': { name: 'commit binding gap', sub: 'PSG commit binding', trigger: 'State change not bound to a transaction hash.', evidence: 'Unbound write.', fp: 'Ephemeral state.', floor: 'medium' },
  'L35-05': { name: 'memory conflict resolution undefined', sub: 'memory conflict resolution', trigger: 'Concurrent memory updates lack conflict resolution strategy.', evidence: 'No resolution.', fp: 'Single-writer.', floor: 'high' },
  'L35-06': { name: 'read write authority gap', sub: 'read/write authority', trigger: 'No defined rules for who can read or write specific state.', evidence: 'Unrestricted access.', fp: 'Public state.', floor: 'high' },
  'L35-07': { name: 'snapshot version drift', sub: 'snapshot/version invariants', trigger: 'Snapshot and live state diverge without reconciliation.', evidence: 'Version mismatch.', fp: 'Async replication.', floor: 'high' },
  'L35-08': { name: 'PSG write atomicity gap', sub: 'PSG write atomicity', trigger: 'PSG write operations not atomic, allowing partial state updates.', evidence: 'Partial write.', fp: 'Single-field updates.', floor: 'high' },
  'L35-09': { name: 'memory taxonomy undefined', sub: 'memory taxonomy', trigger: 'No classification of memory types (working, long-term, episodic).', evidence: 'Flat memory model.', fp: 'Simple stores.', floor: 'medium' },
  'L35-10': { name: 'garbage collection indeterminism', sub: 'garbage collection determinism', trigger: 'State cleanup happens at unpredictable times or with unpredictable results.', evidence: 'Non-deterministic GC.', fp: 'Manual cleanup.', floor: 'medium' },
  'L35-11': { name: 'PSG read consistency gap', sub: 'PSG read consistency', trigger: 'Reads from PSG may return stale or inconsistent state.', evidence: 'Inconsistent read.', fp: 'Eventually consistent.', floor: 'high' },

  // LAYER 36: Agent Orchestration
  'L36-01': { name: 'agent role overlap', sub: 'role non-overlap', trigger: 'Two agents claim authority over same domain.', evidence: 'Role conflict.', fp: 'Backup agents.', floor: 'high' },
  'L36-02': { name: 'arbitration ambiguity', sub: 'arbitration strategy', trigger: 'Agent conflict lacks resolution protocol.', evidence: 'Missing arbiter.', fp: 'Independent agents.', floor: 'high' },
  'L36-03': { name: 'agent authority violation', sub: 'authority boundaries', trigger: 'Agent granted rights outside its I/O contract.', evidence: 'Over-permission.', fp: 'Super-agents.', floor: 'critical' },
  'L36-04': { name: 'composability constraints missing', sub: 'composability', trigger: 'Agent pipeline lacks failure propagation rules.', evidence: 'Silent failure.', fp: 'Simple chains.', floor: 'medium' },
  'L36-05': { name: 'agent role boundary violation', sub: 'role non-overlap', trigger: 'Agent acts outside its declared capability scope.', evidence: 'Scope violation.', fp: 'Super-agents.', floor: 'high' },
  'L36-06': { name: 'failure isolation missing', sub: 'failure isolation', trigger: 'One agent failure propagates uncontained to the full system.', evidence: 'Uncontained failure.', fp: 'Monolithic agents.', floor: 'high' },
  'L36-07': { name: 'agent I/O contract gap', sub: 'agent I/O contracts', trigger: 'Agent lacks defined input/output contract specification.', evidence: 'Missing I/O spec.', fp: 'Simple agents.', floor: 'medium' },
  'L36-08': { name: 'agent mutation prohibition gap', sub: 'agent mutation prohibitions', trigger: 'Agent allowed to mutate state it should only read.', evidence: 'Mutation violation.', fp: 'Write-agents.', floor: 'critical' },
  'L36-09': { name: 'communication protocol undefined', sub: 'communication protocol', trigger: 'Agents exchange data without defined message format or serialization.', evidence: 'Ad-hoc messaging.', fp: 'Direct calls.', floor: 'medium' },
  'L36-10': { name: 'authority boundary overlap', sub: 'authority boundaries', trigger: 'Two agents share overlapping authority domains without resolution rules.', evidence: 'Overlapping domains.', fp: 'Single agent.', floor: 'high' },

  // LAYER 37: Tool & Execution Safety
  'L37-01': { name: 'sandbox isolation breach', sub: 'sandbox isolation', trigger: 'Tool accesses host network or disk directly.', evidence: 'Unsafe API.', fp: 'Approved core tools.', floor: 'critical' },
  'L37-02': { name: 'idempotency guarantee missing', sub: 'idempotency', trigger: 'Execution tool lacks state-check before running.', evidence: 'Blind execution.', fp: 'Read-only tools.', floor: 'high' },
  'L37-03': { name: 'rollback path missing', sub: 'rollback rules', trigger: 'State-changing tool has no revert step.', evidence: 'One-way tool.', fp: 'Irreversible actions.', floor: 'high' },
  'L37-04': { name: 'forbidden direct write', sub: 'forbidden direct write paths', trigger: 'Tool modifies DB instead of using PSG gateway.', evidence: 'Direct DB access.', fp: 'DB admin tools.', floor: 'critical' },
  'L37-05': { name: 'execution authority violation', sub: 'execution authority violations', trigger: 'Tool executes with broader permissions than its contract allows.', evidence: 'Over-privileged execution.', fp: 'Admin tools.', floor: 'critical' },
  'L37-06': { name: 'unsafe execution path', sub: 'unsafe execution paths', trigger: 'Tool execution path allows state corruption without guard rails.', evidence: 'Unguarded path.', fp: 'Atomic operations.', floor: 'high' },
  'L37-07': { name: 'tool invocation contract gap', sub: 'tool invocation contract', trigger: 'Tool called without required preconditions or parameter validation.', evidence: 'Contract gap.', fp: 'Validated calls.', floor: 'high' },
  'L37-08': { name: 'side effect validation absence', sub: 'side-effect validation', trigger: 'Tool produces side effects that are not validated or logged.', evidence: 'Unchecked side effect.', fp: 'Read-only tools.', floor: 'high' },

  // LAYER 38: Deployment Contract
  'L38-01': { name: 'remote deployment prohibition violation', sub: 'remote deployment prohibition', trigger: 'Spec requires cloud deployment for local system.', evidence: 'Cloud requirement.', fp: 'Local network.', floor: 'critical' },
  'L38-02': { name: 'local export structure gap', sub: 'export structure completeness', trigger: 'Export lacks required metadata or assets.', evidence: 'Incomplete bundle.', fp: 'Partial exports.', floor: 'high' },
  'L38-03': { name: 'export atomicity gap', sub: 'export atomicity', trigger: 'Export fails midway leaving corrupted state.', evidence: 'Partial write.', fp: 'Streamed exports.', floor: 'medium' },
  'L38-04': { name: 'offline-run inability', sub: 'offline-run capability', trigger: 'Local export requires active internet connection.', evidence: 'Network call.', fp: 'License checks.', floor: 'high' },
  'L38-05': { name: 'export path non-determinism', sub: 'export path determinism', trigger: 'Export output path varies between runs without configuration.', evidence: 'Variable path.', fp: 'Timestamped paths.', floor: 'medium' },
  'L38-06': { name: 'executable validation absence', sub: 'executable validation', trigger: 'Export lacks post-build validation or integrity check.', evidence: 'No validation step.', fp: 'Signed builds.', floor: 'high' },
  'L38-07': { name: 'deployment term misuse', sub: 'deployment-term misuse', trigger: 'Document uses deployment language interchangeably with export or build.', evidence: 'Term confusion.', fp: 'Clear definitions.', floor: 'medium' },
  'L38-08': { name: 'local export enforcement gap', sub: 'local export enforcement', trigger: 'System does not enforce local-only export when required by deployment contract.', evidence: 'Export leakage.', fp: 'Cloud systems.', floor: 'critical' },
  'L38-09': { name: 'export structure incomplete', sub: 'export structure completeness', trigger: 'Exported package missing required metadata, assets, or manifests.', evidence: 'Missing export parts.', fp: 'Partial exports.', floor: 'high' },

  // LAYER 39: Platform Abstraction
  'L39-01': { name: 'platform exclusion violation', sub: 'platform exclusion enforcement', trigger: 'Code references iOS when target is Android-only.', evidence: 'Platform mismatch.', fp: 'Shared libraries.', floor: 'high' },
  'L39-02': { name: 'abstraction leakage', sub: 'abstraction leakage', trigger: 'Platform-specific types exposed in neutral API.', evidence: 'Leaky type.', fp: 'Platform extensions.', floor: 'medium' },
  'L39-03': { name: 'target lock invariants missing', sub: 'target lock invariants', trigger: 'No mechanism to prevent running on wrong OS.', evidence: 'Missing guard.', fp: 'Universal code.', floor: 'medium' },
  'L39-04': { name: 'implementation divergence', sub: 'implementation divergence', trigger: 'Windows/Mac behavior fundamentally differs.', evidence: 'Behavior gap.', fp: 'Native UI parity.', floor: 'high' },
  'L39-05': { name: 'platform-neutral architecture violation', sub: 'platform-neutral architecture', trigger: 'Architecture assumes platform-specific behavior without abstraction layer.', evidence: 'Platform assumption.', fp: 'Platform-specific features.', floor: 'high' },
  'L39-06': { name: 'cross-platform consistency gap', sub: 'cross-platform consistency', trigger: 'Feature documented on one platform with no equivalent on others.', evidence: 'Platform gap.', fp: 'Platform-specific features.', floor: 'high' },
  'L39-07': { name: 'output target mismatch', sub: 'output-target mismatch', trigger: 'Build output targets a platform different from stated deployment target.', evidence: 'Target mismatch.', fp: 'Multi-target builds.', floor: 'high' },
  'L39-08': { name: 'target lock bypass', sub: 'target lock invariants', trigger: 'No enforcement preventing running the build on an unintended platform.', evidence: 'Missing lock.', fp: 'Portable code.', floor: 'medium' },
  'L39-09': { name: 'compiler mapping mismatch', sub: 'compiler mapping correctness', trigger: 'Build target or compiler config does not match stated platform.', evidence: 'Config mismatch.', fp: 'Cross-compilers.', floor: 'high' },

  // LAYER 40: Context Orchestration
  'L40-01': { name: 'token budget violation', sub: 'token budget enforcement', trigger: 'Context assembly lacks hard length limits.', evidence: 'Unbounded context.', fp: 'Local models.', floor: 'high' },
  'L40-02': { name: 'context contamination', sub: 'context contamination / leakage', trigger: 'Stale or irrelevant data injected into context.', evidence: 'Bad injection.', fp: 'Historical logs.', floor: 'critical' },
  'L40-03': { name: 'decision lock hierarchy gap', sub: 'decision lock hierarchy', trigger: 'Context updates conflict without precedence rules.', evidence: 'Race condition.', fp: 'Append-only logs.', floor: 'high' },
  'L40-04': { name: 'drift correction missing', sub: 'drift correction', trigger: 'Context goes stale without refresh triggers.', evidence: 'Stale context.', fp: 'Static analysis.', floor: 'medium' },
  'L40-05': { name: 'deterministic context assembly gap', sub: 'deterministic context assembly', trigger: 'Context assembly order or content varies between identical runs.', evidence: 'Non-deterministic assembly.', fp: 'Static contexts.', floor: 'high' },
  'L40-06': { name: 'retrieval validation missing', sub: 'retrieval validation', trigger: 'Retrieved context fragments not validated for relevance or freshness.', evidence: 'Unvalidated retrieval.', fp: 'Curated sources.', floor: 'medium' },
  'L40-07': { name: 'token budget absence', sub: 'token budget enforcement', trigger: 'Context assembly lacks defined token budget or length limit.', evidence: 'Unbounded assembly.', fp: 'Local models.', floor: 'high' },
  'L40-08': { name: 'context conflict undetected', sub: 'conflict detection', trigger: 'Conflicting context fragments injected without detection or resolution.', evidence: 'Undetected conflict.', fp: 'Consistent sources.', floor: 'high' },
  'L40-09': { name: 'context truncation strategy missing', sub: 'context truncation', trigger: 'No strategy for truncating context when limits are reached.', evidence: 'Hard cut-off.', fp: 'Small contexts.', floor: 'high' },
  'L40-10': { name: 'decision lock hierarchy missing', sub: 'decision lock hierarchy', trigger: 'No precedence rules for conflicting context updates.', evidence: 'Unresolved conflict.', fp: 'Append-only logs.', floor: 'high' },

  // LAYER 41: Reasoning Integrity
  'L41-01': { name: 'evidence binding gap', sub: 'evidence binding', trigger: 'Reasoning conclusion not linked to supporting evidence.', evidence: 'Unbound conclusion.', fp: 'Obvious inferences.', floor: 'high' },
  'L41-02': { name: 'uncertainty propagation failure', sub: 'uncertainty propagation', trigger: 'Uncertainty not propagated through multi-step reasoning chain.', evidence: 'False certainty.', fp: 'Deterministic steps.', floor: 'high' },
  'L41-03': { name: 'reasoning trace unenforceable', sub: 'reasoning trace enforceability', trigger: 'Reasoning trace refers to unverifiable or private sources.', evidence: 'Private source.', fp: 'Public references.', floor: 'medium' },
  'L41-04': { name: 'multi-step reasoning gap', sub: 'multi-step reasoning validation', trigger: 'Multi-step reasoning chain has a missing or unvalidated link.', evidence: 'Broken chain.', fp: 'Single-step logic.', floor: 'high' },
  'L41-05': { name: 'global contradiction undetected', sub: 'global contradiction detection', trigger: 'Two conclusions across sections contradict without detection.', evidence: 'Hidden contradiction.', fp: 'Independent sections.', floor: 'high' },
  'L41-06': { name: 'self-correction loop unbounded', sub: 'self-correction loop boundedness', trigger: 'Self-correction retries have no max iteration limit.', evidence: 'Infinite retries.', fp: 'Bounded loops.', floor: 'high' },
  'L41-07': { name: 'reasoning trace incomplete', sub: 'reasoning trace completeness', trigger: 'Key reasoning steps omitted from the trace.', evidence: 'Incomplete trace.', fp: 'Summary traces.', floor: 'medium' },
  'L41-08': { name: 'uncertainty not quantified', sub: 'uncertainty propagation failure', trigger: 'Uncertainty acknowledged but not quantified or bounded.', evidence: 'Vague uncertainty.', fp: 'Binary outcomes.', floor: 'medium' },

  // LAYER 42: UI Surface Contract
  'L42-01': { name: 'mandatory UI component missing', sub: 'mandatory UI component existence', trigger: 'Required UI component for a system function not specified.', evidence: 'Missing component.', fp: 'CLI-only systems.', floor: 'high' },
  'L42-02': { name: 'UI interactivity gap', sub: 'UI interactivity enforcement', trigger: 'Interactive element lacks defined behavior or response contract.', evidence: 'Undefined interaction.', fp: 'Display-only elements.', floor: 'medium' },
  'L42-03': { name: 'UI system state mismatch', sub: 'UI-to-system-state mapping', trigger: 'UI state does not reflect the actual system state.', evidence: 'State mismatch.', fp: 'Async state sync.', floor: 'high' },
  'L42-04': { name: 'fatal state exposed in UI', sub: 'no fatal state exposure', trigger: 'UI displays or allows interaction with a fatal error state.', evidence: 'Fatal exposure.', fp: 'Error dialogs.', floor: 'critical' },
  'L42-05': { name: 'component state machine invalid', sub: 'component state-machine correctness', trigger: 'UI component can reach impossible or undefined visual states.', evidence: 'Invalid state.', fp: 'Loading states.', floor: 'medium' },
  'L42-06': { name: 'UI accessibility contract violation', sub: 'UI accessibility contract', trigger: 'UI surface lacks required accessibility attributes or alternatives.', evidence: 'A11y gap.', fp: 'Internal tools.', floor: 'medium' },
  'L42-07': { name: 'UI layout contract violation', sub: 'UI layout contract', trigger: 'Layout breaks or hides critical information at standard viewport sizes.', evidence: 'Layout failure.', fp: 'Responsive design.', floor: 'medium' },
  'L42-08': { name: 'UI feedback contract missing', sub: 'mandatory UI component existence', trigger: 'Action completes without user-visible confirmation or error feedback.', evidence: 'Silent action.', fp: 'Instant operations.', floor: 'medium' },

  // LAYER 43: Deterministic Execution
  'L43-01': { name: 'transition determinism violation', sub: 'transition determinism', trigger: 'State transition outcome varies between identical runs.', evidence: 'Non-deterministic outcome.', fp: 'Random-seeded systems.', floor: 'critical' },
  'L43-02': { name: 'concurrency model undefined', sub: 'concurrency model definition', trigger: 'System handles concurrent operations without defined model.', evidence: 'Implicit concurrency.', fp: 'Single-threaded.', floor: 'high' },
  'L43-03': { name: 'deadlock risk', sub: 'deadlock / livelock prevention', trigger: 'Two operations wait on each other indefinitely.', evidence: 'Circular wait.', fp: 'Lock-free design.', floor: 'critical' },
  'L43-04': { name: 'scheduling non-determinism', sub: 'scheduling determinism', trigger: 'Task execution order varies without explicit scheduling rules.', evidence: 'Variable order.', fp: 'FIFO queues.', floor: 'high' },
  'L43-05': { name: 'retry backoff indeterminism', sub: 'retry and backoff policy', trigger: 'Retry intervals are random without defined backoff strategy.', evidence: 'Random backoff.', fp: 'Fixed intervals.', floor: 'medium' },
  'L43-06': { name: 'deterministic replay impossible', sub: 'deterministic replay capability', trigger: 'System state cannot be replayed from a recorded sequence.', evidence: 'No replay path.', fp: 'Stateless systems.', floor: 'high' },
  'L43-07': { name: 'timing dependency risk', sub: 'timing dependency', trigger: 'Correctness depends on specific timing or ordering without guarantees.', evidence: 'Race condition.', fp: 'Synchronous ops.', floor: 'high' },
  'L43-08': { name: 'resource ordering gap', sub: 'resource ordering', trigger: 'Multiple resources acquired without defined ordering, risking deadlock.', evidence: 'Unordered locks.', fp: 'Single resource.', floor: 'high' },

  // LAYER 44: Control Plane Authority
  'L44-01': { name: 'control plane separation violation', sub: 'control-plane separation', trigger: 'UI or data-plane directly modifies control-plane configuration.', evidence: 'Direct modification.', fp: 'Admin interfaces.', floor: 'critical' },
  'L44-02': { name: 'authority delegation gap', sub: 'authority delegation rules', trigger: 'Authority delegated without defined scope or revocation rules.', evidence: 'Vague delegation.', fp: 'Fixed roles.', floor: 'high' },
  'L44-03': { name: 'override condition ambiguity', sub: 'override conditions', trigger: 'Override conditions described without clear triggers or limits.', evidence: 'Vague override.', fp: 'Emergency-only overrides.', floor: 'high' },
  'L44-04': { name: 'execution owner undefined', sub: 'execution owner boundary', trigger: 'No clear owner defined for execution decisions.', evidence: 'Ownership gap.', fp: 'Single-owner system.', floor: 'high' },
  'L44-05': { name: 'policy enforcement gap', sub: 'policy enforcement points', trigger: 'Policy stated but no enforcement mechanism defined.', evidence: 'Unenforced policy.', fp: 'Self-enforcing policies.', floor: 'high' },
  'L44-06': { name: 'control data plane mixing', sub: 'control-plane separation', trigger: 'Control and data plane logic interleaved without isolation.', evidence: 'Mixed concerns.', fp: 'Simple systems.', floor: 'high' },
  'L44-07': { name: 'escalation path undefined', sub: 'escalation path', trigger: 'No defined escalation path for authority conflicts.', evidence: 'Missing escalation.', fp: 'Flat hierarchy.', floor: 'medium' },
  'L44-08': { name: 'audit trail requirement missing', sub: 'audit trail requirements', trigger: 'Control plane changes not logged with actor, reason, and timestamp.', evidence: 'No audit log.', fp: 'Immutable configs.', floor: 'high' },

  // LAYER 45: World State Governance
  'L45-01': { name: 'state mutation invariant gap', sub: 'state mutation invariants', trigger: 'State mutations lack defined invariants that must hold.', evidence: 'Missing invariant.', fp: 'Immutable state.', floor: 'high' },
  'L45-02': { name: 'mutation gateway bypass', sub: 'mutation gateway exclusivity', trigger: 'State modified without going through the defined mutation gateway.', evidence: 'Direct mutation.', fp: 'Internal state.', floor: 'critical' },
  'L45-03': { name: 'commit hash binding missing', sub: 'commit_hash binding', trigger: 'State changes not bound to verifiable commit hashes.', evidence: 'Unbound change.', fp: 'Ephemeral state.', floor: 'high' },
  'L45-04': { name: 'read write atomicity gap', sub: 'read/write atomicity', trigger: 'State reads and writes not atomic, allowing partial reads.', evidence: 'Partial read.', fp: 'Single-writer.', floor: 'high' },
  'L45-05': { name: 'graph consistency violation', sub: 'graph consistency / acyclicity', trigger: 'State graph develops cycles or inconsistencies.', evidence: 'Graph cycle.', fp: 'Tree structures.', floor: 'high' },
  'L45-06': { name: 'direct state write bypass', sub: 'state isolation', trigger: 'State written directly without isolation from other subsystems.', evidence: 'Unisolated write.', fp: 'Sandboxed state.', floor: 'critical' },
  'L45-07': { name: 'state read write race', sub: 'temporal state consistency', trigger: 'Concurrent read and write operations on shared state without synchronization.', evidence: 'Race condition.', fp: 'Serialized access.', floor: 'high' },
  'L45-08': { name: 'state isolation breach', sub: 'state isolation', trigger: 'One subsystem can read or write another subsystem private state.', evidence: 'Cross-subsystem leak.', fp: 'Public state only.', floor: 'critical' }
};

/**
 * Enhanced Detector Map (Final 383)
 */
export const DETECTOR_METADATA = {};

// Process raw metadata into full objects
Object.entries(rawMetadata).forEach(([id, meta]) => {
  const layerId = id.split('-')[0].replace('L', '');
  const layerSlug = Object.keys(LAYER_SUBCATEGORIES)[parseInt(layerId) - 1];
  
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
    related_layers: meta.related_layers || []
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
  if (val === undefined) val = 1; // Default to medium if unknown

  const floor = severityOrder[meta.severity_floor?.toLowerCase()] || 0;
  if (val < floor) return meta.severity_floor;

  if (meta.severity_ceiling) {
    const ceiling = severityOrder[meta.severity_ceiling?.toLowerCase()];
    if (val > ceiling) return meta.severity_ceiling;
  }

  return severity;
}

/**
 * Enriches an issue with metadata based on its detector_id.
 * Backfills missing fields and normalizes severity.
 */
export function normalizeIssueFromDetector(issue, diagnostics = null) {
  if (!issue) return issue;
  
  const originalDetectorId = issue.detector_id;
  const parsedId = parseDetectorId(issue.description);
  const detectorId = originalDetectorId || parsedId;
  
  const meta = getDetectorMetadata(detectorId);
  
  if (diagnostics) {
    if (parsedId && !originalDetectorId) {
      diagnostics.detector_id_parsed_from_description_count++;
    }
    if (detectorId && !meta) {
      diagnostics.unknown_detector_id_count++;
    }
  }

  if (!meta) {
    if (diagnostics && !issue.category && !issue.subcategory) {
      diagnostics.missing_taxonomy_after_normalization_count++;
    }
    return issue;
  }

  const enriched = { ...issue };
  let normalizedCounted = false;
  
  // 1. Backfill detector_id if it was only in description
  if (!enriched.detector_id && detectorId) {
    enriched.detector_id = detectorId;
    normalizedCounted = true;
  }

  // 2. Backfill missing fields from metadata
  if (!enriched.detector_name) {
    enriched.detector_name = meta.name;
    normalizedCounted = true;
  }
  if (!enriched.subcategory) {
    enriched.subcategory = meta.subcategory;
    normalizedCounted = true;
  }
  if (!enriched.layer) {
    enriched.layer = meta.layer;
    normalizedCounted = true;
  }
  if (!enriched.category) {
    enriched.category = meta.layer;
    normalizedCounted = true;
  }

  if (diagnostics && normalizedCounted) {
    diagnostics.normalized_from_detector_count++;
  }

  // 3. Normalize severity based on metadata bounds
  const originalSeverity = enriched.severity;
  enriched.severity = normalizeSeverityForDetector(detectorId, enriched.severity);
  
  if (diagnostics && enriched.severity !== originalSeverity) {
    diagnostics.severity_clamped_count++;
  }

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
  let prompt = `--- DETECTOR CATALOG (383 DETECTORS) ---\n\n`;
  
  for (const [layerSlug, subcats] of Object.entries(LAYER_SUBCATEGORIES)) {
    const layerIdx = Object.keys(LAYER_SUBCATEGORIES).indexOf(layerSlug) + 1;
    prompt += `LAYER ${layerIdx} [${layerSlug}]\n`;
    
    // Get detectors for this layer
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

// Legacy compatibility
export function getSubcategoryPrompt() {
  return buildDetectorPrompt();
}

/**
 * Shapes data for JSON export, including taxonomy diagnostics.
 */
export function buildExportData(results, taxonomyDiagnostics) {
  if (!results) return null;
  return {
    ...results,
    taxonomyDiagnostics
  };
}

/**
 * Shapes data for session saving.
 */
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

/**
 * Decides which cache to use and whether migration is needed.
 * Returns { cache, shouldMigrate }.
 */
export function resolveInitialCache(fileCache, legacyCacheString) {
  // 1. If file cache is present and non-empty, it takes precedence
  if (fileCache && Object.keys(fileCache).length > 0) {
    return { cache: fileCache, shouldMigrate: false };
  }

  // 2. If file cache is empty/missing, attempt to migrate from legacy localStorage
  if (legacyCacheString) {
    try {
      const parsed = JSON.parse(legacyCacheString);
      if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
        return { cache: parsed, shouldMigrate: true };
      }
    } catch (e) {
      // Malformed legacy data is ignored
    }
  }

  // 3. Fallback to empty state
  return { cache: {}, shouldMigrate: false };
}

/**
 * Normalizes text for stable identity comparison.
 */
export const normalizeIdentityText = (text) => (text || '')
  .replace(/\s+/g, ' ')
  .trim()
  .toLowerCase();

/**
 * Lightweight string hashing for stable keys.
 */
export const hashDescription = (text) => {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
};

/**
 * Generates a stable identity key for an issue.
 */
export const getIssueIdentity = (issue) => {
  // Create unique key from detector ID, primary file, section, and line number
  // If line_number is missing, use a stable description+evidence fingerprint as fallback
  const detectorMatch = issue.description?.match(/\[L(\d+)-(\d+)\]/);
  const detectorId = issue.detector_id || (detectorMatch ? `L${detectorMatch[1]}-${detectorMatch[2]}` : 'unknown');
  const primaryFile = issue.files?.[0] || 'unknown';
  const section = issue.section || 'no-section';
  
  if (issue.line_number) {
    return `${detectorId}::${primaryFile}::${section}::${issue.line_number}`;
  }
  
  // Stable fingerprint fallback
  const description = normalizeIdentityText(issue.description);
  const evidenceSnippet = normalizeIdentityText(issue.evidence).slice(0, 240);
  const fingerprintSource = evidenceSnippet
    ? `${description}::${evidenceSnippet}`
    : description;

  return `${detectorId}::${primaryFile}::${section}::fp:${hashDescription(fingerprintSource)}`;
};

/**
 * Compares two audit result sets and returns a diff summary.
 */
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
  
  // New and changed
  currIssuesMap.forEach((issue, id) => {
    if (!prevIssuesMap.has(id)) {
      newIssues.push({ ...issue, diffStatus: 'new' });
    } else {
      const prev = prevIssuesMap.get(id);
      if (issue.severity !== prev.severity) {
        changedSeverity.push({ ...issue, diffStatus: 'changed', prevSeverity: prev.severity });
      } else {
        unchanged.push({ ...issue, diffStatus: 'unchanged' });
      }
    }
  });
  
  // Resolved
  prevIssuesMap.forEach((issue, id) => {
    if (!currIssuesMap.has(id)) {
      resolvedIssues.push({ ...issue, diffStatus: 'resolved' });
    }
  });
  
  return {
    new: newIssues,
    resolved: resolvedIssues,
    changed: changedSeverity,
    unchanged,
    totalNew: newIssues.length,
    totalResolved: resolvedIssues.length,
    totalChanged: changedSeverity.length
  };
};

/**
 * Normalizes a loaded session by applying taxonomy backfilling and calculating diagnostics.
 */
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

  // Update session diagnostics based on load normalization
  normalized.taxonomyDiagnostics = diagnostics;
  
  return normalized;
}

/**
 * Builds a lightweight metadata object for the history index.
 */
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

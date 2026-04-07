import {
  buildIssueDocumentAnchor,
  normalizeComparableText,
  normalizeEvidenceSpans
} from '../markdownIndex.js';

const WORKFLOW_HEADING_PATTERN = /\b(flow|workflow|steps|process|pipeline|sequence|lifecycle|procedure)\b/i;
const GLOSSARY_HEADING_PATTERN = /\b(glossary|terminology|definitions|terms|symbols|terminology registry|vocabulary)\b/i;
const ROLLBACK_PATTERN = /\b(rollback|revert|undo|restore|recover|backout)\b/i;
const ACTION_PATTERN = /\b(apply|commit|delete|deploy|execute|export|migrate|mutate|release|remove|write)\b/i;
const TERMINAL_PATTERN = /\b(abort|aborted|complete|completed|deployed|done|failed|failure|finished|ready|stable|success|successful)\b/i;
const TERMINAL_STATE_TOKEN_PATTERN = /^(ABORT|ABORTED|CANCELLED|CLOSED|COMPLETE|COMPLETED|DONE|FAILED|FAILURE|FINISHED|READY|REJECTED|SUCCESS|SUCCESSFUL|TERMINATED)$/i;
const RFC_KEYWORD_PATTERN = /\b(MUST|SHALL|REQUIRED|SHOULD|RECOMMENDED|MAY|OPTIONAL)\b/g;
const RFC_LOWERCASE_PATTERN = /\b(must|shall|required|should|recommended|may|optional)\b/g;
const MARKDOWN_LINK_PATTERN = /\[([^\]]+)\]\(([^)]+)\)/g;
const API_RESPONSE_PATTERN = /\b(response|responses|return|returns|returned|result|results|output|outputs|status(?:\s+codes?)?|20[0-9]|schema)\b/i;
const API_ERROR_PATTERN = /\b(error|errors|4\d\d|5\d\d|bad request|unauthorized|forbidden|not found|conflict|unprocessable|timeout|failure|failed)\b/i;
const API_INPUT_PATTERN = /\b(request|input|inputs|payload|body|parameter|parameters|query|header|headers|path parameter|path params?)\b/i;
const API_OUTPUT_PATTERN = /\b(response|responses|return|returns|returned|result|results|output|outputs|status(?:\s+codes?)?|20[0-9])\b/i;
const API_RATE_LIMIT_PATTERN = /\b(rate[- ]?limit|quota|throttle|throttling|requests per|rpm|rps)\b/i;
const API_RATE_LIMIT_CONCRETE_PATTERN = /\b\d+\s*(?:req(?:uests?)?|calls?|rpm|rps)\b|\b\d+\s*(?:per )?(?:sec(?:ond)?s?|min(?:ute)?s?|hour|hours|day|days)\b|\bper (?:second|minute|hour|day)\b/i;
const API_AUTH_MENTION_PATTERN = /\b(auth|authenticate|authentication|authorize|authorization|permissions?|secure|security)\b/i;
const API_AUTH_MECHANISM_PATTERN = /\bAuthorization\b|\bBearer\b|\bOAuth\b|\bJWT\b|\bAPI[- ]?Key\b|\btoken\b|\bbasic auth\b|\bmTLS\b|\bcookie\b|\bsession\b/i;
const API_RETRY_PATTERN = /\b(retry|retries|retryable|resend|replayed|duplicate request|at[- ]least[- ]once)\b/i;
const API_IDEMPOTENCY_PATTERN = /\b(idempotent|idempotency|idempotency[- ]key|dedup(?:lication)?|safe to retry)\b/i;
const UPPERCASE_DEFINITION_PATTERN = /^\s*([A-Z][A-Z0-9_]{1,31})\s*[:\-]\s+(.+)$/;
const GOVERNANCE_CHECKPOINT_PATTERN = /\b(approve|approval|review(?:ed)?|verify|verification|validate|validation|sign[- ]?off|checkpoint|gate|gating|governance|policy check)\b/i;
const AUDIT_TRAIL_PATTERN = /\b(audit trail|audit log|receipt|receipts|record(?:ed|ing)?|journal|trace(?:ability)?|logged?|log entry|commit[- ]?hash|revision id|change id)\b/i;
const GOVERNANCE_BYPASS_PATTERN = /\b(bypass|skip approval|without approval|approval-free|break[- ]?glass|emergency override|force(?:d)? apply|direct write|override)\b/i;
const OWNER_BOUNDARY_PATTERN = /\b(owner|owned by|responsible|responsibility|authority|authorized by|executed by|gatekeeper|controller|custodian)\b/i;
const OVERRIDE_GUARD_PATTERN = /\b(only if|when\b|under\b|approved by|expires?|time[- ]?bound|temporary|justification|ticket|audit trail|logged?|receipt|rollback|revert)\b/i;
const COMMIT_HASH_PATTERN = /\b(commit[_ -]?hash|commit sha|sha[- ]?(?:1|256)|revision id|change id|artifact digest|build hash|version pin)\b/i;
const PRECONDITION_PATTERN = /\b(only if|if\b|when\b|before\b|precondition|requires?|guard(?:ed)? by|must be in)\b/i;
const POSTCONDITION_PATTERN = /\b(after\b|then\b|results? in|ensures?|postcondition|becomes?|sets?\b|produces?|emits?|persists?)\b/i;
const BACKOFF_POLICY_PATTERN = /\b(backoff|delay|wait(?:ing)?|jitter|cooldown|max retries|retry budget|retry limit|exponential)\b/i;
const REPLAY_REQUIREMENT_PATTERN = /\b(replay|deterministic replay|reproduce|re-run|rerun|receipt|event log|journal|idempotency|idempotent)\b/i;
const DEPENDENCY_LIFECYCLE_PATTERN = /\b(setup|install|provision|initialize|update|upgrade|version|rollback|remove|deprecate|retire|cleanup|teardown|lifecycle)\b/i;
const OPTIONAL_DEPENDENCY_PATTERN = /\b(optional|optionally|may skip|can skip|if available|when available|best effort|nice to have)\b/i;
const REQUIRED_DEPENDENCY_PATTERN = /\b(required|required for|must|mandatory|blocking|blocked by|depends on|prerequisite)\b/i;
const COMPLIANCE_GATE_PATTERN = /\b(compliance|regulatory|policy|control|audit|sox|soc ?2|gdpr|hipaa|iso|pci)\b/i;
const PARALLEL_EXECUTION_PATTERN = /\b(parallel|concurrent|simultaneous|in parallel)\b/i;
const RESOURCE_ORDERING_PATTERN = /\b(ordered|serialize|serialized|queue|queued|lock|mutex|one at a time|exclusive|resource order|sequentially)\b/i;
const EXECUTION_NON_DETERMINISM_PATTERN = /\b(any order|whichever|random(?:ly)?|best effort|as available|eventual(?:ly)?|first available|opportunistic|non-deterministic)\b/i;
const VAGUE_REQUIREMENT_PATTERN = /\b(appropriate(?:ly)?|fast enough|quickly|soon|as needed|where possible|if necessary|normal(?:ly)?|reasonable|minimal|minimize|optimi[sz]e|efficient(?:ly)?|robust|seamless|intuitive|user-friendly)\b/i;
const OBJECTIVE_HEADING_PATTERN = /\b(goal|goals|objective|objectives|intent|purpose|outcome|outcomes|user intent|mission)\b/i;
const OBJECTIVE_VAGUE_PATTERN = /\b(improve|better|simple|simplify|easier|streamline|frictionless|smooth|quick(?:ly)?|faster|intuitive|user-friendly)\b/i;
const CHANGE_SCOPE_HEADING_PATTERN = /\b(scope|change|changes|migration|migrate|rollout|update|updates|modification|modify|refactor|impact|affected)\b/i;
const CHANGE_ACTION_PATTERN = /\b(change|changes|update|updates|modify|modification|migration|migrate|rollout|refactor|replace|remove|add|introduce|touch(?:es|ing)?|affects?)\b/i;
const SCOPE_BOUNDARY_PATTERN = /\b(in scope|out of scope|not in scope|non-goals?|does not change|will not change|limited to|only affects|only changes|scope boundary|modification boundary|excluded|unchanged)\b/i;
const UI_COMPONENT_PATTERN = /\b(button|form|input|dialog|modal|table|list|panel|screen|page|view|banner|toast|dropdown|checkbox|toggle|wizard|stepper|dashboard)\b/i;
const UI_STATE_PATTERN = /\b(state|status|loading|loaded|success|error|disabled|enabled|empty|selected|active|pending|failed|complete(?:d)?)\b/i;
const ACTOR_ROLE_PATTERN = /\b(User|Users|System|Operator|Admin|Client|Server|Host|Runtime|Agent|Agents)\b/g;
const TASK_GRAPH_HEADING_PATTERN = /\b(task(?:s| graph)?|dependency|dependencies|dag|graph|execution graph|plan|priority)\b/i;
const TASK_DEPENDENCY_HINT_PATTERN = /\b(depends on|after|requires|blocked by|waits for|following|prerequisite|predecessor)\b/i;
const TASK_DEPENDENCY_REFERENCE_PATTERN = /\b(?:depends on|after|requires|blocked by|waits for|following|after completion of|prerequisite(?: is)?|predecessor(?: is)?)\s+(?:step|task)?\s*(\d+)\b/gi;
const TRANSITION_CONDITION_PATTERN = /\b(if|when|on|unless|after|before|only if|guard|condition|trigger(?:ed)? by)\b/i;
const AUTO_INTERACTION_PATTERN = /\b(automatic(?:ally)?|auto[- ]?(?:apply|approve|submit|progress|advance)|self[- ]?serve|without user intervention|no user action|zero-click|hands[- ]?free|approval-free)\b/i;
const MANUAL_INTERACTION_PATTERN = /\b(user must|operator must|click|confirm|approve|approval|review|manual(?:ly)?|select|choose|submit|fill out|enter|sign[- ]?off)\b/i;
const NO_APPROVAL_PATTERN = /\b(no approval|without approval|approval-free)\b/i;
const DEPENDENCY_HEADING_PATTERN = /\b(dependency|dependencies|package|packages|module|modules|library|libraries|versions?)\b/i;
const FLOATING_VERSION_PATTERN = /\b(latest|stable|current|newest)\b/i;
const VERSION_TOKEN_PATTERN = /\bv?\d+\.\d+(?:\.\d+){0,2}\b/ig;
const EXPLICIT_VERSION_PATTERN = /\bv?\d+\.\d+(?:\.\d+){0,2}\b/i;
const VERSIONED_DEPENDENCY_REFERENCE_PATTERN = /\b([A-Za-z][A-Za-z0-9_.-]{2,63})\b[^\n]{0,40}?\b(v?\d+\.\d+(?:\.\d+){0,2}|latest|stable|current)\b/gi;
const POLICY_PRIORITY_PATTERN = /\b(priority|precedence|takes precedence|higher priority|lower priority|wins|winner|policy order|override order)\b/i;
const POLICY_CONFLICT_PATTERN = /\b(conflict|conflicts|override|overrides|except|unless|emergency|break[- ]?glass|manual override|bypass)\b/i;
const ENFORCEMENT_PATH_PATTERN = /\b(enforce|enforced|enforcement|validator|validate|validation|policy engine|gatekeeper|reject(?:ed|s)?|deny|denied|block(?:ed|ing)?|admission|guardrail)\b/i;
const CONTROL_PLANE_PATTERN = /\b(control plane|authority|decision|policy enforcement|gatekeeper|override)\b/i;
const DELEGATION_PATTERN = /\b(delegate|delegated|delegation|handoff|hand off|assigned authority|may decide|may approve|may reject|decision by|delegates to)\b/i;
const EXECUTION_TRIGGER_PATTERN = /\b(trigger(?:ed)? by|invoked by|requested by|starts? when|begins? when|upon\b|when\b|if\b|after\b)\b/i;
const DEADLOCK_RISK_PATTERN = /\b(lock|mutex|lease|semaphore|waits? for|blocked by|exclusive)\b/i;
const DEADLOCK_MITIGATION_PATTERN = /\b(timeout|backoff|ordered|resource order|try[- ]?lock|lease expiry|deadlock|livelock|circuit breaker)\b/i;
const OUTPUT_SURFACE_PATTERN = /\b(output|outputs|result|results|report|reports|events|records|items)\b/i;
const OUTPUT_ORDERING_PATTERN = /\b(sorted|stable order|canonical(?:ized)?|deterministic output|ordered output|same output|consistent ordering)\b/i;
const FAIL_SAFE_PATTERN = /\b(fail[- ]?safe|failsafe|abort|rollback|revert|stop the run|halt execution|kill switch|circuit breaker|safe mode)\b/i;
const BRANCH_FALLBACK_PATTERN = /\b(else|otherwise|fallback|default|if not|when not|on failure|fail(?:ed)? path|error path)\b/i;
const STATE_PRESERVATION_PATTERN = /\b(persist|preserve|restore|resume|checkpoint|snapshot|retain(?:ed)? state|carry forward|reconstruct state)\b/i;
const STATE_CONTEXT_PATTERN = /\b(state|session|context|snapshot|cursor|offset|checkpoint|world state|memory)\b/i;
const DECISION_PATTERN = /\b(decide|decision|approve|reject|allow|deny|permit|block|authorize|escalate)\b/i;
const EXPLICIT_DECISION_OWNER_PATTERN = /\b(decided by|decision by|approved by|authorized by|owned by|owner|operator|admin|controller|gatekeeper|authority)\b/i;
const CONFLICTING_TRIGGER_PAIR_PATTERN = /\b(automatic(?:ally)?|system(?:-|\s)?triggered|on schedule|on startup)\b[\s\S]{0,240}\b(manual(?:ly)?|user(?:-|\s)?triggered|operator(?:-|\s)?triggered|on request)\b|\b(manual(?:ly)?|user(?:-|\s)?triggered|operator(?:-|\s)?triggered|on request)\b[\s\S]{0,240}\b(automatic(?:ally)?|system(?:-|\s)?triggered|on schedule|on startup)\b/i;

export const DETERMINISTIC_RULE_DEFINITIONS = [
  {
    id: 'broken_heading_hierarchy_rule',
    detectorId: 'L3-01',
    layer: 'structural',
    subcategory: 'broken hierarchy',
    stage: 'indexing',
    owningAgent: 'cross_layer_synthesis_agent'
  },
  {
    id: 'orphan_section_rule',
    detectorId: 'L3-02',
    layer: 'structural',
    subcategory: 'orphan sections',
    stage: 'indexing',
    owningAgent: 'cross_layer_synthesis_agent'
  },
  {
    id: 'duplicate_heading_rule',
    detectorId: 'L3-03',
    layer: 'structural',
    subcategory: 'duplicate sections',
    stage: 'indexing',
    owningAgent: 'cross_layer_synthesis_agent'
  },
  {
    id: 'broken_cross_reference_rule',
    detectorId: 'L13-05',
    layer: 'knowledge_graph',
    subcategory: 'relationship gaps',
    stage: 'project_graph',
    owningAgent: 'memory_world_state_agent'
  },
  {
    id: 'rfc2119_keyword_rule',
    detectorId: 'L15-11',
    layer: 'requirement',
    subcategory: 'RFC2119 misuse',
    stage: 'rule_engine',
    owningAgent: 'spec_absoluteness_agent'
  },
  {
    id: 'duplicated_requirement_rule',
    detectorId: 'L15-06',
    layer: 'requirement',
    subcategory: 'ambiguous acceptance criteria',
    stage: 'project_graph',
    owningAgent: 'spec_absoluteness_agent'
  },
  {
    id: 'requirement_conflict_resolution_rule',
    detectorId: 'L15-21',
    layer: 'requirement',
    subcategory: 'requirement conflict resolution',
    stage: 'project_graph',
    owningAgent: 'spec_absoluteness_agent'
  },
  {
    id: 'missing_terminal_state_rule',
    detectorId: 'L16-04',
    layer: 'state_machine',
    subcategory: 'missing terminal states',
    stage: 'project_graph',
    owningAgent: 'execution_simulation_agent'
  },
  {
    id: 'missing_rollback_rule',
    detectorId: 'L9-09',
    layer: 'completeness',
    subcategory: 'missing rollback',
    stage: 'workflow_rules',
    owningAgent: 'execution_simulation_agent'
  },
  {
    id: 'workflow_ordering_rule',
    detectorId: 'L47-01',
    layer: 'workflow_lifecycle_integrity',
    subcategory: 'required step ordering',
    stage: 'workflow_rules',
    owningAgent: 'execution_simulation_agent'
  },
  {
    id: 'workflow_exit_rule',
    detectorId: 'L47-08',
    layer: 'workflow_lifecycle_integrity',
    subcategory: 'workflow exit criteria',
    stage: 'workflow_rules',
    owningAgent: 'execution_simulation_agent'
  },
  {
    id: 'undefined_identifier_rule',
    detectorId: 'L46-06',
    layer: 'ontology_vocabulary_governance',
    subcategory: 'undefined term rejection',
    stage: 'project_graph',
    owningAgent: 'spec_absoluteness_agent'
  },
  {
    id: 'glossary_binding_rule',
    detectorId: 'L46-07',
    layer: 'ontology_vocabulary_governance',
    subcategory: 'vocabulary-to-contract mapping',
    stage: 'project_graph',
    owningAgent: 'spec_absoluteness_agent'
  },
  {
    id: 'api_return_schema_rule',
    detectorId: 'L17-03',
    layer: 'api_contract',
    subcategory: 'schema mismatch',
    stage: 'api_contract_rules',
    owningAgent: 'tool_deployment_agent'
  },
  {
    id: 'api_error_contract_rule',
    detectorId: 'L17-04',
    layer: 'api_contract',
    subcategory: 'error-contract omissions',
    stage: 'api_contract_rules',
    owningAgent: 'tool_deployment_agent'
  },
  {
    id: 'api_idempotency_rule',
    detectorId: 'L17-09',
    layer: 'api_contract',
    subcategory: 'idempotency gaps',
    stage: 'api_contract_rules',
    owningAgent: 'tool_deployment_agent'
  },
  {
    id: 'api_rate_limit_rule',
    detectorId: 'L17-11',
    layer: 'api_contract',
    subcategory: 'rate-limit ambiguity',
    stage: 'api_contract_rules',
    owningAgent: 'tool_deployment_agent'
  },
  {
    id: 'api_auth_ambiguity_rule',
    detectorId: 'L17-12',
    layer: 'api_contract',
    subcategory: 'auth ambiguity',
    stage: 'api_contract_rules',
    owningAgent: 'tool_deployment_agent'
  },
  {
    id: 'terminology_registry_gap_rule',
    detectorId: 'L33-06',
    layer: 'specification_formalism',
    subcategory: 'terminology registry',
    stage: 'formalism_rules',
    owningAgent: 'spec_absoluteness_agent'
  },
  {
    id: 'state_space_definition_rule',
    detectorId: 'L33-03',
    layer: 'specification_formalism',
    subcategory: 'state-space definition',
    stage: 'formalism_rules',
    owningAgent: 'spec_absoluteness_agent'
  },
  {
    id: 'symbol_consistency_rule',
    detectorId: 'L33-08',
    layer: 'specification_formalism',
    subcategory: 'symbol consistency',
    stage: 'formalism_rules',
    owningAgent: 'spec_absoluteness_agent'
  },
  {
    id: 'formal_terminology_registry_rule',
    detectorId: 'L33-14',
    layer: 'specification_formalism',
    subcategory: 'formal terminology registry enforcement',
    stage: 'formalism_rules',
    owningAgent: 'spec_absoluteness_agent'
  },
  {
    id: 'io_contract_determinism_rule',
    detectorId: 'L33-15',
    layer: 'specification_formalism',
    subcategory: 'input/output contract determinism',
    stage: 'formalism_rules',
    owningAgent: 'spec_absoluteness_agent'
  },
  {
    id: 'ambiguous_requirement_wording_rule',
    detectorId: 'L4-01',
    layer: 'semantic',
    subcategory: 'semantic ambiguity',
    stage: 'interaction_rules',
    owningAgent: 'spec_absoluteness_agent'
  },
  {
    id: 'governance_checkpoint_rule',
    detectorId: 'L29-18',
    layer: 'governance',
    subcategory: 'governance checkpoint gaps',
    stage: 'governance_rules',
    owningAgent: 'architecture_authority_agent'
  },
  {
    id: 'governance_bypass_rule',
    detectorId: 'L29-15',
    layer: 'governance',
    subcategory: 'governance bypass path',
    stage: 'governance_rules',
    owningAgent: 'architecture_authority_agent'
  },
  {
    id: 'audit_trail_requirement_rule',
    detectorId: 'L44-10',
    layer: 'control_plane_authority',
    subcategory: 'audit trail requirements',
    stage: 'governance_rules',
    owningAgent: 'architecture_authority_agent'
  },
  {
    id: 'control_plane_override_condition_rule',
    detectorId: 'L44-12',
    layer: 'control_plane_authority',
    subcategory: 'control-plane override conditions',
    stage: 'governance_rules',
    owningAgent: 'architecture_authority_agent'
  },
  {
    id: 'execution_owner_boundary_rule',
    detectorId: 'L44-13',
    layer: 'control_plane_authority',
    subcategory: 'execution owner boundary clarity',
    stage: 'governance_rules',
    owningAgent: 'architecture_authority_agent'
  },
  {
    id: 'authority_delegation_ambiguity_rule',
    detectorId: 'L44-02',
    layer: 'control_plane_authority',
    subcategory: 'authority delegation rules',
    stage: 'governance_rules',
    owningAgent: 'architecture_authority_agent'
  },
  {
    id: 'policy_enforcement_point_gap_rule',
    detectorId: 'L44-05',
    layer: 'control_plane_authority',
    subcategory: 'policy enforcement points',
    stage: 'governance_rules',
    owningAgent: 'architecture_authority_agent'
  },
  {
    id: 'commit_hash_binding_rule',
    detectorId: 'L45-03',
    layer: 'world_state_governance',
    subcategory: 'commit_hash binding',
    stage: 'world_state_rules',
    owningAgent: 'memory_world_state_agent'
  },
  {
    id: 'state_transition_precondition_rule',
    detectorId: 'L45-15',
    layer: 'world_state_governance',
    subcategory: 'state mutation invariants detail',
    stage: 'world_state_rules',
    owningAgent: 'memory_world_state_agent'
  },
  {
    id: 'state_transition_postcondition_rule',
    detectorId: 'L45-16',
    layer: 'world_state_governance',
    subcategory: 'state mutation invariants detail',
    stage: 'world_state_rules',
    owningAgent: 'memory_world_state_agent'
  },
  {
    id: 'dependency_ownership_rule',
    detectorId: 'L18-13',
    layer: 'dependency_graph',
    subcategory: 'ownership ambiguity',
    stage: 'task_graph_rules',
    owningAgent: 'execution_simulation_agent'
  },
  {
    id: 'dependency_lifecycle_rule',
    detectorId: 'L18-11',
    layer: 'dependency_graph',
    subcategory: 'dependency lifecycle gap',
    stage: 'task_graph_rules',
    owningAgent: 'execution_simulation_agent'
  },
  {
    id: 'dependency_version_ambiguity_rule',
    detectorId: 'L18-08',
    layer: 'dependency_graph',
    subcategory: 'version conflicts',
    stage: 'task_graph_rules',
    owningAgent: 'execution_simulation_agent'
  },
  {
    id: 'transitive_dependency_conflict_rule',
    detectorId: 'L18-06',
    layer: 'dependency_graph',
    subcategory: 'version conflicts',
    stage: 'task_graph_rules',
    owningAgent: 'execution_simulation_agent'
  },
  {
    id: 'task_graph_missing_dependency_rule',
    detectorId: 'L18-03',
    layer: 'dependency_graph',
    subcategory: 'undeclared dependencies',
    stage: 'task_graph_rules',
    owningAgent: 'execution_simulation_agent'
  },
  {
    id: 'task_graph_optional_required_confusion_rule',
    detectorId: 'L18-05',
    layer: 'dependency_graph',
    subcategory: 'undeclared dependencies',
    stage: 'task_graph_rules',
    owningAgent: 'execution_simulation_agent'
  },
  {
    id: 'compliance_gate_omission_rule',
    detectorId: 'L29-16',
    layer: 'governance',
    subcategory: 'checkpoint omissions',
    stage: 'governance_rules',
    owningAgent: 'architecture_authority_agent'
  },
  {
    id: 'policy_priority_conflict_rule',
    detectorId: 'L29-11',
    layer: 'governance',
    subcategory: 'policy-priority conflicts',
    stage: 'governance_rules',
    owningAgent: 'architecture_authority_agent'
  },
  {
    id: 'enforcement_path_gap_rule',
    detectorId: 'L29-17',
    layer: 'governance',
    subcategory: 'enforcement-path gaps',
    stage: 'governance_rules',
    owningAgent: 'architecture_authority_agent'
  },
  {
    id: 'retry_backoff_policy_rule',
    detectorId: 'L43-05',
    layer: 'deterministic_execution',
    subcategory: 'retry and backoff policy',
    stage: 'execution_invariant_rules',
    owningAgent: 'execution_simulation_agent'
  },
  {
    id: 'parallel_resource_order_rule',
    detectorId: 'L43-08',
    layer: 'deterministic_execution',
    subcategory: 'resource ordering',
    stage: 'execution_invariant_rules',
    owningAgent: 'execution_simulation_agent'
  },
  {
    id: 'deadlock_livelock_risk_rule',
    detectorId: 'L43-03',
    layer: 'deterministic_execution',
    subcategory: 'deadlock / livelock prevention',
    stage: 'execution_invariant_rules',
    owningAgent: 'execution_simulation_agent'
  },
  {
    id: 'deterministic_replay_requirements_rule',
    detectorId: 'L43-13',
    layer: 'deterministic_execution',
    subcategory: 'deterministic replay requirements',
    stage: 'execution_invariant_rules',
    owningAgent: 'execution_simulation_agent'
  },
  {
    id: 'execution_determinism_gap_rule',
    detectorId: 'L43-09',
    layer: 'deterministic_execution',
    subcategory: 'scheduling determinism',
    stage: 'execution_invariant_rules',
    owningAgent: 'execution_simulation_agent'
  },
  {
    id: 'output_determinism_gap_rule',
    detectorId: 'L43-12',
    layer: 'deterministic_execution',
    subcategory: 'scheduling non-determinism',
    stage: 'execution_invariant_rules',
    owningAgent: 'execution_simulation_agent'
  },
  {
    id: 'transition_determinism_failure_rule',
    detectorId: 'L43-11',
    layer: 'deterministic_execution',
    subcategory: 'transition determinism',
    stage: 'execution_invariant_rules',
    owningAgent: 'execution_simulation_agent'
  },
  {
    id: 'ui_state_mapping_contract_rule',
    detectorId: 'L42-03',
    layer: 'ui_surface_contract',
    subcategory: 'UI-to-system-state mapping',
    stage: 'interaction_rules',
    owningAgent: 'ui_operational_agent'
  },
  {
    id: 'task_graph_cycle_rule',
    detectorId: 'L18-01',
    layer: 'dependency_graph',
    subcategory: 'circular dependencies',
    stage: 'task_graph_rules',
    owningAgent: 'execution_simulation_agent'
  },
  {
    id: 'task_graph_dependency_order_rule',
    detectorId: 'L18-04',
    layer: 'dependency_graph',
    subcategory: 'undeclared dependencies',
    stage: 'task_graph_rules',
    owningAgent: 'execution_simulation_agent'
  },
  {
    id: 'task_graph_unreachable_node_rule',
    detectorId: 'L20-01',
    layer: 'execution_path',
    subcategory: 'unreachable paths',
    stage: 'task_graph_rules',
    owningAgent: 'execution_simulation_agent'
  },
  {
    id: 'missing_execution_trigger_rule',
    detectorId: 'L20-02',
    layer: 'execution_path',
    subcategory: 'branch omissions',
    stage: 'workflow_rules',
    owningAgent: 'execution_simulation_agent'
  },
  {
    id: 'execution_idempotency_gap_rule',
    detectorId: 'L20-16',
    layer: 'execution_path',
    subcategory: 'idempotency gaps',
    stage: 'workflow_rules',
    owningAgent: 'execution_simulation_agent'
  },
  {
    id: 'execution_order_indeterminism_rule',
    detectorId: 'L20-17',
    layer: 'execution_path',
    subcategory: 'execution order determinism',
    stage: 'workflow_rules',
    owningAgent: 'execution_simulation_agent'
  },
  {
    id: 'task_graph_priority_propagation_rule',
    detectorId: 'L10-07',
    layer: 'intent',
    subcategory: 'goal drift',
    stage: 'task_graph_rules',
    owningAgent: 'execution_simulation_agent'
  },
  {
    id: 'intent_ambiguity_rule',
    detectorId: 'L10-10',
    layer: 'intent',
    subcategory: 'objective ambiguity',
    stage: 'interaction_rules',
    owningAgent: 'ui_operational_agent'
  },
  {
    id: 'change_scope_boundary_rule',
    detectorId: 'L10-01',
    layer: 'intent',
    subcategory: 'scope creep',
    stage: 'interaction_rules',
    owningAgent: 'ui_operational_agent'
  },
  {
    id: 'user_intent_consistency_rule',
    detectorId: 'L10-02',
    layer: 'intent',
    subcategory: 'business-vs-implementation mismatch',
    stage: 'interaction_rules',
    owningAgent: 'ui_operational_agent'
  },
  {
    id: 'interaction_conflict_rule',
    detectorId: 'L10-03',
    layer: 'intent',
    subcategory: 'goal drift',
    stage: 'interaction_rules',
    owningAgent: 'ui_operational_agent'
  },
  {
    id: 'redundant_dependency_rule',
    detectorId: 'L18-07',
    layer: 'dependency_graph',
    subcategory: 'undeclared dependencies',
    stage: 'task_graph_rules',
    owningAgent: 'execution_simulation_agent'
  },
  {
    id: 'dependency_ownership_ambiguity_detail_rule',
    detectorId: 'L18-09',
    layer: 'dependency_graph',
    subcategory: 'ownership ambiguity',
    stage: 'task_graph_rules',
    owningAgent: 'execution_simulation_agent'
  },
  {
    id: 'conflicting_trigger_rule',
    detectorId: 'L20-03',
    layer: 'execution_path',
    subcategory: 'branch omissions',
    stage: 'workflow_rules',
    owningAgent: 'execution_simulation_agent'
  },
  {
    id: 'incomplete_execution_branch_rule',
    detectorId: 'L20-04',
    layer: 'execution_path',
    subcategory: 'branch omissions',
    stage: 'workflow_rules',
    owningAgent: 'execution_simulation_agent'
  },
  {
    id: 'dead_end_workflow_rule',
    detectorId: 'L20-05',
    layer: 'execution_path',
    subcategory: 'dead ends',
    stage: 'workflow_rules',
    owningAgent: 'execution_simulation_agent'
  },
  {
    id: 'conditional_ambiguity_rule',
    detectorId: 'L20-07',
    layer: 'execution_path',
    subcategory: 'unreachable paths',
    stage: 'workflow_rules',
    owningAgent: 'execution_simulation_agent'
  },
  {
    id: 'execution_path_gap_rule',
    detectorId: 'L20-10',
    layer: 'execution_path',
    subcategory: 'execution-path gaps',
    stage: 'workflow_rules',
    owningAgent: 'execution_simulation_agent'
  },
  {
    id: 'path_dependency_cycle_rule',
    detectorId: 'L20-14',
    layer: 'execution_path',
    subcategory: 'path dependency cycles',
    stage: 'workflow_rules',
    owningAgent: 'execution_simulation_agent'
  },
  {
    id: 'path_state_preservation_rule',
    detectorId: 'L20-18',
    layer: 'execution_path',
    subcategory: 'path state preservation',
    stage: 'workflow_rules',
    owningAgent: 'execution_simulation_agent'
  },
  {
    id: 'conditional_execution_indeterminism_rule',
    detectorId: 'L20-19',
    layer: 'execution_path',
    subcategory: 'conditional execution determinism',
    stage: 'workflow_rules',
    owningAgent: 'execution_simulation_agent'
  },
  {
    id: 'execution_branching_logic_rule',
    detectorId: 'L20-20',
    layer: 'execution_path',
    subcategory: 'execution branching logic',
    stage: 'workflow_rules',
    owningAgent: 'execution_simulation_agent'
  },
  {
    id: 'missing_approval_gate_rule',
    detectorId: 'L29-02',
    layer: 'governance',
    subcategory: 'approval gates',
    stage: 'governance_rules',
    owningAgent: 'architecture_authority_agent'
  },
  {
    id: 'untraceable_change_rule',
    detectorId: 'L29-03',
    layer: 'governance',
    subcategory: 'auditability',
    stage: 'governance_rules',
    owningAgent: 'architecture_authority_agent'
  },
  {
    id: 'governance_unclear_ownership_rule',
    detectorId: 'L29-06',
    layer: 'governance',
    subcategory: 'policy traceability',
    stage: 'governance_rules',
    owningAgent: 'architecture_authority_agent'
  },
  {
    id: 'missing_fail_safe_rule',
    detectorId: 'L29-07',
    layer: 'governance',
    subcategory: 'fail-safe condition ambiguity',
    stage: 'governance_rules',
    owningAgent: 'architecture_authority_agent'
  },
  {
    id: 'override_ambiguity_rule',
    detectorId: 'L29-08',
    layer: 'governance',
    subcategory: 'override ambiguity',
    stage: 'governance_rules',
    owningAgent: 'architecture_authority_agent'
  },
  {
    id: 'unauthorized_agent_write_rule',
    detectorId: 'L29-21',
    layer: 'governance',
    subcategory: 'unauthorized agent writes',
    stage: 'governance_rules',
    owningAgent: 'architecture_authority_agent'
  },
  {
    id: 'transition_non_determinism_rule',
    detectorId: 'L43-01',
    layer: 'deterministic_execution',
    subcategory: 'transition determinism',
    stage: 'execution_invariant_rules',
    owningAgent: 'execution_simulation_agent'
  },
  {
    id: 'concurrency_model_ambiguity_rule',
    detectorId: 'L43-02',
    layer: 'deterministic_execution',
    subcategory: 'concurrency model definition',
    stage: 'execution_invariant_rules',
    owningAgent: 'execution_simulation_agent'
  },
  {
    id: 'input_determinism_gap_rule',
    detectorId: 'L43-04',
    layer: 'deterministic_execution',
    subcategory: 'scheduling determinism',
    stage: 'execution_invariant_rules',
    owningAgent: 'execution_simulation_agent'
  },
  {
    id: 'decision_authority_ambiguity_rule',
    detectorId: 'L44-14',
    layer: 'control_plane_authority',
    subcategory: 'control plane separation violation',
    stage: 'governance_rules',
    owningAgent: 'architecture_authority_agent'
  }
];

export const DETERMINISTIC_RULE_COUNT = DETERMINISTIC_RULE_DEFINITIONS.length;

function getRuleDefinition(ruleId) {
  return DETERMINISTIC_RULE_DEFINITIONS.find((rule) => rule.id === ruleId) || null;
}

function createEvidenceSpan({ file, section = '', sectionSlug = '', lineStart, lineEnd, role = 'primary', source = 'rule', excerpt = '' }) {
  return {
    file,
    section,
    section_slug: sectionSlug,
    line_start: Number.isFinite(Number(lineStart)) ? Number(lineStart) : undefined,
    line_end: Number.isFinite(Number(lineEnd)) ? Number(lineEnd) : undefined,
    anchor: buildIssueDocumentAnchor({
      files: [file],
      section,
      section_slug: sectionSlug,
      line_number: lineStart,
      line_end: lineEnd
    }),
    role,
    source,
    excerpt
  };
}

function buildLineExcerpt(documentIndex, startLine, endLine = startLine) {
  if (!documentIndex || !Number.isFinite(Number(startLine))) return '';
  return documentIndex.lines
    .slice(Number(startLine) - 1, Number(endLine))
    .map((line) => line.trim())
    .filter(Boolean)
    .join(' ')
    .slice(0, 280);
}

function getSectionForLine(documentIndex, lineNumber) {
  return documentIndex.headings.find((heading) => heading.lineStart <= lineNumber && lineNumber <= heading.lineEnd) || null;
}

function extractRequirementKeywords(text = '') {
  return Array.from(
    new Set((String(text || '').match(RFC_KEYWORD_PATTERN) || []).map((keyword) => keyword.toUpperCase()))
  );
}

function extractNumberedSteps(lines = []) {
  return lines
    .map(({ lineNumber, text }) => {
      const match = String(text || '').match(/^\s*(\d+)\.\s+(.+)$/);
      if (!match) return null;
      return {
        number: Number(match[1]),
        text: match[2].trim(),
        lineNumber
      };
    })
    .filter(Boolean);
}

function extractTaskDependencies(text = '') {
  return Array.from(
    new Set(
      Array.from(String(text || '').matchAll(TASK_DEPENDENCY_REFERENCE_PATTERN))
        .map((match) => Number(match[1]))
        .filter((value) => Number.isFinite(value))
    )
  );
}

function parsePriorityLevel(text = '') {
  const explicitPriority = String(text || '').match(/\bpriority\s*[:=-]?\s*(critical|high|medium|low|p\d+|\d+)\b/i);
  const tokenPriority = String(text || '').match(/\bP(\d+)\b/i);
  const raw = explicitPriority?.[1] || (tokenPriority ? `P${tokenPriority[1]}` : '');
  if (!raw) return null;

  const normalized = String(raw).trim().toLowerCase();
  if (normalized === 'critical') return 0;
  if (normalized === 'high') return 1;
  if (normalized === 'medium') return 2;
  if (normalized === 'low') return 3;
  if (/^p\d+$/.test(normalized)) return Number(normalized.slice(1));
  if (/^\d+$/.test(normalized)) return Number(normalized);
  return null;
}

function classifyInteractionMode(text = '') {
  return {
    automatic: AUTO_INTERACTION_PATTERN.test(text),
    manual: MANUAL_INTERACTION_PATTERN.test(text),
    noApproval: NO_APPROVAL_PATTERN.test(text),
    approvalRequired: /\b(approve|approval|review|sign[- ]?off)\b/i.test(text),
    selfServe: /\bself[- ]?serve\b/i.test(text)
  };
}

function normalizeRequirementClause(text = '') {
  return normalizeComparableText(String(text || '').replace(RFC_KEYWORD_PATTERN, ' '));
}

function createRuleIssue({
  ruleId,
  detectorId,
  severity,
  description,
  files,
  section = '',
  sectionSlug = '',
  lineNumber,
  lineEnd,
  evidence,
  whyTriggered,
  confidence = 0.99,
  evidenceSpans = [],
  deterministicFix = '',
  recommendedFix = ''
}) {
  const normalizedSpans = normalizeEvidenceSpans(evidenceSpans);
  const documentAnchor = buildIssueDocumentAnchor({
    files,
    section,
    section_slug: sectionSlug,
    line_number: lineNumber,
    line_end: lineEnd
  });
  const ruleDefinition = getRuleDefinition(ruleId);

  return {
    detector_id: detectorId,
    severity,
    description,
    files,
    section,
    section_slug: sectionSlug,
    line_number: lineNumber,
    line_end: lineEnd,
    document_anchor: documentAnchor || undefined,
    document_anchors: documentAnchor ? [documentAnchor] : undefined,
    anchor_source: 'deterministic_rule_engine',
    evidence,
    evidence_spans: normalizedSpans,
    why_triggered: whyTriggered,
    confidence,
    detection_source: 'rule',
    analysis_agent: 'deterministic_rule_engine',
    analysis_agents: ruleDefinition?.owningAgent
      ? ['deterministic_rule_engine', ruleDefinition.owningAgent]
      : ['deterministic_rule_engine'],
    deterministic_fix: deterministicFix || undefined,
    recommended_fix: recommendedFix || undefined,
    rule_id: ruleId || undefined,
    rule_stage: ruleDefinition?.stage || undefined
  };
}

function pushIssue(issues, issue) {
  if (!issue) return;
  issues.push(issue);
}

function hasMeaningfulSectionBody(documentIndex, heading) {
  if (!documentIndex || !heading) return false;

  for (let lineIndex = heading.lineStart + 1; lineIndex <= heading.lineEnd; lineIndex += 1) {
    const line = documentIndex.lines[lineIndex - 1];
    const normalized = normalizeComparableText(line);
    if (!normalized) continue;
    if (/^[#>*`\-_=:.]+$/.test(String(line || '').trim())) continue;
    return true;
  }

  return false;
}

function runBrokenHeadingHierarchyRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    let previousHeading = null;

    documentIndex.headings.forEach((heading) => {
      if (
        previousHeading
        && Number.isFinite(Number(previousHeading.level))
        && Number.isFinite(Number(heading.level))
        && Number(heading.level) > Number(previousHeading.level) + 1
      ) {
        pushIssue(issues, createRuleIssue({
          ruleId: 'broken_heading_hierarchy_rule',
          detectorId: 'L3-01',
          severity: 'medium',
          description: `Heading "${heading.title}" jumps from H${previousHeading.level} to H${heading.level} in ${documentIndex.name} without an intermediate level.`,
          files: [documentIndex.name],
          section: heading.title,
          sectionSlug: heading.slug,
          lineNumber: heading.lineStart,
          evidence: `${documentIndex.name}:${previousHeading.lineStart} ${previousHeading.title}\n${documentIndex.name}:${heading.lineStart} ${heading.title}`,
          whyTriggered: 'Markdown heading levels skip one or more structural levels, which breaks deterministic section nesting.',
          evidenceSpans: [
            createEvidenceSpan({
              file: documentIndex.name,
              section: previousHeading.title,
              sectionSlug: previousHeading.slug,
              lineStart: previousHeading.lineStart,
              role: 'supporting',
              source: 'broken_heading_hierarchy_rule',
              excerpt: buildLineExcerpt(documentIndex, previousHeading.lineStart)
            }),
            createEvidenceSpan({
              file: documentIndex.name,
              section: heading.title,
              sectionSlug: heading.slug,
              lineStart: heading.lineStart,
              role: 'primary',
              source: 'broken_heading_hierarchy_rule',
              excerpt: buildLineExcerpt(documentIndex, heading.lineStart)
            })
          ],
          deterministicFix: 'Insert the missing intermediate heading level or flatten the section so heading levels only increase by one step at a time.',
          recommendedFix: 'Restructure the section hierarchy so the heading ladder remains H1 -> H2 -> H3 without level skips.'
        }));
      }

      previousHeading = heading;
    });
  });
}

function runOrphanSectionRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    documentIndex.headings.forEach((heading) => {
      if (hasMeaningfulSectionBody(documentIndex, heading)) return;

      pushIssue(issues, createRuleIssue({
        ruleId: 'orphan_section_rule',
        detectorId: 'L3-02',
        severity: 'low',
        description: `Heading "${heading.title}" in ${documentIndex.name} has no meaningful body content under it.`,
        files: [documentIndex.name],
        section: heading.title,
        sectionSlug: heading.slug,
        lineNumber: heading.lineStart,
        evidence: `${documentIndex.name}:${heading.lineStart} ${heading.title}`,
        whyTriggered: 'The heading resolves to an empty section range or contains only formatting/noise lines, leaving the section orphaned.',
        evidenceSpans: [
          createEvidenceSpan({
            file: documentIndex.name,
            section: heading.title,
            sectionSlug: heading.slug,
            lineStart: heading.lineStart,
            lineEnd: heading.lineEnd > heading.lineStart ? heading.lineEnd : undefined,
            role: 'primary',
            source: 'orphan_section_rule',
            excerpt: buildLineExcerpt(documentIndex, heading.lineStart, heading.lineEnd)
          })
        ],
        deterministicFix: 'Either add body content that explains the section or remove/merge the empty heading.',
        recommendedFix: 'Populate the section with the missing contract details or fold the heading into a neighboring section.'
      }));
    });
  });
}

function runDuplicateHeadingRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    const groups = new Map();
    documentIndex.headings.forEach((heading) => {
      if (!heading.normalizedTitle) return;
      if (!groups.has(heading.normalizedTitle)) groups.set(heading.normalizedTitle, []);
      groups.get(heading.normalizedTitle).push(heading);
    });

    groups.forEach((group) => {
      if (group.length < 2) return;

      const first = group[0];
      const evidenceSpans = group.map((heading) => createEvidenceSpan({
        file: documentIndex.name,
        section: heading.title,
        sectionSlug: heading.slug,
        lineStart: heading.lineStart,
        role: heading === first ? 'primary' : 'supporting',
        source: 'duplicate_heading',
        excerpt: buildLineExcerpt(documentIndex, heading.lineStart)
      }));

      pushIssue(issues, createRuleIssue({
        ruleId: 'duplicate_heading_rule',
        detectorId: 'L3-03',
        severity: 'medium',
        description: `Heading "${first.title}" appears ${group.length} times in ${documentIndex.name}, creating duplicate section structure.`,
        files: [documentIndex.name],
        section: first.title,
        sectionSlug: first.slug,
        lineNumber: first.lineStart,
        evidence: `Duplicate heading "${first.title}" appears on lines ${group.map((heading) => heading.lineStart).join(', ')}.`,
        whyTriggered: 'The same normalized heading title is repeated multiple times in the same Markdown file.',
        evidenceSpans,
        deterministicFix: 'Merge the duplicated sections or rename the headings so each section title is unique within the document.',
        recommendedFix: 'Consolidate repeated sections under one heading or give each section a distinct contract-specific title.'
      }));
    });
  });
}

function resolveReferenceTarget(target, projectGraph, sourceDocument) {
  if (!target || /^(https?:|mailto:)/i.test(target)) return { valid: true };

  const [rawFilePart, rawSlugPart] = target.split('#');
  const filePart = rawFilePart.trim();
  const slugPart = (rawSlugPart || '').trim().toLowerCase();

  if (!filePart) {
    const slugExists = sourceDocument.headings.some((heading) => heading.slug === slugPart);
    return {
      valid: slugExists,
      reason: slugExists ? '' : `Anchor "#${slugPart}" does not exist in ${sourceDocument.name}.`
    };
  }

  const normalizedFilePart = filePart.replace(/^\.?[\\/]/, '').toLowerCase();
  const targetDocument = projectGraph.projectIndex.documents.find((documentIndex) =>
    documentIndex.aliases.includes(normalizedFilePart)
    || documentIndex.name.toLowerCase() === normalizedFilePart
  );

  if (!targetDocument) {
    return {
      valid: false,
      reason: `Referenced file "${filePart}" is not part of the loaded Markdown set.`
    };
  }

  if (!slugPart) {
    return { valid: true };
  }

  const slugExists = targetDocument.headings.some((heading) => heading.slug === slugPart);
  return {
    valid: slugExists,
    reason: slugExists ? '' : `Anchor "#${slugPart}" does not exist in ${targetDocument.name}.`
  };
}

function runBrokenCrossReferenceRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    documentIndex.lines.forEach((line, index) => {
      Array.from(line.matchAll(MARKDOWN_LINK_PATTERN)).forEach((match) => {
        const target = match[2].trim();
        const resolution = resolveReferenceTarget(target, projectGraph, documentIndex);
        if (resolution.valid) return;

        const section = getSectionForLine(documentIndex, index + 1);
        pushIssue(issues, createRuleIssue({
          ruleId: 'broken_cross_reference_rule',
          detectorId: 'L13-05',
          severity: 'high',
          description: `Cross-reference "${target}" in ${documentIndex.name} does not resolve to a loaded file or heading.`,
          files: [documentIndex.name],
          section: section?.title || '',
          sectionSlug: section?.slug || '',
          lineNumber: index + 1,
          evidence: line.trim(),
          whyTriggered: resolution.reason,
          evidenceSpans: [
            createEvidenceSpan({
              file: documentIndex.name,
              section: section?.title || '',
              sectionSlug: section?.slug || '',
              lineStart: index + 1,
              source: 'broken_reference',
              excerpt: line.trim()
            })
          ],
          deterministicFix: 'Update the Markdown link target so it points to an existing loaded file and heading slug.',
          recommendedFix: 'Rename the target heading to match the link slug or correct the link target.'
        }));
      });
    });
  });
}

function runRfc2119Rule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    const documentText = documentIndex.lines.join('\n');
    const normativeDocument = /\bRFC ?2119\b|\bRFC ?8174\b/.test(documentText) || /\b(MUST|SHALL|SHOULD|MAY|REQUIRED|RECOMMENDED|OPTIONAL)\b/.test(documentText);
    if (!normativeDocument) return;

    documentIndex.lines.forEach((line, index) => {
      const uppercaseKeywords = Array.from(new Set((line.match(RFC_KEYWORD_PATTERN) || []).map((keyword) => keyword.toUpperCase())));
      const lowercaseKeywords = Array.from(new Set((line.match(RFC_LOWERCASE_PATTERN) || []).map((keyword) => keyword.toLowerCase())));
      const containsMixedLowercase = lowercaseKeywords.length > 0 && uppercaseKeywords.length === 0;
      const containsConflictingUppercase = uppercaseKeywords.length > 1;

      if (!containsMixedLowercase && !containsConflictingUppercase) return;

      const section = getSectionForLine(documentIndex, index + 1);
      const reason = containsMixedLowercase
        ? `Normative line uses lowercase modal keywords (${lowercaseKeywords.join(', ')}) in a document that uses RFC 2119/8174 style requirements.`
        : `Line mixes multiple RFC 2119 keywords (${uppercaseKeywords.join(', ')}) without clarifying precedence.`;

      pushIssue(issues, createRuleIssue({
        ruleId: 'rfc2119_keyword_rule',
        detectorId: 'L15-11',
        severity: 'medium',
        description: `RFC 2119 keyword usage is inconsistent on line ${index + 1} of ${documentIndex.name}.`,
        files: [documentIndex.name],
        section: section?.title || '',
        sectionSlug: section?.slug || '',
        lineNumber: index + 1,
        evidence: line.trim(),
        whyTriggered: reason,
        evidenceSpans: [
          createEvidenceSpan({
            file: documentIndex.name,
            section: section?.title || '',
            sectionSlug: section?.slug || '',
            lineStart: index + 1,
            source: 'rfc2119_keyword_rule',
            excerpt: line.trim()
          })
        ],
        deterministicFix: 'Standardize normative keywords to explicit RFC 2119/8174 capitalization and remove ambiguous mixed-strength wording.',
        recommendedFix: 'Use one clearly intended requirement keyword per statement and capitalize it consistently.'
      }));
    });
  });
}

function runAmbiguousRequirementWordingRule(projectGraph, issues) {
  const documentsByName = new Map(
    (projectGraph?.projectIndex?.documents || []).map((documentIndex) => [documentIndex.name, documentIndex])
  );

  (projectGraph?.requirementOccurrences || []).forEach((occurrence) => {
    const documentIndex = documentsByName.get(occurrence.file);
    if (!documentIndex) return;
    if (!VAGUE_REQUIREMENT_PATTERN.test(occurrence.label)) return;

    pushIssue(issues, createRuleIssue({
      ruleId: 'ambiguous_requirement_wording_rule',
      detectorId: 'L4-01',
      severity: 'medium',
      description: `Requirement clause in ${occurrence.file} uses vague wording that weakens deterministic interpretation.`,
      files: [occurrence.file],
      section: occurrence.section,
      sectionSlug: occurrence.section_slug,
      lineNumber: occurrence.line_number,
      evidence: occurrence.label,
      whyTriggered: 'The requirement contains open-ended wording such as "appropriate", "quickly", or "as needed", which leaves the requirement semantically ambiguous.',
      evidenceSpans: [
        createEvidenceSpan({
          file: occurrence.file,
          section: occurrence.section,
          sectionSlug: occurrence.section_slug,
          lineStart: occurrence.line_number,
          source: 'ambiguous_requirement_wording_rule',
          excerpt: occurrence.label
        })
      ],
      deterministicFix: 'Replace vague requirement wording with explicit measurable, bounded, or conditionally-scoped language.',
      recommendedFix: 'State the exact threshold, timing, quantity, or boundary instead of relying on subjective language.'
    }));
  });
}

function runDuplicatedRequirementRule(projectGraph, issues) {
  projectGraph.requirementGroups.forEach((occurrences) => {
    if (!Array.isArray(occurrences) || occurrences.length < 2) return;

    const normalizedClauses = Array.from(
      new Set(occurrences.map((occurrence) => normalizeRequirementClause(occurrence.label)).filter(Boolean))
    );
    if (normalizedClauses.length !== 1) return;

    const keywordSet = new Set(occurrences.flatMap((occurrence) => extractRequirementKeywords(occurrence.label)));
    if (keywordSet.size > 1) return;

    const first = occurrences[0];
    pushIssue(issues, createRuleIssue({
      ruleId: 'duplicated_requirement_rule',
      detectorId: 'L15-06',
      severity: 'low',
      description: `Requirement clause "${first.label}" is duplicated ${occurrences.length} times across the loaded Markdown set.`,
      files: Array.from(new Set(occurrences.map((occurrence) => occurrence.file))),
      section: first.section,
      sectionSlug: first.section_slug,
      lineNumber: first.line_number,
      evidence: occurrences.map((occurrence) => `${occurrence.file}:${occurrence.line_number} ${occurrence.label}`).join('\n'),
      whyTriggered: 'The same normalized requirement clause appears multiple times without introducing distinct acceptance semantics or traceability boundaries.',
      evidenceSpans: occurrences.map((occurrence, index) => createEvidenceSpan({
        file: occurrence.file,
        section: occurrence.section,
        sectionSlug: occurrence.section_slug,
        lineStart: occurrence.line_number,
        role: index === 0 ? 'primary' : 'supporting',
        source: 'duplicated_requirement_rule',
        excerpt: occurrence.label
      })),
      deterministicFix: 'Consolidate the duplicate statements into one canonical requirement and replace the rest with explicit cross-references.',
      recommendedFix: 'Keep a single authoritative requirement clause and add traceability links anywhere the same obligation needs to be referenced again.'
    }));
  });
}

function runRequirementConflictResolutionRule(projectGraph, issues) {
  projectGraph.requirementGroups.forEach((occurrences) => {
    if (!Array.isArray(occurrences) || occurrences.length < 2) return;

    const normalizedClauses = Array.from(
      new Set(occurrences.map((occurrence) => normalizeRequirementClause(occurrence.label)).filter(Boolean))
    );
    if (normalizedClauses.length !== 1) return;

    const keywordSet = new Set(occurrences.flatMap((occurrence) => extractRequirementKeywords(occurrence.label)));
    if (keywordSet.size < 2) return;

    const first = occurrences[0];
    pushIssue(issues, createRuleIssue({
      ruleId: 'requirement_conflict_resolution_rule',
      detectorId: 'L15-21',
      severity: 'high',
      description: `Requirement clause "${first.label}" appears with conflicting RFC 2119 strength across the loaded Markdown set.`,
      files: Array.from(new Set(occurrences.map((occurrence) => occurrence.file))),
      section: first.section,
      sectionSlug: first.section_slug,
      lineNumber: first.line_number,
      evidence: occurrences.map((occurrence) => `${occurrence.file}:${occurrence.line_number} ${occurrence.label}`).join('\n'),
      whyTriggered: `The same normalized requirement clause appears with multiple normative strengths (${Array.from(keywordSet).join(', ')}) and no deterministic precedence or conflict-resolution rule is present.`,
      evidenceSpans: occurrences.map((occurrence, index) => createEvidenceSpan({
        file: occurrence.file,
        section: occurrence.section,
        sectionSlug: occurrence.section_slug,
        lineStart: occurrence.line_number,
        role: index === 0 ? 'primary' : 'supporting',
        source: 'requirement_conflict_resolution_rule',
        excerpt: occurrence.label
      })),
      deterministicFix: 'Pick one authoritative requirement strength and define an explicit precedence rule if variants must remain for different contexts.',
      recommendedFix: 'Replace conflicting MUST/SHOULD/MAY variants with one canonical clause or document a deterministic conflict-resolution policy.'
    }));
  });
}

function collectWorkflowSections(documentIndex) {
  return documentIndex.headings.filter((heading) => WORKFLOW_HEADING_PATTERN.test(heading.title)).map((heading) => {
    const lines = [];
    for (let lineNumber = heading.lineStart; lineNumber <= heading.lineEnd; lineNumber += 1) {
      lines.push({
        lineNumber,
        text: documentIndex.lines[lineNumber - 1] || ''
      });
    }

    const numberedSteps = extractNumberedSteps(lines);

    return { heading, lines, numberedSteps };
  });
}

function collectDocumentSections(documentIndex) {
  if (!documentIndex) return [];

  if (!Array.isArray(documentIndex.headings) || documentIndex.headings.length === 0) {
    const lines = documentIndex.lines.map((text, index) => ({
      lineNumber: index + 1,
      text
    }));

    return [{
      heading: null,
      lines,
      lineStart: 1,
      lineEnd: documentIndex.lines.length,
      sectionText: lines.map(({ text }) => text).join('\n')
    }];
  }

  return documentIndex.headings.map((heading) => {
    const lines = [];
    for (let lineNumber = heading.lineStart; lineNumber <= heading.lineEnd; lineNumber += 1) {
      lines.push({
        lineNumber,
        text: documentIndex.lines[lineNumber - 1] || ''
      });
    }

    return {
      heading,
      lines,
      lineStart: heading.lineStart,
      lineEnd: heading.lineEnd,
      sectionText: lines.map(({ text }) => text).join('\n')
    };
  });
}

function collectTaskGraphSections(documentIndex) {
  return collectDocumentSections(documentIndex)
    .map(({ heading, lines, lineStart, lineEnd, sectionText }) => {
      const numberedSteps = extractNumberedSteps(lines).map((step) => ({
        ...step,
        dependencies: extractTaskDependencies(step.text),
        priority: parsePriorityLevel(step.text)
      }));

      return {
        heading,
        lines,
        lineStart,
        lineEnd,
        sectionText,
        numberedSteps
      };
    })
    .filter(({ heading, sectionText, numberedSteps }) => (
      numberedSteps.length >= 2
      && (
        TASK_GRAPH_HEADING_PATTERN.test(heading?.title || '')
        || TASK_DEPENDENCY_HINT_PATTERN.test(sectionText)
        )
      ));
}

function collectDependencySections(documentIndex) {
  return collectDocumentSections(documentIndex).filter(({ heading, sectionText }) => (
    DEPENDENCY_HEADING_PATTERN.test(heading?.title || '')
    || (
      TASK_DEPENDENCY_HINT_PATTERN.test(sectionText)
      && DEPENDENCY_HEADING_PATTERN.test(sectionText)
    )
  ));
}

function extractActorRoles(text = '') {
  const matches = String(text || '').match(ACTOR_ROLE_PATTERN) || [];
  return Array.from(
    new Set(
      matches.map((match) => {
        const lowered = String(match).toLowerCase();
        return lowered.endsWith('s') ? lowered.slice(0, -1) : lowered;
      })
    )
  );
}

function buildTaskGraphContext(taskSection) {
  const numberedSteps = Array.isArray(taskSection?.numberedSteps) ? taskSection.numberedSteps : [];
  const stepMap = new Map(numberedSteps.map((step) => [step.number, step]));
  const adjacency = new Map(numberedSteps.map((step) => [step.number, []]));
  const reverseAdjacency = new Map(numberedSteps.map((step) => [step.number, []]));
  const validEdges = [];
  const invalidForwardDependencies = [];
  const missingDependencies = [];
  const optionalDependencySteps = [];
  const requiredDependencySteps = [];

  numberedSteps.forEach((step) => {
    if (step.dependencies.length > 0) {
      if (OPTIONAL_DEPENDENCY_PATTERN.test(step.text)) {
        optionalDependencySteps.push(step);
      }
      if (REQUIRED_DEPENDENCY_PATTERN.test(step.text)) {
        requiredDependencySteps.push(step);
      }
    }

    step.dependencies.forEach((dependencyNumber) => {
      if (!stepMap.has(dependencyNumber)) {
        missingDependencies.push({
          dependencyNumber,
          stepNumber: step.number
        });
        return;
      }
      adjacency.get(dependencyNumber).push(step.number);
      reverseAdjacency.get(step.number).push(dependencyNumber);
      validEdges.push({
        dependencyNumber,
        stepNumber: step.number
      });
      if (dependencyNumber > step.number) {
        invalidForwardDependencies.push({
          dependencyNumber,
          stepNumber: step.number
        });
      }
    });
  });

  return {
    numberedSteps,
    stepMap,
    adjacency,
    reverseAdjacency,
    validEdges,
    invalidForwardDependencies,
    missingDependencies,
    optionalDependencySteps,
    requiredDependencySteps
    };
  }

function buildDependencyVersionReferences(sectionText = '') {
  const references = new Map();

  String(sectionText || '')
    .split('\n')
    .forEach((line) => {
      const trimmedLine = String(line || '').trim();
      if (!trimmedLine) return;

      for (const match of trimmedLine.matchAll(VERSIONED_DEPENDENCY_REFERENCE_PATTERN)) {
        const dependencyName = String(match[1] || '').trim().toLowerCase();
        const versionToken = String(match[2] || '').trim().toLowerCase();
        if (!dependencyName || !versionToken) continue;

        if (!references.has(dependencyName)) {
          references.set(dependencyName, new Set());
        }
        references.get(dependencyName).add(versionToken);
      }
    });

  return references;
}

function buildDependencyVersionOccurrences(lines = []) {
  const references = new Map();

  (Array.isArray(lines) ? lines : []).forEach(({ lineNumber, text }) => {
    const trimmedLine = String(text || '').trim();
    if (!trimmedLine) return;

    for (const match of trimmedLine.matchAll(VERSIONED_DEPENDENCY_REFERENCE_PATTERN)) {
      const dependencyName = String(match[1] || '').trim().toLowerCase();
      const versionToken = String(match[2] || '').trim().toLowerCase();
      if (!dependencyName || !versionToken) continue;

      if (!references.has(dependencyName)) {
        references.set(dependencyName, new Map());
      }
      const versions = references.get(dependencyName);
      if (!versions.has(versionToken)) {
        versions.set(versionToken, []);
      }
      versions.get(versionToken).push({
        lineNumber,
        text: trimmedLine
      });
    }
  });

  return references;
}

function countConditionalMarkers(text = '') {
  const matches = String(text || '').match(/\b(if|when|unless|otherwise|else|fallback|default)\b/gi) || [];
  return matches.length;
}

function findTaskGraphCycle(adjacency) {
  const visited = new Set();
  const stack = [];
  const inStack = new Set();

  function visit(node) {
    visited.add(node);
    stack.push(node);
    inStack.add(node);

    for (const next of adjacency.get(node) || []) {
      if (!visited.has(next)) {
        const found = visit(next);
        if (found) return found;
      } else if (inStack.has(next)) {
        const startIndex = stack.indexOf(next);
        return stack.slice(startIndex).concat(next);
      }
    }

    stack.pop();
    inStack.delete(node);
    return null;
  }

  for (const node of adjacency.keys()) {
    if (visited.has(node)) continue;
    const cycle = visit(node);
    if (cycle) return cycle;
  }

  return null;
}

function collectStateTransitionGroups(documentIndex) {
  const transitionGroups = new Map();

  documentIndex.lines.forEach((line, index) => {
    if (!/(->|\u2192)/.test(line)) return;

    const tokens = Array.from(line.matchAll(/\b([A-Z][A-Z0-9_]{1,31})\b/g))
      .map((match) => match[1].toUpperCase())
      .filter((token) => token.length >= 3);
    if (tokens.length < 2) return;

    const section = getSectionForLine(documentIndex, index + 1);
    const groupKey = section?.slug || '__document__';
    if (!transitionGroups.has(groupKey)) {
      transitionGroups.set(groupKey, {
        section,
        transitions: []
      });
    }

    transitionGroups.get(groupKey).transitions.push({
      lineNumber: index + 1,
      line: String(line || '').trim(),
      tokens
    });
  });

  return Array.from(transitionGroups.values()).map(({ section, transitions }) => {
    const first = transitions[0];
    const last = transitions[transitions.length - 1];
    const lineStart = section?.lineStart || first?.lineNumber || 1;
    const lineEnd = section?.lineEnd || last?.lineNumber || lineStart;
    const lines = [];

    for (let lineNumber = lineStart; lineNumber <= lineEnd; lineNumber += 1) {
      lines.push({
        lineNumber,
        text: documentIndex.lines[lineNumber - 1] || ''
      });
    }

    return {
      section,
      transitions,
      lineStart,
      lineEnd,
      sectionText: lines.map(({ text }) => text).join('\n')
    };
  });
}

function collectApiSections(projectGraph) {
  const groups = new Map();
  const documentsByName = new Map(
    (projectGraph?.projectIndex?.documents || []).map((documentIndex) => [documentIndex.name, documentIndex])
  );

  (projectGraph?.apiOccurrences || []).forEach((occurrence) => {
    const documentIndex = documentsByName.get(occurrence.file);
    if (!documentIndex) return;

    const section = getSectionForLine(documentIndex, occurrence.line_number);
    const key = `${documentIndex.name}::${section?.slug || `line-${occurrence.line_number}`}`;
    if (!groups.has(key)) {
      groups.set(key, {
        documentIndex,
        section,
        apiOccurrences: [],
        lineNumbers: new Set()
      });
    }

    const entry = groups.get(key);
    entry.apiOccurrences.push(occurrence);
    entry.lineNumbers.add(occurrence.line_number);
  });

  return Array.from(groups.values()).map(({ documentIndex, section, apiOccurrences, lineNumbers }) => {
    const orderedLineNumbers = Array.from(lineNumbers).sort((a, b) => a - b);
    const lineStart = section?.lineStart || orderedLineNumbers[0];
    const lineEnd = section?.lineEnd || orderedLineNumbers[orderedLineNumbers.length - 1];
    const lines = [];
    for (let lineNumber = lineStart; lineNumber <= lineEnd; lineNumber += 1) {
      lines.push({
        lineNumber,
        text: documentIndex.lines[lineNumber - 1] || ''
      });
    }

    return {
      documentIndex,
      section,
      apiOccurrences,
      lineStart,
      lineEnd,
      lines,
      sectionText: lines.map(({ text }) => text).join('\n'),
      methods: Array.from(new Set(apiOccurrences.map((occurrence) => String(occurrence.label || '').split(' ')[0].toUpperCase()).filter(Boolean)))
    };
  });
}

function buildDefinedStateSymbols(projectGraph) {
  const definedSymbols = new Set();

  (projectGraph?.glossaryOccurrences || []).forEach((occurrence) => {
    if (/^[A-Z][A-Z0-9_]{1,31}$/.test(occurrence.label || '')) {
      definedSymbols.add(String(occurrence.label).toUpperCase());
    }
  });

  (projectGraph?.projectIndex?.documents || []).forEach((documentIndex) => {
    documentIndex.headings.forEach((heading) => {
      if (/^[A-Z][A-Z0-9_]{1,31}$/.test(heading.title || '')) {
        definedSymbols.add(String(heading.title).toUpperCase());
      }
    });

    documentIndex.lines.forEach((line) => {
      const match = String(line || '').match(UPPERCASE_DEFINITION_PATTERN);
      if (match) {
        definedSymbols.add(String(match[1]).toUpperCase());
      }
    });
  });

  return definedSymbols;
}

function runWorkflowOrderingRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectWorkflowSections(documentIndex).forEach(({ heading, numberedSteps }) => {
      if (numberedSteps.length < 2) return;

      let orderingBroken = numberedSteps[0].number !== 1;
      for (let index = 1; index < numberedSteps.length && !orderingBroken; index += 1) {
        const expected = numberedSteps[index - 1].number + 1;
        if (numberedSteps[index].number !== expected) {
          orderingBroken = true;
        }
      }

      if (!orderingBroken) return;

      pushIssue(issues, createRuleIssue({
        ruleId: 'workflow_ordering_rule',
        detectorId: 'L47-01',
        severity: 'high',
        description: `Workflow step numbering in "${heading.title}" is incomplete or out of order in ${documentIndex.name}.`,
        files: [documentIndex.name],
        section: heading.title,
        sectionSlug: heading.slug,
        lineNumber: numberedSteps[0].lineNumber,
        lineEnd: numberedSteps[numberedSteps.length - 1].lineNumber,
        evidence: numberedSteps.map((step) => `${step.number}. ${step.text}`).join('\n'),
        whyTriggered: 'The numbered workflow steps are not contiguous from step 1, which creates deterministic ordering ambiguity.',
        evidenceSpans: numberedSteps.map((step, index) => createEvidenceSpan({
          file: documentIndex.name,
          section: heading.title,
          sectionSlug: heading.slug,
          lineStart: step.lineNumber,
          role: index === 0 ? 'primary' : 'supporting',
          source: 'workflow_ordering_rule',
          excerpt: `${step.number}. ${step.text}`
        })),
        deterministicFix: 'Renumber the workflow steps into one contiguous deterministic sequence.',
        recommendedFix: 'Ensure numbered workflow sections start at 1 and increase by one without gaps or duplicates.'
      }));
    });
  });
}

function runTaskGraphCycleRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectTaskGraphSections(documentIndex).forEach((taskSection) => {
      const { heading, lineStart, lineEnd } = taskSection;
      const graphContext = buildTaskGraphContext(taskSection);
      if (graphContext.validEdges.length === 0) return;

      const cycle = findTaskGraphCycle(graphContext.adjacency);
      if (!cycle || cycle.length < 2) return;

      const cycleSteps = Array.from(new Set(cycle))
        .map((stepNumber) => graphContext.stepMap.get(stepNumber))
        .filter(Boolean);

      pushIssue(issues, createRuleIssue({
        ruleId: 'task_graph_cycle_rule',
        detectorId: 'L18-01',
        severity: 'high',
        description: `Task graph section "${heading?.title || documentIndex.name}" in ${documentIndex.name} is not acyclic and therefore fails deterministic DAG validation.`,
        files: [documentIndex.name],
        section: heading?.title || '',
        sectionSlug: heading?.slug || '',
        lineNumber: lineStart,
        lineEnd,
        evidence: cycleSteps.map((step) => `${step.number}. ${step.text}`).join('\n'),
        whyTriggered: `Explicit task dependencies create a cycle (${cycle.join(' -> ')}), so the documented task graph cannot be executed as a deterministic DAG.`,
        evidenceSpans: cycleSteps.map((step, index) => createEvidenceSpan({
          file: documentIndex.name,
          section: heading?.title || '',
          sectionSlug: heading?.slug || '',
          lineStart: step.lineNumber,
          role: index === 0 ? 'primary' : 'supporting',
          source: 'task_graph_cycle_rule',
          excerpt: `${step.number}. ${step.text}`
        })),
        deterministicFix: 'Remove or invert the cyclic dependency edges so the documented task graph becomes acyclic.',
        recommendedFix: 'Rewrite the step prerequisites so every task has a deterministic predecessor chain without looping back to an earlier step.'
      }));
    });
  });
}

function runTaskGraphDependencyOrderRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectTaskGraphSections(documentIndex).forEach((taskSection) => {
      const { heading, lineStart, lineEnd } = taskSection;
      const graphContext = buildTaskGraphContext(taskSection);
      if (graphContext.invalidForwardDependencies.length === 0) return;

      const evidenceSteps = Array.from(
        new Set(
          graphContext.invalidForwardDependencies.flatMap(({ dependencyNumber, stepNumber }) => [dependencyNumber, stepNumber])
        )
      )
        .map((stepNumber) => graphContext.stepMap.get(stepNumber))
        .filter(Boolean)
        .sort((left, right) => left.number - right.number);

      pushIssue(issues, createRuleIssue({
        ruleId: 'task_graph_dependency_order_rule',
        detectorId: 'L18-04',
        severity: 'medium',
        description: `Task graph section "${heading?.title || documentIndex.name}" in ${documentIndex.name} declares dependencies that violate the documented execution order.`,
        files: [documentIndex.name],
        section: heading?.title || '',
        sectionSlug: heading?.slug || '',
        lineNumber: lineStart,
        lineEnd,
        evidence: graphContext.invalidForwardDependencies
          .map(({ stepNumber, dependencyNumber }) => `Step ${stepNumber} depends on later step ${dependencyNumber}.`)
          .join('\n'),
        whyTriggered: 'One or more tasks depend on a numerically later step, which makes the stated step ordering non-deterministic.',
        evidenceSpans: evidenceSteps.map((step, index) => createEvidenceSpan({
          file: documentIndex.name,
          section: heading?.title || '',
          sectionSlug: heading?.slug || '',
          lineStart: step.lineNumber,
          role: index === 0 ? 'primary' : 'supporting',
          source: 'task_graph_dependency_order_rule',
          excerpt: `${step.number}. ${step.text}`
        })),
        deterministicFix: 'Renumber the tasks or rewrite the prerequisites so each task depends only on earlier prerequisite steps.',
        recommendedFix: 'Make the numbered task order match the declared dependency order.'
      }));
    });
  });
}

function runTaskGraphUnreachableNodeRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectTaskGraphSections(documentIndex).forEach((taskSection) => {
      const { heading, lineStart, lineEnd } = taskSection;
      const graphContext = buildTaskGraphContext(taskSection);
      if (graphContext.validEdges.length === 0 || graphContext.numberedSteps.length < 3) return;

      const firstStepNumber = Math.min(...graphContext.numberedSteps.map((step) => step.number));
      const connectedToPrimary = new Set([firstStepNumber]);
      const queue = [firstStepNumber];

      while (queue.length > 0) {
        const current = queue.shift();
        const neighbors = [
          ...(graphContext.adjacency.get(current) || []),
          ...(graphContext.reverseAdjacency.get(current) || [])
        ];

        neighbors.forEach((neighbor) => {
          if (connectedToPrimary.has(neighbor)) return;
          connectedToPrimary.add(neighbor);
          queue.push(neighbor);
        });
      }

      const disconnectedSteps = graphContext.numberedSteps.filter((step) => (
        step.number !== firstStepNumber
        && !connectedToPrimary.has(step.number)
      ));
      if (disconnectedSteps.length === 0) return;

      pushIssue(issues, createRuleIssue({
        ruleId: 'task_graph_unreachable_node_rule',
        detectorId: 'L20-01',
        severity: 'medium',
        description: `Task graph section "${heading?.title || documentIndex.name}" in ${documentIndex.name} contains disconnected task nodes outside the primary execution path.`,
        files: [documentIndex.name],
        section: heading?.title || '',
        sectionSlug: heading?.slug || '',
        lineNumber: lineStart,
        lineEnd,
        evidence: disconnectedSteps.map((step) => `${step.number}. ${step.text}`).join('\n'),
        whyTriggered: `Task steps ${disconnectedSteps.map((step) => step.number).join(', ')} are disconnected from the primary task path rooted at step ${firstStepNumber}, making them unreachable from the declared execution graph.`,
        evidenceSpans: disconnectedSteps.map((step, index) => createEvidenceSpan({
          file: documentIndex.name,
          section: heading?.title || '',
          sectionSlug: heading?.slug || '',
          lineStart: step.lineNumber,
          role: index === 0 ? 'primary' : 'supporting',
          source: 'task_graph_unreachable_node_rule',
          excerpt: `${step.number}. ${step.text}`
        })),
        deterministicFix: 'Connect every task node to the primary execution path or split disconnected tasks into a separate explicitly independent graph.',
        recommendedFix: 'Add the missing dependencies or rename the isolated steps as a separate workflow if they are intentionally independent.'
      }));
    });
  });
}

function runTaskGraphPriorityPropagationRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectTaskGraphSections(documentIndex).forEach((taskSection) => {
      const { heading, lineStart, lineEnd } = taskSection;
      const graphContext = buildTaskGraphContext(taskSection);
      if (graphContext.validEdges.length === 0) return;

      const priorityViolations = graphContext.validEdges.filter(({ dependencyNumber, stepNumber }) => {
        const dependencyStep = graphContext.stepMap.get(dependencyNumber);
        const dependentStep = graphContext.stepMap.get(stepNumber);
        return Number.isFinite(dependencyStep?.priority)
          && Number.isFinite(dependentStep?.priority)
          && dependentStep.priority < dependencyStep.priority;
      });
      if (priorityViolations.length === 0) return;

      const evidenceSteps = Array.from(
        new Set(priorityViolations.flatMap(({ dependencyNumber, stepNumber }) => [dependencyNumber, stepNumber]))
      )
        .map((stepNumber) => graphContext.stepMap.get(stepNumber))
        .filter(Boolean)
        .sort((left, right) => left.number - right.number);

      pushIssue(issues, createRuleIssue({
        ruleId: 'task_graph_priority_propagation_rule',
        detectorId: 'L10-07',
        severity: 'medium',
        description: `Task graph section "${heading?.title || documentIndex.name}" in ${documentIndex.name} contains priority inversions across dependent tasks.`,
        files: [documentIndex.name],
        section: heading?.title || '',
        sectionSlug: heading?.slug || '',
        lineNumber: lineStart,
        lineEnd,
        evidence: priorityViolations
          .map(({ dependencyNumber, stepNumber }) => {
            const dependencyStep = graphContext.stepMap.get(dependencyNumber);
            const dependentStep = graphContext.stepMap.get(stepNumber);
            return `Step ${stepNumber} (priority ${dependentStep.priority}) depends on step ${dependencyNumber} (priority ${dependencyStep.priority}).`;
          })
          .join('\n'),
        whyTriggered: 'A higher-priority task depends on a lower-priority prerequisite, which creates deterministic priority drift inside the task graph.',
        evidenceSpans: evidenceSteps.map((step, index) => createEvidenceSpan({
          file: documentIndex.name,
          section: heading?.title || '',
          sectionSlug: heading?.slug || '',
          lineStart: step.lineNumber,
          role: index === 0 ? 'primary' : 'supporting',
          source: 'task_graph_priority_propagation_rule',
          excerpt: `${step.number}. ${step.text}`
        })),
        deterministicFix: 'Raise the priority of prerequisite tasks or lower the dependent task priority so the dependency chain propagates priority consistently.',
        recommendedFix: 'Keep prerequisite tasks at least as urgent as the tasks that depend on them.'
      }));
    });
  });
}

function runTaskGraphMissingDependencyRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectTaskGraphSections(documentIndex).forEach((taskSection) => {
      const { heading, lineStart, lineEnd } = taskSection;
      const graphContext = buildTaskGraphContext(taskSection);
      if (graphContext.missingDependencies.length === 0) return;

      const evidenceSteps = Array.from(
        new Set(graphContext.missingDependencies.map(({ stepNumber }) => stepNumber))
      )
        .map((stepNumber) => graphContext.stepMap.get(stepNumber))
        .filter(Boolean)
        .sort((left, right) => left.number - right.number);

      pushIssue(issues, createRuleIssue({
        ruleId: 'task_graph_missing_dependency_rule',
        detectorId: 'L18-03',
        severity: 'high',
        description: `Task graph section "${heading?.title || documentIndex.name}" in ${documentIndex.name} references prerequisite steps that are not defined in the graph.`,
        files: [documentIndex.name],
        section: heading?.title || '',
        sectionSlug: heading?.slug || '',
        lineNumber: lineStart,
        lineEnd,
        evidence: graphContext.missingDependencies
          .map(({ stepNumber, dependencyNumber }) => `Step ${stepNumber} depends on missing step ${dependencyNumber}.`)
          .join('\n'),
        whyTriggered: 'The task graph names prerequisite steps that do not exist anywhere in the declared numbered task sequence.',
        evidenceSpans: evidenceSteps.map((step, index) => createEvidenceSpan({
          file: documentIndex.name,
          section: heading?.title || '',
          sectionSlug: heading?.slug || '',
          lineStart: step.lineNumber,
          role: index === 0 ? 'primary' : 'supporting',
          source: 'task_graph_missing_dependency_rule',
          excerpt: `${step.number}. ${step.text}`
        })),
        deterministicFix: 'Define the missing prerequisite steps or update the dependency references to point at real task nodes.',
        recommendedFix: 'Keep every dependency reference anchored to an existing numbered task in the same deterministic graph.'
      }));
    });
  });
}

function runTaskGraphOptionalRequiredConfusionRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectTaskGraphSections(documentIndex).forEach((taskSection) => {
      const { heading, lineStart, lineEnd } = taskSection;
      const graphContext = buildTaskGraphContext(taskSection);
      if (graphContext.optionalDependencySteps.length === 0 || graphContext.requiredDependencySteps.length === 0) return;

      const evidenceSteps = Array.from(
        new Map(
          [...graphContext.optionalDependencySteps, ...graphContext.requiredDependencySteps]
            .map((step) => [step.number, step])
        ).values()
      ).sort((left, right) => left.number - right.number);

      pushIssue(issues, createRuleIssue({
        ruleId: 'task_graph_optional_required_confusion_rule',
        detectorId: 'L18-05',
        severity: 'low',
        description: `Task graph section "${heading?.title || documentIndex.name}" in ${documentIndex.name} mixes optional and required dependency language without a deterministic boundary.`,
        files: [documentIndex.name],
        section: heading?.title || '',
        sectionSlug: heading?.slug || '',
        lineNumber: lineStart,
        lineEnd,
        evidence: evidenceSteps.map((step) => `${step.number}. ${step.text}`).join('\n'),
        whyTriggered: 'Some prerequisite lines describe dependencies as optional or best-effort while others describe them as mandatory, which weakens deterministic execution semantics.',
        evidenceSpans: evidenceSteps.map((step, index) => createEvidenceSpan({
          file: documentIndex.name,
          section: heading?.title || '',
          sectionSlug: heading?.slug || '',
          lineStart: step.lineNumber,
          role: index === 0 ? 'primary' : 'supporting',
          source: 'task_graph_optional_required_confusion_rule',
          excerpt: `${step.number}. ${step.text}`
        })),
        deterministicFix: 'Choose one dependency contract for each prerequisite edge: required, or explicitly optional with bounded fallback behavior.',
        recommendedFix: 'Rewrite the task graph so prerequisites are either mandatory or explicitly optional under named conditions, not both.'
      }));
    });
  });
}

function runDependencyOwnershipRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectTaskGraphSections(documentIndex).forEach((taskSection) => {
      const { heading, lineStart, lineEnd, sectionText } = taskSection;
      const graphContext = buildTaskGraphContext(taskSection);
      if (graphContext.validEdges.length === 0) return;
      if (OWNER_BOUNDARY_PATTERN.test(sectionText) || extractActorRoles(sectionText).length > 0) return;

      pushIssue(issues, createRuleIssue({
        ruleId: 'dependency_ownership_rule',
        detectorId: 'L18-13',
        severity: 'medium',
        description: `Task/dependency section "${heading?.title || documentIndex.name}" in ${documentIndex.name} defines dependency edges without an ownership boundary.`,
        files: [documentIndex.name],
        section: heading?.title || '',
        sectionSlug: heading?.slug || '',
        lineNumber: lineStart,
        lineEnd,
        evidence: sectionText.trim().slice(0, 500),
        whyTriggered: 'The section defines dependencies between tasks but never states who owns, approves, or is responsible for the dependent work chain.',
        evidenceSpans: [
          createEvidenceSpan({
            file: documentIndex.name,
            section: heading?.title || '',
            sectionSlug: heading?.slug || '',
            lineStart,
            lineEnd,
            source: 'dependency_ownership_rule',
            excerpt: buildLineExcerpt(documentIndex, lineStart, Math.min(lineEnd, lineStart + 8))
          })
        ],
        deterministicFix: 'Assign an owner or authority boundary for the dependent task graph.',
        recommendedFix: 'Document who owns the dependency chain and who is responsible when upstream prerequisites block downstream tasks.'
      }));
    });
  });
}

function runDependencyLifecycleRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectTaskGraphSections(documentIndex).forEach((taskSection) => {
      const { heading, lineStart, lineEnd, sectionText } = taskSection;
      const graphContext = buildTaskGraphContext(taskSection);
      if (graphContext.validEdges.length === 0) return;
      if (DEPENDENCY_LIFECYCLE_PATTERN.test(sectionText)) return;

      pushIssue(issues, createRuleIssue({
        ruleId: 'dependency_lifecycle_rule',
        detectorId: 'L18-11',
        severity: 'medium',
        description: `Task/dependency section "${heading?.title || documentIndex.name}" in ${documentIndex.name} omits dependency lifecycle semantics.`,
        files: [documentIndex.name],
        section: heading?.title || '',
        sectionSlug: heading?.slug || '',
        lineNumber: lineStart,
        lineEnd,
        evidence: sectionText.trim().slice(0, 500),
        whyTriggered: 'The section defines task dependencies but never states how those dependencies are introduced, updated, versioned, removed, or retired over time.',
        evidenceSpans: [
          createEvidenceSpan({
            file: documentIndex.name,
            section: heading?.title || '',
            sectionSlug: heading?.slug || '',
            lineStart,
            lineEnd,
            source: 'dependency_lifecycle_rule',
            excerpt: buildLineExcerpt(documentIndex, lineStart, Math.min(lineEnd, lineStart + 8))
          })
        ],
        deterministicFix: 'Document setup, change, and retirement semantics for the declared dependencies.',
        recommendedFix: 'Explain how dependent tasks are provisioned, updated, versioned, and removed instead of listing only the dependency edges.'
      }));
    });
  });
}

function runDependencyVersionAmbiguityRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectDependencySections(documentIndex).forEach(({ heading, sectionText, lineStart, lineEnd }) => {
      const versionReferences = buildDependencyVersionReferences(sectionText);
      const floatingMentions = Array.from(versionReferences.entries())
        .filter(([, versions]) => Array.from(versions).some((version) => FLOATING_VERSION_PATTERN.test(version)));
      if (floatingMentions.length === 0) return;

      const evidence = floatingMentions
        .map(([dependencyName, versions]) => `${dependencyName}: ${Array.from(versions).join(', ')}`)
        .join('\n');

      pushIssue(issues, createRuleIssue({
        ruleId: 'dependency_version_ambiguity_rule',
        detectorId: 'L18-08',
        severity: 'medium',
        description: `Dependency section "${heading?.title || documentIndex.name}" in ${documentIndex.name} uses floating dependency versions without a deterministic pin.`,
        files: [documentIndex.name],
        section: heading?.title || '',
        sectionSlug: heading?.slug || '',
        lineNumber: lineStart,
        lineEnd,
        evidence,
        whyTriggered: 'The dependency surface references versions such as latest, stable, or current, which makes downstream dependency resolution non-deterministic.',
        evidenceSpans: [
          createEvidenceSpan({
            file: documentIndex.name,
            section: heading?.title || '',
            sectionSlug: heading?.slug || '',
            lineStart,
            lineEnd,
            source: 'dependency_version_ambiguity_rule',
            excerpt: buildLineExcerpt(documentIndex, lineStart, Math.min(lineEnd, lineStart + 8))
          })
        ],
        deterministicFix: 'Replace floating dependency labels with explicit pinned versions or a named deterministic version-selection rule.',
        recommendedFix: 'Pin each dependency to an exact version instead of referring to latest/current/stable variants.'
      }));
    });
  });
}

function runTransitiveDependencyConflictRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectDependencySections(documentIndex).forEach(({ heading, sectionText, lineStart, lineEnd }) => {
      const versionReferences = buildDependencyVersionReferences(sectionText);
      const conflictingDependencies = Array.from(versionReferences.entries())
        .filter(([, versions]) => {
          const explicitVersions = Array.from(versions).filter((version) => EXPLICIT_VERSION_PATTERN.test(version));
          return new Set(explicitVersions).size > 1;
        });
      if (conflictingDependencies.length === 0) return;

      const evidence = conflictingDependencies
        .map(([dependencyName, versions]) => `${dependencyName}: ${Array.from(versions).join(', ')}`)
        .join('\n');

      pushIssue(issues, createRuleIssue({
        ruleId: 'transitive_dependency_conflict_rule',
        detectorId: 'L18-06',
        severity: 'high',
        description: `Dependency section "${heading?.title || documentIndex.name}" in ${documentIndex.name} assigns conflicting versions to the same dependency surface.`,
        files: [documentIndex.name],
        section: heading?.title || '',
        sectionSlug: heading?.slug || '',
        lineNumber: lineStart,
        lineEnd,
        evidence,
        whyTriggered: 'The same dependency name is paired with multiple explicit versions in one deterministic dependency surface, creating a transitive conflict risk.',
        evidenceSpans: [
          createEvidenceSpan({
            file: documentIndex.name,
            section: heading?.title || '',
            sectionSlug: heading?.slug || '',
            lineStart,
            lineEnd,
            source: 'transitive_dependency_conflict_rule',
            excerpt: buildLineExcerpt(documentIndex, lineStart, Math.min(lineEnd, lineStart + 8))
          })
        ],
        deterministicFix: 'Collapse each dependency surface to one canonical version or document a deterministic compatibility matrix.',
        recommendedFix: 'Remove competing version pins for the same dependency and state the single approved version chain.'
      }));
    });
  });
}

function runMissingExecutionTriggerRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectWorkflowSections(documentIndex).forEach(({ heading, lines, numberedSteps }) => {
      if (numberedSteps.length < 2) return;

      const sectionText = lines.map(({ text }) => text).join('\n');
      if (!ACTION_PATTERN.test(sectionText)) return;
      const firstStep = numberedSteps[0];
      const preambleText = lines
        .filter(({ lineNumber }) => lineNumber < firstStep.lineNumber)
        .map(({ text }) => text)
        .join('\n');
      const workflowStartSurface = [preambleText, firstStep.text].filter(Boolean).join('\n');
      if (EXECUTION_TRIGGER_PATTERN.test(workflowStartSurface)) return;

      pushIssue(issues, createRuleIssue({
        ruleId: 'missing_execution_trigger_rule',
        detectorId: 'L20-02',
        severity: 'high',
        description: `Workflow section "${heading.title}" in ${documentIndex.name} defines execution steps without a deterministic trigger.`,
        files: [documentIndex.name],
        section: heading.title,
        sectionSlug: heading.slug,
        lineNumber: heading.lineStart,
        lineEnd: heading.lineEnd,
        evidence: numberedSteps.map((step) => `${step.number}. ${step.text}`).join('\n'),
        whyTriggered: 'The workflow lists ordered actions, but never states what event, request, or condition starts the flow.',
        evidenceSpans: [
          createEvidenceSpan({
            file: documentIndex.name,
            section: heading.title,
            sectionSlug: heading.slug,
            lineStart: heading.lineStart,
            lineEnd: heading.lineEnd,
            source: 'missing_execution_trigger_rule',
            excerpt: buildLineExcerpt(documentIndex, heading.lineStart, Math.min(heading.lineEnd, heading.lineStart + 6))
          })
        ],
        deterministicFix: 'Name the exact trigger, request, or precondition that starts the workflow.',
        recommendedFix: 'Document what event or actor action initiates this sequence before step 1 begins.'
      }));
    });
  });
}

function runExecutionIdempotencyGapRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectWorkflowSections(documentIndex).forEach(({ heading, lines, numberedSteps }) => {
      if (numberedSteps.length < 2) return;

      const sectionText = lines.map(({ text }) => text).join('\n');
      if (!ACTION_PATTERN.test(sectionText)) return;
      if (!API_RETRY_PATTERN.test(sectionText)) return;
      if (API_IDEMPOTENCY_PATTERN.test(sectionText)) return;

      pushIssue(issues, createRuleIssue({
        ruleId: 'execution_idempotency_gap_rule',
        detectorId: 'L20-16',
        severity: 'critical',
        description: `Workflow section "${heading.title}" in ${documentIndex.name} retries execution without an idempotency contract.`,
        files: [documentIndex.name],
        section: heading.title,
        sectionSlug: heading.slug,
        lineNumber: heading.lineStart,
        lineEnd: heading.lineEnd,
        evidence: sectionText.trim().slice(0, 500),
        whyTriggered: 'The workflow allows retries or replays of mutating actions but never states how duplicate execution is prevented or safely absorbed.',
        evidenceSpans: [
          createEvidenceSpan({
            file: documentIndex.name,
            section: heading.title,
            sectionSlug: heading.slug,
            lineStart: heading.lineStart,
            lineEnd: heading.lineEnd,
            source: 'execution_idempotency_gap_rule',
            excerpt: buildLineExcerpt(documentIndex, heading.lineStart, Math.min(heading.lineEnd, heading.lineStart + 8))
          })
        ],
        deterministicFix: 'Define the idempotency key, deduplication rule, or safe-retry boundary for the retried workflow steps.',
        recommendedFix: 'Specify how repeated execution is recognized and made safe before allowing retries.'
      }));
    });
  });
}

function runExecutionOrderIndeterminismRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectWorkflowSections(documentIndex).forEach(({ heading, lines, numberedSteps }) => {
      if (numberedSteps.length < 2) return;

      const sectionText = lines.map(({ text }) => text).join('\n');
      if (!(EXECUTION_NON_DETERMINISM_PATTERN.test(sectionText) || PARALLEL_EXECUTION_PATTERN.test(sectionText))) return;
      if (RESOURCE_ORDERING_PATTERN.test(sectionText)) return;

      pushIssue(issues, createRuleIssue({
        ruleId: 'execution_order_indeterminism_rule',
        detectorId: 'L20-17',
        severity: 'high',
        description: `Workflow section "${heading.title}" in ${documentIndex.name} leaves execution order indeterminate.`,
        files: [documentIndex.name],
        section: heading.title,
        sectionSlug: heading.slug,
        lineNumber: heading.lineStart,
        lineEnd: heading.lineEnd,
        evidence: sectionText.trim().slice(0, 600),
        whyTriggered: 'The workflow permits parallel or any-order execution without a documented ordering or serialization boundary.',
        evidenceSpans: [
          createEvidenceSpan({
            file: documentIndex.name,
            section: heading.title,
            sectionSlug: heading.slug,
            lineStart: heading.lineStart,
            lineEnd: heading.lineEnd,
            source: 'execution_order_indeterminism_rule',
            excerpt: buildLineExcerpt(documentIndex, heading.lineStart, Math.min(heading.lineEnd, heading.lineStart + 8))
          })
        ],
        deterministicFix: 'State the exact execution order or the serialization rule that stabilizes the workflow.',
        recommendedFix: 'Replace any-order wording with a named queue, lock, or deterministic step-order contract.'
      }));
    });
  });
}

function runMissingRollbackRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectWorkflowSections(documentIndex).forEach(({ heading, lines, numberedSteps }) => {
      if (numberedSteps.length < 2) return;

      const sectionText = lines.map((entry) => entry.text).join('\n');
      if (!ACTION_PATTERN.test(sectionText) || ROLLBACK_PATTERN.test(sectionText)) {
        return;
      }

      pushIssue(issues, createRuleIssue({
        ruleId: 'missing_rollback_rule',
        detectorId: 'L9-09',
        severity: 'high',
        description: `Workflow section "${heading.title}" in ${documentIndex.name} performs state-changing actions without a rollback path.`,
        files: [documentIndex.name],
        section: heading.title,
        sectionSlug: heading.slug,
        lineNumber: heading.lineStart,
        lineEnd: heading.lineEnd,
        evidence: sectionText.trim().slice(0, 500),
        whyTriggered: 'The section contains state-changing workflow steps but no rollback, revert, undo, restore, or recovery step.',
        evidenceSpans: [
          createEvidenceSpan({
            file: documentIndex.name,
            section: heading.title,
            sectionSlug: heading.slug,
            lineStart: heading.lineStart,
            lineEnd: heading.lineEnd,
            source: 'missing_rollback_rule',
            excerpt: buildLineExcerpt(documentIndex, heading.lineStart, Math.min(heading.lineEnd, heading.lineStart + 6))
          })
        ],
        deterministicFix: 'Add a rollback or recovery step that clearly reverses the state-changing actions in this workflow.',
        recommendedFix: 'Document the exact rollback stage, trigger condition, and recovery boundary for this section.'
      }));
    });
  });
}

function runWorkflowExitCriteriaRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectWorkflowSections(documentIndex).forEach(({ heading, lines, numberedSteps }) => {
      if (numberedSteps.length < 2) return;

      const hasTerminalSignal = lines.some(({ text }) => TERMINAL_PATTERN.test(text));
      if (hasTerminalSignal) return;

      pushIssue(issues, createRuleIssue({
        ruleId: 'workflow_exit_rule',
        detectorId: 'L47-08',
        severity: 'medium',
        description: `Workflow section "${heading.title}" in ${documentIndex.name} does not define completion, abort, or failure exit criteria.`,
        files: [documentIndex.name],
        section: heading.title,
        sectionSlug: heading.slug,
        lineNumber: heading.lineStart,
        lineEnd: heading.lineEnd,
        evidence: numberedSteps.map((step) => `${step.number}. ${step.text}`).join('\n'),
        whyTriggered: 'The workflow has ordered steps but no explicit terminal, abort, success, or failure condition.',
        evidenceSpans: [
          createEvidenceSpan({
            file: documentIndex.name,
            section: heading.title,
            sectionSlug: heading.slug,
            lineStart: heading.lineStart,
            lineEnd: heading.lineEnd,
            source: 'workflow_exit_rule',
            excerpt: buildLineExcerpt(documentIndex, heading.lineStart, Math.min(heading.lineEnd, heading.lineStart + 6))
          })
        ],
        deterministicFix: 'Add explicit completion, abort, or failure conditions for the workflow.',
        recommendedFix: 'Document the exact exit criteria and final observable state for this workflow.'
      }));
    });
  });
}

function runGovernanceCheckpointRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectWorkflowSections(documentIndex).forEach(({ heading, lines, numberedSteps }) => {
      if (numberedSteps.length < 2) return;

      const sectionText = lines.map(({ text }) => text).join('\n');
      if (!ACTION_PATTERN.test(sectionText) || GOVERNANCE_CHECKPOINT_PATTERN.test(sectionText)) return;

      pushIssue(issues, createRuleIssue({
        ruleId: 'governance_checkpoint_rule',
        detectorId: 'L29-18',
        severity: 'critical',
        description: `Workflow section "${heading.title}" in ${documentIndex.name} performs execution steps without a documented governance checkpoint.`,
        files: [documentIndex.name],
        section: heading.title,
        sectionSlug: heading.slug,
        lineNumber: heading.lineStart,
        lineEnd: heading.lineEnd,
        evidence: sectionText.trim().slice(0, 500),
        whyTriggered: 'The workflow includes state-changing or execution-driving steps but never documents approval, review, verification, sign-off, or policy/gate checkpoints.',
        evidenceSpans: [
          createEvidenceSpan({
            file: documentIndex.name,
            section: heading.title,
            sectionSlug: heading.slug,
            lineStart: heading.lineStart,
            lineEnd: heading.lineEnd,
            source: 'governance_checkpoint_rule',
            excerpt: buildLineExcerpt(documentIndex, heading.lineStart, Math.min(heading.lineEnd, heading.lineStart + 8))
          })
        ],
        deterministicFix: 'Add an explicit governance checkpoint that states who reviews, approves, or verifies the workflow before mutation or release proceeds.',
        recommendedFix: 'Document the policy gate, approval authority, and the exact step where the checkpoint is enforced.'
      }));
    });
  });
}

function runGovernanceBypassRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectWorkflowSections(documentIndex).forEach(({ heading, lines, numberedSteps }) => {
      if (numberedSteps.length < 2) return;

      const sectionText = lines.map(({ text }) => text).join('\n');
      if (!ACTION_PATTERN.test(sectionText) || !GOVERNANCE_BYPASS_PATTERN.test(sectionText)) return;
      if (OVERRIDE_GUARD_PATTERN.test(sectionText) || AUDIT_TRAIL_PATTERN.test(sectionText)) return;

      pushIssue(issues, createRuleIssue({
        ruleId: 'governance_bypass_rule',
        detectorId: 'L29-15',
        severity: 'critical',
        description: `Workflow section "${heading.title}" in ${documentIndex.name} describes a governance bypass path without bounded controls.`,
        files: [documentIndex.name],
        section: heading.title,
        sectionSlug: heading.slug,
        lineNumber: heading.lineStart,
        lineEnd: heading.lineEnd,
        evidence: sectionText.trim().slice(0, 500),
        whyTriggered: 'The workflow allows bypass, override, approval-free, or direct-write behavior without documenting bounded override conditions, logging, or rollback controls.',
        evidenceSpans: [
          createEvidenceSpan({
            file: documentIndex.name,
            section: heading.title,
            sectionSlug: heading.slug,
            lineStart: heading.lineStart,
            lineEnd: heading.lineEnd,
            source: 'governance_bypass_rule',
            excerpt: buildLineExcerpt(documentIndex, heading.lineStart, Math.min(heading.lineEnd, heading.lineStart + 8))
          })
        ],
        deterministicFix: 'Bound the bypass path with explicit override conditions, audit logging, and rollback requirements or remove the bypass behavior.',
        recommendedFix: 'Document who can invoke the bypass, under what conditions, how it is recorded, and how the system is restored afterward.'
      }));
    });
  });
}

function runAuditTrailRequirementRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectWorkflowSections(documentIndex).forEach(({ heading, lines, numberedSteps }) => {
      if (numberedSteps.length < 2) return;

      const sectionText = lines.map(({ text }) => text).join('\n');
      if (!ACTION_PATTERN.test(sectionText) || AUDIT_TRAIL_PATTERN.test(sectionText)) return;

      pushIssue(issues, createRuleIssue({
        ruleId: 'audit_trail_requirement_rule',
        detectorId: 'L44-10',
        severity: 'critical',
        description: `Workflow section "${heading.title}" in ${documentIndex.name} mutates state without an audit trail requirement.`,
        files: [documentIndex.name],
        section: heading.title,
        sectionSlug: heading.slug,
        lineNumber: heading.lineStart,
        lineEnd: heading.lineEnd,
        evidence: sectionText.trim().slice(0, 500),
        whyTriggered: 'The workflow performs mutating or release-oriented actions but does not require receipts, audit logs, journals, or a comparable durable trace.',
        evidenceSpans: [
          createEvidenceSpan({
            file: documentIndex.name,
            section: heading.title,
            sectionSlug: heading.slug,
            lineStart: heading.lineStart,
            lineEnd: heading.lineEnd,
            source: 'audit_trail_requirement_rule',
            excerpt: buildLineExcerpt(documentIndex, heading.lineStart, Math.min(heading.lineEnd, heading.lineStart + 8))
          })
        ],
        deterministicFix: 'Require a durable audit trail or receipt for every mutating step in this workflow.',
        recommendedFix: 'Specify the exact log, receipt, or journal artifact that records the workflow actions and who can inspect it.'
      }));
    });
  });
}

function runExecutionOwnerBoundaryRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectWorkflowSections(documentIndex).forEach(({ heading, lines, numberedSteps }) => {
      if (numberedSteps.length < 2) return;

      const sectionText = lines.map(({ text }) => text).join('\n');
      const actorRoles = extractActorRoles(sectionText);
      if (!ACTION_PATTERN.test(sectionText) || actorRoles.length < 2 || OWNER_BOUNDARY_PATTERN.test(sectionText)) return;

      pushIssue(issues, createRuleIssue({
        ruleId: 'execution_owner_boundary_rule',
        detectorId: 'L44-13',
        severity: 'high',
        description: `Workflow section "${heading.title}" in ${documentIndex.name} involves multiple actors without a clear execution owner boundary.`,
        files: [documentIndex.name],
        section: heading.title,
        sectionSlug: heading.slug,
        lineNumber: heading.lineStart,
        lineEnd: heading.lineEnd,
        evidence: sectionText.trim().slice(0, 500),
        whyTriggered: `The workflow mentions multiple actors (${actorRoles.join(', ')}) but never states who owns or authorizes the mutating execution step.`,
        evidenceSpans: [
          createEvidenceSpan({
            file: documentIndex.name,
            section: heading.title,
            sectionSlug: heading.slug,
            lineStart: heading.lineStart,
            lineEnd: heading.lineEnd,
            source: 'execution_owner_boundary_rule',
            excerpt: buildLineExcerpt(documentIndex, heading.lineStart, Math.min(heading.lineEnd, heading.lineStart + 8))
          })
        ],
        deterministicFix: 'Assign a single authoritative execution owner or gatekeeping boundary for the workflow step that changes state.',
        recommendedFix: 'Document which actor is allowed to execute the step and who, if anyone, may only request or review it.'
      }));
    });
  });
}

function runControlPlaneOverrideConditionRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectDocumentSections(documentIndex).forEach(({ heading, sectionText, lineStart, lineEnd }) => {
      if (!GOVERNANCE_BYPASS_PATTERN.test(sectionText)) return;
      if (!(ACTION_PATTERN.test(sectionText) || /override|governance|authority|control/i.test(heading?.title || ''))) return;
      if (OVERRIDE_GUARD_PATTERN.test(sectionText)) return;

      pushIssue(issues, createRuleIssue({
        ruleId: 'control_plane_override_condition_rule',
        detectorId: 'L44-12',
        severity: 'high',
        description: `Section "${heading?.title || documentIndex.name}" in ${documentIndex.name} mentions override behavior without explicit control-plane conditions.`,
        files: [documentIndex.name],
        section: heading?.title || '',
        sectionSlug: heading?.slug || '',
        lineNumber: lineStart,
        lineEnd,
        evidence: sectionText.trim().slice(0, 500),
        whyTriggered: 'The section mentions override or bypass behavior but does not specify the allowed conditions, bounded lifetime, justification, or compensating control.',
        evidenceSpans: [
          createEvidenceSpan({
            file: documentIndex.name,
            section: heading?.title || '',
            sectionSlug: heading?.slug || '',
            lineStart,
            lineEnd,
            source: 'control_plane_override_condition_rule',
            excerpt: buildLineExcerpt(documentIndex, lineStart, Math.min(lineEnd, lineStart + 8))
          })
        ],
        deterministicFix: 'Define the exact override conditions, authority boundary, and compensating controls for any control-plane override path.',
        recommendedFix: 'State who can override, under what conditions, for how long, and what evidence or rollback is required.'
      }));
    });
  });
}

function runAuthorityDelegationAmbiguityRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectDocumentSections(documentIndex).forEach(({ heading, sectionText, lineStart, lineEnd }) => {
      const headingTitle = heading?.title || '';
      if (!DELEGATION_PATTERN.test(sectionText)) return;
      if (!(CONTROL_PLANE_PATTERN.test(headingTitle) || CONTROL_PLANE_PATTERN.test(sectionText) || ACTION_PATTERN.test(sectionText))) return;
      if (OWNER_BOUNDARY_PATTERN.test(sectionText) || OVERRIDE_GUARD_PATTERN.test(sectionText)) return;

      pushIssue(issues, createRuleIssue({
        ruleId: 'authority_delegation_ambiguity_rule',
        detectorId: 'L44-02',
        severity: 'high',
        description: `Section "${headingTitle || documentIndex.name}" in ${documentIndex.name} delegates authority without a bounded delegation rule.`,
        files: [documentIndex.name],
        section: headingTitle,
        sectionSlug: heading?.slug || '',
        lineNumber: lineStart,
        lineEnd,
        evidence: sectionText.trim().slice(0, 500),
        whyTriggered: 'The section delegates or hands off decision authority, but it does not specify who may delegate, who may receive that authority, or under what bounded conditions.',
        evidenceSpans: [
          createEvidenceSpan({
            file: documentIndex.name,
            section: headingTitle,
            sectionSlug: heading?.slug || '',
            lineStart,
            lineEnd,
            source: 'authority_delegation_ambiguity_rule',
            excerpt: buildLineExcerpt(documentIndex, lineStart, Math.min(lineEnd, lineStart + 8))
          })
        ],
        deterministicFix: 'Define the delegation source, receiving authority, and the bounded conditions that make the delegation valid.',
        recommendedFix: 'Document exactly who can delegate authority, to whom, and with what approval or expiry guard.'
      }));
    });
  });
}

function runPolicyEnforcementPointGapRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectDocumentSections(documentIndex).forEach(({ heading, sectionText, lineStart, lineEnd }) => {
      const headingTitle = heading?.title || '';
      if (!(CONTROL_PLANE_PATTERN.test(headingTitle) || CONTROL_PLANE_PATTERN.test(sectionText))) return;
      if (!(COMPLIANCE_GATE_PATTERN.test(sectionText) || ACTION_PATTERN.test(sectionText) || GOVERNANCE_BYPASS_PATTERN.test(sectionText))) return;
      if (ENFORCEMENT_PATH_PATTERN.test(sectionText) || GOVERNANCE_CHECKPOINT_PATTERN.test(sectionText)) return;

      pushIssue(issues, createRuleIssue({
        ruleId: 'policy_enforcement_point_gap_rule',
        detectorId: 'L44-05',
        severity: 'high',
        description: `Section "${headingTitle || documentIndex.name}" in ${documentIndex.name} defines control-plane policy without an enforcement point.`,
        files: [documentIndex.name],
        section: headingTitle,
        sectionSlug: heading?.slug || '',
        lineNumber: lineStart,
        lineEnd,
        evidence: sectionText.trim().slice(0, 600),
        whyTriggered: 'The section names authority, policy, or override behavior, but it never identifies the validator, gate, or enforcement point that actually blocks invalid execution.',
        evidenceSpans: [
          createEvidenceSpan({
            file: documentIndex.name,
            section: headingTitle,
            sectionSlug: heading?.slug || '',
            lineStart,
            lineEnd,
            source: 'policy_enforcement_point_gap_rule',
            excerpt: buildLineExcerpt(documentIndex, lineStart, Math.min(lineEnd, lineStart + 8))
          })
        ],
        deterministicFix: 'Name the concrete enforcement point, validator, or admission gate that applies the policy before execution proceeds.',
        recommendedFix: 'Document where the policy is enforced and what happens when validation fails.'
      }));
    });
  });
}

function runComplianceGateOmissionRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectDocumentSections(documentIndex).forEach(({ heading, sectionText, lineStart, lineEnd }) => {
      const headingTitle = heading?.title || '';
      const complianceMutationPattern = /\b(apply|applies|commit|commits|delete|deletes|deploy|deploys|execute|executes|export|exports|migrate|migrates|mutate|mutates|release|releases|remove|removes|write|writes)\b/i;
      if (!(COMPLIANCE_GATE_PATTERN.test(headingTitle) || COMPLIANCE_GATE_PATTERN.test(sectionText))) return;
      if (!(ACTION_PATTERN.test(sectionText) || complianceMutationPattern.test(sectionText))) return;
      if (GOVERNANCE_CHECKPOINT_PATTERN.test(sectionText)) return;

      pushIssue(issues, createRuleIssue({
        ruleId: 'compliance_gate_omission_rule',
        detectorId: 'L29-16',
        severity: 'critical',
        description: `Section "${headingTitle || documentIndex.name}" in ${documentIndex.name} describes compliance-governed execution without a documented compliance gate.`,
        files: [documentIndex.name],
        section: headingTitle,
        sectionSlug: heading?.slug || '',
        lineNumber: lineStart,
        lineEnd,
        evidence: sectionText.trim().slice(0, 600),
        whyTriggered: 'The section invokes compliance, regulatory, audit, or control requirements while also driving execution or mutation steps, but it never defines where the compliance gate is enforced.',
        evidenceSpans: [
          createEvidenceSpan({
            file: documentIndex.name,
            section: headingTitle,
            sectionSlug: heading?.slug || '',
            lineStart,
            lineEnd,
            source: 'compliance_gate_omission_rule',
            excerpt: buildLineExcerpt(documentIndex, lineStart, Math.min(lineEnd, lineStart + 8))
          })
        ],
        deterministicFix: 'Add an explicit compliance checkpoint that names the gate, authority, and approval condition before execution proceeds.',
        recommendedFix: 'Document the exact control/compliance validation step and where it blocks or permits the workflow.'
      }));
    });
  });
}

function runPolicyPriorityConflictRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectDocumentSections(documentIndex).forEach(({ heading, sectionText, lineStart, lineEnd }) => {
      const headingTitle = heading?.title || '';
      if (!(COMPLIANCE_GATE_PATTERN.test(headingTitle) || COMPLIANCE_GATE_PATTERN.test(sectionText))) return;
      if (!POLICY_CONFLICT_PATTERN.test(sectionText)) return;
      if (POLICY_PRIORITY_PATTERN.test(sectionText)) return;

      pushIssue(issues, createRuleIssue({
        ruleId: 'policy_priority_conflict_rule',
        detectorId: 'L29-11',
        severity: 'high',
        description: `Section "${headingTitle || documentIndex.name}" in ${documentIndex.name} contains competing policy paths without a priority rule.`,
        files: [documentIndex.name],
        section: headingTitle,
        sectionSlug: heading?.slug || '',
        lineNumber: lineStart,
        lineEnd,
        evidence: sectionText.trim().slice(0, 600),
        whyTriggered: 'The section mixes policy/compliance requirements with override, bypass, or emergency-path language, but it never says which rule wins when they conflict.',
        evidenceSpans: [
          createEvidenceSpan({
            file: documentIndex.name,
            section: headingTitle,
            sectionSlug: heading?.slug || '',
            lineStart,
            lineEnd,
            source: 'policy_priority_conflict_rule',
            excerpt: buildLineExcerpt(documentIndex, lineStart, Math.min(lineEnd, lineStart + 8))
          })
        ],
        deterministicFix: 'Define a precedence rule for conflicting policy, compliance, and override paths.',
        recommendedFix: 'State which policy path takes precedence and what conditions permit an exception.'
      }));
    });
  });
}

function runEnforcementPathGapRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectDocumentSections(documentIndex).forEach(({ heading, sectionText, lineStart, lineEnd }) => {
      const headingTitle = heading?.title || '';
      if (!(COMPLIANCE_GATE_PATTERN.test(headingTitle) || COMPLIANCE_GATE_PATTERN.test(sectionText))) return;
      if (!(ACTION_PATTERN.test(sectionText) || POLICY_CONFLICT_PATTERN.test(sectionText) || GOVERNANCE_CHECKPOINT_PATTERN.test(sectionText))) return;
      if (ENFORCEMENT_PATH_PATTERN.test(sectionText)) return;

      pushIssue(issues, createRuleIssue({
        ruleId: 'enforcement_path_gap_rule',
        detectorId: 'L29-17',
        severity: 'high',
        description: `Section "${headingTitle || documentIndex.name}" in ${documentIndex.name} names governance policy without an enforcement path.`,
        files: [documentIndex.name],
        section: headingTitle,
        sectionSlug: heading?.slug || '',
        lineNumber: lineStart,
        lineEnd,
        evidence: sectionText.trim().slice(0, 600),
        whyTriggered: 'The section defines a policy, compliance, or control obligation, but it never says what validator, gate, or rejection path enforces it.',
        evidenceSpans: [
          createEvidenceSpan({
            file: documentIndex.name,
            section: headingTitle,
            sectionSlug: heading?.slug || '',
            lineStart,
            lineEnd,
            source: 'enforcement_path_gap_rule',
            excerpt: buildLineExcerpt(documentIndex, lineStart, Math.min(lineEnd, lineStart + 8))
          })
        ],
        deterministicFix: 'Document the explicit enforcement path, including the validating actor or system and the failure behavior when policy is not met.',
        recommendedFix: 'Add the concrete enforcement step that blocks execution when the policy fails.'
      }));
    });
  });
}

function runRetryBackoffPolicyRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectDocumentSections(documentIndex).forEach(({ heading, sectionText, lineStart, lineEnd }) => {
      const headingTitle = heading?.title || '';
      if (!API_RETRY_PATTERN.test(sectionText)) return;
      if (!(ACTION_PATTERN.test(sectionText) || WORKFLOW_HEADING_PATTERN.test(headingTitle) || /\b(retry|recovery|failure|execution|pipeline|flow)\b/i.test(headingTitle))) return;
      if (BACKOFF_POLICY_PATTERN.test(sectionText)) return;

      pushIssue(issues, createRuleIssue({
        ruleId: 'retry_backoff_policy_rule',
        detectorId: 'L43-05',
        severity: 'medium',
        description: `Section "${headingTitle || documentIndex.name}" in ${documentIndex.name} allows retries without a deterministic backoff policy.`,
        files: [documentIndex.name],
        section: headingTitle,
        sectionSlug: heading?.slug || '',
        lineNumber: lineStart,
        lineEnd,
        evidence: sectionText.trim().slice(0, 500),
        whyTriggered: 'The section documents retry behavior but does not define delays, backoff, jitter, or retry-budget limits.',
        evidenceSpans: [
          createEvidenceSpan({
            file: documentIndex.name,
            section: headingTitle,
            sectionSlug: heading?.slug || '',
            lineStart,
            lineEnd,
            source: 'retry_backoff_policy_rule',
            excerpt: buildLineExcerpt(documentIndex, lineStart, Math.min(lineEnd, lineStart + 8))
          })
        ],
        deterministicFix: 'Define the retry limit, backoff strategy, and any jitter or cooldown parameters for the retried action.',
        recommendedFix: 'Document the exact retry budget and timing sequence instead of mentioning retries abstractly.'
      }));
    });
  });
}

function runParallelResourceOrderRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectDocumentSections(documentIndex).forEach(({ heading, sectionText, lineStart, lineEnd }) => {
      if (!PARALLEL_EXECUTION_PATTERN.test(sectionText)) return;
      if (!(WORKFLOW_HEADING_PATTERN.test(heading?.title || '') || TASK_GRAPH_HEADING_PATTERN.test(heading?.title || '') || ACTION_PATTERN.test(sectionText))) return;
      if (RESOURCE_ORDERING_PATTERN.test(sectionText)) return;

      pushIssue(issues, createRuleIssue({
        ruleId: 'parallel_resource_order_rule',
        detectorId: 'L43-08',
        severity: 'high',
        description: `Section "${heading?.title || documentIndex.name}" in ${documentIndex.name} allows parallel execution without a deterministic resource-ordering rule.`,
        files: [documentIndex.name],
        section: heading?.title || '',
        sectionSlug: heading?.slug || '',
        lineNumber: lineStart,
        lineEnd,
        evidence: sectionText.trim().slice(0, 500),
        whyTriggered: 'The section allows concurrent or parallel execution but never defines serialization, queueing, exclusivity, or a comparable resource-ordering contract.',
        evidenceSpans: [
          createEvidenceSpan({
            file: documentIndex.name,
            section: heading?.title || '',
            sectionSlug: heading?.slug || '',
            lineStart,
            lineEnd,
            source: 'parallel_resource_order_rule',
            excerpt: buildLineExcerpt(documentIndex, lineStart, Math.min(lineEnd, lineStart + 8))
          })
        ],
        deterministicFix: 'Define how parallel work is serialized, queued, or otherwise ordered at the shared-resource boundary.',
        recommendedFix: 'Document queueing, lock order, or exclusivity rules so concurrent execution cannot race on shared resources.'
      }));
    });
  });
}

function runDeadlockLivelockRiskRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectDocumentSections(documentIndex).forEach(({ heading, sectionText, lineStart, lineEnd }) => {
      const headingTitle = heading?.title || '';
      if (!(PARALLEL_EXECUTION_PATTERN.test(sectionText) || TASK_GRAPH_HEADING_PATTERN.test(headingTitle))) return;
      if (!DEADLOCK_RISK_PATTERN.test(sectionText)) return;
      if (DEADLOCK_MITIGATION_PATTERN.test(sectionText)) return;

      pushIssue(issues, createRuleIssue({
        ruleId: 'deadlock_livelock_risk_rule',
        detectorId: 'L43-03',
        severity: 'critical',
        description: `Section "${headingTitle || documentIndex.name}" in ${documentIndex.name} creates a lock/wait dependency without deadlock or livelock mitigation.`,
        files: [documentIndex.name],
        section: headingTitle,
        sectionSlug: heading?.slug || '',
        lineNumber: lineStart,
        lineEnd,
        evidence: sectionText.trim().slice(0, 600),
        whyTriggered: 'The section allows concurrent or dependency-driven execution over locks, waits, or exclusive resources, but it never documents timeout, ordering, or fallback mitigation.',
        evidenceSpans: [
          createEvidenceSpan({
            file: documentIndex.name,
            section: headingTitle,
            sectionSlug: heading?.slug || '',
            lineStart,
            lineEnd,
            source: 'deadlock_livelock_risk_rule',
            excerpt: buildLineExcerpt(documentIndex, lineStart, Math.min(lineEnd, lineStart + 8))
          })
        ],
        deterministicFix: 'Add timeout, ordering, try-lock, or equivalent mitigation rules for the concurrent lock/wait path.',
        recommendedFix: 'Document how the system avoids deadlock or livelock when work waits on exclusive resources.'
      }));
    });
  });
}

function runExecutionDeterminismGapRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectDocumentSections(documentIndex).forEach(({ heading, sectionText, lineStart, lineEnd }) => {
      const headingTitle = heading?.title || '';
      const executionLikeSection = (
        WORKFLOW_HEADING_PATTERN.test(headingTitle)
        || TASK_GRAPH_HEADING_PATTERN.test(headingTitle)
        || ACTION_PATTERN.test(sectionText)
      );
      if (!executionLikeSection) return;
      if (!EXECUTION_NON_DETERMINISM_PATTERN.test(sectionText)) return;
      if (RESOURCE_ORDERING_PATTERN.test(sectionText) || REPLAY_REQUIREMENT_PATTERN.test(sectionText)) return;

      pushIssue(issues, createRuleIssue({
        ruleId: 'execution_determinism_gap_rule',
        detectorId: 'L43-09',
        severity: 'high',
        description: `Section "${headingTitle || documentIndex.name}" in ${documentIndex.name} describes execution ordering in non-deterministic terms without a stabilizing invariant.`,
        files: [documentIndex.name],
        section: headingTitle,
        sectionSlug: heading?.slug || '',
        lineNumber: lineStart,
        lineEnd,
        evidence: sectionText.trim().slice(0, 600),
        whyTriggered: 'The section allows execution in any order, opportunistically, or on a best-effort basis without defining a deterministic scheduler, ordering rule, or replay boundary.',
        evidenceSpans: [
          createEvidenceSpan({
            file: documentIndex.name,
            section: headingTitle,
            sectionSlug: heading?.slug || '',
            lineStart,
            lineEnd,
            source: 'execution_determinism_gap_rule',
            excerpt: buildLineExcerpt(documentIndex, lineStart, Math.min(lineEnd, lineStart + 8))
          })
        ],
        deterministicFix: 'Specify the deterministic ordering, scheduling, or replay contract that resolves the non-deterministic execution wording.',
        recommendedFix: 'Replace vague execution wording with an explicit sequencing or scheduling invariant.'
      }));
    });
  });
}

function runOutputDeterminismGapRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectDocumentSections(documentIndex).forEach(({ heading, sectionText, lineStart, lineEnd }) => {
      const headingTitle = heading?.title || '';
      if (!(OUTPUT_SURFACE_PATTERN.test(sectionText) || /output|result|report/i.test(headingTitle))) return;
      if (!(PARALLEL_EXECUTION_PATTERN.test(sectionText) || EXECUTION_NON_DETERMINISM_PATTERN.test(sectionText))) return;
      if (OUTPUT_ORDERING_PATTERN.test(sectionText) || RESOURCE_ORDERING_PATTERN.test(sectionText)) return;

      pushIssue(issues, createRuleIssue({
        ruleId: 'output_determinism_gap_rule',
        detectorId: 'L43-12',
        severity: 'high',
        description: `Section "${headingTitle || documentIndex.name}" in ${documentIndex.name} leaves output ordering non-deterministic.`,
        files: [documentIndex.name],
        section: headingTitle,
        sectionSlug: heading?.slug || '',
        lineNumber: lineStart,
        lineEnd,
        evidence: sectionText.trim().slice(0, 600),
        whyTriggered: 'The section describes results, reports, or emitted records in parallel or any-order terms without a stable output-order contract.',
        evidenceSpans: [
          createEvidenceSpan({
            file: documentIndex.name,
            section: headingTitle,
            sectionSlug: heading?.slug || '',
            lineStart,
            lineEnd,
            source: 'output_determinism_gap_rule',
            excerpt: buildLineExcerpt(documentIndex, lineStart, Math.min(lineEnd, lineStart + 8))
          })
        ],
        deterministicFix: 'Specify the deterministic output order, canonical sorting rule, or stable emission contract for the result set.',
        recommendedFix: 'Document how outputs are ordered so the same execution produces the same externally visible result ordering.'
      }));
    });
  });
}

function runDeterministicReplayRequirementsRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectWorkflowSections(documentIndex).forEach(({ heading, lines, numberedSteps }) => {
      if (numberedSteps.length < 2) return;

      const sectionText = lines.map(({ text }) => text).join('\n');
      if (!ACTION_PATTERN.test(sectionText) || REPLAY_REQUIREMENT_PATTERN.test(sectionText)) return;

      pushIssue(issues, createRuleIssue({
        ruleId: 'deterministic_replay_requirements_rule',
        detectorId: 'L43-13',
        severity: 'high',
        description: `Workflow section "${heading.title}" in ${documentIndex.name} lacks deterministic replay prerequisites for its execution path.`,
        files: [documentIndex.name],
        section: heading.title,
        sectionSlug: heading.slug,
        lineNumber: heading.lineStart,
        lineEnd: heading.lineEnd,
        evidence: sectionText.trim().slice(0, 500),
        whyTriggered: 'The workflow changes state or executes release-oriented steps but does not define replay inputs, receipts, or reproducible re-run prerequisites.',
        evidenceSpans: [
          createEvidenceSpan({
            file: documentIndex.name,
            section: heading.title,
            sectionSlug: heading.slug,
            lineStart: heading.lineStart,
            lineEnd: heading.lineEnd,
            source: 'deterministic_replay_requirements_rule',
            excerpt: buildLineExcerpt(documentIndex, heading.lineStart, Math.min(heading.lineEnd, heading.lineStart + 8))
          })
        ],
        deterministicFix: 'Document the receipts, replay inputs, or rerun prerequisites needed to reproduce this workflow deterministically.',
        recommendedFix: 'Specify the replay artifact set, stable inputs, or execution journal required for a reproducible rerun.'
      }));
    });
  });
}

function runMissingTerminalStateRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectStateTransitionGroups(documentIndex).forEach(({ section, transitions, lineStart, lineEnd }) => {
      if (!Array.isArray(transitions) || transitions.length === 0) return;

      const uniqueTokens = Array.from(new Set(
        transitions.flatMap((transition) => transition.tokens.map((token) => token.toUpperCase()))
      ));
      if (uniqueTokens.length < 2) return;
      if (uniqueTokens.some((token) => TERMINAL_STATE_TOKEN_PATTERN.test(token))) return;

      pushIssue(issues, createRuleIssue({
        ruleId: 'missing_terminal_state_rule',
        detectorId: 'L16-04',
        severity: 'medium',
        description: `State transitions in ${documentIndex.name}${section?.title ? ` section "${section.title}"` : ''} do not define a terminal state.`,
        files: [documentIndex.name],
        section: section?.title || '',
        sectionSlug: section?.slug || '',
        lineNumber: lineStart,
        lineEnd,
        evidence: transitions.map((transition) => `${documentIndex.name}:${transition.lineNumber} ${transition.line}`).join('\n'),
        whyTriggered: 'The state-transition notation introduces multiple states, but none of the state symbols represent a terminal success, failure, abort, or completed exit state.',
        evidenceSpans: transitions.slice(0, 5).map((transition, index) => createEvidenceSpan({
          file: documentIndex.name,
          section: section?.title || '',
          sectionSlug: section?.slug || '',
          lineStart: transition.lineNumber,
          role: index === 0 ? 'primary' : 'supporting',
          source: 'missing_terminal_state_rule',
          excerpt: transition.line
        })),
        deterministicFix: 'Add explicit terminal states and show how the documented transitions reach them.',
        recommendedFix: 'Document terminal success, failure, or abort states for this state machine and connect the existing transitions to those endpoints.'
      }));
    });
  });
}

function runCommitHashBindingRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectWorkflowSections(documentIndex).forEach(({ heading, lines, numberedSteps }) => {
      if (numberedSteps.length < 2) return;

      const sectionText = lines.map(({ text }) => text).join('\n');
      if (!ACTION_PATTERN.test(sectionText) || COMMIT_HASH_PATTERN.test(sectionText)) return;

      pushIssue(issues, createRuleIssue({
        ruleId: 'commit_hash_binding_rule',
        detectorId: 'L45-03',
        severity: 'high',
        description: `Workflow section "${heading.title}" in ${documentIndex.name} changes state without commit-hash or revision binding.`,
        files: [documentIndex.name],
        section: heading.title,
        sectionSlug: heading.slug,
        lineNumber: heading.lineStart,
        lineEnd: heading.lineEnd,
        evidence: sectionText.trim().slice(0, 500),
        whyTriggered: 'The workflow performs state-changing or release-oriented actions but never binds the decision or mutation to a commit hash, revision id, change id, or equivalent immutable artifact reference.',
        evidenceSpans: [
          createEvidenceSpan({
            file: documentIndex.name,
            section: heading.title,
            sectionSlug: heading.slug,
            lineStart: heading.lineStart,
            lineEnd: heading.lineEnd,
            source: 'commit_hash_binding_rule',
            excerpt: buildLineExcerpt(documentIndex, heading.lineStart, Math.min(heading.lineEnd, heading.lineStart + 8))
          })
        ],
        deterministicFix: 'Bind the workflow mutation or decision to an immutable commit, revision, or artifact identifier.',
        recommendedFix: 'Document the exact commit hash, revision id, or artifact digest that governs the state-changing step.'
      }));
    });
  });
}

function runStateTransitionPreconditionRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectStateTransitionGroups(documentIndex).forEach(({ section, transitions, lineStart, lineEnd, sectionText }) => {
      if (!Array.isArray(transitions) || transitions.length === 0 || PRECONDITION_PATTERN.test(sectionText)) return;

      pushIssue(issues, createRuleIssue({
        ruleId: 'state_transition_precondition_rule',
        detectorId: 'L45-15',
        severity: 'high',
        description: `State transitions in ${documentIndex.name}${section?.title ? ` section "${section.title}"` : ''} do not define transition preconditions.`,
        files: [documentIndex.name],
        section: section?.title || '',
        sectionSlug: section?.slug || '',
        lineNumber: lineStart,
        lineEnd,
        evidence: transitions.map((transition) => `${documentIndex.name}:${transition.lineNumber} ${transition.line}`).join('\n'),
        whyTriggered: 'The state machine documents transitions, but it never states the guards, preconditions, or required prior conditions that permit those transitions.',
        evidenceSpans: transitions.slice(0, 5).map((transition, index) => createEvidenceSpan({
          file: documentIndex.name,
          section: section?.title || '',
          sectionSlug: section?.slug || '',
          lineStart: transition.lineNumber,
          role: index === 0 ? 'primary' : 'supporting',
          source: 'state_transition_precondition_rule',
          excerpt: transition.line
        })),
        deterministicFix: 'Add explicit guards or preconditions for each documented state transition.',
        recommendedFix: 'Specify the exact state, event, or condition that must already hold before each transition may occur.'
      }));
    });
  });
}

function runStateTransitionPostconditionRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectStateTransitionGroups(documentIndex).forEach(({ section, transitions, lineStart, lineEnd, sectionText }) => {
      if (!Array.isArray(transitions) || transitions.length === 0 || POSTCONDITION_PATTERN.test(sectionText)) return;

      pushIssue(issues, createRuleIssue({
        ruleId: 'state_transition_postcondition_rule',
        detectorId: 'L45-16',
        severity: 'high',
        description: `State transitions in ${documentIndex.name}${section?.title ? ` section "${section.title}"` : ''} do not define transition postconditions.`,
        files: [documentIndex.name],
        section: section?.title || '',
        sectionSlug: section?.slug || '',
        lineNumber: lineStart,
        lineEnd,
        evidence: transitions.map((transition) => `${documentIndex.name}:${transition.lineNumber} ${transition.line}`).join('\n'),
        whyTriggered: 'The state machine documents transitions, but it never states the resulting persisted state, emitted effect, or post-transition guarantee.',
        evidenceSpans: transitions.slice(0, 5).map((transition, index) => createEvidenceSpan({
          file: documentIndex.name,
          section: section?.title || '',
          sectionSlug: section?.slug || '',
          lineStart: transition.lineNumber,
          role: index === 0 ? 'primary' : 'supporting',
          source: 'state_transition_postcondition_rule',
          excerpt: transition.line
        })),
        deterministicFix: 'Define the resulting state or postcondition for each documented transition.',
        recommendedFix: 'Document the exact post-transition state, effect, or committed outcome that follows each transition.'
      }));
    });
  });
}

function runTransitionDeterminismFailureRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectStateTransitionGroups(documentIndex).forEach(({ section, transitions, lineStart, lineEnd, sectionText }) => {
      if (!Array.isArray(transitions) || transitions.length < 2) return;
      if (TRANSITION_CONDITION_PATTERN.test(sectionText)) return;

      const outgoingTransitions = new Map();
      transitions.forEach((transition) => {
        const source = transition.tokens[0];
        const target = transition.tokens[transition.tokens.length - 1];
        if (!source || !target || source === target) return;
        if (!outgoingTransitions.has(source)) {
          outgoingTransitions.set(source, []);
        }
        outgoingTransitions.get(source).push({
          source,
          target,
          lineNumber: transition.lineNumber,
          line: transition.line
        });
      });

      const ambiguousTransitions = Array.from(outgoingTransitions.values()).find((entries) => {
        const uniqueTargets = Array.from(new Set(entries.map((entry) => entry.target)));
        return uniqueTargets.length > 1;
      });
      if (!ambiguousTransitions) return;

      pushIssue(issues, createRuleIssue({
        ruleId: 'transition_determinism_failure_rule',
        detectorId: 'L43-11',
        severity: 'critical',
        description: `State transitions in ${documentIndex.name}${section?.title ? ` section "${section.title}"` : ''} branch from the same source state without a deterministic guard.`,
        files: [documentIndex.name],
        section: section?.title || '',
        sectionSlug: section?.slug || '',
        lineNumber: lineStart,
        lineEnd,
        evidence: ambiguousTransitions.map((transition) => `${documentIndex.name}:${transition.lineNumber} ${transition.line}`).join('\n'),
        whyTriggered: `State ${ambiguousTransitions[0].source} transitions to multiple targets (${Array.from(new Set(ambiguousTransitions.map((transition) => transition.target))).join(', ')}) without any documented condition or guard.`,
        evidenceSpans: ambiguousTransitions.map((transition, index) => createEvidenceSpan({
          file: documentIndex.name,
          section: section?.title || '',
          sectionSlug: section?.slug || '',
          lineStart: transition.lineNumber,
          role: index === 0 ? 'primary' : 'supporting',
          source: 'transition_determinism_failure_rule',
          excerpt: transition.line
        })),
        deterministicFix: 'Add explicit guards or conditions that decide which outgoing transition is valid from the shared source state.',
        recommendedFix: 'Keep each source state deterministic by documenting a unique transition rule or naming the mutually exclusive conditions.'
      }));
    });
  });
}

function runUiStateMappingContractRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectDocumentSections(documentIndex).forEach(({ heading, sectionText, lineStart, lineEnd }) => {
      if (!UI_COMPONENT_PATTERN.test(sectionText) || UI_STATE_PATTERN.test(sectionText) || /(->|\u2192)/.test(sectionText)) return;

      pushIssue(issues, createRuleIssue({
        ruleId: 'ui_state_mapping_contract_rule',
        detectorId: 'L42-03',
        severity: 'high',
        description: `Section "${heading?.title || documentIndex.name}" in ${documentIndex.name} describes UI surfaces without mapping them to system state.`,
        files: [documentIndex.name],
        section: heading?.title || '',
        sectionSlug: heading?.slug || '',
        lineNumber: lineStart,
        lineEnd,
        evidence: sectionText.trim().slice(0, 500),
        whyTriggered: 'The section names UI components such as buttons, forms, dialogs, or screens but does not describe the loading, success, error, pending, or state-projection contract behind them.',
        evidenceSpans: [
          createEvidenceSpan({
            file: documentIndex.name,
            section: heading?.title || '',
            sectionSlug: heading?.slug || '',
            lineStart,
            lineEnd,
            source: 'ui_state_mapping_contract_rule',
            excerpt: buildLineExcerpt(documentIndex, lineStart, Math.min(lineEnd, lineStart + 8))
          })
        ],
        deterministicFix: 'Map each documented UI surface to the backend or workflow state it represents, including failure and loading states where relevant.',
        recommendedFix: 'Add explicit status, state, or projection rules for the documented UI elements instead of describing them as presentation-only controls.'
      }));
    });
  });
}

function runIntentAmbiguityRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectDocumentSections(documentIndex).forEach(({ heading, sectionText, lineStart, lineEnd }) => {
      const headingTitle = heading?.title || '';
      if (!OBJECTIVE_HEADING_PATTERN.test(headingTitle) && !/\b(objective|goal|intent|purpose|outcome)\b/i.test(sectionText)) return;
      if (!(VAGUE_REQUIREMENT_PATTERN.test(sectionText) || OBJECTIVE_VAGUE_PATTERN.test(sectionText))) return;

      pushIssue(issues, createRuleIssue({
        ruleId: 'intent_ambiguity_rule',
        detectorId: 'L10-10',
        severity: 'medium',
        description: `Intent section "${headingTitle || documentIndex.name}" in ${documentIndex.name} uses ambiguous outcome language that weakens user-intent interpretation.`,
        files: [documentIndex.name],
        section: headingTitle,
        sectionSlug: heading?.slug || '',
        lineNumber: lineStart,
        lineEnd,
        evidence: sectionText.trim().slice(0, 500),
        whyTriggered: 'The objective or intent section relies on subjective wording such as "improve", "simple", or similarly vague terms without bounded success criteria.',
        evidenceSpans: [
          createEvidenceSpan({
            file: documentIndex.name,
            section: headingTitle,
            sectionSlug: heading?.slug || '',
            lineStart,
            lineEnd,
            source: 'intent_ambiguity_rule',
            excerpt: buildLineExcerpt(documentIndex, lineStart, Math.min(lineEnd, lineStart + 8))
          })
        ],
        deterministicFix: 'Rewrite the objective into measurable user-intent outcomes with explicit scope or success conditions.',
        recommendedFix: 'Replace subjective experience language with bounded user-intent outcomes or acceptance criteria.'
      }));
    });
  });
}

function runChangeScopeBoundaryRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectDocumentSections(documentIndex).forEach(({ heading, sectionText, lineStart, lineEnd }) => {
      const headingTitle = heading?.title || '';
      const relevantSection = CHANGE_SCOPE_HEADING_PATTERN.test(headingTitle)
        || (CHANGE_ACTION_PATTERN.test(sectionText) && /\b(this (?:change|update|migration|rollout|refactor)|dashboard|workflow|ui|approval|state|system)\b/i.test(sectionText));
      if (!relevantSection || SCOPE_BOUNDARY_PATTERN.test(sectionText)) return;

      pushIssue(issues, createRuleIssue({
        ruleId: 'change_scope_boundary_rule',
        detectorId: 'L10-01',
        severity: 'medium',
        description: `Change-oriented section "${headingTitle || documentIndex.name}" in ${documentIndex.name} lacks an explicit modification boundary.`,
        files: [documentIndex.name],
        section: headingTitle,
        sectionSlug: heading?.slug || '',
        lineNumber: lineStart,
        lineEnd,
        evidence: sectionText.trim().slice(0, 500),
        whyTriggered: 'The section describes updates or modifications but never states what is in scope, out of scope, unchanged, or otherwise bounded.',
        evidenceSpans: [
          createEvidenceSpan({
            file: documentIndex.name,
            section: headingTitle,
            sectionSlug: heading?.slug || '',
            lineStart,
            lineEnd,
            source: 'change_scope_boundary_rule',
            excerpt: buildLineExcerpt(documentIndex, lineStart, Math.min(lineEnd, lineStart + 8))
          })
        ],
        deterministicFix: 'Add explicit in-scope, out-of-scope, or unchanged boundaries for the documented modification.',
        recommendedFix: 'Document exactly which surfaces, states, or workflows are affected and which ones are intentionally not changed.'
      }));
    });
  });
}

function runUserIntentConsistencyRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    const sections = collectDocumentSections(documentIndex);
    const objectiveSections = sections.filter(({ heading, sectionText }) => (
      OBJECTIVE_HEADING_PATTERN.test(heading?.title || '')
      || /\b(objective|goal|intent|purpose|outcome)\b/i.test(sectionText)
    ));
    if (objectiveSections.length === 0) return;

    objectiveSections.forEach((objectiveSection) => {
      const objectiveMode = classifyInteractionMode(objectiveSection.sectionText);
      const objectiveCommitsAutomatic = objectiveMode.automatic || objectiveMode.noApproval || objectiveMode.selfServe;
      const objectiveCommitsManual = objectiveMode.manual || objectiveMode.approvalRequired;
      if (!objectiveCommitsAutomatic && !objectiveCommitsManual) return;

      const conflictingSection = sections.find((section) => {
        if (section === objectiveSection) return false;
        const sectionMode = classifyInteractionMode(section.sectionText);
        if (!(sectionMode.automatic || sectionMode.manual || sectionMode.approvalRequired || sectionMode.noApproval)) return false;

        return (
          (objectiveCommitsAutomatic && (sectionMode.manual || sectionMode.approvalRequired))
          || (objectiveCommitsManual && (sectionMode.automatic || sectionMode.noApproval))
        );
      });
      if (!conflictingSection) return;

      pushIssue(issues, createRuleIssue({
        ruleId: 'user_intent_consistency_rule',
        detectorId: 'L10-02',
        severity: 'high',
        description: `Intent section "${objectiveSection.heading?.title || documentIndex.name}" in ${documentIndex.name} conflicts with the documented interaction flow.`,
        files: [documentIndex.name],
        section: objectiveSection.heading?.title || '',
        sectionSlug: objectiveSection.heading?.slug || '',
        lineNumber: objectiveSection.lineStart,
        lineEnd: conflictingSection.lineEnd,
        evidence: `${objectiveSection.sectionText.trim().slice(0, 250)}\n---\n${conflictingSection.sectionText.trim().slice(0, 250)}`,
        whyTriggered: 'The documented objective commits to one interaction mode, but another section describes the opposite user-control or approval pattern.',
        evidenceSpans: [
          createEvidenceSpan({
            file: documentIndex.name,
            section: objectiveSection.heading?.title || '',
            sectionSlug: objectiveSection.heading?.slug || '',
            lineStart: objectiveSection.lineStart,
            lineEnd: objectiveSection.lineEnd,
            role: 'primary',
            source: 'user_intent_consistency_rule',
            excerpt: buildLineExcerpt(documentIndex, objectiveSection.lineStart, Math.min(objectiveSection.lineEnd, objectiveSection.lineStart + 6))
          }),
          createEvidenceSpan({
            file: documentIndex.name,
            section: conflictingSection.heading?.title || '',
            sectionSlug: conflictingSection.heading?.slug || '',
            lineStart: conflictingSection.lineStart,
            lineEnd: conflictingSection.lineEnd,
            role: 'supporting',
            source: 'user_intent_consistency_rule',
            excerpt: buildLineExcerpt(documentIndex, conflictingSection.lineStart, Math.min(conflictingSection.lineEnd, conflictingSection.lineStart + 6))
          })
        ],
        deterministicFix: 'Make the interaction flow match the stated user intent or rewrite the intent section to reflect the required approval/manual path.',
        recommendedFix: 'Keep the goal statement and interaction flow aligned on whether the experience is self-serve, approval-free, manual, or review-gated.'
      }));
    });
  });
}

function runInteractionConflictRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectDocumentSections(documentIndex).forEach(({ heading, sectionText, lineStart, lineEnd }) => {
      const mode = classifyInteractionMode(sectionText);
      if (!(mode.automatic || mode.noApproval) || !(mode.manual || mode.approvalRequired)) return;

      pushIssue(issues, createRuleIssue({
        ruleId: 'interaction_conflict_rule',
        detectorId: 'L10-03',
        severity: 'high',
        description: `Interaction section "${heading?.title || documentIndex.name}" in ${documentIndex.name} mixes automatic and manual user-control requirements.`,
        files: [documentIndex.name],
        section: heading?.title || '',
        sectionSlug: heading?.slug || '',
        lineNumber: lineStart,
        lineEnd,
        evidence: sectionText.trim().slice(0, 500),
        whyTriggered: 'The same section says the interaction is automatic or requires no user action while also requiring manual approval, clicks, review, or confirmation.',
        evidenceSpans: [
          createEvidenceSpan({
            file: documentIndex.name,
            section: heading?.title || '',
            sectionSlug: heading?.slug || '',
            lineStart,
            lineEnd,
            source: 'interaction_conflict_rule',
            excerpt: buildLineExcerpt(documentIndex, lineStart, Math.min(lineEnd, lineStart + 8))
          })
        ],
        deterministicFix: 'Choose one interaction contract for the section: fully automatic, or explicitly user-driven with named manual steps.',
        recommendedFix: 'Remove the contradictory interaction statements or split them into separate modes with explicit conditions.'
      }));
    });
  });
}

function runRedundantDependencyRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectDependencySections(documentIndex).forEach(({ heading, lines, lineStart, lineEnd, sectionText }) => {
      const versionOccurrences = buildDependencyVersionOccurrences(lines);
      const redundantDependencies = Array.from(versionOccurrences.entries())
        .map(([dependencyName, versions]) => {
          const duplicateEntries = Array.from(versions.entries())
            .filter(([, occurrences]) => occurrences.length > 1)
            .flatMap(([, occurrences]) => occurrences);
          return { dependencyName, duplicateEntries };
        })
        .filter((entry) => entry.duplicateEntries.length > 0);
      if (redundantDependencies.length === 0) return;

      const evidenceEntries = redundantDependencies
        .flatMap((entry) => entry.duplicateEntries.map((occurrence) => ({
          ...occurrence,
          dependencyName: entry.dependencyName
        })))
        .sort((left, right) => left.lineNumber - right.lineNumber)
        .slice(0, 6);

      pushIssue(issues, createRuleIssue({
        ruleId: 'redundant_dependency_rule',
        detectorId: 'L18-07',
        severity: 'low',
        description: `Dependency section "${heading?.title || documentIndex.name}" in ${documentIndex.name} repeats the same dependency declarations without adding deterministic meaning.`,
        files: [documentIndex.name],
        section: heading?.title || '',
        sectionSlug: heading?.slug || '',
        lineNumber: lineStart,
        lineEnd,
        evidence: evidenceEntries.map((entry) => `${entry.dependencyName}: ${entry.text}`).join('\n') || sectionText.trim().slice(0, 500),
        whyTriggered: 'The same dependency surface is declared multiple times in one section, which introduces redundant maintenance points without clarifying ownership, versioning, or ordering semantics.',
        evidenceSpans: evidenceEntries.map((entry, index) => createEvidenceSpan({
          file: documentIndex.name,
          section: heading?.title || '',
          sectionSlug: heading?.slug || '',
          lineStart: entry.lineNumber,
          role: index === 0 ? 'primary' : 'supporting',
          source: 'redundant_dependency_rule',
          excerpt: entry.text
        })),
        deterministicFix: 'Collapse repeated dependency declarations into one canonical statement per dependency surface.',
        recommendedFix: 'Keep a single dependency line for each dependency/version pair and move any extra notes into bounded metadata.'
      }));
    });
  });
}

function runDependencyOwnershipAmbiguityDetailRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectDependencySections(documentIndex).forEach(({ heading, sectionText, lineStart, lineEnd }) => {
      const actorRoles = extractActorRoles(sectionText);
      if (actorRoles.length < 2) return;
      if (OWNER_BOUNDARY_PATTERN.test(sectionText)) return;

      pushIssue(issues, createRuleIssue({
        ruleId: 'dependency_ownership_ambiguity_detail_rule',
        detectorId: 'L18-09',
        severity: 'medium',
        description: `Dependency section "${heading?.title || documentIndex.name}" in ${documentIndex.name} names multiple actors without a bounded ownership rule for the dependency chain.`,
        files: [documentIndex.name],
        section: heading?.title || '',
        sectionSlug: heading?.slug || '',
        lineNumber: lineStart,
        lineEnd,
        evidence: sectionText.trim().slice(0, 500),
        whyTriggered: `The section references multiple actors (${actorRoles.join(', ')}) while describing dependency behavior, but it never states which actor owns or governs those dependencies.`,
        evidenceSpans: [
          createEvidenceSpan({
            file: documentIndex.name,
            section: heading?.title || '',
            sectionSlug: heading?.slug || '',
            lineStart,
            lineEnd,
            source: 'dependency_ownership_ambiguity_detail_rule',
            excerpt: buildLineExcerpt(documentIndex, lineStart, Math.min(lineEnd, lineStart + 8))
          })
        ],
        deterministicFix: 'Assign a canonical owner or authority boundary for each dependency surface.',
        recommendedFix: 'Document who owns dependency updates, approvals, and remediation when prerequisites change or fail.'
      }));
    });
  });
}

function runConflictingTriggerRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectWorkflowSections(documentIndex).forEach(({ heading, lines, numberedSteps }) => {
      if (numberedSteps.length < 2) return;

      const sectionText = lines.map(({ text }) => text).join('\n');
      if (!CONFLICTING_TRIGGER_PAIR_PATTERN.test(sectionText)) return;

      pushIssue(issues, createRuleIssue({
        ruleId: 'conflicting_trigger_rule',
        detectorId: 'L20-03',
        severity: 'high',
        description: `Workflow section "${heading.title}" in ${documentIndex.name} mixes automatic and manual trigger conditions for the same execution path.`,
        files: [documentIndex.name],
        section: heading.title,
        sectionSlug: heading.slug,
        lineNumber: heading.lineStart,
        lineEnd: heading.lineEnd,
        evidence: sectionText.trim().slice(0, 500),
        whyTriggered: 'The same workflow is described as both automatically triggered and manually or operator triggered, which leaves the execution entrypoint ambiguous.',
        evidenceSpans: [
          createEvidenceSpan({
            file: documentIndex.name,
            section: heading.title,
            sectionSlug: heading.slug,
            lineStart: heading.lineStart,
            lineEnd: heading.lineEnd,
            source: 'conflicting_trigger_rule',
            excerpt: buildLineExcerpt(documentIndex, heading.lineStart, Math.min(heading.lineEnd, heading.lineStart + 8))
          })
        ],
        deterministicFix: 'Choose one trigger contract for the workflow or split automatic and manual modes into separate explicitly bounded paths.',
        recommendedFix: 'State whether this flow starts automatically, manually, or under a named condition instead of mixing trigger modes.'
      }));
    });
  });
}

function runIncompleteExecutionBranchRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectWorkflowSections(documentIndex).forEach(({ heading, lines, numberedSteps }) => {
      if (numberedSteps.length < 2) return;

      const sectionText = lines.map(({ text }) => text).join('\n');
      if (countConditionalMarkers(sectionText) === 0) return;
      if (BRANCH_FALLBACK_PATTERN.test(sectionText)) return;

      pushIssue(issues, createRuleIssue({
        ruleId: 'incomplete_execution_branch_rule',
        detectorId: 'L20-04',
        severity: 'high',
        description: `Workflow section "${heading.title}" in ${documentIndex.name} introduces conditional branching without documenting the alternate branch behavior.`,
        files: [documentIndex.name],
        section: heading.title,
        sectionSlug: heading.slug,
        lineNumber: heading.lineStart,
        lineEnd: heading.lineEnd,
        evidence: sectionText.trim().slice(0, 600),
        whyTriggered: 'The workflow uses if/when/unless-style branching language but never documents an else, fallback, failure path, or alternate route.',
        evidenceSpans: [
          createEvidenceSpan({
            file: documentIndex.name,
            section: heading.title,
            sectionSlug: heading.slug,
            lineStart: heading.lineStart,
            lineEnd: heading.lineEnd,
            source: 'incomplete_execution_branch_rule',
            excerpt: buildLineExcerpt(documentIndex, heading.lineStart, Math.min(heading.lineEnd, heading.lineStart + 8))
          })
        ],
        deterministicFix: 'Document every branch outcome, including the fallback or failure path for conditional execution.',
        recommendedFix: 'Add explicit else/failure/default behavior wherever the workflow branches conditionally.'
      }));
    });
  });
}

function runDeadEndWorkflowRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectWorkflowSections(documentIndex).forEach(({ heading, numberedSteps }) => {
      if (numberedSteps.length < 2) return;

      const lastStep = numberedSteps[numberedSteps.length - 1];
      if (!lastStep) return;
      if (TERMINAL_PATTERN.test(lastStep.text)) return;
      if (!/\b(wait|waiting|pending|hold|review|queue|queued|retry|loop|branch)\b/i.test(lastStep.text)) return;

      pushIssue(issues, createRuleIssue({
        ruleId: 'dead_end_workflow_rule',
        detectorId: 'L20-05',
        severity: 'medium',
        description: `Workflow section "${heading.title}" in ${documentIndex.name} appears to end in a waiting or branching state without a deterministic exit.`,
        files: [documentIndex.name],
        section: heading.title,
        sectionSlug: heading.slug,
        lineNumber: lastStep.lineNumber,
        evidence: `${lastStep.number}. ${lastStep.text}`,
        whyTriggered: 'The final workflow step leaves the process in a pending/branching posture and does not define how execution reaches a terminal outcome.',
        evidenceSpans: [
          createEvidenceSpan({
            file: documentIndex.name,
            section: heading.title,
            sectionSlug: heading.slug,
            lineStart: lastStep.lineNumber,
            source: 'dead_end_workflow_rule',
            excerpt: `${lastStep.number}. ${lastStep.text}`
          })
        ],
        deterministicFix: 'Add the missing terminal step or explicit next-path condition after the waiting/branching step.',
        recommendedFix: 'Make the final workflow step resolve to success, failure, rollback, or a named next workflow.'
      }));
    });
  });
}

function runConditionalAmbiguityRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectDocumentSections(documentIndex).forEach(({ heading, sectionText, lineStart, lineEnd }) => {
      if (countConditionalMarkers(sectionText) < 2) return;
      if (TRANSITION_CONDITION_PATTERN.test(sectionText) || BRANCH_FALLBACK_PATTERN.test(sectionText)) return;

      pushIssue(issues, createRuleIssue({
        ruleId: 'conditional_ambiguity_rule',
        detectorId: 'L20-07',
        severity: 'medium',
        description: `Section "${heading?.title || documentIndex.name}" in ${documentIndex.name} uses multiple conditional clauses without a bounded decision rule.`,
        files: [documentIndex.name],
        section: heading?.title || '',
        sectionSlug: heading?.slug || '',
        lineNumber: lineStart,
        lineEnd,
        evidence: sectionText.trim().slice(0, 600),
        whyTriggered: 'The section uses several conditional markers, but it never names the deciding guard, fallback rule, or explicit condition-to-path mapping.',
        evidenceSpans: [
          createEvidenceSpan({
            file: documentIndex.name,
            section: heading?.title || '',
            sectionSlug: heading?.slug || '',
            lineStart,
            lineEnd,
            source: 'conditional_ambiguity_rule',
            excerpt: buildLineExcerpt(documentIndex, lineStart, Math.min(lineEnd, lineStart + 8))
          })
        ],
        deterministicFix: 'Rewrite the conditional logic into explicit mutually exclusive guards and named outcomes.',
        recommendedFix: 'Map each conditional clause to a concrete path instead of relying on prose-level branching.'
      }));
    });
  });
}

function runExecutionPathGapRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectWorkflowSections(documentIndex).forEach(({ heading, lines, numberedSteps }) => {
      if (numberedSteps.length < 2) return;

      const sectionText = lines.map(({ text }) => text).join('\n');
      if (countConditionalMarkers(sectionText) === 0) return;
      if (BRANCH_FALLBACK_PATTERN.test(sectionText) || TERMINAL_PATTERN.test(sectionText)) return;

      pushIssue(issues, createRuleIssue({
        ruleId: 'execution_path_gap_rule',
        detectorId: 'L20-10',
        severity: 'high',
        description: `Workflow section "${heading.title}" in ${documentIndex.name} describes conditional execution without a closed execution-path contract.`,
        files: [documentIndex.name],
        section: heading.title,
        sectionSlug: heading.slug,
        lineNumber: heading.lineStart,
        lineEnd: heading.lineEnd,
        evidence: sectionText.trim().slice(0, 600),
        whyTriggered: 'The workflow branches conditionally but never closes the execution graph with alternate outcomes, fallback handling, or terminal behavior.',
        evidenceSpans: [
          createEvidenceSpan({
            file: documentIndex.name,
            section: heading.title,
            sectionSlug: heading.slug,
            lineStart: heading.lineStart,
            lineEnd: heading.lineEnd,
            source: 'execution_path_gap_rule',
            excerpt: buildLineExcerpt(documentIndex, heading.lineStart, Math.min(heading.lineEnd, heading.lineStart + 8))
          })
        ],
        deterministicFix: 'Close the execution graph by documenting every branch outcome and the terminal or rollback behavior for each path.',
        recommendedFix: 'Add explicit alternate-path handling so the workflow remains closed under all conditional outcomes.'
      }));
    });
  });
}

function runPathDependencyCycleRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectTaskGraphSections(documentIndex).forEach((taskSection) => {
      const { heading, lineStart, lineEnd } = taskSection;
      const graphContext = buildTaskGraphContext(taskSection);
      const cycle = findTaskGraphCycle(graphContext.adjacency);
      if (!cycle || cycle.length < 2) return;

      const cycleSteps = Array.from(new Set(cycle))
        .map((stepNumber) => graphContext.stepMap.get(stepNumber))
        .filter(Boolean);

      pushIssue(issues, createRuleIssue({
        ruleId: 'path_dependency_cycle_rule',
        detectorId: 'L20-14',
        severity: 'high',
        description: `Execution-path section "${heading?.title || documentIndex.name}" in ${documentIndex.name} contains a dependency cycle that prevents deterministic completion.`,
        files: [documentIndex.name],
        section: heading?.title || '',
        sectionSlug: heading?.slug || '',
        lineNumber: lineStart,
        lineEnd,
        evidence: cycleSteps.map((step) => `${step.number}. ${step.text}`).join('\n'),
        whyTriggered: `The documented execution path loops back across dependencies (${cycle.join(' -> ')}), so the path graph cannot be traversed deterministically to completion.`,
        evidenceSpans: cycleSteps.map((step, index) => createEvidenceSpan({
          file: documentIndex.name,
          section: heading?.title || '',
          sectionSlug: heading?.slug || '',
          lineStart: step.lineNumber,
          role: index === 0 ? 'primary' : 'supporting',
          source: 'path_dependency_cycle_rule',
          excerpt: `${step.number}. ${step.text}`
        })),
        deterministicFix: 'Break the cyclic dependency or split the loop into separate explicitly staged execution paths.',
        recommendedFix: 'Rewrite the path dependencies so the graph is acyclic and can always progress forward.'
      }));
    });
  });
}

function runPathStatePreservationRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectWorkflowSections(documentIndex).forEach(({ heading, lines, numberedSteps }) => {
      if (numberedSteps.length < 2) return;

      const sectionText = lines.map(({ text }) => text).join('\n');
      if (!STATE_CONTEXT_PATTERN.test(sectionText) || !ACTION_PATTERN.test(sectionText)) return;
      if (STATE_PRESERVATION_PATTERN.test(sectionText)) return;

      pushIssue(issues, createRuleIssue({
        ruleId: 'path_state_preservation_rule',
        detectorId: 'L20-18',
        severity: 'high',
        description: `Workflow section "${heading.title}" in ${documentIndex.name} changes or depends on state without documenting how that state is preserved across the path.`,
        files: [documentIndex.name],
        section: heading.title,
        sectionSlug: heading.slug,
        lineNumber: heading.lineStart,
        lineEnd: heading.lineEnd,
        evidence: sectionText.trim().slice(0, 600),
        whyTriggered: 'The workflow references session, state, snapshot, or context surfaces but never states how that state is preserved, restored, resumed, or replayed across the execution path.',
        evidenceSpans: [
          createEvidenceSpan({
            file: documentIndex.name,
            section: heading.title,
            sectionSlug: heading.slug,
            lineStart: heading.lineStart,
            lineEnd: heading.lineEnd,
            source: 'path_state_preservation_rule',
            excerpt: buildLineExcerpt(documentIndex, heading.lineStart, Math.min(heading.lineEnd, heading.lineStart + 8))
          })
        ],
        deterministicFix: 'Document the checkpoint, snapshot, resume, or restore rule that preserves state across the workflow path.',
        recommendedFix: 'Specify how path state is carried forward so retries and branches do not lose execution context.'
      }));
    });
  });
}

function runConditionalExecutionIndeterminismRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectWorkflowSections(documentIndex).forEach(({ heading, lines, numberedSteps }) => {
      if (numberedSteps.length < 2) return;

      const sectionText = lines.map(({ text }) => text).join('\n');
      if (countConditionalMarkers(sectionText) < 2) return;
      if (!EXECUTION_NON_DETERMINISM_PATTERN.test(sectionText)) return;

      pushIssue(issues, createRuleIssue({
        ruleId: 'conditional_execution_indeterminism_rule',
        detectorId: 'L20-19',
        severity: 'high',
        description: `Workflow section "${heading.title}" in ${documentIndex.name} combines branching logic with non-deterministic execution wording.`,
        files: [documentIndex.name],
        section: heading.title,
        sectionSlug: heading.slug,
        lineNumber: heading.lineStart,
        lineEnd: heading.lineEnd,
        evidence: sectionText.trim().slice(0, 600),
        whyTriggered: 'The workflow has multiple conditional branches and also allows best-effort or any-order execution, so the chosen branch and execution order are both under-specified.',
        evidenceSpans: [
          createEvidenceSpan({
            file: documentIndex.name,
            section: heading.title,
            sectionSlug: heading.slug,
            lineStart: heading.lineStart,
            lineEnd: heading.lineEnd,
            source: 'conditional_execution_indeterminism_rule',
            excerpt: buildLineExcerpt(documentIndex, heading.lineStart, Math.min(heading.lineEnd, heading.lineStart + 8))
          })
        ],
        deterministicFix: 'Define deterministic branch selection and execution order invariants for the conditional workflow.',
        recommendedFix: 'Name the guard that selects each branch and the ordering contract that executes the chosen path.'
      }));
    });
  });
}

function runExecutionBranchingLogicRule(projectGraph, issues) {
  const branchingPattern = /\b(branch|branching|fork|split|alternate path|alternative path|branch path)\b/i;

  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectWorkflowSections(documentIndex).forEach(({ heading, lines, numberedSteps }) => {
      if (numberedSteps.length < 2) return;

      const sectionText = lines.map(({ text }) => text).join('\n');
      if (!branchingPattern.test(sectionText)) return;
      if (TRANSITION_CONDITION_PATTERN.test(sectionText) || BRANCH_FALLBACK_PATTERN.test(sectionText)) return;

      pushIssue(issues, createRuleIssue({
        ruleId: 'execution_branching_logic_rule',
        detectorId: 'L20-20',
        severity: 'medium',
        description: `Workflow section "${heading.title}" in ${documentIndex.name} references branching logic without a deterministic branch-selection rule.`,
        files: [documentIndex.name],
        section: heading.title,
        sectionSlug: heading.slug,
        lineNumber: heading.lineStart,
        lineEnd: heading.lineEnd,
        evidence: sectionText.trim().slice(0, 600),
        whyTriggered: 'The section talks about branching or alternate paths, but it does not define the explicit conditions or decision owner that selects each branch.',
        evidenceSpans: [
          createEvidenceSpan({
            file: documentIndex.name,
            section: heading.title,
            sectionSlug: heading.slug,
            lineStart: heading.lineStart,
            lineEnd: heading.lineEnd,
            source: 'execution_branching_logic_rule',
            excerpt: buildLineExcerpt(documentIndex, heading.lineStart, Math.min(heading.lineEnd, heading.lineStart + 8))
          })
        ],
        deterministicFix: 'Define the branch selector, the branch conditions, and the fallback behavior for alternate paths.',
        recommendedFix: 'Replace generic branching prose with named branch conditions and explicit route outcomes.'
      }));
    });
  });
}

function runMissingApprovalGateRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectDocumentSections(documentIndex).forEach(({ heading, sectionText, lineStart, lineEnd }) => {
      const headingTitle = heading?.title || '';
      const governanceLike = /governance|policy|approval|release|deployment|control/i.test(headingTitle) || /governance|policy|approval|release|deployment|control/i.test(sectionText);
      if (!governanceLike || !ACTION_PATTERN.test(sectionText)) return;
      if (/\b(approve|approval|review(?:ed)?|sign[- ]?off|authorized by|approval gate|human gate)\b/i.test(sectionText)) return;

      pushIssue(issues, createRuleIssue({
        ruleId: 'missing_approval_gate_rule',
        detectorId: 'L29-02',
        severity: 'high',
        description: `Section "${headingTitle || documentIndex.name}" in ${documentIndex.name} changes governed state without an explicit approval gate.`,
        files: [documentIndex.name],
        section: headingTitle,
        sectionSlug: heading?.slug || '',
        lineNumber: lineStart,
        lineEnd,
        evidence: sectionText.trim().slice(0, 600),
        whyTriggered: 'The section drives change or execution in a governance-sensitive area, but it never states where approval, review, or sign-off is required.',
        evidenceSpans: [
          createEvidenceSpan({
            file: documentIndex.name,
            section: headingTitle,
            sectionSlug: heading?.slug || '',
            lineStart,
            lineEnd,
            source: 'missing_approval_gate_rule',
            excerpt: buildLineExcerpt(documentIndex, lineStart, Math.min(lineEnd, lineStart + 8))
          })
        ],
        deterministicFix: 'Add a named approval gate before the governed mutation or release step executes.',
        recommendedFix: 'Document who approves the change and the exact step where the gate blocks or permits execution.'
      }));
    });
  });
}

function runUntraceableChangeRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectDocumentSections(documentIndex).forEach(({ heading, sectionText, lineStart, lineEnd }) => {
      const headingTitle = heading?.title || '';
      const changeLike = CHANGE_ACTION_PATTERN.test(sectionText) || /\b(change|deployment|release|rollout|migration|update|write|apply|mutate)\b/i.test(sectionText);
      if (!changeLike) return;
      if (AUDIT_TRAIL_PATTERN.test(sectionText) || COMMIT_HASH_PATTERN.test(sectionText)) return;

      pushIssue(issues, createRuleIssue({
        ruleId: 'untraceable_change_rule',
        detectorId: 'L29-03',
        severity: 'high',
        description: `Section "${headingTitle || documentIndex.name}" in ${documentIndex.name} describes change behavior without a traceable change record.`,
        files: [documentIndex.name],
        section: headingTitle,
        sectionSlug: heading?.slug || '',
        lineNumber: lineStart,
        lineEnd,
        evidence: sectionText.trim().slice(0, 600),
        whyTriggered: 'The section introduces updates or mutations but never ties them to an audit trail, change record, commit, revision, or receipt.',
        evidenceSpans: [
          createEvidenceSpan({
            file: documentIndex.name,
            section: headingTitle,
            sectionSlug: heading?.slug || '',
            lineStart,
            lineEnd,
            source: 'untraceable_change_rule',
            excerpt: buildLineExcerpt(documentIndex, lineStart, Math.min(lineEnd, lineStart + 8))
          })
        ],
        deterministicFix: 'Bind every described change path to a durable change record, commit id, or audit receipt.',
        recommendedFix: 'Document the immutable artifact or journal that records the change end to end.'
      }));
    });
  });
}

function runGovernanceUnclearOwnershipRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectDocumentSections(documentIndex).forEach(({ heading, sectionText, lineStart, lineEnd }) => {
      const headingTitle = heading?.title || '';
      const actorRoles = extractActorRoles(sectionText);
      if (actorRoles.length < 2) return;
      if (!/governance|policy|control|approval|authority/i.test(`${headingTitle}\n${sectionText}`)) return;
      if (OWNER_BOUNDARY_PATTERN.test(sectionText)) return;

      pushIssue(issues, createRuleIssue({
        ruleId: 'governance_unclear_ownership_rule',
        detectorId: 'L29-06',
        severity: 'medium',
        description: `Section "${headingTitle || documentIndex.name}" in ${documentIndex.name} describes governance responsibilities without a clear owner.`,
        files: [documentIndex.name],
        section: headingTitle,
        sectionSlug: heading?.slug || '',
        lineNumber: lineStart,
        lineEnd,
        evidence: sectionText.trim().slice(0, 600),
        whyTriggered: `The section names multiple actors (${actorRoles.join(', ')}) in a governance-sensitive context without assigning a canonical accountable owner.`,
        evidenceSpans: [
          createEvidenceSpan({
            file: documentIndex.name,
            section: headingTitle,
            sectionSlug: heading?.slug || '',
            lineStart,
            lineEnd,
            source: 'governance_unclear_ownership_rule',
            excerpt: buildLineExcerpt(documentIndex, lineStart, Math.min(lineEnd, lineStart + 8))
          })
        ],
        deterministicFix: 'Assign one accountable owner or approval authority for the governed behavior.',
        recommendedFix: 'State which actor owns the decision, mutation, or checkpoint when several actors are involved.'
      }));
    });
  });
}

function runMissingFailSafeRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectDocumentSections(documentIndex).forEach(({ heading, sectionText, lineStart, lineEnd }) => {
      const headingTitle = heading?.title || '';
      const safetyRelevant = ACTION_PATTERN.test(sectionText)
        && (
          WORKFLOW_HEADING_PATTERN.test(headingTitle)
          || GOVERNANCE_BYPASS_PATTERN.test(sectionText)
          || CONTROL_PLANE_PATTERN.test(`${headingTitle}\n${sectionText}`)
        );
      if (!safetyRelevant) return;
      if (FAIL_SAFE_PATTERN.test(sectionText)) return;

      pushIssue(issues, createRuleIssue({
        ruleId: 'missing_fail_safe_rule',
        detectorId: 'L29-07',
        severity: 'high',
        description: `Section "${headingTitle || documentIndex.name}" in ${documentIndex.name} drives execution without a documented fail-safe or stop condition.`,
        files: [documentIndex.name],
        section: headingTitle,
        sectionSlug: heading?.slug || '',
        lineNumber: lineStart,
        lineEnd,
        evidence: sectionText.trim().slice(0, 600),
        whyTriggered: 'The section describes mutating or override-capable behavior but never states a safe-stop, abort, kill-switch, rollback, or circuit-breaker condition.',
        evidenceSpans: [
          createEvidenceSpan({
            file: documentIndex.name,
            section: headingTitle,
            sectionSlug: heading?.slug || '',
            lineStart,
            lineEnd,
            source: 'missing_fail_safe_rule',
            excerpt: buildLineExcerpt(documentIndex, lineStart, Math.min(lineEnd, lineStart + 8))
          })
        ],
        deterministicFix: 'Document the fail-safe, stop condition, or rollback boundary that halts unsafe execution.',
        recommendedFix: 'Add the exact abort/kill-switch/recovery behavior that contains failures in this path.'
      }));
    });
  });
}

function runOverrideAmbiguityRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectDocumentSections(documentIndex).forEach(({ heading, sectionText, lineStart, lineEnd }) => {
      const headingTitle = heading?.title || '';
      if (!(GOVERNANCE_BYPASS_PATTERN.test(sectionText) || /\boverride\b/i.test(sectionText))) return;
      if (OVERRIDE_GUARD_PATTERN.test(sectionText) || OWNER_BOUNDARY_PATTERN.test(sectionText)) return;

      pushIssue(issues, createRuleIssue({
        ruleId: 'override_ambiguity_rule',
        detectorId: 'L29-08',
        severity: 'high',
        description: `Section "${headingTitle || documentIndex.name}" in ${documentIndex.name} mentions override behavior without bounded override rules.`,
        files: [documentIndex.name],
        section: headingTitle,
        sectionSlug: heading?.slug || '',
        lineNumber: lineStart,
        lineEnd,
        evidence: sectionText.trim().slice(0, 600),
        whyTriggered: 'The section allows bypass or override behavior but does not define who can invoke it, under what conditions, or what compensating controls apply.',
        evidenceSpans: [
          createEvidenceSpan({
            file: documentIndex.name,
            section: headingTitle,
            sectionSlug: heading?.slug || '',
            lineStart,
            lineEnd,
            source: 'override_ambiguity_rule',
            excerpt: buildLineExcerpt(documentIndex, lineStart, Math.min(lineEnd, lineStart + 8))
          })
        ],
        deterministicFix: 'Define the override authority, allowed conditions, expiry, and required controls for the override path.',
        recommendedFix: 'Bound the override path with explicit conditions and named decision ownership.'
      }));
    });
  });
}

function runUnauthorizedAgentWriteRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectDocumentSections(documentIndex).forEach(({ heading, sectionText, lineStart, lineEnd }) => {
      const agentWritePattern = /\b(agent|assistant|automation|system|controller)\b[\s\S]{0,240}\b(write|writes|apply|applies|commit|commits|deploy|deploys|delete|deletes|mutate|mutates|update|updates|release|releases)\b/i;
      if (!agentWritePattern.test(sectionText)) return;
      if (/\b(authorize|authorized|approval|approved|owner|operator|admin|gatekeeper|reviewed by)\b/i.test(sectionText)) return;

      pushIssue(issues, createRuleIssue({
        ruleId: 'unauthorized_agent_write_rule',
        detectorId: 'L29-21',
        severity: 'critical',
        description: `Section "${heading?.title || documentIndex.name}" in ${documentIndex.name} allows agent or system writes without an explicit authorization boundary.`,
        files: [documentIndex.name],
        section: heading?.title || '',
        sectionSlug: heading?.slug || '',
        lineNumber: lineStart,
        lineEnd,
        evidence: sectionText.trim().slice(0, 600),
        whyTriggered: 'The section allows an agent, assistant, or system controller to perform writes or releases but does not state who authorizes those actions.',
        evidenceSpans: [
          createEvidenceSpan({
            file: documentIndex.name,
            section: heading?.title || '',
            sectionSlug: heading?.slug || '',
            lineStart,
            lineEnd,
            source: 'unauthorized_agent_write_rule',
            excerpt: buildLineExcerpt(documentIndex, lineStart, Math.min(lineEnd, lineStart + 8))
          })
        ],
        deterministicFix: 'Add an explicit authorization boundary for agent-driven writes, releases, or state mutations.',
        recommendedFix: 'Document who approves, gates, or owns the agent write path before the system mutates state.'
      }));
    });
  });
}

function runTransitionNonDeterminismRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectStateTransitionGroups(documentIndex).forEach(({ section, transitions, lineStart, lineEnd, sectionText }) => {
      if (!Array.isArray(transitions) || transitions.length < 2) return;
      if (TRANSITION_CONDITION_PATTERN.test(sectionText)) return;

      const outgoingTransitions = new Map();
      transitions.forEach((transition) => {
        const source = transition.tokens[0];
        const target = transition.tokens[transition.tokens.length - 1];
        if (!source || !target || source === target) return;
        if (!outgoingTransitions.has(source)) outgoingTransitions.set(source, new Set());
        outgoingTransitions.get(source).add(target);
      });

      const ambiguousSources = Array.from(outgoingTransitions.entries())
        .filter(([, targets]) => targets.size > 1)
        .map(([source]) => source);
      if (ambiguousSources.length === 0) return;

      pushIssue(issues, createRuleIssue({
        ruleId: 'transition_non_determinism_rule',
        detectorId: 'L43-01',
        severity: 'high',
        description: `State transitions in ${documentIndex.name}${section?.title ? ` section "${section.title}"` : ''} contain non-deterministic branching from shared source states.`,
        files: [documentIndex.name],
        section: section?.title || '',
        sectionSlug: section?.slug || '',
        lineNumber: lineStart,
        lineEnd,
        evidence: transitions.map((transition) => `${documentIndex.name}:${transition.lineNumber} ${transition.line}`).join('\n'),
        whyTriggered: `The state machine branches from shared source states (${ambiguousSources.join(', ')}) without documenting the rule that chooses each outgoing transition.`,
        evidenceSpans: transitions.slice(0, 6).map((transition, index) => createEvidenceSpan({
          file: documentIndex.name,
          section: section?.title || '',
          sectionSlug: section?.slug || '',
          lineStart: transition.lineNumber,
          role: index === 0 ? 'primary' : 'supporting',
          source: 'transition_non_determinism_rule',
          excerpt: transition.line
        })),
        deterministicFix: 'Define a deterministic guard for every branch that leaves the same source state.',
        recommendedFix: 'Make each source-state transition mutually exclusive and explicitly conditioned.'
      }));
    });
  });
}

function runConcurrencyModelAmbiguityRule(projectGraph, issues) {
  const concurrencyBoundaryPattern = /\b(queue|queued|lock|locked|mutex|semaphore|serialize|serialized|single writer|worker pool|thread pool|scheduler|deterministic scheduler)\b/i;

  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectDocumentSections(documentIndex).forEach(({ heading, sectionText, lineStart, lineEnd }) => {
      if (!PARALLEL_EXECUTION_PATTERN.test(sectionText)) return;
      if (concurrencyBoundaryPattern.test(sectionText)) return;

      pushIssue(issues, createRuleIssue({
        ruleId: 'concurrency_model_ambiguity_rule',
        detectorId: 'L43-02',
        severity: 'high',
        description: `Section "${heading?.title || documentIndex.name}" in ${documentIndex.name} permits concurrent execution without defining the concurrency model.`,
        files: [documentIndex.name],
        section: heading?.title || '',
        sectionSlug: heading?.slug || '',
        lineNumber: lineStart,
        lineEnd,
        evidence: sectionText.trim().slice(0, 600),
        whyTriggered: 'The section allows parallel, concurrent, or simultaneous work but never states the queueing, locking, scheduling, or worker-pool model that makes concurrency deterministic.',
        evidenceSpans: [
          createEvidenceSpan({
            file: documentIndex.name,
            section: heading?.title || '',
            sectionSlug: heading?.slug || '',
            lineStart,
            lineEnd,
            source: 'concurrency_model_ambiguity_rule',
            excerpt: buildLineExcerpt(documentIndex, lineStart, Math.min(lineEnd, lineStart + 8))
          })
        ],
        deterministicFix: 'Define the queueing, locking, or scheduling model that governs concurrent execution.',
        recommendedFix: 'State whether work is serialized, queued, single-writer, or otherwise constrained under a named concurrency contract.'
      }));
    });
  });
}

function runInputDeterminismGapRule(projectGraph, issues) {
  const inputSurfacePattern = /\b(input|inputs|request|payload|event|parameter|parameters|argument|arguments|config|configuration|source data|artifact digest|commit hash|revision)\b/i;

  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectWorkflowSections(documentIndex).forEach(({ heading, lines, numberedSteps }) => {
      if (numberedSteps.length < 2) return;

      const sectionText = lines.map(({ text }) => text).join('\n');
      if (!ACTION_PATTERN.test(sectionText)) return;
      if (inputSurfacePattern.test(sectionText)) return;

      pushIssue(issues, createRuleIssue({
        ruleId: 'input_determinism_gap_rule',
        detectorId: 'L43-04',
        severity: 'medium',
        description: `Workflow section "${heading.title}" in ${documentIndex.name} executes actions without defining stable inputs or trigger artifacts.`,
        files: [documentIndex.name],
        section: heading.title,
        sectionSlug: heading.slug,
        lineNumber: heading.lineStart,
        lineEnd: heading.lineEnd,
        evidence: sectionText.trim().slice(0, 600),
        whyTriggered: 'The workflow drives execution, but it never states the request, event, config, payload, or immutable artifact that serves as the stable input surface.',
        evidenceSpans: [
          createEvidenceSpan({
            file: documentIndex.name,
            section: heading.title,
            sectionSlug: heading.slug,
            lineStart: heading.lineStart,
            lineEnd: heading.lineEnd,
            source: 'input_determinism_gap_rule',
            excerpt: buildLineExcerpt(documentIndex, heading.lineStart, Math.min(heading.lineEnd, heading.lineStart + 8))
          })
        ],
        deterministicFix: 'Document the stable input, request, event, or artifact that deterministically seeds the workflow.',
        recommendedFix: 'Name the exact input contract for the workflow before describing downstream execution steps.'
      }));
    });
  });
}

function runDecisionAuthorityAmbiguityRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectDocumentSections(documentIndex).forEach(({ heading, sectionText, lineStart, lineEnd }) => {
      const headingTitle = heading?.title || '';
      if (!DECISION_PATTERN.test(sectionText)) return;
      if (!(CONTROL_PLANE_PATTERN.test(`${headingTitle}\n${sectionText}`) || /governance|approval|policy|authority/i.test(`${headingTitle}\n${sectionText}`))) return;
      if (EXPLICIT_DECISION_OWNER_PATTERN.test(sectionText)) return;

      pushIssue(issues, createRuleIssue({
        ruleId: 'decision_authority_ambiguity_rule',
        detectorId: 'L44-14',
        severity: 'high',
        description: `Section "${headingTitle || documentIndex.name}" in ${documentIndex.name} describes decisions or approvals without naming the decision authority.`,
        files: [documentIndex.name],
        section: headingTitle,
        sectionSlug: heading?.slug || '',
        lineNumber: lineStart,
        lineEnd,
        evidence: sectionText.trim().slice(0, 600),
        whyTriggered: 'The section references decisions, approvals, or escalations, but it does not say who actually owns or authorizes those decisions.',
        evidenceSpans: [
          createEvidenceSpan({
            file: documentIndex.name,
            section: headingTitle,
            sectionSlug: heading?.slug || '',
            lineStart,
            lineEnd,
            source: 'decision_authority_ambiguity_rule',
            excerpt: buildLineExcerpt(documentIndex, lineStart, Math.min(lineEnd, lineStart + 8))
          })
        ],
        deterministicFix: 'Name the decision owner, approval authority, or control-plane actor that resolves the decision.',
        recommendedFix: 'Document who decides, who may override, and what authority boundary applies to the decision.'
      }));
    });
  });
}

function runUndefinedIdentifierRule(projectGraph, issues) {
  const definedTerms = new Set(projectGraph.glossaryOccurrences.map((occurrence) => normalizeComparableText(occurrence.label)));
  const headingTerms = new Set(projectGraph.headingOccurrences.map((occurrence) => normalizeComparableText(occurrence.label)));
  const byIdentifier = new Map();

  projectGraph.identifierOccurrences.forEach((occurrence) => {
    const key = occurrence.key.toUpperCase();
    if (!byIdentifier.has(key)) byIdentifier.set(key, []);
    byIdentifier.get(key).push(occurrence);
  });

  byIdentifier.forEach((occurrences, key) => {
    if (occurrences.length < 2) return;
    if (definedTerms.has(normalizeComparableText(key)) || headingTerms.has(normalizeComparableText(key))) return;

    const first = occurrences[0];
    pushIssue(issues, createRuleIssue({
      ruleId: 'undefined_identifier_rule',
      detectorId: 'L46-06',
      severity: 'high',
      description: `Identifier "${key}" appears ${occurrences.length} times without a glossary or heading definition across the loaded Markdown set.`,
      files: [first.file],
      section: first.section,
      sectionSlug: first.section_slug,
      lineNumber: first.line_number,
      evidence: occurrences.map((occurrence) => `${occurrence.file}:${occurrence.line_number} ${occurrence.description}`).join('\n'),
      whyTriggered: 'The same identifier is reused across the documents, but no glossary or heading definition binds it to a canonical meaning.',
      evidenceSpans: occurrences.map((occurrence, index) => createEvidenceSpan({
        file: occurrence.file,
        section: occurrence.section,
        sectionSlug: occurrence.section_slug,
        lineStart: occurrence.line_number,
        role: index === 0 ? 'primary' : 'supporting',
        source: 'undefined_identifier_rule',
        excerpt: occurrence.description
      })),
      deterministicFix: 'Define the identifier in a glossary or canonical heading and bind future uses to that definition.',
      recommendedFix: 'Add a terminology registry entry or a dedicated heading that defines the identifier before it is reused.'
    }));
  });
}

function runGlossaryBindingRule(projectGraph, issues) {
  const nonGlossaryContent = projectGraph.projectIndex.documents.flatMap((documentIndex) =>
    documentIndex.lines
      .map((line, index) => ({
        line,
        lineNumber: index + 1,
        section: getSectionForLine(documentIndex, index + 1),
        documentIndex
      }))
      .filter(({ section }) => !/\b(glossary|terminology|definitions|terms|symbols|terminology registry|vocabulary)\b/i.test(section?.title || ''))
  );

  const termBindings = new Map();
  projectGraph.glossaryOccurrences.forEach((occurrence) => {
    if (!termBindings.has(occurrence.key)) termBindings.set(occurrence.key, []);
    termBindings.get(occurrence.key).push(occurrence);
  });

  termBindings.forEach((occurrences, termKey) => {
    const termUsedOutsideGlossary = nonGlossaryContent.some(({ line }) => normalizeComparableText(line).includes(termKey));
    if (termUsedOutsideGlossary) return;

    const first = occurrences[0];
    pushIssue(issues, createRuleIssue({
      ruleId: 'glossary_binding_rule',
      detectorId: 'L46-07',
      severity: 'medium',
      description: `Glossary term "${first.label}" is defined but never bound to non-glossary behavior or contract text.`,
      files: [first.file],
      section: first.section,
      sectionSlug: first.section_slug,
      lineNumber: first.line_number,
      evidence: occurrences.map((occurrence) => `${occurrence.file}:${occurrence.line_number} ${occurrence.label}`).join('\n'),
      whyTriggered: 'The term appears in glossary definitions but does not appear in any non-glossary rule, workflow, requirement, or contract text.',
      evidenceSpans: occurrences.map((occurrence, index) => createEvidenceSpan({
        file: occurrence.file,
        section: occurrence.section,
        sectionSlug: occurrence.section_slug,
        lineStart: occurrence.line_number,
        role: index === 0 ? 'primary' : 'supporting',
        source: 'glossary_binding_rule',
        excerpt: occurrence.description || occurrence.label
      })),
      deterministicFix: 'Either bind the glossary term to real behavioral text or remove the unused definition.',
      recommendedFix: 'Reference the term in the requirements, workflows, or contracts it is meant to govern.'
    }));
  });
}

function runApiReturnSchemaRule(projectGraph, issues) {
  collectApiSections(projectGraph).forEach(({ documentIndex, section, lineStart, lineEnd, sectionText, apiOccurrences }) => {
    if (API_RESPONSE_PATTERN.test(sectionText)) return;

    const first = apiOccurrences[0];
    pushIssue(issues, createRuleIssue({
      ruleId: 'api_return_schema_rule',
      detectorId: 'L17-03',
      severity: 'high',
      description: `API section "${section?.title || first.label}" in ${documentIndex.name} defines an endpoint without a documented return contract.` ,
      files: [documentIndex.name],
      section: section?.title || '',
      sectionSlug: section?.slug || '',
      lineNumber: lineStart,
      lineEnd,
      evidence: sectionText.trim().slice(0, 500),
      whyTriggered: 'The endpoint section declares an API surface but does not document response status codes, response payloads, or return schema semantics.',
      evidenceSpans: [
        createEvidenceSpan({
          file: documentIndex.name,
          section: section?.title || '',
          sectionSlug: section?.slug || '',
          lineStart,
          lineEnd,
          source: 'api_return_schema_rule',
          excerpt: buildLineExcerpt(documentIndex, lineStart, Math.min(lineEnd, lineStart + 8))
        })
      ],
      deterministicFix: 'Add explicit success response status codes and define the returned payload or response schema for the endpoint.',
      recommendedFix: 'Document the endpoint output contract with concrete success codes and response-body structure.'
    }));
  });
}

function runApiErrorContractRule(projectGraph, issues) {
  collectApiSections(projectGraph).forEach(({ documentIndex, section, lineStart, lineEnd, sectionText, apiOccurrences }) => {
    if (API_ERROR_PATTERN.test(sectionText)) return;

    const first = apiOccurrences[0];
    pushIssue(issues, createRuleIssue({
      ruleId: 'api_error_contract_rule',
      detectorId: 'L17-04',
      severity: 'medium',
      description: `API section "${section?.title || first.label}" in ${documentIndex.name} omits explicit error-contract behavior.`,
      files: [documentIndex.name],
      section: section?.title || '',
      sectionSlug: section?.slug || '',
      lineNumber: lineStart,
      lineEnd,
      evidence: sectionText.trim().slice(0, 500),
      whyTriggered: 'The endpoint section declares a callable API surface but does not mention any error codes, failure responses, or error payload behavior.',
      evidenceSpans: [
        createEvidenceSpan({
          file: documentIndex.name,
          section: section?.title || '',
          sectionSlug: section?.slug || '',
          lineStart,
          lineEnd,
          source: 'api_error_contract_rule',
          excerpt: buildLineExcerpt(documentIndex, lineStart, Math.min(lineEnd, lineStart + 8))
        })
      ],
      deterministicFix: 'Add explicit error status codes and describe the corresponding error payload or failure semantics.',
      recommendedFix: 'Document at least the expected 4xx/5xx outcomes and any stable error-body structure.'
    }));
  });
}

function runApiIdempotencyRule(projectGraph, issues) {
  collectApiSections(projectGraph).forEach(({ documentIndex, section, lineStart, lineEnd, sectionText, methods, apiOccurrences }) => {
    const mutating = methods.some((method) => method === 'POST' || method === 'PATCH');
    if (!mutating || !API_RETRY_PATTERN.test(sectionText) || API_IDEMPOTENCY_PATTERN.test(sectionText)) return;

    const first = apiOccurrences[0];
    pushIssue(issues, createRuleIssue({
      ruleId: 'api_idempotency_rule',
      detectorId: 'L17-09',
      severity: 'high',
      description: `API section "${section?.title || first.label}" in ${documentIndex.name} describes retries for a mutating endpoint without idempotency guarantees.`,
      files: [documentIndex.name],
      section: section?.title || '',
      sectionSlug: section?.slug || '',
      lineNumber: lineStart,
      lineEnd,
      evidence: sectionText.trim().slice(0, 500),
      whyTriggered: 'The endpoint section mentions retry or replay behavior for a POST/PATCH operation but does not define idempotency, deduplication, or idempotency-key semantics.',
      evidenceSpans: [
        createEvidenceSpan({
          file: documentIndex.name,
          section: section?.title || '',
          sectionSlug: section?.slug || '',
          lineStart,
          lineEnd,
          source: 'api_idempotency_rule',
          excerpt: buildLineExcerpt(documentIndex, lineStart, Math.min(lineEnd, lineStart + 8))
        })
      ],
      deterministicFix: 'Document whether the operation is idempotent and, if needed, define an idempotency key or deduplication policy.',
      recommendedFix: 'Add retry-safe semantics before instructing clients to retry a mutating API call.'
    }));
  });
}

function runApiRateLimitRule(projectGraph, issues) {
  collectApiSections(projectGraph).forEach(({ documentIndex, section, lineStart, lineEnd, sectionText, apiOccurrences }) => {
    if (!API_RATE_LIMIT_PATTERN.test(sectionText) || API_RATE_LIMIT_CONCRETE_PATTERN.test(sectionText)) return;

    const first = apiOccurrences[0];
    pushIssue(issues, createRuleIssue({
      ruleId: 'api_rate_limit_rule',
      detectorId: 'L17-11',
      severity: 'medium',
      description: `API section "${section?.title || first.label}" in ${documentIndex.name} mentions rate limiting without a concrete limit or window.`,
      files: [documentIndex.name],
      section: section?.title || '',
      sectionSlug: section?.slug || '',
      lineNumber: lineStart,
      lineEnd,
      evidence: sectionText.trim().slice(0, 500),
      whyTriggered: 'The endpoint section references rate limits or quotas but does not specify a numerical quota, request ceiling, or time window.',
      evidenceSpans: [
        createEvidenceSpan({
          file: documentIndex.name,
          section: section?.title || '',
          sectionSlug: section?.slug || '',
          lineStart,
          lineEnd,
          source: 'api_rate_limit_rule',
          excerpt: buildLineExcerpt(documentIndex, lineStart, Math.min(lineEnd, lineStart + 8))
        })
      ],
      deterministicFix: 'Define the rate-limit quantity and the exact measurement window for the endpoint.',
      recommendedFix: 'Document the quota numerically, for example requests per minute or requests per day.'
    }));
  });
}

function runApiAuthAmbiguityRule(projectGraph, issues) {
  collectApiSections(projectGraph).forEach(({ documentIndex, section, lineStart, lineEnd, sectionText, apiOccurrences }) => {
    if (!API_AUTH_MENTION_PATTERN.test(sectionText) || API_AUTH_MECHANISM_PATTERN.test(sectionText)) return;

    const first = apiOccurrences[0];
    pushIssue(issues, createRuleIssue({
      ruleId: 'api_auth_ambiguity_rule',
      detectorId: 'L17-12',
      severity: 'high',
      description: `API section "${section?.title || first.label}" in ${documentIndex.name} references authentication without naming a concrete mechanism.`,
      files: [documentIndex.name],
      section: section?.title || '',
      sectionSlug: section?.slug || '',
      lineNumber: lineStart,
      lineEnd,
      evidence: sectionText.trim().slice(0, 500),
      whyTriggered: 'The endpoint section mentions authentication or authorization but does not specify a concrete mechanism such as Authorization header, Bearer token, API key, OAuth, JWT, or session semantics.',
      evidenceSpans: [
        createEvidenceSpan({
          file: documentIndex.name,
          section: section?.title || '',
          sectionSlug: section?.slug || '',
          lineStart,
          lineEnd,
          source: 'api_auth_ambiguity_rule',
          excerpt: buildLineExcerpt(documentIndex, lineStart, Math.min(lineEnd, lineStart + 8))
        })
      ],
      deterministicFix: 'Name the exact authentication mechanism and show how clients present credentials to the endpoint.',
      recommendedFix: 'Replace generic auth wording with the concrete credential scheme and header/token contract.'
    }));
  });
}

function runTerminologyRegistryGapRule(projectGraph, issues) {
  const hasGlossaryHeading = (projectGraph?.projectIndex?.documents || []).some((documentIndex) =>
    documentIndex.headings.some((heading) => GLOSSARY_HEADING_PATTERN.test(heading.title))
  );
  if (hasGlossaryHeading || (projectGraph?.glossaryOccurrences || []).length > 0) return;

  const candidateGroups = [
    ...(projectGraph?.identifierGroups || []),
    ...(projectGraph?.stateGroups || []),
    ...(projectGraph?.apiGroups || [])
  ];
  if (candidateGroups.length < 2) return;

  const evidenceOccurrences = candidateGroups
    .slice(0, 4)
    .map((group) => group[0])
    .filter(Boolean);
  if (evidenceOccurrences.length === 0) return;

  const first = evidenceOccurrences[0];
  pushIssue(issues, createRuleIssue({
    ruleId: 'terminology_registry_gap_rule',
    detectorId: 'L33-06',
    severity: 'medium',
    description: 'The loaded Markdown set reuses formal identifiers, states, or API surfaces without a glossary or terminology registry.',
    files: Array.from(new Set(evidenceOccurrences.map((occurrence) => occurrence.file))),
    section: first.section,
    sectionSlug: first.section_slug,
    lineNumber: first.line_number,
    evidence: evidenceOccurrences.map((occurrence) => `${occurrence.file}:${occurrence.line_number} ${occurrence.label}`).join('\n'),
    whyTriggered: 'Multiple formal symbols or contract surfaces are reused across the loaded Markdown set, but there is no glossary, terminology registry, or definitions section to bind those terms canonically.',
    evidenceSpans: evidenceOccurrences.map((occurrence, index) => createEvidenceSpan({
      file: occurrence.file,
      section: occurrence.section,
      sectionSlug: occurrence.section_slug,
      lineStart: occurrence.line_number,
      role: index === 0 ? 'primary' : 'supporting',
      source: 'terminology_registry_gap_rule',
      excerpt: occurrence.description || occurrence.label
    })),
    deterministicFix: 'Add a glossary or terminology registry that defines the repeated identifiers, states, and API symbols used across the documentation set.',
    recommendedFix: 'Create one canonical terminology section and bind repeated formal terms to it.'
  }));
}

function runFormalTerminologyRegistryRule(projectGraph, issues) {
  (projectGraph?.projectIndex?.documents || []).forEach((documentIndex) => {
    documentIndex.headings
      .filter((heading) => GLOSSARY_HEADING_PATTERN.test(heading.title))
      .forEach((heading) => {
        const formalEntries = (projectGraph?.glossaryOccurrences || []).filter(
          (occurrence) => occurrence.file === documentIndex.name && occurrence.section_slug === heading.slug
        );
        if (formalEntries.length > 0) return;

        pushIssue(issues, createRuleIssue({
          ruleId: 'formal_terminology_registry_rule',
          detectorId: 'L33-14',
          severity: 'medium',
          description: `Terminology section "${heading.title}" in ${documentIndex.name} does not contain formal parseable term definitions.`,
          files: [documentIndex.name],
          section: heading.title,
          sectionSlug: heading.slug,
          lineNumber: heading.lineStart,
          lineEnd: heading.lineEnd,
          evidence: buildLineExcerpt(documentIndex, heading.lineStart, heading.lineEnd),
          whyTriggered: 'A glossary or terminology heading exists, but the section does not contain parseable term-definition entries in a formal registry shape.',
          evidenceSpans: [
            createEvidenceSpan({
              file: documentIndex.name,
              section: heading.title,
              sectionSlug: heading.slug,
              lineStart: heading.lineStart,
              lineEnd: heading.lineEnd,
              source: 'formal_terminology_registry_rule',
              excerpt: buildLineExcerpt(documentIndex, heading.lineStart, Math.min(heading.lineEnd, heading.lineStart + 8))
            })
          ],
          deterministicFix: 'Rewrite the terminology section into explicit term-definition entries using a stable formal structure.',
          recommendedFix: 'Use consistent `Term: definition` or `**Term**: definition` entries inside the glossary.'
        }));
      });
  });
}

function runSymbolConsistencyRule(projectGraph, issues) {
  const canonicalGroups = new Map();

  (projectGraph?.identifierOccurrences || []).forEach((occurrence) => {
    const rawLabel = String(occurrence.label || '').toUpperCase();
    const canonical = rawLabel.replace(/[-_]/g, '');
    if (!canonical || canonical.length < 4) return;
    if (!canonicalGroups.has(canonical)) canonicalGroups.set(canonical, new Map());
    const variants = canonicalGroups.get(canonical);
    if (!variants.has(rawLabel)) variants.set(rawLabel, []);
    variants.get(rawLabel).push(occurrence);
  });

  canonicalGroups.forEach((variants) => {
    if (variants.size < 2) return;

    const representativeOccurrences = Array.from(variants.values()).map((occurrences) => occurrences[0]).filter(Boolean);
    const first = representativeOccurrences[0];
    pushIssue(issues, createRuleIssue({
      ruleId: 'symbol_consistency_rule',
      detectorId: 'L33-08',
      severity: 'medium',
      description: `Formal symbol variants ${Array.from(variants.keys()).join(', ')} are used interchangeably without a canonical spelling.`,
      files: Array.from(new Set(representativeOccurrences.map((occurrence) => occurrence.file))),
      section: first.section,
      sectionSlug: first.section_slug,
      lineNumber: first.line_number,
      evidence: representativeOccurrences.map((occurrence) => `${occurrence.file}:${occurrence.line_number} ${occurrence.label}`).join('\n'),
      whyTriggered: 'The same canonical symbol root appears with multiple surface spellings, which breaks formal symbol consistency.',
      evidenceSpans: representativeOccurrences.map((occurrence, index) => createEvidenceSpan({
        file: occurrence.file,
        section: occurrence.section,
        sectionSlug: occurrence.section_slug,
        lineStart: occurrence.line_number,
        role: index === 0 ? 'primary' : 'supporting',
        source: 'symbol_consistency_rule',
        excerpt: occurrence.description || occurrence.label
      })),
      deterministicFix: 'Choose one canonical symbol spelling and replace the other variants with explicit aliases or the canonical form.',
      recommendedFix: 'Standardize the symbol vocabulary so the same concept is never written with competing identifier forms.'
    }));
  });
}

function runStateSpaceDefinitionRule(projectGraph, issues) {
  const definedSymbols = buildDefinedStateSymbols(projectGraph);

  (projectGraph?.projectIndex?.documents || []).forEach((documentIndex) => {
    const transitionGroups = new Map();

    documentIndex.lines.forEach((line, index) => {
      if (!/(->|\u2192)/.test(line)) return;

      const tokens = Array.from(line.matchAll(/\b([A-Z][A-Z0-9_]{1,31})\b/g))
        .map((match) => match[1].toUpperCase())
        .filter((token) => token.length >= 3);
      if (tokens.length < 2) return;

      const section = getSectionForLine(documentIndex, index + 1);
      const groupKey = section?.slug || '__document__';
      if (!transitionGroups.has(groupKey)) {
        transitionGroups.set(groupKey, {
          section,
          transitions: []
        });
      }

      transitionGroups.get(groupKey).transitions.push({
        lineNumber: index + 1,
        line: String(line || '').trim(),
        tokens
      });
    });

    transitionGroups.forEach(({ section, transitions }) => {
      const undefinedTokens = Array.from(new Set(
        transitions.flatMap((transition) => transition.tokens).filter((token) => !definedSymbols.has(token))
      ));
      if (undefinedTokens.length === 0) return;

      const first = transitions[0];
      const last = transitions[transitions.length - 1];
      pushIssue(issues, createRuleIssue({
        ruleId: 'state_space_definition_rule',
        detectorId: 'L33-03',
        severity: 'high',
        description: `State machine symbols in ${documentIndex.name}${section?.title ? ` section "${section.title}"` : ''} are used without explicit state definitions.`,
        files: [documentIndex.name],
        section: section?.title || '',
        sectionSlug: section?.slug || '',
        lineNumber: first.lineNumber,
        lineEnd: last.lineNumber,
        evidence: transitions.map((transition) => `${documentIndex.name}:${transition.lineNumber} ${transition.line}`).join('\n'),
        whyTriggered: `The transition notation references undefined state symbols (${undefinedTokens.join(', ')}) without glossary, heading, or definition-line coverage.`,
        evidenceSpans: transitions.slice(0, 5).map((transition, index) => createEvidenceSpan({
          file: documentIndex.name,
          section: section?.title || '',
          sectionSlug: section?.slug || '',
          lineStart: transition.lineNumber,
          role: index === 0 ? 'primary' : 'supporting',
          source: 'state_space_definition_rule',
          excerpt: transition.line
        })),
        deterministicFix: 'Define each state symbol explicitly in a glossary, heading, or dedicated state definition block before using it in transitions.',
        recommendedFix: 'Add canonical definitions for every state token that appears in transition notation.'
      }));
    });
  });
}

function runIoContractDeterminismRule(projectGraph, issues) {
  collectApiSections(projectGraph).forEach(({ documentIndex, section, lineStart, lineEnd, sectionText, methods, apiOccurrences }) => {
    const hasInputContract = API_INPUT_PATTERN.test(sectionText);
    const hasOutputContract = API_OUTPUT_PATTERN.test(sectionText);
    const mutatingEndpoint = methods.some((method) => ['POST', 'PUT', 'PATCH'].includes(method));
    const missingInput = mutatingEndpoint && !hasInputContract;
    const missingOutput = !hasOutputContract;

    if (!missingInput && !missingOutput) return;

    const first = apiOccurrences[0];
    const reason = missingInput && missingOutput
      ? 'The endpoint section documents an API surface but defines neither an input contract nor an output contract.'
      : missingInput
        ? 'The endpoint section describes a mutating API surface without documenting request inputs or request-body semantics.'
        : 'The endpoint section documents input-side contract details but omits a corresponding output or response contract.';

    pushIssue(issues, createRuleIssue({
      ruleId: 'io_contract_determinism_rule',
      detectorId: 'L33-15',
      severity: 'high',
      description: `API section "${section?.title || first.label}" in ${documentIndex.name} has a non-deterministic input/output contract boundary.`,
      files: [documentIndex.name],
      section: section?.title || '',
      sectionSlug: section?.slug || '',
      lineNumber: lineStart,
      lineEnd,
      evidence: sectionText.trim().slice(0, 500),
      whyTriggered: reason,
      evidenceSpans: [
        createEvidenceSpan({
          file: documentIndex.name,
          section: section?.title || '',
          sectionSlug: section?.slug || '',
          lineStart,
          lineEnd,
          source: 'io_contract_determinism_rule',
          excerpt: buildLineExcerpt(documentIndex, lineStart, Math.min(lineEnd, lineStart + 8))
        })
      ],
      deterministicFix: 'Document both the input-side contract and the output-side contract for the endpoint in one deterministic section.',
      recommendedFix: 'Make request parameters/body and response status/body explicit so the endpoint contract is closed on both sides.'
    }));
  });
}

function buildDetectorExecutionReceipts(issues = []) {
  const issueGroups = new Map();
  issues.forEach((issue) => {
    const detectorId = typeof issue.detector_id === 'string' ? issue.detector_id.trim() : '';
    if (!detectorId) return;
    if (!issueGroups.has(detectorId)) issueGroups.set(detectorId, []);
    issueGroups.get(detectorId).push(issue);
  });

  return DETERMINISTIC_RULE_DEFINITIONS.map((rule) => {
    const ruleIssues = issueGroups.get(rule.detectorId) || [];
    return {
      detector_id: rule.detectorId,
      rule_id: rule.id,
      layer: rule.layer,
      subcategory: rule.subcategory,
      stage: rule.stage,
      owning_agent: rule.owningAgent,
      checked: true,
      status: ruleIssues.length > 0 ? 'hit' : 'clean',
      issue_count: ruleIssues.length,
      evidence_span_count: ruleIssues.reduce(
        (sum, issue) => sum + (Array.isArray(issue.evidence_spans) ? issue.evidence_spans.length : 0),
        0
      )
    };
  });
}

function summarizeIssues(issues, files, detectorExecutionReceipts = []) {
  const checkedSubcategories = Array.from(new Set(
    detectorExecutionReceipts
      .map((receipt) => receipt.subcategory)
      .filter(Boolean)
  ));
  const checkedStages = Array.from(new Set(
    detectorExecutionReceipts
      .map((receipt) => receipt.stage)
      .filter(Boolean)
  ));
  const hitSubcategories = Array.from(new Set(
    detectorExecutionReceipts
      .filter((receipt) => receipt.status === 'hit')
      .map((receipt) => receipt.subcategory)
      .filter(Boolean)
  ));
  const hitStages = Array.from(new Set(
    detectorExecutionReceipts
      .filter((receipt) => receipt.status === 'hit')
      .map((receipt) => receipt.stage)
      .filter(Boolean)
  ));
  const detectorsHit = detectorExecutionReceipts.filter((receipt) => receipt.status === 'hit').length;
  const detectorsChecked = detectorExecutionReceipts.length;

  return {
    total: issues.length,
    critical: issues.filter((issue) => issue.severity === 'critical').length,
    high: issues.filter((issue) => issue.severity === 'high').length,
    medium: issues.filter((issue) => issue.severity === 'medium').length,
    low: issues.filter((issue) => issue.severity === 'low').length,
    files_analyzed: Array.isArray(files) ? files.length : 0,
    rules_evaluated: DETERMINISTIC_RULE_DEFINITIONS.length,
    detectors_checked: detectorsChecked,
    detectors_hit: detectorsHit,
    detectors_clean: Math.max(0, detectorsChecked - detectorsHit),
    rule_subcategories_checked: checkedSubcategories,
    rule_subcategories_hit: hitSubcategories,
    rule_stages_checked: checkedStages,
    rule_stages_hit: hitStages,
    rule_subcategories_covered: checkedSubcategories,
    rule_stages_executed: checkedStages,
    detector_execution_receipts: detectorExecutionReceipts
  };
}

export function runDeterministicRuleEngine({ files = [], projectGraph, diagnostics = null }) {
  if (!projectGraph?.projectIndex?.documents?.length) {
    const detectorExecutionReceipts = buildDetectorExecutionReceipts([]);
    return {
      summary: summarizeIssues([], files, detectorExecutionReceipts),
      issues: [],
      root_causes: [],
      _sourceFiles: (files || []).map((file) => file.name)
    };
  }

  const issues = [];
  runBrokenHeadingHierarchyRule(projectGraph, issues);
  runOrphanSectionRule(projectGraph, issues);
  runDuplicateHeadingRule(projectGraph, issues);
  runBrokenCrossReferenceRule(projectGraph, issues);
  runRfc2119Rule(projectGraph, issues);
  runAmbiguousRequirementWordingRule(projectGraph, issues);
  runDuplicatedRequirementRule(projectGraph, issues);
  runRequirementConflictResolutionRule(projectGraph, issues);
  runMissingTerminalStateRule(projectGraph, issues);
  runMissingRollbackRule(projectGraph, issues);
  runWorkflowOrderingRule(projectGraph, issues);
  runWorkflowExitCriteriaRule(projectGraph, issues);
  runMissingExecutionTriggerRule(projectGraph, issues);
  runExecutionIdempotencyGapRule(projectGraph, issues);
  runExecutionOrderIndeterminismRule(projectGraph, issues);
  runGovernanceCheckpointRule(projectGraph, issues);
  runGovernanceBypassRule(projectGraph, issues);
  runComplianceGateOmissionRule(projectGraph, issues);
  runPolicyPriorityConflictRule(projectGraph, issues);
  runEnforcementPathGapRule(projectGraph, issues);
  runAuditTrailRequirementRule(projectGraph, issues);
  runControlPlaneOverrideConditionRule(projectGraph, issues);
  runAuthorityDelegationAmbiguityRule(projectGraph, issues);
  runPolicyEnforcementPointGapRule(projectGraph, issues);
  runExecutionOwnerBoundaryRule(projectGraph, issues);
  runRetryBackoffPolicyRule(projectGraph, issues);
  runParallelResourceOrderRule(projectGraph, issues);
  runDeadlockLivelockRiskRule(projectGraph, issues);
  runDeterministicReplayRequirementsRule(projectGraph, issues);
  runExecutionDeterminismGapRule(projectGraph, issues);
  runOutputDeterminismGapRule(projectGraph, issues);
  runCommitHashBindingRule(projectGraph, issues);
  runStateTransitionPreconditionRule(projectGraph, issues);
  runStateTransitionPostconditionRule(projectGraph, issues);
  runTransitionDeterminismFailureRule(projectGraph, issues);
  runTaskGraphCycleRule(projectGraph, issues);
  runTaskGraphMissingDependencyRule(projectGraph, issues);
  runTaskGraphDependencyOrderRule(projectGraph, issues);
  runTaskGraphOptionalRequiredConfusionRule(projectGraph, issues);
  runTaskGraphUnreachableNodeRule(projectGraph, issues);
  runTaskGraphPriorityPropagationRule(projectGraph, issues);
  runRedundantDependencyRule(projectGraph, issues);
  runDependencyOwnershipAmbiguityDetailRule(projectGraph, issues);
  runDependencyOwnershipRule(projectGraph, issues);
  runDependencyLifecycleRule(projectGraph, issues);
  runDependencyVersionAmbiguityRule(projectGraph, issues);
  runTransitiveDependencyConflictRule(projectGraph, issues);
  runIntentAmbiguityRule(projectGraph, issues);
  runChangeScopeBoundaryRule(projectGraph, issues);
  runUserIntentConsistencyRule(projectGraph, issues);
  runInteractionConflictRule(projectGraph, issues);
  runConflictingTriggerRule(projectGraph, issues);
  runIncompleteExecutionBranchRule(projectGraph, issues);
  runDeadEndWorkflowRule(projectGraph, issues);
  runConditionalAmbiguityRule(projectGraph, issues);
  runExecutionPathGapRule(projectGraph, issues);
  runPathDependencyCycleRule(projectGraph, issues);
  runPathStatePreservationRule(projectGraph, issues);
  runConditionalExecutionIndeterminismRule(projectGraph, issues);
  runExecutionBranchingLogicRule(projectGraph, issues);
  runMissingApprovalGateRule(projectGraph, issues);
  runUntraceableChangeRule(projectGraph, issues);
  runGovernanceUnclearOwnershipRule(projectGraph, issues);
  runMissingFailSafeRule(projectGraph, issues);
  runOverrideAmbiguityRule(projectGraph, issues);
  runUnauthorizedAgentWriteRule(projectGraph, issues);
  runTransitionNonDeterminismRule(projectGraph, issues);
  runConcurrencyModelAmbiguityRule(projectGraph, issues);
  runInputDeterminismGapRule(projectGraph, issues);
  runDecisionAuthorityAmbiguityRule(projectGraph, issues);
  runUndefinedIdentifierRule(projectGraph, issues);
  runGlossaryBindingRule(projectGraph, issues);
  runApiReturnSchemaRule(projectGraph, issues);
  runApiErrorContractRule(projectGraph, issues);
  runApiIdempotencyRule(projectGraph, issues);
  runApiRateLimitRule(projectGraph, issues);
  runApiAuthAmbiguityRule(projectGraph, issues);
  runTerminologyRegistryGapRule(projectGraph, issues);
  runStateSpaceDefinitionRule(projectGraph, issues);
  runSymbolConsistencyRule(projectGraph, issues);
  runFormalTerminologyRegistryRule(projectGraph, issues);
  runIoContractDeterminismRule(projectGraph, issues);
  runUiStateMappingContractRule(projectGraph, issues);
  const detectorExecutionReceipts = buildDetectorExecutionReceipts(issues);

  if (diagnostics) {
    diagnostics.deterministic_rule_issue_count = (diagnostics.deterministic_rule_issue_count || 0) + issues.length;
    diagnostics.deterministic_rule_runs = (diagnostics.deterministic_rule_runs || 0) + 1;
    diagnostics.deterministic_rule_checked_detector_count = detectorExecutionReceipts.length;
    diagnostics.deterministic_rule_hit_detector_count = detectorExecutionReceipts.filter((receipt) => receipt.status === 'hit').length;
    diagnostics.deterministic_rule_clean_detector_count = detectorExecutionReceipts.filter((receipt) => receipt.status === 'clean').length;
    diagnostics.deterministic_rule_detector_receipts = detectorExecutionReceipts;
  }

  return {
    summary: summarizeIssues(issues, files, detectorExecutionReceipts),
    issues,
    root_causes: [],
    _sourceFiles: (files || []).map((file) => file.name)
  };
}

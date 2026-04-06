import { DETECTOR_METADATA, LAYER_SUBCATEGORIES } from './detectorMetadata.js';
import { ORDERED_LAYER_IDS } from './layers.js';

function buildTopCounts(items = [], limit = 3) {
  const counts = new Map();
  items
    .filter(Boolean)
    .forEach((item) => counts.set(item, (counts.get(item) || 0) + 1));

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([value, count]) => ({ value, count }));
}

function mergeCountMaps(...countMaps) {
  const merged = {};
  countMaps.forEach((countMap) => {
    Object.entries(countMap || {}).forEach(([key, value]) => {
      merged[key] = (merged[key] || 0) + value;
    });
  });
  return merged;
}

function mergeUniqueStrings(...valueGroups) {
  return Array.from(
    new Set(
      valueGroups.flatMap((values) => (
        Array.isArray(values)
          ? values.filter((value) => typeof value === 'string' && value.trim())
          : []
      ))
    )
  ).sort((a, b) => a.localeCompare(b));
}

function compareDetectorIds(a, b) {
  const [, aLayer = '0', aDetector = '0'] = /^L(\d+)-(\d+)$/.exec(a || '') || [];
  const [, bLayer = '0', bDetector = '0'] = /^L(\d+)-(\d+)$/.exec(b || '') || [];
  const layerDelta = Number(aLayer) - Number(bLayer);
  if (layerDelta !== 0) return layerDelta;
  return Number(aDetector) - Number(bDetector);
}

function sortDetectorIds(ids = []) {
  return [...ids].sort(compareDetectorIds);
}

function normalizeDetectorExecutionReceipts(receipts = []) {
  if (!Array.isArray(receipts)) return [];
  return receipts
    .filter((receipt) => receipt && typeof receipt === 'object' && typeof receipt.detector_id === 'string' && receipt.detector_id.trim())
    .map((receipt) => ({
      detector_id: receipt.detector_id.trim(),
      status: typeof receipt.status === 'string' ? receipt.status.trim().toLowerCase() : 'clean'
    }));
}

function compressDetectorRanges(detectorIds = []) {
  const groups = new Map();
  sortDetectorIds(detectorIds).forEach((detectorId) => {
    const match = /^L(\d+)-(\d+)$/.exec(detectorId);
    if (!match) return;
    const [, layerNum, detectorNum] = match;
    if (!groups.has(layerNum)) {
      groups.set(layerNum, []);
    }
    groups.get(layerNum).push(Number(detectorNum));
  });

  return Array.from(groups.entries()).map(([layerNum, detectorNums]) => {
    const sorted = detectorNums.sort((a, b) => a - b);
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const formatId = (detectorNum) => `L${layerNum}-${String(detectorNum).padStart(2, '0')}`;
    return first === last ? formatId(first) : `${formatId(first)}..${formatId(last)}`;
  });
}

function buildOwnedSubcategoryEntries(ownedLayers = []) {
  return ownedLayers.flatMap((layerId) => (
    (LAYER_SUBCATEGORIES[layerId] || []).map((subcategory) => ({
      layer: layerId,
      subcategory,
      key: `${layerId}::${subcategory}`
    }))
  ));
}

function buildIssueSubcategoryKey(issue = {}) {
  const layerId = issue.category || issue.layer || '';
  const subcategory = issue.subcategory || '';
  return layerId && subcategory ? `${layerId}::${subcategory}` : '';
}

const BASE_ANALYSIS_AGENT_MESH = [
  {
    id: 'spec_absoluteness_agent',
    label: 'Spec Absoluteness Agent',
    ownedLayers: [
      'semantic',
      'factual',
      'intent',
      'quantitative',
      'requirement',
      'specification_formalism',
      'ontology_vocabulary_governance',
      'knowledge_source_authority'
    ],
    focusLayers: [
      'semantic',
      'requirement',
      'specification_formalism',
      'ontology_vocabulary_governance',
      'knowledge_source_authority'
    ],
    focusSubcategories: [
      'undefined terms',
      'ambiguous acceptance criteria',
      'input domain closure',
      'canonical vocabulary enforcement',
      'source-of-truth ranking'
    ],
    mission: 'Prioritize specification absoluteness, canonical vocabulary, closed-world validation, and requirement precision.',
    mergeStrategy: 'focus_priority_then_specificity',
    mergePriority: 80
  },
  {
    id: 'architecture_authority_agent',
    label: 'Architecture & Authority Agent',
    ownedLayers: [
      'architectural',
      'api_contract',
      'dependency_graph',
      'configuration',
      'interoperability',
      'agent_orchestration',
      'platform_abstraction',
      'control_plane_authority',
      'authority_path_integrity'
    ],
    focusLayers: [
      'architectural',
      'control_plane_authority',
      'authority_path_integrity',
      'platform_abstraction',
      'agent_orchestration'
    ],
    focusSubcategories: [
      'boundary leaks',
      'control-plane separation',
      'write path uniqueness',
      'platform-neutral architecture',
      'role non-overlap'
    ],
    mission: 'Scrutinize authority boundaries, delegation paths, architectural separation, and invalid control/runtime mixing.',
    mergeStrategy: 'authority_first',
    mergePriority: 95
  },
  {
    id: 'ui_operational_agent',
    label: 'UI & Operational UX Agent',
    ownedLayers: [
      'functional',
      'usability',
      'ui_surface_contract',
      'operational_ux_contract'
    ],
    focusLayers: [
      'ui_surface_contract',
      'usability',
      'operational_ux_contract',
      'workflow_lifecycle_integrity',
      'state_machine'
    ],
    focusSubcategories: [
      'mandatory UI component existence',
      'UI-to-system-state mapping',
      'no fatal state exposure',
      'progress state projection',
      'workflow exit criteria'
    ],
    mission: 'Focus on user-visible state integrity, calm-state UX contracts, workflow clarity, and fatal-state exposure.',
    mergeStrategy: 'ui_surface_first',
    mergePriority: 70
  },
  {
    id: 'execution_simulation_agent',
    label: 'Execution & Simulation Agent',
    ownedLayers: [
      'temporal',
      'completeness',
      'state_machine',
      'execution_path',
      'deterministic_execution',
      'simulation_verification',
      'workflow_lifecycle_integrity'
    ],
    focusLayers: [
      'execution_path',
      'deterministic_execution',
      'simulation_verification',
      'workflow_lifecycle_integrity',
      'failure_recovery_integrity'
    ],
    focusSubcategories: [
      'execution order determinism',
      'mandatory simulation',
      'no-skip execution paths',
      'rollback stage integrity',
      'retry budget correctness'
    ],
    mission: 'Stress execution ordering, simulation gates, determinism, retries, and lifecycle no-skip guarantees.',
    mergeStrategy: 'execution_contract_first',
    mergePriority: 92
  },
  {
    id: 'memory_world_state_agent',
    label: 'Memory & World State Agent',
    ownedLayers: [
      'knowledge_graph',
      'data_flow',
      'memory_world_model',
      'context_orchestration',
      'world_state_governance'
    ],
    focusLayers: [
      'memory_world_model',
      'world_state_governance',
      'data_flow',
      'knowledge_graph',
      'authority_path_integrity'
    ],
    focusSubcategories: [
      'PSG snapshot isolation',
      'PSG mutation gateway exclusivity',
      'state mutation invariants',
      'data provenance gap',
      'mutation gateway exclusivity'
    ],
    mission: 'Prioritize snapshot integrity, mutation-gateway exclusivity, world-state atomicity, and state lineage.',
    mergeStrategy: 'world_state_first',
    mergePriority: 94
  },
  {
    id: 'tool_deployment_agent',
    label: 'Tool, Environment & Deployment Agent',
    ownedLayers: [
      'security',
      'performance',
      'tool_execution_safety',
      'deployment_contract',
      'artifact_reproducibility',
      'environment_toolchain_isolation'
    ],
    focusLayers: [
      'tool_execution_safety',
      'deployment_contract',
      'artifact_reproducibility',
      'environment_toolchain_isolation',
      'platform_abstraction'
    ],
    focusSubcategories: [
      'sandbox isolation',
      'local export enforcement',
      'deterministic outputs',
      'host dependency prohibition',
      'compiler mapping correctness'
    ],
    mission: 'Prioritize tool isolation, export determinism, reproducible artifacts, and environment leakage prevention.',
    mergeStrategy: 'deployment_contract_first',
    mergePriority: 88
  },
  {
    id: 'reasoning_evidence_agent',
    label: 'Reasoning & Evidence Agent',
    ownedLayers: [
      'contradiction',
      'logical',
      'metacognition',
      'testability',
      'reasoning_integrity'
    ],
    focusLayers: [
      'reasoning_integrity',
      'factual',
      'metacognition',
      'knowledge_source_authority',
      'ontology_vocabulary_governance'
    ],
    focusSubcategories: [
      'evidence binding',
      'uncertainty propagation',
      'unverifiable conclusions',
      'stale knowledge invalidation',
      'undefined term rejection'
    ],
    mission: 'Scrutinize evidence binding, uncertainty propagation, assumption leakage, and unsupported conclusions.',
    mergeStrategy: 'evidence_binding_first',
    mergePriority: 86
  },
  {
    id: 'cross_layer_synthesis_agent',
    label: 'Cross-Layer Synthesis Agent',
    ownedLayers: [
      'structural',
      'adversarial',
      'error_handling',
      'maintainability',
      'governance',
      'resilience',
      'observability',
      'evolution',
      'failure_recovery_integrity'
    ],
    focusLayers: [
      'contradiction',
      'governance',
      'resilience',
      'failure_recovery_integrity',
      'workflow_lifecycle_integrity'
    ],
    focusSubcategories: [
      'direct conflicts',
      'policy-priority conflicts',
      'failure domain isolation',
      'loop/cycle break enforcement',
      'required step ordering'
    ],
    mission: 'Correlate root causes across layers, collapse duplicates, and emphasize escalation-worthy cross-layer interactions.',
    mergeStrategy: 'cross_layer_root_cause',
    mergePriority: 90
  }
];

function buildComputedAgent(agent) {
  const ownedLayers = agent.ownedLayers.filter(Boolean);
  const ownedSubcategoryEntries = buildOwnedSubcategoryEntries(ownedLayers);
  const ownedDetectorIds = sortDetectorIds(
    Object.values(DETECTOR_METADATA)
      .filter((meta) => ownedLayers.includes(meta.layer))
      .map((meta) => meta.id)
  );

  return {
    ...agent,
    ownedLayers,
    ownedSubcategories: ownedSubcategoryEntries.map((entry) => entry.subcategory),
    ownedSubcategoryKeys: ownedSubcategoryEntries.map((entry) => entry.key),
    ownedSubcategoryCount: ownedSubcategoryEntries.length,
    ownedDetectorIds,
    ownedDetectorCount: ownedDetectorIds.length,
    ownedDetectorRanges: compressDetectorRanges(ownedDetectorIds)
  };
}

export const ANALYSIS_AGENT_MESH = BASE_ANALYSIS_AGENT_MESH.map(buildComputedAgent);
export const ANALYSIS_AGENT_COUNT = ANALYSIS_AGENT_MESH.length;

function buildOwnershipIntegrity(mesh = ANALYSIS_AGENT_MESH) {
  const layerOwners = new Map();
  const subcategoryOwners = new Map();
  const detectorOwners = new Map();

  mesh.forEach((agent) => {
    agent.ownedLayers.forEach((layerId) => {
      if (!layerOwners.has(layerId)) {
        layerOwners.set(layerId, []);
      }
      layerOwners.get(layerId).push(agent.id);
    });

    agent.ownedSubcategoryKeys.forEach((subcategoryKey) => {
      if (!subcategoryOwners.has(subcategoryKey)) {
        subcategoryOwners.set(subcategoryKey, []);
      }
      subcategoryOwners.get(subcategoryKey).push(agent.id);
    });

    agent.ownedDetectorIds.forEach((detectorId) => {
      if (!detectorOwners.has(detectorId)) {
        detectorOwners.set(detectorId, []);
      }
      detectorOwners.get(detectorId).push(agent.id);
    });
  });

  const allSubcategoryKeys = ORDERED_LAYER_IDS.flatMap((layerId) => (
    (LAYER_SUBCATEGORIES[layerId] || []).map((subcategory) => `${layerId}::${subcategory}`)
  ));

  const overlappingLayers = Array.from(layerOwners.entries())
    .filter(([, owners]) => owners.length > 1)
    .map(([layerId, owners]) => ({ layerId, owners: [...owners] }));
  const overlappingSubcategories = Array.from(subcategoryOwners.entries())
    .filter(([, owners]) => owners.length > 1)
    .map(([subcategoryKey, owners]) => ({ subcategoryKey, owners: [...owners] }));
  const overlappingDetectors = Array.from(detectorOwners.entries())
    .filter(([, owners]) => owners.length > 1)
    .map(([detectorId, owners]) => ({ detectorId, owners: [...owners] }));

  const unownedLayers = ORDERED_LAYER_IDS.filter((layerId) => !layerOwners.has(layerId));
  const unownedSubcategories = allSubcategoryKeys.filter((subcategoryKey) => !subcategoryOwners.has(subcategoryKey));
  const unownedDetectors = sortDetectorIds(Object.keys(DETECTOR_METADATA).filter((detectorId) => !detectorOwners.has(detectorId)));

  const warnings = [];
  if (unownedLayers.length > 0) {
    warnings.push(`Unowned layers detected: ${unownedLayers.join(', ')}`);
  }
  if (unownedDetectors.length > 0) {
    warnings.push(`Unowned detectors detected: ${unownedDetectors.slice(0, 8).join(', ')}`);
  }
  if (overlappingLayers.length > 0) {
    warnings.push(`Overlapping layer ownership detected for ${overlappingLayers.length} layers.`);
  }
  if (overlappingDetectors.length > 0) {
    warnings.push(`Overlapping detector ownership detected for ${overlappingDetectors.length} detectors.`);
  }

  return {
    status: warnings.length === 0 ? 'sealed' : 'drift',
    warning_count: warnings.length,
    assigned_layer_count: layerOwners.size,
    assigned_subcategory_count: subcategoryOwners.size,
    assigned_detector_count: detectorOwners.size,
    unowned_layers: unownedLayers,
    unowned_subcategories: unownedSubcategories,
    unowned_detectors: unownedDetectors,
    overlapping_layers: overlappingLayers,
    overlapping_subcategories: overlappingSubcategories,
    overlapping_detectors: overlappingDetectors,
    warnings
  };
}

export const ANALYSIS_AGENT_OWNERSHIP = buildOwnershipIntegrity();
export const ANALYSIS_MESH_VERSION = 'taxonomy-v4-53x701-a8-owned-runtime';

function createCoverageReconciliation() {
  return {
    integrity_status: ANALYSIS_AGENT_OWNERSHIP.status,
    ownership_warning_count: ANALYSIS_AGENT_OWNERSHIP.warning_count,
    assigned_layer_count: ANALYSIS_AGENT_OWNERSHIP.assigned_layer_count,
    assigned_subcategory_count: ANALYSIS_AGENT_OWNERSHIP.assigned_subcategory_count,
    assigned_detector_count: ANALYSIS_AGENT_OWNERSHIP.assigned_detector_count,
    finding_backed_layer_count: 0,
    quiet_layer_count: ANALYSIS_AGENT_OWNERSHIP.assigned_layer_count,
    finding_backed_subcategory_count: 0,
    quiet_subcategory_count: ANALYSIS_AGENT_OWNERSHIP.assigned_subcategory_count,
    finding_backed_detector_count: 0,
    quiet_detector_count: ANALYSIS_AGENT_OWNERSHIP.assigned_detector_count,
    checked_detector_count: 0,
    checked_clean_detector_count: 0,
    checked_hit_detector_count: 0,
    touched_detector_count: 0,
    untouched_detector_count: ANALYSIS_AGENT_OWNERSHIP.assigned_detector_count,
    out_of_owned_scope_issue_count: 0,
    out_of_owned_scope_detector_count: 0,
    unowned_layer_count: ANALYSIS_AGENT_OWNERSHIP.unowned_layers.length,
    overlapping_layer_count: ANALYSIS_AGENT_OWNERSHIP.overlapping_layers.length,
    unowned_detector_count: ANALYSIS_AGENT_OWNERSHIP.unowned_detectors.length,
    overlapping_detector_count: ANALYSIS_AGENT_OWNERSHIP.overlapping_detectors.length,
    unowned_layer_ids: [...ANALYSIS_AGENT_OWNERSHIP.unowned_layers],
    overlapping_layer_ids: ANALYSIS_AGENT_OWNERSHIP.overlapping_layers.map((entry) => entry.layerId),
    unowned_detector_ids: ANALYSIS_AGENT_OWNERSHIP.unowned_detectors.slice(0, 25),
    overlapping_detector_ids: ANALYSIS_AGENT_OWNERSHIP.overlapping_detectors
      .map((entry) => entry.detectorId)
      .slice(0, 25)
  };
}

export function getAnalysisAgent(agentId) {
  return ANALYSIS_AGENT_MESH.find((agent) => agent.id === agentId) || null;
}

export function getAnalysisAgentFocusLayers(agentId) {
  const agent = getAnalysisAgent(agentId);
  return agent ? [...agent.focusLayers] : [];
}

export function getAnalysisAgentFocusSubcategories(agentId) {
  const agent = getAnalysisAgent(agentId);
  return agent ? [...agent.focusSubcategories] : [];
}

export function getAnalysisAgentOwnedLayers(agentId) {
  const agent = getAnalysisAgent(agentId);
  return agent ? [...agent.ownedLayers] : [];
}

export function getAnalysisAgentOwnedDetectorIds(agentId) {
  const agent = getAnalysisAgent(agentId);
  return agent ? [...agent.ownedDetectorIds] : [];
}

export function buildAnalysisAgentPrompt(agentId) {
  const agent = getAnalysisAgent(agentId);
  if (!agent) {
    return 'ANALYSIS MESH: Deterministic 8-agent audit mesh enabled. Evaluate the full taxonomy and remain consistent with the canonical merge contract.';
  }

  return `ANALYSIS MESH ROLE: ${agent.label}
Focus layers: ${agent.focusLayers.join(', ')}
Focus subcategories: ${agent.focusSubcategories.join(', ')}
Ownership layers: ${agent.ownedLayers.join(', ')}
Owned detector ranges: ${agent.ownedDetectorRanges.join('; ')}
Owned subcategories: ${agent.ownedSubcategoryCount}
Mission: ${agent.mission}
Runtime contract:
- merge_strategy=${agent.mergeStrategy}
- merge_priority=${agent.mergePriority}
- focus_layers=${agent.focusLayers.length}
- focus_subcategories=${agent.focusSubcategories.length}
- owned_layers=${agent.ownedLayers.length}
- owned_subcategories=${agent.ownedSubcategoryCount}
- owned_detectors=${agent.ownedDetectorCount}
Execution rule: Evaluate the full taxonomy, but treat the owned detector ranges above as your primary accountability scope. Findings outside owned scope should be emitted only when the evidence supports a real cross-layer escalation.
Traceability rule: Tag every emitted issue with analysis_agent="${agent.id}".`;
}

export function validateAnalysisAgentResult(agentId, issues = [], summary = {}, options = {}) {
  const agent = getAnalysisAgent(agentId);
  if (!agent) {
    return {
      agent_id: agentId,
      valid: false,
      status: 'unknown_agent',
      warnings: [`Unknown analysis agent: ${agentId}`]
    };
  }

  const detectorExecutionReceipts = normalizeDetectorExecutionReceipts(options.detectorExecutionReceipts);
  const focusLayerSet = new Set(agent.focusLayers);
  const focusSubcategorySet = new Set(agent.focusSubcategories);
  const ownedLayerSet = new Set(agent.ownedLayers);
  const ownedSubcategoryKeySet = new Set(agent.ownedSubcategoryKeys);
  const ownedDetectorSet = new Set(agent.ownedDetectorIds);

  let focusLayerHits = 0;
  let focusSubcategoryHits = 0;
  let ownedLayerHits = 0;
  let ownedSubcategoryHits = 0;
  let ownedDetectorHits = 0;
  let ownedScopeIssueCount = 0;
  let outOfOwnedScopeIssueCount = 0;
  let analysisAgentMismatchCount = 0;

  const observedLayers = new Set();
  const observedSubcategories = new Set();
  const observedDetectorIds = new Set();
  const observedOwnedLayers = new Set();
  const observedOwnedSubcategoryKeys = new Set();
  const observedOwnedDetectorIds = new Set();
  const outOfOwnedScopeDetectorIds = new Set();

  issues.forEach((issue) => {
    const layerId = issue.category || issue.layer || '';
    const subcategoryKey = buildIssueSubcategoryKey(issue);
    const detectorId = typeof issue.detector_id === 'string' && issue.detector_id.trim()
      ? issue.detector_id.trim()
      : '';

    if (layerId) {
      observedLayers.add(layerId);
    }
    if (subcategoryKey) {
      observedSubcategories.add(subcategoryKey);
    }
    if (detectorId) {
      observedDetectorIds.add(detectorId);
    }

    if (focusLayerSet.has(layerId)) {
      focusLayerHits += 1;
    }
    if (focusSubcategorySet.has(issue.subcategory)) {
      focusSubcategoryHits += 1;
    }
    if (issue.analysis_agent && issue.analysis_agent !== agent.id) {
      analysisAgentMismatchCount += 1;
    }

    const ownedByLayer = ownedLayerSet.has(layerId);
    const ownedBySubcategory = ownedSubcategoryKeySet.has(subcategoryKey);
    const ownedByDetector = ownedDetectorSet.has(detectorId);

    if (ownedByLayer) {
      ownedLayerHits += 1;
      observedOwnedLayers.add(layerId);
    }
    if (ownedBySubcategory) {
      ownedSubcategoryHits += 1;
      observedOwnedSubcategoryKeys.add(subcategoryKey);
    }
    if (ownedByDetector) {
      ownedDetectorHits += 1;
      observedOwnedDetectorIds.add(detectorId);
    }

    const inOwnedScope = ownedByDetector || (!detectorId && (ownedBySubcategory || ownedByLayer));
    if (inOwnedScope) {
      ownedScopeIssueCount += 1;
    } else {
      outOfOwnedScopeIssueCount += 1;
      if (detectorId) {
        outOfOwnedScopeDetectorIds.add(detectorId);
      }
    }
  });

  const warnings = [...ANALYSIS_AGENT_OWNERSHIP.warnings];
  if (issues.length > 0 && focusLayerHits === 0) {
    warnings.push(`No focus-layer findings emitted for ${agent.label}.`);
  }
  if (issues.length > 0 && focusSubcategoryHits === 0) {
    warnings.push(`No focus-subcategory findings emitted for ${agent.label}.`);
  }
  if (issues.length > 0 && ownedScopeIssueCount === 0) {
    warnings.push(`No owned-scope findings emitted for ${agent.label}.`);
  }
  if (outOfOwnedScopeIssueCount > 0) {
    warnings.push(`${outOfOwnedScopeIssueCount} findings landed outside ${agent.label}'s owned scope.`);
  }
  if (analysisAgentMismatchCount > 0) {
    warnings.push(`${analysisAgentMismatchCount} issues carried a mismatched analysis_agent tag.`);
  }

  const receiptCheckedOwnedDetectorIds = sortDetectorIds(
    detectorExecutionReceipts
      .filter((receipt) => ownedDetectorSet.has(receipt.detector_id))
      .map((receipt) => receipt.detector_id)
  );
  const receiptCleanOwnedDetectorIds = sortDetectorIds(
    detectorExecutionReceipts
      .filter((receipt) => receipt.status === 'clean' && ownedDetectorSet.has(receipt.detector_id))
      .map((receipt) => receipt.detector_id)
  );
  const receiptHitOwnedDetectorIds = sortDetectorIds(
    detectorExecutionReceipts
      .filter((receipt) => receipt.status === 'hit' && ownedDetectorSet.has(receipt.detector_id))
      .map((receipt) => receipt.detector_id)
  );
  const touchedOwnedDetectorIds = sortDetectorIds(
    Array.from(new Set([
      ...Array.from(observedOwnedDetectorIds),
      ...receiptCheckedOwnedDetectorIds
    ]))
  );
  const touchedOwnedDetectorIdSet = new Set(touchedOwnedDetectorIds);
  const untouchedOwnedDetectorIds = sortDetectorIds(
    agent.ownedDetectorIds.filter((detectorId) => !touchedOwnedDetectorIdSet.has(detectorId))
  );

  const status = analysisAgentMismatchCount > 0
    ? 'mismatch'
    : (outOfOwnedScopeIssueCount > 0
      ? (ownedScopeIssueCount > 0 ? 'mixed_scope' : 'cross_scope')
      : 'aligned');

  return {
    agent_id: agent.id,
    agent_label: agent.label,
    valid: analysisAgentMismatchCount === 0,
    status,
    merge_strategy: agent.mergeStrategy,
    merge_priority: agent.mergePriority,
    focus_layers: [...agent.focusLayers],
    focus_subcategories: [...agent.focusSubcategories],
    owned_layers: [...agent.ownedLayers],
    owned_layer_count: agent.ownedLayers.length,
    owned_subcategory_count: agent.ownedSubcategoryCount,
    owned_detector_count: agent.ownedDetectorCount,
    owned_detector_ranges: [...agent.ownedDetectorRanges],
    issues_emitted: issues.length,
    detectors_evaluated: Number.isFinite(Number(summary.detectors_evaluated))
      ? Number(summary.detectors_evaluated)
      : 0,
    detectors_skipped: Number.isFinite(Number(summary.detectors_skipped))
      ? Number(summary.detectors_skipped)
      : 0,
    layer_counts: issues.reduce((acc, issue) => {
      const layerId = issue.category || issue.layer;
      if (layerId) acc[layerId] = (acc[layerId] || 0) + 1;
      return acc;
    }, {}),
    subcategory_counts: issues.reduce((acc, issue) => {
      const subcategoryKey = buildIssueSubcategoryKey(issue);
      if (subcategoryKey) acc[subcategoryKey] = (acc[subcategoryKey] || 0) + 1;
      return acc;
    }, {}),
    focus_layer_hits: focusLayerHits,
    focus_subcategory_hits: focusSubcategoryHits,
    owned_layer_hits: ownedLayerHits,
    owned_subcategory_hits: ownedSubcategoryHits,
    owned_detector_hits: ownedDetectorHits,
    owned_scope_issue_count: ownedScopeIssueCount,
    out_of_focus_issue_count: issues.filter((issue) => !focusLayerSet.has(issue.category || issue.layer)).length,
    out_of_owned_scope_issue_count: outOfOwnedScopeIssueCount,
    owned_layer_hit_ids: Array.from(observedOwnedLayers).sort((a, b) => ORDERED_LAYER_IDS.indexOf(a) - ORDERED_LAYER_IDS.indexOf(b)),
    owned_subcategory_hit_keys: Array.from(observedOwnedSubcategoryKeys).sort((a, b) => a.localeCompare(b)),
    owned_detector_hit_ids: sortDetectorIds(Array.from(observedOwnedDetectorIds)),
    receipt_checked_owned_detector_ids: receiptCheckedOwnedDetectorIds,
    receipt_clean_owned_detector_ids: receiptCleanOwnedDetectorIds,
    receipt_hit_owned_detector_ids: receiptHitOwnedDetectorIds,
    touched_owned_detector_ids: touchedOwnedDetectorIds,
    untouched_owned_detector_ids: untouchedOwnedDetectorIds,
    observed_detector_ids: sortDetectorIds(Array.from(observedDetectorIds)),
    out_of_owned_scope_detector_ids: sortDetectorIds(Array.from(outOfOwnedScopeDetectorIds)),
    owned_layer_coverage_count: observedOwnedLayers.size,
    owned_subcategory_coverage_count: observedOwnedSubcategoryKeys.size,
    owned_detector_coverage_count: observedOwnedDetectorIds.size,
    receipt_checked_owned_detector_count: receiptCheckedOwnedDetectorIds.length,
    receipt_clean_owned_detector_count: receiptCleanOwnedDetectorIds.length,
    receipt_hit_owned_detector_count: receiptHitOwnedDetectorIds.length,
    touched_owned_detector_count: touchedOwnedDetectorIds.length,
    untouched_owned_detector_count: untouchedOwnedDetectorIds.length,
    quiet_owned_layer_count: Math.max(0, agent.ownedLayers.length - observedOwnedLayers.size),
    quiet_owned_subcategory_count: Math.max(0, agent.ownedSubcategoryCount - observedOwnedSubcategoryKeys.size),
    quiet_owned_detector_count: Math.max(0, agent.ownedDetectorCount - observedOwnedDetectorIds.size),
    dominant_layers: buildTopCounts(issues.map((issue) => issue.category || issue.layer)),
    dominant_subcategories: buildTopCounts(issues.map((issue) => buildIssueSubcategoryKey(issue)).map((value) => value.replace(/^.*::/, ''))),
    warnings
  };
}

export function createEmptyAnalysisMeshSummary() {
  return {
    configured_agents: ANALYSIS_AGENT_COUNT,
    completed_passes: 0,
    merge_strategies: Array.from(new Set(ANALYSIS_AGENT_MESH.map((agent) => agent.mergeStrategy))),
    ownership_integrity: ANALYSIS_AGENT_OWNERSHIP,
    coverage_reconciliation: createCoverageReconciliation(),
    agents: []
  };
}

export function mergeAnalysisMeshRuns(agentRuns = []) {
  const summary = createEmptyAnalysisMeshSummary();
  const grouped = new Map();

  agentRuns.forEach((run) => {
    if (!run?.agent_id) return;
    if (!grouped.has(run.agent_id)) {
      grouped.set(run.agent_id, {
        ...run,
        passes: 1,
        warnings: [...(run.warnings || [])]
      });
      return;
    }

    const existing = grouped.get(run.agent_id);
    existing.passes += 1;
    existing.issues_emitted += run.issues_emitted || 0;
    existing.detectors_evaluated += run.detectors_evaluated || 0;
    existing.detectors_skipped += run.detectors_skipped || 0;
    existing.focus_layer_hits += run.focus_layer_hits || 0;
    existing.focus_subcategory_hits += run.focus_subcategory_hits || 0;
    existing.owned_layer_hits += run.owned_layer_hits || 0;
    existing.owned_subcategory_hits += run.owned_subcategory_hits || 0;
    existing.owned_detector_hits += run.owned_detector_hits || 0;
    existing.owned_scope_issue_count += run.owned_scope_issue_count || 0;
    existing.out_of_focus_issue_count += run.out_of_focus_issue_count || 0;
    existing.out_of_owned_scope_issue_count += run.out_of_owned_scope_issue_count || 0;
    existing.layer_counts = mergeCountMaps(existing.layer_counts, run.layer_counts);
    existing.subcategory_counts = mergeCountMaps(existing.subcategory_counts, run.subcategory_counts);
    existing.owned_layer_hit_ids = mergeUniqueStrings(existing.owned_layer_hit_ids, run.owned_layer_hit_ids);
    existing.owned_subcategory_hit_keys = mergeUniqueStrings(existing.owned_subcategory_hit_keys, run.owned_subcategory_hit_keys);
    existing.owned_detector_hit_ids = sortDetectorIds(mergeUniqueStrings(existing.owned_detector_hit_ids, run.owned_detector_hit_ids));
    existing.receipt_checked_owned_detector_ids = sortDetectorIds(mergeUniqueStrings(existing.receipt_checked_owned_detector_ids, run.receipt_checked_owned_detector_ids));
    existing.receipt_clean_owned_detector_ids = sortDetectorIds(mergeUniqueStrings(existing.receipt_clean_owned_detector_ids, run.receipt_clean_owned_detector_ids));
    existing.receipt_hit_owned_detector_ids = sortDetectorIds(mergeUniqueStrings(existing.receipt_hit_owned_detector_ids, run.receipt_hit_owned_detector_ids));
    existing.touched_owned_detector_ids = sortDetectorIds(mergeUniqueStrings(existing.touched_owned_detector_ids, run.touched_owned_detector_ids));
    existing.untouched_owned_detector_ids = sortDetectorIds(mergeUniqueStrings(existing.untouched_owned_detector_ids, run.untouched_owned_detector_ids));
    existing.observed_detector_ids = sortDetectorIds(mergeUniqueStrings(existing.observed_detector_ids, run.observed_detector_ids));
    existing.out_of_owned_scope_detector_ids = sortDetectorIds(mergeUniqueStrings(existing.out_of_owned_scope_detector_ids, run.out_of_owned_scope_detector_ids));
    existing.status = existing.status === 'mismatch' || run.status === 'mismatch'
      ? 'mismatch'
      : (existing.status === 'cross_scope' || run.status === 'cross_scope'
        ? 'cross_scope'
        : (existing.status === 'mixed_scope' || run.status === 'mixed_scope' ? 'mixed_scope' : 'aligned'));
    existing.valid = existing.valid && run.valid;
    existing.warnings = Array.from(new Set([...(existing.warnings || []), ...(run.warnings || [])]));
  });

  summary.agents = Array.from(grouped.values())
    .sort((a, b) => b.merge_priority - a.merge_priority)
    .map((agent) => {
      const registeredAgent = getAnalysisAgent(agent.agent_id);
      const ownedDetectorIds = Array.isArray(registeredAgent?.ownedDetectorIds) ? registeredAgent.ownedDetectorIds : [];
      const touchedOwnedDetectorIds = sortDetectorIds(Array.isArray(agent.touched_owned_detector_ids) ? agent.touched_owned_detector_ids : []);
      const touchedOwnedDetectorIdSet = new Set(touchedOwnedDetectorIds);
      const untouchedOwnedDetectorIds = sortDetectorIds(
        ownedDetectorIds.filter((detectorId) => !touchedOwnedDetectorIdSet.has(detectorId))
      );

      return {
        ...agent,
        touched_owned_detector_ids: touchedOwnedDetectorIds,
        untouched_owned_detector_ids: untouchedOwnedDetectorIds,
        owned_layer_coverage_count: Array.isArray(agent.owned_layer_hit_ids) ? agent.owned_layer_hit_ids.length : 0,
        owned_subcategory_coverage_count: Array.isArray(agent.owned_subcategory_hit_keys) ? agent.owned_subcategory_hit_keys.length : 0,
        owned_detector_coverage_count: Array.isArray(agent.owned_detector_hit_ids) ? agent.owned_detector_hit_ids.length : 0,
        receipt_checked_owned_detector_count: Array.isArray(agent.receipt_checked_owned_detector_ids) ? agent.receipt_checked_owned_detector_ids.length : 0,
        receipt_clean_owned_detector_count: Array.isArray(agent.receipt_clean_owned_detector_ids) ? agent.receipt_clean_owned_detector_ids.length : 0,
        receipt_hit_owned_detector_count: Array.isArray(agent.receipt_hit_owned_detector_ids) ? agent.receipt_hit_owned_detector_ids.length : 0,
        touched_owned_detector_count: touchedOwnedDetectorIds.length,
        untouched_owned_detector_count: untouchedOwnedDetectorIds.length,
        quiet_owned_layer_count: Math.max(0, (agent.owned_layer_count || 0) - (agent.owned_layer_hit_ids?.length || 0)),
        quiet_owned_subcategory_count: Math.max(0, (agent.owned_subcategory_count || 0) - (agent.owned_subcategory_hit_keys?.length || 0)),
        quiet_owned_detector_count: Math.max(0, (agent.owned_detector_count || 0) - (agent.owned_detector_hit_ids?.length || 0)),
        dominant_layers: buildTopCounts(
          Object.entries(agent.layer_counts || {}).flatMap(([value, count]) => Array.from({ length: count }, () => value))
        ),
        dominant_subcategories: buildTopCounts(
          Object.entries(agent.subcategory_counts || {}).flatMap(([value, count]) => Array.from({ length: count }, () => value.replace(/^.*::/, '')))
        )
      };
    });

  summary.completed_passes = summary.agents.reduce((sum, agent) => sum + (agent.passes || 0), 0);
  summary.validation_warnings = summary.agents.reduce((sum, agent) => sum + (agent.warnings?.length || 0), 0);
  summary.focus_layer_hits = summary.agents.reduce((sum, agent) => sum + (agent.focus_layer_hits || 0), 0);
  summary.focus_subcategory_hits = summary.agents.reduce((sum, agent) => sum + (agent.focus_subcategory_hits || 0), 0);
  summary.owned_layer_hits = summary.agents.reduce((sum, agent) => sum + (agent.owned_layer_hits || 0), 0);
  summary.owned_subcategory_hits = summary.agents.reduce((sum, agent) => sum + (agent.owned_subcategory_hits || 0), 0);
  summary.owned_detector_hits = summary.agents.reduce((sum, agent) => sum + (agent.owned_detector_hits || 0), 0);
  summary.owned_scope_issue_count = summary.agents.reduce((sum, agent) => sum + (agent.owned_scope_issue_count || 0), 0);
  summary.out_of_focus_issue_count = summary.agents.reduce((sum, agent) => sum + (agent.out_of_focus_issue_count || 0), 0);
  summary.out_of_owned_scope_issue_count = summary.agents.reduce((sum, agent) => sum + (agent.out_of_owned_scope_issue_count || 0), 0);

  const findingBackedLayerIds = mergeUniqueStrings(...summary.agents.map((agent) => agent.owned_layer_hit_ids));
  const findingBackedSubcategoryKeys = mergeUniqueStrings(...summary.agents.map((agent) => agent.owned_subcategory_hit_keys));
  const findingBackedDetectorIds = sortDetectorIds(mergeUniqueStrings(...summary.agents.map((agent) => agent.owned_detector_hit_ids)));
  const checkedDetectorIds = sortDetectorIds(mergeUniqueStrings(...summary.agents.map((agent) => agent.receipt_checked_owned_detector_ids)));
  const checkedCleanDetectorIds = sortDetectorIds(mergeUniqueStrings(...summary.agents.map((agent) => agent.receipt_clean_owned_detector_ids)));
  const checkedHitDetectorIds = sortDetectorIds(mergeUniqueStrings(...summary.agents.map((agent) => agent.receipt_hit_owned_detector_ids)));
  const touchedDetectorIds = sortDetectorIds(mergeUniqueStrings(...summary.agents.map((agent) => agent.touched_owned_detector_ids)));
  const outOfOwnedScopeDetectorIds = sortDetectorIds(mergeUniqueStrings(...summary.agents.map((agent) => agent.out_of_owned_scope_detector_ids)));

  summary.coverage_reconciliation = {
    ...createCoverageReconciliation(),
    finding_backed_layer_count: findingBackedLayerIds.length,
    quiet_layer_count: Math.max(0, ANALYSIS_AGENT_OWNERSHIP.assigned_layer_count - findingBackedLayerIds.length),
    finding_backed_subcategory_count: findingBackedSubcategoryKeys.length,
    quiet_subcategory_count: Math.max(0, ANALYSIS_AGENT_OWNERSHIP.assigned_subcategory_count - findingBackedSubcategoryKeys.length),
    finding_backed_detector_count: findingBackedDetectorIds.length,
    quiet_detector_count: Math.max(0, ANALYSIS_AGENT_OWNERSHIP.assigned_detector_count - findingBackedDetectorIds.length),
    checked_detector_count: checkedDetectorIds.length,
    checked_clean_detector_count: checkedCleanDetectorIds.length,
    checked_hit_detector_count: checkedHitDetectorIds.length,
    touched_detector_count: touchedDetectorIds.length,
    untouched_detector_count: Math.max(0, ANALYSIS_AGENT_OWNERSHIP.assigned_detector_count - touchedDetectorIds.length),
    out_of_owned_scope_issue_count: summary.out_of_owned_scope_issue_count,
    out_of_owned_scope_detector_count: outOfOwnedScopeDetectorIds.length
  };

  return summary;
}

import { ORDERED_LAYER_IDS, getLayerById } from './layers';

function toCoveragePercent(covered, total) {
  if (!Number.isFinite(Number(total)) || Number(total) <= 0) return 0;
  return Number((((Number(covered) || 0) / Number(total)) * 100).toFixed(1));
}

function collectUniqueDetectorIds(issues = [], predicate = null) {
  const detectorIds = new Set();

  (Array.isArray(issues) ? issues : []).forEach((issue) => {
    if (typeof predicate === 'function' && !predicate(issue)) return;

    const detectorId = typeof issue?.detector_id === 'string' ? issue.detector_id.trim() : '';
    if (detectorId) {
      detectorIds.add(detectorId);
    }
  });

  return Array.from(detectorIds).sort((a, b) => a.localeCompare(b));
}

function collectReceiptDetectorIds(receipts = []) {
  const detectorIds = new Set();

  (Array.isArray(receipts) ? receipts : []).forEach((receipt) => {
    const detectorId = typeof receipt?.detector_id === 'string' ? receipt.detector_id.trim() : '';
    if (detectorId) {
      detectorIds.add(detectorId);
    }
  });

  return Array.from(detectorIds).sort((a, b) => a.localeCompare(b));
}

function buildLayerDetectorMaps({
  detectorMetadata = {},
  deterministicRuleDefinitions = []
}) {
  const definedDetectorIdsByLayer = new Map(ORDERED_LAYER_IDS.map((layerId) => [layerId, new Set()]));
  const deterministicDetectorIdsByLayer = new Map(ORDERED_LAYER_IDS.map((layerId) => [layerId, new Set()]));

  Object.values(detectorMetadata || {}).forEach((detector) => {
    const layerId = typeof detector?.layer === 'string' ? detector.layer.trim() : '';
    const detectorId = typeof detector?.id === 'string' ? detector.id.trim() : '';
    if (!layerId || !detectorId) return;
    if (!definedDetectorIdsByLayer.has(layerId)) {
      definedDetectorIdsByLayer.set(layerId, new Set());
    }
    definedDetectorIdsByLayer.get(layerId).add(detectorId);
  });

  (Array.isArray(deterministicRuleDefinitions) ? deterministicRuleDefinitions : []).forEach((rule) => {
    const layerId = typeof rule?.layer === 'string' ? rule.layer.trim() : '';
    const detectorId = typeof rule?.detectorId === 'string' ? rule.detectorId.trim() : '';
    if (!layerId || !detectorId) return;
    if (!deterministicDetectorIdsByLayer.has(layerId)) {
      deterministicDetectorIdsByLayer.set(layerId, new Set());
    }
    deterministicDetectorIdsByLayer.get(layerId).add(detectorId);
  });

  return {
    definedDetectorIdsByLayer,
    deterministicDetectorIdsByLayer
  };
}

function buildLayerCoverage({
  detectorMetadata = {},
  deterministicRuleDefinitions = [],
  findingBackedDetectorIds = [],
  modelFindingBackedDetectorIds = [],
  localCheckedDetectorIds = [],
  runtimeTouchedDetectorIds = []
}) {
  const {
    definedDetectorIdsByLayer,
    deterministicDetectorIdsByLayer
  } = buildLayerDetectorMaps({
    detectorMetadata,
    deterministicRuleDefinitions
  });

  const findingBackedSet = new Set(findingBackedDetectorIds);
  const modelFindingBackedSet = new Set(modelFindingBackedDetectorIds);
  const localCheckedSet = new Set(localCheckedDetectorIds);
  const runtimeTouchedSet = new Set(runtimeTouchedDetectorIds);

  return ORDERED_LAYER_IDS.map((layerId) => {
    const layer = getLayerById(layerId);
    const definedDetectorIds = Array.from(definedDetectorIdsByLayer.get(layerId) || []);
    const deterministicDetectorIds = Array.from(deterministicDetectorIdsByLayer.get(layerId) || []);
    const modelDrivenCatalogDetectorCount = Math.max(0, definedDetectorIds.length - deterministicDetectorIds.length);
    const findingBackedCount = definedDetectorIds.filter((detectorId) => findingBackedSet.has(detectorId)).length;
    const modelFindingBackedCount = definedDetectorIds.filter((detectorId) => modelFindingBackedSet.has(detectorId)).length;
    const localCheckedCount = definedDetectorIds.filter((detectorId) => localCheckedSet.has(detectorId)).length;
    const runtimeTouchedCount = definedDetectorIds.filter((detectorId) => runtimeTouchedSet.has(detectorId)).length;

    return {
      layer_id: layerId,
      layer_label: layer.label,
      layer_number: layer.number,
      detectors_defined: definedDetectorIds.length,
      deterministic_catalog_detectors: deterministicDetectorIds.length,
      model_driven_catalog_detectors: modelDrivenCatalogDetectorCount,
      detectors_finding_backed: findingBackedCount,
      detectors_model_finding_backed: modelFindingBackedCount,
      detectors_locally_checked: localCheckedCount,
      detectors_runtime_touched: runtimeTouchedCount,
      detectors_untouched: Math.max(0, definedDetectorIds.length - runtimeTouchedCount),
      deterministic_catalog_coverage_percent: toCoveragePercent(localCheckedCount, deterministicDetectorIds.length),
      model_driven_catalog_coverage_percent: toCoveragePercent(modelFindingBackedCount, modelDrivenCatalogDetectorCount)
    };
  });
}

export function buildRuntimeDetectorCoverage({
  issues = [],
  deterministicReceipts = [],
  detectorMetadata = {},
  totalDetectorCount = 0,
  deterministicRuleDefinitions = []
} = {}) {
  const findingBackedDetectorIds = collectUniqueDetectorIds(issues);
  const modelFindingBackedDetectorIds = collectUniqueDetectorIds(
    issues,
    (issue) => String(issue?.detection_source || '').trim().toLowerCase() !== 'rule'
  );
  const localCheckedDetectorIds = collectReceiptDetectorIds(deterministicReceipts);
  const runtimeTouchedDetectorIds = Array.from(
    new Set([...findingBackedDetectorIds, ...localCheckedDetectorIds])
  ).sort((a, b) => a.localeCompare(b));
  const deterministicCatalogDetectorCount = Array.from(
    new Set(
      (Array.isArray(deterministicRuleDefinitions) ? deterministicRuleDefinitions : [])
        .map((rule) => (typeof rule?.detectorId === 'string' ? rule.detectorId.trim() : ''))
        .filter(Boolean)
    )
  ).length;
  const modelDrivenCatalogDetectorCount = Math.max(
    0,
    Number(totalDetectorCount || 0) - deterministicCatalogDetectorCount
  );

  return {
    detectorsDefined: totalDetectorCount,
    findingBackedDetectorIds,
    findingBackedDetectorCount: findingBackedDetectorIds.length,
    modelFindingBackedDetectorIds,
    modelFindingBackedDetectorCount: modelFindingBackedDetectorIds.length,
    localCheckedDetectorIds,
    localCheckedDetectorCount: localCheckedDetectorIds.length,
    runtimeTouchedDetectorIds,
    runtimeTouchedDetectorCount: runtimeTouchedDetectorIds.length,
    untouchedDetectorCount: Math.max(0, Number(totalDetectorCount || 0) - runtimeTouchedDetectorIds.length),
    deterministicCatalogDetectorCount,
    modelDrivenCatalogDetectorCount,
    deterministicCatalogCoveragePercent: toCoveragePercent(
      localCheckedDetectorIds.length,
      deterministicCatalogDetectorCount
    ),
    modelDrivenCatalogCoveragePercent: toCoveragePercent(
      modelFindingBackedDetectorIds.length,
      modelDrivenCatalogDetectorCount
    ),
    layerCoverage: buildLayerCoverage({
      detectorMetadata,
      deterministicRuleDefinitions,
      findingBackedDetectorIds,
      modelFindingBackedDetectorIds,
      localCheckedDetectorIds,
      runtimeTouchedDetectorIds
    })
  };
}

export function applyRuntimeDetectorCoverageSummary(summary, coverage) {
  if (!summary || !coverage) return;

  summary.detectors_defined = coverage.detectorsDefined;
  summary.detectors_finding_backed = coverage.findingBackedDetectorCount;
  summary.detectors_model_finding_backed = coverage.modelFindingBackedDetectorCount;
  summary.detectors_locally_checked = coverage.localCheckedDetectorCount;
  summary.detectors_runtime_touched = coverage.runtimeTouchedDetectorCount;
  summary.detectors_untouched = coverage.untouchedDetectorCount;
  summary.deterministic_catalog_detector_count = coverage.deterministicCatalogDetectorCount;
  summary.model_driven_catalog_detector_count = coverage.modelDrivenCatalogDetectorCount;
  summary.deterministic_catalog_coverage_percent = coverage.deterministicCatalogCoveragePercent;
  summary.model_driven_catalog_coverage_percent = coverage.modelDrivenCatalogCoveragePercent;
  summary.layer_coverage = Array.isArray(coverage.layerCoverage) ? coverage.layerCoverage : [];
  summary.detectors_evaluated = coverage.runtimeTouchedDetectorCount;
  summary.detectors_skipped = coverage.untouchedDetectorCount;
  summary.detector_coverage_mode = 'receipt_backed_and_finding_backed';
}

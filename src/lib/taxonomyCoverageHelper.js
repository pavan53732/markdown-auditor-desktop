import { DETECTOR_METADATA, LAYER_SUBCATEGORIES } from './detectorMetadata.js';
import { CROSS_LAYER_BUNDLES } from './crossLayerBundles.js';
import { LAYERS } from './layers.js';

// Deep-spec layers are L33-L45 (indices 32-44 in the LAYERS array)
const DEEP_SPEC_LAYER_IDS = LAYERS.slice(32).map(l => l.id);

export function generateTaxonomyQualityReport() {
  const detectors = Object.values(DETECTOR_METADATA);
  const totalDetectors = detectors.length;
  const layers = Object.keys(LAYER_SUBCATEGORIES);

  // ─── Per-layer analysis ───────────────────────────────────────────────
  const layerStats = layers.map(layer => {
    const layerDetectors = detectors.filter(d => d.layer === layer);
    const subcategories = LAYER_SUBCATEGORIES[layer] || [];
    const usedSubcategories = new Set(layerDetectors.map(d => d.subcategory));
    const missingSubcategories = subcategories.filter(s => !usedSubcategories.has(s));

    // Existing richness metrics (6 fields)
    const hasTrigger = layerDetectors.every(d => d.trigger_pattern);
    const hasEvidence = layerDetectors.every(d => d.required_evidence);
    const hasFP = layerDetectors.every(d => d.false_positive_guards);
    const hasFloor = layerDetectors.every(d => d.severity_floor);
    const hasCeiling = layerDetectors.every(d => d.severity_ceiling);
    const hasRelatedLayers = layerDetectors.every(d => d.related_layers && d.related_layers.length > 0);

    const richnessScore = [hasTrigger, hasEvidence, hasFP, hasFloor, hasCeiling, hasRelatedLayers].filter(Boolean).length;

    // Per-layer detector density
    const detectorDensity = subcategories.length > 0 ? layerDetectors.length / subcategories.length : 0;

    // Subcategory density warnings
    const subcategoryDensity = subcategories.length > 0 ? usedSubcategories.size / subcategories.length : 0;

    // ─── NEW: related_layers coverage percent per layer ──────────────────
    const detectorsWithRelatedLayers = layerDetectors.filter(d => Array.isArray(d.related_layers) && d.related_layers.length > 0).length;
    const relatedLayersCoveragePct = layerDetectors.length > 0
      ? Math.round((detectorsWithRelatedLayers / layerDetectors.length) * 100)
      : 0;

    // ─── NEW: Metadata richness scoring (0-100 based on 4 fields) ──────
    const fieldsToCheck = ['severity_ceiling', 'severity_floor', 'trigger_pattern', 'related_layers'];
    const richnessFieldCounts = fieldsToCheck.map(field => {
      return layerDetectors.filter(d => {
        const val = d[field];
        if (field === 'related_layers') return Array.isArray(val) && val.length > 0;
        return val !== undefined && val !== null && val !== '';
      }).length;
    });
    const totalPossibleRichness = layerDetectors.length * fieldsToCheck.length;
    const metadataRichnessPct = totalPossibleRichness > 0
      ? Math.round((richnessFieldCounts.reduce((a, b) => a + b, 0) / totalPossibleRichness) * 100)
      : 0;

    // ─── NEW: Missing field summaries by layer ─────────────────────────
    const missingCeiling = layerDetectors.filter(d => !d.severity_ceiling).length;
    const missingFloor = layerDetectors.filter(d => !d.severity_floor).length;
    const missingTrigger = layerDetectors.filter(d => !d.trigger_pattern).length;
    const missingRelatedLayers = layerDetectors.filter(d => !d.related_layers || d.related_layers.length === 0).length;

    // ─── NEW: Subcategory density (detectors per subcategory) ──────────
    const subcategoryDetectorCounts = {};
    subcategories.forEach(sub => {
      subcategoryDetectorCounts[sub] = layerDetectors.filter(d => d.subcategory === sub).length;
    });
    const singleDetectorSubcategories = subcategories.filter(sub => subcategoryDetectorCounts[sub] === 1);

    // ─── NEW: Bundle coverage per layer ────────────────────────────────
    const bundlesReferencingLayer = CROSS_LAYER_BUNDLES
      .filter(b => b.layers.includes(layer))
      .map(b => ({ id: b.id, name: b.name }));

    // ─── Density flags ─────────────────────────────────────────────────
    const isLowDensity = layerDetectors.length < 12;
    const isDeepSpecLayer = DEEP_SPEC_LAYER_IDS.includes(layer);
    const isDeepLayerDensityGap = isDeepSpecLayer && layerDetectors.length < 14;
    const isLowMetadataRichness = metadataRichnessPct < 50;
    const isLowRichnessDeepLayer = isDeepSpecLayer && metadataRichnessPct < 60;

    return {
      layer,
      count: layerDetectors.length,
      subCount: subcategories.length,
      usedSubCount: usedSubcategories.size,
      missingSubcategories,
      richnessScore,
      richnessMax: 6,
      isThin: layerDetectors.length < 10,
      isVeryThin: layerDetectors.length < 5,
      detectorDensity,
      subcategoryDensity,
      hasTrigger,
      hasEvidence,
      hasFP,
      hasFloor,
      hasCeiling,
      hasRelatedLayers,
      lowRichness: richnessScore < 4,
      // New fields
      metadataRichnessPct,
      missingCeiling,
      missingFloor,
      missingTrigger,
      missingRelatedLayers,
      subcategoryDetectorCounts,
      singleDetectorSubcategories,
      bundlesReferencingLayer,
      isLowDensity,
      isDeepSpecLayer,
      isDeepLayerDensityGap,
      isLowMetadataRichness,
      isLowRichnessDeepLayer,
      relatedLayersCoveragePct
    };
  });

  // ─── Bundle coverage with per-layer detector visibility ───────────────
  const bundleCoverage = CROSS_LAYER_BUNDLES.map(b => {
    const bundleDetectors = detectors.filter(d => b.layers.includes(d.layer));
    const layerBreakdown = {};
    b.layers.forEach(layer => {
      const layerCount = detectors.filter(d => d.layer === layer).length;
      layerBreakdown[layer] = layerCount;
    });
    return {
      id: b.id,
      name: b.name,
      layers: b.layers,
      totalDetectors: bundleDetectors.length,
      hasGaps: bundleDetectors.length === 0,
      layerBreakdown,
      minLayerDetectors: Math.min(...b.layers.map(l => layerBreakdown[l] || 0))
    };
  });

  // ─── Layer metrics map (existing) ─────────────────────────────────────
  const layerMetrics = {};
  layerStats.forEach(s => {
    layerMetrics[s.layer] = {
      detectorCount: s.count,
      subcategoryCount: s.subCount,
      usedSubcategoryCount: s.usedSubCount,
      completenessScore: s.subCount > 0 ? Math.min(1, s.usedSubCount / s.subCount) : 0,
      metadataRichness: s.richnessScore / 6,
      detectorDensity: s.detectorDensity,
      subcategoryDensity: s.subcategoryDensity,
      missingSubcategories: s.missingSubcategories,
      hasTrigger: s.hasTrigger,
      hasEvidence: s.hasEvidence,
      hasFP: s.hasFP,
      hasFloor: s.hasFloor,
      hasCeiling: s.hasCeiling,
      hasRelatedLayers: s.hasRelatedLayers,
      lowRichness: s.lowRichness,
      // New fields
      metadataRichnessPct: s.metadataRichnessPct,
      missingCeiling: s.missingCeiling,
      missingFloor: s.missingFloor,
      missingTrigger: s.missingTrigger,
      missingRelatedLayers: s.missingRelatedLayers,
      subcategoryDetectorCounts: s.subcategoryDetectorCounts,
      singleDetectorSubcategories: s.singleDetectorSubcategories,
      bundlesReferencingLayer: s.bundlesReferencingLayer,
      isLowDensity: s.isLowDensity,
      isDeepSpecLayer: s.isDeepSpecLayer,
      isDeepLayerDensityGap: s.isDeepLayerDensityGap,
      isLowMetadataRichness: s.isLowMetadataRichness,
      isLowRichnessDeepLayer: s.isLowRichnessDeepLayer,
      relatedLayersCoveragePct: s.relatedLayersCoveragePct
    };
  });

  const bundleCoverageMap = {};
  bundleCoverage.forEach(b => {
    bundleCoverageMap[b.id] = b;
  });

  // ─── NEW: Per-layer density warnings ──────────────────────────────────
  const perLayerDensityWarnings = layerStats
    .filter(s => s.isLowDensity)
    .map(s => ({
      layer: s.layer,
      warning: `Low detector density (${s.count} detectors, threshold: 12)`,
      count: s.count
    }));

  // ─── NEW: Deep-layer density gap warnings ─────────────────────────────
  const deepLayerDensityWarnings = layerStats
    .filter(s => s.isDeepLayerDensityGap)
    .map(s => ({
      layer: s.layer,
      warning: `Deep-spec layer density gap (${s.count} detectors, threshold: 14)`,
      count: s.count
    }));

  // ─── NEW: Subcategory density warnings ────────────────────────────────
  const subcategoryDensityWarnings = layerStats
    .filter(s => s.singleDetectorSubcategories.length > 0)
    .map(s => ({
      layer: s.layer,
      warning: `Single-detector subcategories detected`,
      subcategories: s.singleDetectorSubcategories
    }));

  // ─── NEW: Bundle coverage gaps per layer ──────────────────────────────
  const bundleCoverageGaps = layerStats
    .filter(s => s.bundlesReferencingLayer.length === 0)
    .map(s => ({
      layer: s.layer,
      warning: 'Layer not referenced by any cross-layer bundle',
      bundlesReferencingLayer: s.bundlesReferencingLayer
    }));

  // ─── NEW: Missing field summaries by layer ────────────────────────────
  const missingFieldSummaries = layerStats.map(s => ({
    layer: s.layer,
    missingCeiling: s.missingCeiling,
    missingFloor: s.missingFloor,
    missingTrigger: s.missingTrigger,
    missingRelatedLayers: s.missingRelatedLayers,
    totalDetectors: s.count
  }));

  // ─── NEW: Low metadata richness warnings ──────────────────────────────
  const lowMetadataRichnessWarnings = layerStats
    .filter(s => s.isLowMetadataRichness)
    .map(s => ({
      layer: s.layer,
      warning: `Low metadata richness (${s.metadataRichnessPct}%, threshold: 50%)`,
      richnessPct: s.metadataRichnessPct
    }));

  // ─── Deep-layer warnings (existing, enhanced) ─────────────────────────
  const deepSpecLayers = [
    'simulation_verification', 'deterministic_execution', 'control_plane_authority',
    'world_state_governance', 'tool_execution_safety', 'deployment_contract',
    'reasoning_integrity', 'specification_formalism', 'memory_world_model', 'ui_surface_contract'
  ];
  const deepLayerWarnings = layerStats
    .filter(s => deepSpecLayers.includes(s.layer) && s.lowRichness)
    .map(s => ({
      layer: s.layer,
      warning: `Low metadata richness (${s.richnessScore}/${s.richnessMax}) for deep-spec layer`,
      missing: s.missingSubcategories
    }));

  // ─── NEW: Low-richness deep-layer warnings (< 60%) ────────────────────
  const lowRichnessDeepLayerWarnings = layerStats
    .filter(s => s.isLowRichnessDeepLayer)
    .map(s => ({
      layer: s.layer,
      warning: `Low metadata richness for deep-spec layer (${s.metadataRichnessPct}%, threshold: 60%)`,
      richnessPct: s.metadataRichnessPct
    }));

  // ─── NEW: Weakest cross-layer metadata (bottom 10 by related_layers coverage) ──
  const weakestCrossLayerMetadata = [...layerStats]
    .sort((a, b) => a.relatedLayersCoveragePct - b.relatedLayersCoveragePct)
    .slice(0, 10)
    .map(s => ({
      layer: s.layer,
      relatedLayersCoveragePct: s.relatedLayersCoveragePct,
      missingRelatedLayersCount: s.missingRelatedLayers
    }));

  // ─── NEW: Most frequently referenced layers ───────────────────────────
  const layerReferenceCounts = {};
  detectors.forEach(d => {
    if (Array.isArray(d.related_layers)) {
      d.related_layers.forEach(refLayer => {
        layerReferenceCounts[refLayer] = (layerReferenceCounts[refLayer] || 0) + 1;
      });
    }
  });
  const mostReferencedLayers = Object.entries(layerReferenceCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([layer, count]) => ({ layer, count }));

  // ─── NEW: Top cross-layer relationship pairs ──────────────────────────
  const pairCounts = {};
  detectors.forEach(d => {
    if (Array.isArray(d.related_layers) && d.related_layers.length > 0) {
      d.related_layers.forEach(refLayer => {
        const pair = `${d.layer}→${refLayer}`;
        pairCounts[pair] = (pairCounts[pair] || 0) + 1;
      });
    }
  });
  const topCrossLayerRelationships = Object.entries(pairCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([pair, count]) => ({ pair, count }));

  // ─── NEW: related_layers summary ──────────────────────────────────────
  const totalDetectorsWithRelatedLayers = detectors.filter(d => Array.isArray(d.related_layers) && d.related_layers.length > 0).length;
  const totalDetectorsWithoutRelatedLayers = totalDetectors - totalDetectorsWithRelatedLayers;
  const relatedLayersSummary = {
    totalDetectorsWithRelatedLayers,
    totalDetectorsWithoutRelatedLayers,
    coveragePercent: totalDetectors > 0
      ? Math.round((totalDetectorsWithRelatedLayers / totalDetectors) * 100)
      : 0
  };

  return {
    totalLayers: layers.length,
    totalDetectors,
    metadataRichness: layerStats.reduce((acc, s) => acc + s.richnessScore, 0) / (layers.length * 6),
    layersWithThinCoverage: layerStats.filter(s => s.isThin).map(s => s.layer),
    layerMetrics,
    bundleCoverage: bundleCoverageMap,
    deepLayerWarnings,
    perLayerDensity: layerStats.reduce((acc, s) => {
      acc[s.layer] = s.detectorDensity;
      return acc;
    }, {}),
    // New sections
    perLayerDensityWarnings,
    deepLayerDensityWarnings,
    subcategoryDensityWarnings,
    bundleCoverageGaps,
    missingFieldSummaries,
    lowMetadataRichnessWarnings,
    lowRichnessDeepLayerWarnings,
    weakestCrossLayerMetadata,
    mostReferencedLayers,
    topCrossLayerRelationships,
    relatedLayersSummary
  };
}

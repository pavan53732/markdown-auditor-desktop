import { DETECTOR_METADATA, LAYER_SUBCATEGORIES } from './detectorMetadata.js';
import { CROSS_LAYER_BUNDLES } from './crossLayerBundles.js';

export function generateTaxonomyQualityReport() {
  const detectors = Object.values(DETECTOR_METADATA);
  const totalDetectors = detectors.length;
  const layers = Object.keys(LAYER_SUBCATEGORIES);
  
  const layerStats = layers.map(layer => {
    const layerDetectors = detectors.filter(d => d.layer === layer);
    const subcategories = LAYER_SUBCATEGORIES[layer] || [];
    const usedSubcategories = new Set(layerDetectors.map(d => d.subcategory));
    const missingSubcategories = subcategories.filter(s => !usedSubcategories.has(s));
    
    // Richness metrics
    const hasTrigger = layerDetectors.every(d => d.trigger_pattern);
    const hasEvidence = layerDetectors.every(d => d.required_evidence);
    const hasFP = layerDetectors.every(d => d.false_positive_guards);
    const hasFloor = layerDetectors.every(d => d.severity_floor);
    
    const richnessScore = [hasTrigger, hasEvidence, hasFP, hasFloor].filter(Boolean).length;
    
    return {
      layer,
      count: layerDetectors.length,
      subCount: subcategories.length,
      usedSubCount: usedSubcategories.size,
      missingSubcategories,
      richnessScore,
      isThin: layerDetectors.length < 10,
      isVeryThin: layerDetectors.length < 5
    };
  });

  const bundleCoverage = CROSS_LAYER_BUNDLES.map(b => {
    const bundleDetectors = detectors.filter(d => b.layers.includes(d.layer));
    return {
      id: b.id,
      name: b.name,
      layers: b.layers,
      totalDetectors: bundleDetectors.length,
      hasGaps: bundleDetectors.length === 0
    };
  });

  const layerMetrics = {};
  layerStats.forEach(s => {
    layerMetrics[s.layer] = {
      detectorCount: s.count,
      subcategoryCount: s.subCount,
      usedSubcategoryCount: s.usedSubCount,
      completenessScore: s.subCount > 0 ? Math.min(1, s.usedSubCount / s.subCount) : 0,
      metadataRichness: s.richnessScore / 4
    };
  });

  const bundleCoverageMap = {};
  bundleCoverage.forEach(b => {
    bundleCoverageMap[b.id] = b;
  });

  return {
    totalLayers: layers.length,
    totalDetectors,
    metadataRichness: layerStats.reduce((acc, s) => acc + s.richnessScore, 0) / (layers.length * 4),
    layersWithThinCoverage: layerStats.filter(s => s.isThin).map(s => s.layer),
    layerMetrics,
    bundleCoverage: bundleCoverageMap
  };
}

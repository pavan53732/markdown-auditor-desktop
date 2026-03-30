import { DETECTOR_METADATA, LAYER_SUBCATEGORIES } from './detectorMetadata.js';

export function generateTaxonomyQualityReport() {
  const detectors = Object.values(DETECTOR_METADATA);
  const layers = Object.keys(LAYER_SUBCATEGORIES);
  const report = {
    totalLayers: layers.length,
    totalDetectors: detectors.length,
    layersWithThinCoverage: [], // < 8 detectors
    subcategoriesWithThinCoverage: [], // 0 detectors
    subcategoriesWithSingleDetector: [], // exactly 1 detector (thin)
    detectorsMissingCeiling: [],
    detectorsMissingFloor: [],
    detectorsMissingTrigger: [],
    detectorsWithRelatedLayers: 0,
    layerMetrics: {},
    subcategoryMetrics: {},
    densityAnalysis: {},
    metadataRichness: {
      hasCeilingPercent: 0,
      hasFloorPercent: 0,
      hasRelatedPercent: 0,
      hasTriggerPercent: 0
    }
  };

  // Initialize metrics
  layers.forEach(layer => {
    report.layerMetrics[layer] = {
      count: 0,
      subs: LAYER_SUBCATEGORIES[layer].length,
      hasCeiling: 0,
      hasFloor: 0,
      hasTrigger: 0,
      hasRelated: 0,
      completenessScore: 0
    };
  });

  const subcategoryDetectorCounts = {};
  layers.forEach(layer => {
    LAYER_SUBCATEGORIES[layer].forEach(sub => {
      subcategoryDetectorCounts[`${layer}::${sub}`] = 0;
    });
  });

  // Populate counts
  detectors.forEach(d => {
    const metrics = report.layerMetrics[d.layer];
    if (metrics) {
      metrics.count++;
      if (d.severity_ceiling) metrics.hasCeiling++;
      if (d.severity_floor) metrics.hasFloor++;
      if (d.trigger_pattern) metrics.hasTrigger++;
      if (d.related_layers && d.related_layers.length > 0) metrics.hasRelated++;
    }

    const subKey = `${d.layer}::${d.subcategory}`;
    subcategoryDetectorCounts[subKey] = (subcategoryDetectorCounts[subKey] || 0) + 1;

    if (!d.severity_ceiling) report.detectorsMissingCeiling.push(d.id);
    if (!d.severity_floor) report.detectorsMissingFloor.push(d.id);
    if (!d.trigger_pattern) report.detectorsMissingTrigger.push(d.id);

    if (d.related_layers && d.related_layers.length > 0) {
      report.detectorsWithRelatedLayers++;
    }
  });

  // Build subcategory metrics
  for (const [subKey, count] of Object.entries(subcategoryDetectorCounts)) {
    report.subcategoryMetrics[subKey] = { count };
    if (count === 0) {
      report.subcategoriesWithThinCoverage.push(subKey);
    } else if (count === 1) {
      report.subcategoriesWithSingleDetector.push(subKey);
    }
  }

  // Calculate richness percentages
  if (report.totalDetectors > 0) {
    report.metadataRichness.hasCeilingPercent = Math.round(((report.totalDetectors - report.detectorsMissingCeiling.length) / report.totalDetectors) * 100);
    report.metadataRichness.hasFloorPercent = Math.round(((report.totalDetectors - report.detectorsMissingFloor.length) / report.totalDetectors) * 100);
    report.metadataRichness.hasRelatedPercent = Math.round((report.detectorsWithRelatedLayers / report.totalDetectors) * 100);
    report.metadataRichness.hasTriggerPercent = Math.round(((report.totalDetectors - report.detectorsMissingTrigger.length) / report.totalDetectors) * 100);
  }

  // Density analysis: compute median detector count per layer
  const layerCounts = layers.map(l => report.layerMetrics[l].count).sort((a, b) => a - b);
  const medianCount = layerCounts.length > 0
    ? layerCounts[Math.floor(layerCounts.length / 2)]
    : 0;

  report.densityAnalysis.medianDetectorCount = medianCount;
  report.densityAnalysis.minDetectorCount = layerCounts.length > 0 ? layerCounts[0] : 0;
  report.densityAnalysis.maxDetectorCount = layerCounts.length > 0 ? layerCounts[layerCounts.length - 1] : 0;

  // Evaluate thin coverage and completeness
  const weakLayers = [];
  for (const [layer, metrics] of Object.entries(report.layerMetrics)) {
    if (metrics.count < 8) {
      report.layersWithThinCoverage.push(layer);
    }
    // Completeness score: density (40%), ceiling richness (20%), floor richness (15%), trigger richness (15%), relational richness (10%)
    const densityScore = Math.min(metrics.count / 8, 1) * 40;
    const ceilingScore = metrics.count > 0 ? (metrics.hasCeiling / metrics.count) * 20 : 0;
    const floorScore = metrics.count > 0 ? (metrics.hasFloor / metrics.count) * 15 : 0;
    const triggerScore = metrics.count > 0 ? (metrics.hasTrigger / metrics.count) * 15 : 0;
    const relatedScore = metrics.count > 0 ? (metrics.hasRelated / metrics.count) * 10 : 0;
    metrics.completenessScore = Math.round(densityScore + ceilingScore + floorScore + triggerScore + relatedScore);

    if (metrics.count < medianCount) {
      weakLayers.push({ layer, count: metrics.count, median: medianCount });
    }
  }
  report.densityAnalysis.layersBelowMedian = weakLayers;

  return report;
}

export function printTaxonomyReport() {
  const report = generateTaxonomyQualityReport();
  console.log(`=== Taxonomy Quality Report (${report.totalLayers} Layers / ${report.totalDetectors} Detectors) ===`);
  console.log(`Metadata Richness:`);
  console.log(`  - Severity Floors: ${report.metadataRichness.hasFloorPercent}%`);
  console.log(`  - Severity Ceilings: ${report.metadataRichness.hasCeilingPercent}%`);
  console.log(`  - Trigger Patterns: ${report.metadataRichness.hasTriggerPercent}%`);
  console.log(`  - Related Layer Mappings: ${report.metadataRichness.hasRelatedPercent}%`);
  console.log(`Coverage Gaps:`);
  console.log(`  - Layers with < 8 detectors: ${report.layersWithThinCoverage.length} (${report.layersWithThinCoverage.join(', ')})`);
  console.log(`  - Subcategories with 0 detectors: ${report.subcategoriesWithThinCoverage.length}`);
  if (report.subcategoriesWithThinCoverage.length > 0) {
    console.log(`    ${report.subcategoriesWithThinCoverage.join(', ')}`);
  }
  console.log(`  - Subcategories with only 1 detector: ${report.subcategoriesWithSingleDetector.length}`);
  console.log(`  - Detectors missing triggers: ${report.detectorsMissingTrigger.length}`);
  console.log(`Density Analysis:`);
  console.log(`  - Median detectors/layer: ${report.densityAnalysis.medianDetectorCount}`);
  console.log(`  - Min detectors/layer: ${report.densityAnalysis.minDetectorCount}`);
  console.log(`  - Max detectors/layer: ${report.densityAnalysis.maxDetectorCount}`);

  const weakLayers = Object.entries(report.layerMetrics)
    .filter(([_, m]) => m.completenessScore < 50)
    .map(([l, m]) => `${l} (${m.completenessScore})`);

  if (weakLayers.length > 0) {
    console.log(`Weakest Layers (Score < 50): ${weakLayers.join(', ')}`);
  }

  if (report.densityAnalysis.layersBelowMedian.length > 0) {
    const belowMedian = report.densityAnalysis.layersBelowMedian
      .map(e => `${e.layer}(${e.count}/${e.median})`)
      .join(', ');
    console.log(`Layers Below Median: ${belowMedian}`);
  }
  console.log('===========================================================');
}

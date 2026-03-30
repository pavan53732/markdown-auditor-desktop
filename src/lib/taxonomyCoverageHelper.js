import { DETECTOR_METADATA, LAYER_SUBCATEGORIES } from './detectorMetadata.js';

export function generateTaxonomyQualityReport() {
  const detectors = Object.values(DETECTOR_METADATA);
  const report = {
    totalDetectors: detectors.length,
    layersWithThinCoverage: [],
    subcategoriesWithThinCoverage: [],
    detectorsMissingCeiling: [],
    detectorsMissingFloor: [],
    detectorsMissingTrigger: [],
    detectorsWithRelatedLayers: 0,
    layerDetectorCounts: {},
    subcategoryDetectorCounts: {},
    metadataRichness: {
      hasCeilingPercent: 0,
      hasFloorPercent: 0,
      hasRelatedPercent: 0
    }
  };

  // Initialize counts
  for (const layer in LAYER_SUBCATEGORIES) {
    report.layerDetectorCounts[layer] = 0;
    LAYER_SUBCATEGORIES[layer].forEach(sub => {
      report.subcategoryDetectorCounts[`${layer}::${sub}`] = 0;
    });
  }

  // Populate counts
  detectors.forEach(d => {
    report.layerDetectorCounts[d.layer] = (report.layerDetectorCounts[d.layer] || 0) + 1;
    const subKey = `${d.layer}::${d.subcategory}`;
    report.subcategoryDetectorCounts[subKey] = (report.subcategoryDetectorCounts[subKey] || 0) + 1;
    
    if (!d.severity_ceiling) {
      report.detectorsMissingCeiling.push(d.id);
    }
    if (!d.severity_floor) {
      report.detectorsMissingFloor.push(d.id);
    }
    if (!d.trigger_pattern) {
      report.detectorsMissingTrigger.push(d.id);
    }
    
    if (d.related_layers && d.related_layers.length > 0) {
      report.detectorsWithRelatedLayers++;
    }
  });

  // Calculate richness percentages
  if (report.totalDetectors > 0) {
    report.metadataRichness.hasCeilingPercent = Math.round(((report.totalDetectors - report.detectorsMissingCeiling.length) / report.totalDetectors) * 100);
    report.metadataRichness.hasFloorPercent = Math.round(((report.totalDetectors - report.detectorsMissingFloor.length) / report.totalDetectors) * 100);
    report.metadataRichness.hasRelatedPercent = Math.round((report.detectorsWithRelatedLayers / report.totalDetectors) * 100);
  }

  // Evaluate thin coverage
  for (const [layer, count] of Object.entries(report.layerDetectorCounts)) {
    if (count < 4) { // We now have 4-8 detectors per layer on average
      report.layersWithThinCoverage.push(layer);
    }
  }

  for (const [subKey, count] of Object.entries(report.subcategoryDetectorCounts)) {
    if (count < 1) { // 0 detectors mapped
      report.subcategoriesWithThinCoverage.push(subKey);
    }
  }

  return report;
}

export function printTaxonomyReport() {
  const report = generateTaxonomyQualityReport();
  console.log('=== Taxonomy Quality Report (40 Layers / 288 Detectors) ===');
  console.log(`Total Detectors: ${report.totalDetectors}`);
  console.log(`Metadata Richness:`);
  console.log(`  - Severity Floors: ${report.metadataRichness.hasFloorPercent}%`);
  console.log(`  - Severity Ceilings: ${report.metadataRichness.hasCeilingPercent}%`);
  console.log(`  - Related Layer Mappings: ${report.metadataRichness.hasRelatedPercent}%`);
  console.log(`Coverage Gaps:`);
  console.log(`  - Layers with < 4 detectors: ${report.layersWithThinCoverage.length} (${report.layersWithThinCoverage.join(', ')})`);
  console.log(`  - Subcategories with 0 detectors: ${report.subcategoriesWithThinCoverage.length}`);
  console.log(`  - Detectors missing triggers: ${report.detectorsMissingTrigger.length}`);
  console.log('===========================================================');
}

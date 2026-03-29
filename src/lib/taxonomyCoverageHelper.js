import { DETECTOR_METADATA, LAYER_SUBCATEGORIES } from './detectorMetadata.js';

export function generateTaxonomyQualityReport() {
  const report = {
    totalDetectors: Object.keys(DETECTOR_METADATA).length,
    layersWithThinCoverage: [],
    subcategoriesWithThinCoverage: [],
    detectorsMissingCeiling: [],
    detectorsWithRelatedLayers: 0,
    layerDetectorCounts: {},
    subcategoryDetectorCounts: {}
  };

  // Initialize counts
  for (const layer in LAYER_SUBCATEGORIES) {
    report.layerDetectorCounts[layer] = 0;
    LAYER_SUBCATEGORIES[layer].forEach(sub => {
      report.subcategoryDetectorCounts[`${layer}::${sub}`] = 0;
    });
  }

  // Populate counts
  Object.values(DETECTOR_METADATA).forEach(d => {
    report.layerDetectorCounts[d.layer] = (report.layerDetectorCounts[d.layer] || 0) + 1;
    const subKey = `${d.layer}::${d.subcategory}`;
    report.subcategoryDetectorCounts[subKey] = (report.subcategoryDetectorCounts[subKey] || 0) + 1;
    
    if (!d.severity_ceiling) {
      report.detectorsMissingCeiling.push(d.id);
    }
    
    if (d.related_layers && d.related_layers.length > 0) {
      report.detectorsWithRelatedLayers++;
    }
  });

  // Evaluate thin coverage
  for (const [layer, count] of Object.entries(report.layerDetectorCounts)) {
    if (count < 8) { // Less than 8 detectors is "thin" since we aim for 256/32 = 8
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
  console.log('=== Taxonomy Quality Report ===');
  console.log(`Total Detectors: ${report.totalDetectors}`);
  console.log(`Detectors enriched with related layers: ${report.detectorsWithRelatedLayers}`);
  console.log(`Layers with < 8 detectors: ${report.layersWithThinCoverage.length} (${report.layersWithThinCoverage.join(', ')})`);
  console.log(`Subcategories with 0 detectors: ${report.subcategoriesWithThinCoverage.length}`);
  console.log(`Detectors missing explicit severity ceiling: ${report.detectorsMissingCeiling.length}`);
  console.log('===============================');
}

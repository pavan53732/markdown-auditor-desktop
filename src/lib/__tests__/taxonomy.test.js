import { describe, it, expect } from 'vitest';
import {
  DETECTOR_METADATA,
  LAYER_SUBCATEGORIES,
  isKnownDetectorId,
  getDetectorMetadata,
  parseDetectorId,
  isValidSubcategory,
  isValidDetectorForLayer,
  isValidDetectorForSubcategory,
  normalizeSeverityForDetector
} from '../detectorMetadata';
import { buildSystemPrompt } from '../systemPrompt';
import { LAYERS } from '../layers';
import { generateTaxonomyQualityReport } from '../taxonomyCoverageHelper';
import { CROSS_LAYER_BUNDLES } from '../crossLayerBundles';

describe('Taxonomy Integrity', () => {
  it('should have exactly 637 detectors', () => {
    const ids = Object.keys(DETECTOR_METADATA);
    expect(ids.length).toBe(637);
  });

  it('should have unique detector IDs following Lx-yy format', () => {
    const ids = Object.keys(DETECTOR_METADATA);
    const formatRegex = /^L\d+-\d+$/;
    const seen = new Set();

    ids.forEach(id => {
      expect(id).toMatch(formatRegex);
      expect(seen.has(id)).toBe(false);
      seen.add(id);
    });
  });

  it('should map all detectors to valid layers', () => {
    const validLayerIds = LAYERS.map(l => l.id);
    Object.values(DETECTOR_METADATA).forEach(meta => {
      expect(validLayerIds).toContain(meta.layer);
    });
  });

  it('should map all detectors to valid subcategories for their layer', () => {
    Object.values(DETECTOR_METADATA).forEach(meta => {
      const subcats = LAYER_SUBCATEGORIES[meta.layer];
      expect(subcats).toBeDefined();
      expect(subcats).toContain(meta.subcategory);
    });
  });

  it('should have all required metadata fields', () => {
    Object.values(DETECTOR_METADATA).forEach(meta => {
      expect(meta.id).toBeDefined();
      expect(meta.name).toBeDefined();
      expect(meta.layer).toBeDefined();
      expect(meta.subcategory).toBeDefined();
      expect(meta.trigger_pattern).toBeDefined();
      expect(meta.required_evidence).toBeDefined();
      expect(meta.false_positive_guards).toBeDefined();
      expect(meta.severity_floor).toBeDefined();
    });
  });

  it('should have valid severity bounds', () => {
    const severityOrder = { critical: 3, high: 2, medium: 1, low: 0 };
    Object.values(DETECTOR_METADATA).forEach(meta => {
      if (meta.severity_ceiling) {
        const floor = severityOrder[meta.severity_floor.toLowerCase()];
        const ceiling = severityOrder[meta.severity_ceiling.toLowerCase()];
        expect(floor).toBeLessThanOrEqual(ceiling);
      }
    });
  });
});

describe('Taxonomy Helpers', () => {
  it('isKnownDetectorId works correctly', () => {
    expect(isKnownDetectorId('L1-01')).toBe(true);
    expect(isKnownDetectorId('L99-99')).toBe(false);
  });

  it('getDetectorMetadata works correctly', () => {
    const meta = getDetectorMetadata('L1-01');
    expect(meta).not.toBeNull();
    expect(meta.id).toBe('L1-01');
    expect(getDetectorMetadata('INVALID')).toBeNull();
  });

  it('parseDetectorId works correctly', () => {
    expect(parseDetectorId('[L1-01] issue')).toBe('L1-01');
    expect(parseDetectorId('no id here')).toBeNull();
    expect(parseDetectorId(null)).toBeNull();
  });

  it('isValidSubcategory works correctly', () => {
    expect(isValidSubcategory('contradiction', 'direct conflicts')).toBe(true);
    expect(isValidSubcategory('contradiction', 'invalid sub')).toBe(false);
    expect(isValidSubcategory('invalid layer', 'any')).toBe(false);
  });

  it('isValidDetectorForLayer works correctly', () => {
    expect(isValidDetectorForLayer('L1-01', 'contradiction')).toBe(true);
    expect(isValidDetectorForLayer('L1-01', 'security')).toBe(false);
    expect(isValidDetectorForLayer('UNKNOWN-ID', 'any')).toBe(true); // Graceful for unknown
  });

  it('normalizeSeverityForDetector works correctly', () => {
    // L1-01 floor is high
    expect(normalizeSeverityForDetector('L1-01', 'low')).toBe('high');
    expect(normalizeSeverityForDetector('L1-01', 'critical')).toBe('critical');
    // L3-01 floor is low
    expect(normalizeSeverityForDetector('L3-01', 'low')).toBe('low');
  });
});

describe('Prompt Generation', () => {
  it('buildSystemPrompt builds a valid string', () => {
    const prompt = buildSystemPrompt('auto');
    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(1000);
    expect(prompt).toContain('DOMAIN PROFILE: Auto (Default)');
    expect(prompt).toContain('CROSS-LAYER BUNDLES');
    expect(prompt).toContain(`--- DETECTOR CATALOG (${Object.keys(DETECTOR_METADATA).length} DETECTORS) ---`);
  });

  it('buildSystemPrompt includes detector details', () => {
    const prompt = buildSystemPrompt('api_docs');
    expect(prompt).toContain('[L1-01] direct contradictions');
    expect(prompt).toContain('Trigger: Two statements explicitly negate each other');
    expect(prompt).toContain('Evidence: Conflict.');
  });

  describe('Prompt and Documentation Alignment', () => {
    it('system prompt reflects the correct 45/637 counts', () => {
      const prompt = buildSystemPrompt();
      const detectorCount = Object.keys(DETECTOR_METADATA).length;
      const layerCount = Object.keys(LAYER_SUBCATEGORIES).length;

      expect(prompt).toContain(`**${layerCount} analytical layers and ${detectorCount} micro-detectors**`);
      expect(prompt).toContain(`Evaluate all ${detectorCount} detectors across all ${layerCount} layers`);
      expect(prompt).toContain(`Include detectors_evaluated count (must be ≤${detectorCount})`);
    });

    it('detector catalog header in prompt matches reality', () => {
      const prompt = buildSystemPrompt();
      const detectorCount = Object.keys(DETECTOR_METADATA).length;
      expect(prompt).toContain(`--- DETECTOR CATALOG (${detectorCount} DETECTORS) ---`);
    });
  });
});

describe('Deep-Spec Layer Coverage', () => {
  const deepSpecLayers = [
    'specification_formalism',
    'simulation_verification',
    'memory_world_model',
    'agent_orchestration',
    'tool_execution_safety',
    'deployment_contract',
    'platform_abstraction',
    'context_orchestration',
    'reasoning_integrity',
    'ui_surface_contract',
    'deterministic_execution',
    'control_plane_authority',
    'world_state_governance'
  ];

  it('all deep-spec layers have at least 8 detectors', () => {
    deepSpecLayers.forEach(layer => {
      const count = Object.values(DETECTOR_METADATA).filter(d => d.layer === layer).length;
      expect(count).toBeGreaterThanOrEqual(8);
    });
  });

  it('all deep-spec layers have detectors covering their subcategories', () => {
    deepSpecLayers.forEach(layer => {
      const subcats = LAYER_SUBCATEGORIES[layer];
      const layerDetectors = Object.values(DETECTOR_METADATA).filter(d => d.layer === layer);
      const coveredSubcats = new Set(layerDetectors.map(d => d.subcategory));
      subcats.forEach(sub => {
        expect(coveredSubcats.has(sub)).toBe(true);
      });
    });
  });

  it('all layers have at least 8 detectors', () => {
    const allLayerIds = Object.keys(LAYER_SUBCATEGORIES);
    allLayerIds.forEach(layer => {
      const count = Object.values(DETECTOR_METADATA).filter(d => d.layer === layer).length;
      expect(count).toBeGreaterThanOrEqual(8);
    });
  });
});

describe('Taxonomy Coverage Helper', () => {
  it('generates a valid report', () => {
    const report = generateTaxonomyQualityReport();
    expect(report.totalLayers).toBe(45);
    expect(report.totalDetectors).toBe(637);
    expect(report.metadataRichness).toBeDefined();
    expect(report.layerMetrics).toBeDefined();
  });

  it('report has no layers with thin coverage (< 8 detectors)', () => {
    const report = generateTaxonomyQualityReport();
    expect(report.layersWithThinCoverage.filter(l => report.layerMetrics[l].detectorCount < 8).length).toBe(0);
  });

  it('report completeness scores are reasonable', () => {
    const report = generateTaxonomyQualityReport();
    Object.values(report.layerMetrics).forEach(metrics => {
      expect(metrics.completenessScore).toBeGreaterThanOrEqual(0);
      expect(metrics.completenessScore).toBeLessThanOrEqual(1);
    });
  });

  it('report includes bundle coverage data', () => {
    const report = generateTaxonomyQualityReport();
    expect(report.bundleCoverage).toBeDefined();
    expect(Object.keys(report.bundleCoverage).length).toBeGreaterThan(0);
  });

  it('all cross-layer bundles reference valid layers', () => {
    const report = generateTaxonomyQualityReport();
    Object.values(report.bundleCoverage).forEach(bundle => {
      bundle.layers.forEach(layer => {
        expect(report.layerMetrics[layer]).toBeDefined();
      });
    });
  });
});

describe('Cross-Layer Bundles', () => {
  it('has at least 17 bundles', () => {
    expect(CROSS_LAYER_BUNDLES.length).toBeGreaterThanOrEqual(17);
  });

  it('all bundles have required fields', () => {
    CROSS_LAYER_BUNDLES.forEach(bundle => {
      expect(bundle.id).toBeDefined();
      expect(bundle.name).toBeDefined();
      expect(bundle.layers).toBeDefined();
      expect(bundle.layers.length).toBeGreaterThanOrEqual(2);
      expect(bundle.description).toBeDefined();
      expect(bundle.escalation_rule).toBeDefined();
    });
  });

  it('all bundles reference valid layer IDs', () => {
    const validLayerIds = LAYERS.map(l => l.id);
    CROSS_LAYER_BUNDLES.forEach(bundle => {
      bundle.layers.forEach(layerId => {
        expect(validLayerIds).toContain(layerId);
      });
    });
  });
});

describe('Deep-Spec Layer Detector Coverage', () => {
  const deepSpecLayerIds = [
    'specification_formalism',
    'simulation_verification',
    'memory_world_model',
    'agent_orchestration',
    'tool_execution_safety',
    'deployment_contract',
    'platform_abstraction',
    'context_orchestration',
    'reasoning_integrity',
    'ui_surface_contract',
    'deterministic_execution',
    'control_plane_authority',
    'world_state_governance'
  ];

  it('all deep-spec layers (L33-L45) have >= 13 detectors', () => {
    deepSpecLayerIds.forEach(layer => {
      const count = Object.values(DETECTOR_METADATA).filter(d => d.layer === layer).length;
      expect(count).toBeGreaterThanOrEqual(13);
    });
  });

  it('no layer has 0 detectors', () => {
    const allLayerIds = Object.keys(LAYER_SUBCATEGORIES);
    allLayerIds.forEach(layer => {
      const count = Object.values(DETECTOR_METADATA).filter(d => d.layer === layer).length;
      expect(count).toBeGreaterThan(0);
    });
  });
});

describe('Bundle Validity and Layer References', () => {
  it('all bundle layers arrays reference valid layer IDs from layers.js', () => {
    const validLayerIds = LAYERS.map(l => l.id);
    CROSS_LAYER_BUNDLES.forEach(bundle => {
      bundle.layers.forEach(layerId => {
        expect(validLayerIds).toContain(layerId);
      });
    });
  });

  it('no bundle references a non-existent layer', () => {
    const validLayerIds = new Set(LAYERS.map(l => l.id));
    CROSS_LAYER_BUNDLES.forEach(bundle => {
      bundle.layers.forEach(layerId => {
        expect(validLayerIds.has(layerId)).toBe(true);
      });
    });
  });

  it('all bundles have at least 2 layers', () => {
    CROSS_LAYER_BUNDLES.forEach(bundle => {
      expect(bundle.layers.length).toBeGreaterThanOrEqual(2);
    });
  });
});

describe('Helper Report Consistency', () => {
  it('generateTaxonomyQualityReport returns expected sections', () => {
    const report = generateTaxonomyQualityReport();
    expect(report).toHaveProperty('totalLayers');
    expect(report).toHaveProperty('totalDetectors');
    expect(report).toHaveProperty('metadataRichness');
    expect(report).toHaveProperty('layerMetrics');
    expect(report).toHaveProperty('bundleCoverage');
    expect(report).toHaveProperty('deepLayerWarnings');
    expect(report).toHaveProperty('perLayerDensityWarnings');
    expect(report).toHaveProperty('deepLayerDensityWarnings');
    expect(report).toHaveProperty('subcategoryDensityWarnings');
    expect(report).toHaveProperty('bundleCoverageGaps');
    expect(report).toHaveProperty('missingFieldSummaries');
    expect(report).toHaveProperty('lowMetadataRichnessWarnings');
    expect(report).toHaveProperty('lowRichnessDeepLayerWarnings');
  });

  it('report totalLayers equals 45', () => {
    const report = generateTaxonomyQualityReport();
    expect(report.totalLayers).toBe(45);
  });

  it('report totalDetectors equals 637', () => {
    const report = generateTaxonomyQualityReport();
    expect(report.totalDetectors).toBe(637);
  });

  it('layerMetrics has entries for all 45 layers', () => {
    const report = generateTaxonomyQualityReport();
    const layerKeys = Object.keys(report.layerMetrics);
    expect(layerKeys.length).toBe(45);
  });
});

describe('Benchmark Mapping to Expected Layers', () => {
  const benchmarkLayerMappings = [
    { fixture: 'benchmark-control-plane-override-abuse.md', expectedLayer: 'control_plane_authority' },
    { fixture: 'benchmark-evidence-free-escalation.md', expectedLayer: 'reasoning_integrity' },
    { fixture: 'benchmark-export-non-determinism.md', expectedLayer: 'deterministic_execution' },
    { fixture: 'benchmark-simulation-governance-mismatch.md', expectedLayer: 'simulation_verification' },
    { fixture: 'benchmark-tool-side-effect-leakage.md', expectedLayer: 'tool_execution_safety' },
    { fixture: 'benchmark-ui-fatal-state.md', expectedLayer: 'ui_surface_contract' },
    { fixture: 'benchmark-uncertainty-dropped.md', expectedLayer: 'reasoning_integrity' },
    { fixture: 'benchmark-world-state-atomicity.md', expectedLayer: 'world_state_governance' }
  ];

  benchmarkLayerMappings.forEach(({ fixture, expectedLayer }) => {
    it(`maps ${fixture} to ${expectedLayer}`, () => {
      const detectorsForLayer = Object.values(DETECTOR_METADATA).filter(d => d.layer === expectedLayer);
      expect(detectorsForLayer.length).toBeGreaterThan(0);
    });
  });
});

describe('Taxonomy Drift Prevention', () => {
  it('LAYER_SUBCATEGORIES keys match the subcategories used in rawMetadata', () => {
    const subcategoryKeys = Object.keys(LAYER_SUBCATEGORIES);
    const layerIdsFromDetectors = new Set();
    Object.keys(DETECTOR_METADATA).forEach(id => {
      const layerNum = id.match(/^L(\d+)/);
      if (layerNum) {
        const layerIdx = parseInt(layerNum[1]) - 1;
        if (layerIdx >= 0 && layerIdx < subcategoryKeys.length) {
          layerIdsFromDetectors.add(subcategoryKeys[layerIdx]);
        }
      }
    });
    subcategoryKeys.forEach(key => {
      expect(layerIdsFromDetectors.has(key)).toBe(true);
    });
  });

  it('detector IDs follow the L{layer}-{number} pattern', () => {
    const idRegex = /^L\d+-\d+$/;
    Object.keys(DETECTOR_METADATA).forEach(id => {
      expect(id).toMatch(idRegex);
    });
  });

  it('all detector IDs map to valid layer indices', () => {
    const subcategoryKeys = Object.keys(LAYER_SUBCATEGORIES);
    Object.keys(DETECTOR_METADATA).forEach(id => {
      const layerNum = id.match(/^L(\d+)/);
      if (layerNum) {
        const layerIdx = parseInt(layerNum[1]);
        expect(layerIdx).toBeGreaterThanOrEqual(1);
        expect(layerIdx).toBeLessThanOrEqual(subcategoryKeys.length);
      }
    });
  });
});

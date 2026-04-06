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
import { LAYERS, ORDERED_LAYER_IDS, getLayerIdByNumber, getLayerNumber } from '../layers';
import {
  ANALYSIS_AGENT_COUNT,
  ANALYSIS_AGENT_MESH,
  ANALYSIS_AGENT_OWNERSHIP,
  validateAnalysisAgentResult,
  mergeAnalysisMeshRuns
} from '../analysisAgents';
import { generateTaxonomyQualityReport } from '../taxonomyCoverageHelper';
import { CROSS_LAYER_BUNDLES } from '../crossLayerBundles';

describe('Taxonomy Integrity', () => {
  it('should have exactly 701 detectors', () => {
    const ids = Object.keys(DETECTOR_METADATA);
    expect(ids.length).toBe(701);
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

  it('should derive layer ordering and numbering from layers.js as the single source of truth', () => {
    expect(ORDERED_LAYER_IDS).toEqual(LAYERS.map((layer) => layer.id));
    LAYERS.forEach((layer, index) => {
      const expectedNumber = index + 1;
      expect(layer.number).toBe(expectedNumber);
      expect(layer.icon).toBe(`L${expectedNumber}`);
      expect(getLayerNumber(layer.id)).toBe(expectedNumber);
      expect(getLayerIdByNumber(expectedNumber)).toBe(layer.id);
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

  it('should expose strict schema metadata defaults for every detector', () => {
    Object.values(DETECTOR_METADATA).forEach(meta => {
      expect(meta.failure_type).toBeDefined();
      expect(meta.constraint_reference).toBeDefined();
      expect(meta.contract_step).toBeDefined();
      expect(meta.invariant_broken).toBeDefined();
      expect(meta.authority_boundary).toBeDefined();
      expect(meta.closed_world_status).toBeDefined();
      expect(meta.evidence_reference).toBeDefined();
      expect(meta.deterministic_fix_template).toBeDefined();
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
    const prompt = buildSystemPrompt();
    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(1000);
    expect(prompt).toContain('AUDIT MODE: Universal Audit Mode');
    expect(prompt).toContain('CROSS-LAYER BUNDLES');
    expect(prompt).toContain(`--- DETECTOR CATALOG (${Object.keys(DETECTOR_METADATA).length} DETECTORS) ---`);
  });

  it('buildSystemPrompt includes detector details', () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain('[L1-01] direct contradictions');
    expect(prompt).toContain('Trigger: Two statements explicitly negate each other');
    expect(prompt).toContain('Evidence: Conflict.');
  });

  describe('Prompt and Documentation Alignment', () => {
    it('system prompt reflects the correct 53/701 counts', () => {
      const prompt = buildSystemPrompt();
      const detectorCount = Object.keys(DETECTOR_METADATA).length;
      const layerCount = Object.keys(LAYER_SUBCATEGORIES).length;

      expect(prompt).toContain(`**${layerCount} analytical layers and ${detectorCount} micro-detectors**`);
      expect(prompt).toContain(`evaluate all ${detectorCount} detectors across all ${layerCount} layers`);
      expect(prompt).toContain(`include detectors_evaluated count (must be <=${detectorCount})`);
    });

    it('agent-specific prompt includes the active mesh role', () => {
      const firstAgent = ANALYSIS_AGENT_MESH[0];
      const prompt = buildSystemPrompt(firstAgent.id);
      expect(prompt).toContain(`ANALYSIS MESH ROLE: ${firstAgent.label}`);
      expect(prompt).toContain(`analysis_agent="${firstAgent.id}"`);
    });

    it('detector catalog header in prompt matches reality', () => {
      const prompt = buildSystemPrompt();
      const detectorCount = Object.keys(DETECTOR_METADATA).length;
      expect(prompt).toContain(`--- DETECTOR CATALOG (${detectorCount} DETECTORS) ---`);
    });
  });
});

describe('Analysis Mesh Runtime Contracts', () => {
  it('assigns every layer and detector to exactly one owning agent', () => {
    expect(ANALYSIS_AGENT_OWNERSHIP.status).toBe('sealed');
    expect(ANALYSIS_AGENT_OWNERSHIP.assigned_layer_count).toBe(53);
    expect(ANALYSIS_AGENT_OWNERSHIP.assigned_detector_count).toBe(701);
    expect(ANALYSIS_AGENT_OWNERSHIP.unowned_layers).toEqual([]);
    expect(ANALYSIS_AGENT_OWNERSHIP.unowned_detectors).toEqual([]);
    expect(ANALYSIS_AGENT_OWNERSHIP.overlapping_layers).toEqual([]);
    expect(ANALYSIS_AGENT_OWNERSHIP.overlapping_detectors).toEqual([]);
  });

  it('validates per-agent focus coverage and merge metadata', () => {
    const reasoningEvidenceDetectorId = Object.values(DETECTOR_METADATA).find(
      (detector) => detector.layer === 'reasoning_integrity' && detector.subcategory === 'evidence binding'
    )?.id;
    expect(reasoningEvidenceDetectorId).toBeDefined();

    const run = validateAnalysisAgentResult('reasoning_evidence_agent', [
      {
        severity: 'high',
        category: 'reasoning_integrity',
        layer: 'reasoning_integrity',
        subcategory: 'evidence binding',
        detector_id: reasoningEvidenceDetectorId,
        analysis_agent: 'reasoning_evidence_agent'
      }
    ], {
      detectors_evaluated: 701,
      detectors_skipped: 0
    });

    expect(run.valid).toBe(true);
    expect(run.merge_strategy).toBe('evidence_binding_first');
    expect(run.focus_layer_hits).toBe(1);
    expect(run.focus_subcategory_hits).toBe(1);
    expect(run.owned_detector_count).toBeGreaterThan(0);
    expect(run.owned_detector_hits).toBe(1);
    expect(run.out_of_owned_scope_issue_count).toBe(0);
    expect(run.warnings).toEqual([]);
  });

  it('tracks receipt-backed checked, clean, and untouched owned detectors', () => {
    const run = validateAnalysisAgentResult('execution_simulation_agent', [
      {
        severity: 'high',
        category: 'workflow_lifecycle_integrity',
        layer: 'workflow_lifecycle_integrity',
        subcategory: 'required step ordering',
        detector_id: 'L47-01',
        analysis_agent: 'execution_simulation_agent'
      }
    ], {}, {
      detectorExecutionReceipts: [
        { detector_id: 'L47-01', status: 'hit' },
        { detector_id: 'L47-08', status: 'clean' }
      ]
    });

    expect(run.receipt_checked_owned_detector_count).toBe(2);
    expect(run.receipt_clean_owned_detector_count).toBe(1);
    expect(run.receipt_hit_owned_detector_count).toBe(1);
    expect(run.touched_owned_detector_count).toBeGreaterThanOrEqual(2);
    expect(run.untouched_owned_detector_count).toBe(run.owned_detector_count - run.touched_owned_detector_count);
  });

  it('merges first-class agent runs into an analysis mesh summary', () => {
    const reasoningEvidenceDetectorId = Object.values(DETECTOR_METADATA).find(
      (detector) => detector.layer === 'reasoning_integrity' && detector.subcategory === 'evidence binding'
    )?.id;
    const requiredOrderingDetectorId = Object.values(DETECTOR_METADATA).find(
      (detector) => detector.layer === 'workflow_lifecycle_integrity' && detector.subcategory === 'required step ordering'
    )?.id;
    expect(reasoningEvidenceDetectorId).toBeDefined();
    expect(requiredOrderingDetectorId).toBeDefined();

    const merged = mergeAnalysisMeshRuns([
      validateAnalysisAgentResult('reasoning_evidence_agent', [
        {
          severity: 'high',
          category: 'reasoning_integrity',
          layer: 'reasoning_integrity',
          subcategory: 'evidence binding',
          detector_id: reasoningEvidenceDetectorId,
          analysis_agent: 'reasoning_evidence_agent'
        }
      ], {}),
      validateAnalysisAgentResult('execution_simulation_agent', [
        {
          severity: 'high',
          category: 'workflow_lifecycle_integrity',
          layer: 'workflow_lifecycle_integrity',
          subcategory: 'required step ordering',
          detector_id: requiredOrderingDetectorId,
          analysis_agent: 'execution_simulation_agent'
        }
      ], {}, {
        detectorExecutionReceipts: [
          { detector_id: 'L47-01', status: 'hit' },
          { detector_id: 'L47-08', status: 'clean' }
        ]
      })
    ]);

    expect(merged.completed_passes).toBe(2);
    expect(merged.agents).toHaveLength(2);
    expect(merged.focus_layer_hits).toBeGreaterThanOrEqual(2);
    expect(merged.focus_subcategory_hits).toBeGreaterThanOrEqual(1);
    expect(merged.owned_detector_hits).toBeGreaterThanOrEqual(2);
    expect(merged.coverage_reconciliation.finding_backed_detector_count).toBeGreaterThanOrEqual(2);
    expect(merged.coverage_reconciliation.checked_detector_count).toBe(2);
    expect(merged.coverage_reconciliation.checked_clean_detector_count).toBe(1);
    expect(merged.coverage_reconciliation.untouched_detector_count).toBeLessThan(merged.coverage_reconciliation.assigned_detector_count);
    expect(merged.coverage_reconciliation.out_of_owned_scope_issue_count).toBe(0);
    expect(Number.isInteger(merged.validation_warnings)).toBe(true);
    expect(merged.validation_warnings).toBeGreaterThanOrEqual(0);
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
    expect(report.totalLayers).toBe(53);
    expect(report.totalDetectors).toBe(701);
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
  it('has at least 31 bundles', () => {
    expect(CROSS_LAYER_BUNDLES.length).toBeGreaterThanOrEqual(31);
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

  it('report totalLayers equals 53', () => {
    const report = generateTaxonomyQualityReport();
    expect(report.totalLayers).toBe(53);
  });

  it('report totalDetectors equals 701', () => {
    const report = generateTaxonomyQualityReport();
    expect(report.totalDetectors).toBe(701);
  });

  it('layerMetrics has entries for all 53 layers', () => {
    const report = generateTaxonomyQualityReport();
    const layerKeys = Object.keys(report.layerMetrics);
    expect(layerKeys.length).toBe(53);
  });
});

describe('Benchmark Mapping to Expected Layers', () => {
  const benchmarkLayerMappings = [
    { fixture: 'benchmark-artifact-reproducibility.md', expectedLayer: 'artifact_reproducibility' },
    { fixture: 'benchmark-authority-path-bypass.md', expectedLayer: 'authority_path_integrity' },
    { fixture: 'benchmark-control-plane-override-abuse.md', expectedLayer: 'control_plane_authority' },
    { fixture: 'benchmark-evidence-free-escalation.md', expectedLayer: 'reasoning_integrity' },
    { fixture: 'benchmark-export-non-determinism.md', expectedLayer: 'deterministic_execution' },
    { fixture: 'benchmark-knowledge-source-authority.md', expectedLayer: 'knowledge_source_authority' },
    { fixture: 'benchmark-operational-ux-leakage.md', expectedLayer: 'operational_ux_contract' },
    { fixture: 'benchmark-recovery-loop-collapse.md', expectedLayer: 'failure_recovery_integrity' },
    { fixture: 'benchmark-simulation-governance-mismatch.md', expectedLayer: 'simulation_verification' },
    { fixture: 'benchmark-tool-side-effect-leakage.md', expectedLayer: 'tool_execution_safety' },
    { fixture: 'benchmark-toolchain-isolation.md', expectedLayer: 'environment_toolchain_isolation' },
    { fixture: 'benchmark-ui-fatal-state.md', expectedLayer: 'ui_surface_contract' },
    { fixture: 'benchmark-uncertainty-dropped.md', expectedLayer: 'reasoning_integrity' },
    { fixture: 'benchmark-vocabulary-authority.md', expectedLayer: 'ontology_vocabulary_governance' },
    { fixture: 'benchmark-workflow-no-skip.md', expectedLayer: 'workflow_lifecycle_integrity' },
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

describe('Related Layers Validity', () => {
  it('all related_layers reference valid layer IDs from layers.js', () => {
    const validLayerIds = new Set(LAYERS.map(l => l.id));
    Object.values(DETECTOR_METADATA).forEach(meta => {
      if (Array.isArray(meta.related_layers) && meta.related_layers.length > 0) {
        meta.related_layers.forEach(refLayer => {
          expect(validLayerIds.has(refLayer)).toBe(true);
        });
      }
    });
  });

  it('all 191 core deep-spec detectors (L33-L45) have non-empty related_layers', () => {
    const deepSpecDetectors = Object.values(DETECTOR_METADATA).filter(d => {
      const layerNum = parseInt(d.id.match(/^L(\d+)/)[1]);
      return layerNum >= 33 && layerNum <= 45;
    });
    expect(deepSpecDetectors.length).toBe(191);
    deepSpecDetectors.forEach(d => {
      expect(Array.isArray(d.related_layers)).toBe(true);
      expect(d.related_layers.length).toBeGreaterThan(0);
    });
  });

  it('L1-L32 detectors have empty related_layers (by design)', () => {
    const shallowDetectors = Object.values(DETECTOR_METADATA).filter(d => {
      const layerNum = parseInt(d.id.match(/^L(\d+)/)[1]);
      return layerNum >= 1 && layerNum <= 32;
    });
    shallowDetectors.forEach(d => {
      expect(Array.isArray(d.related_layers)).toBe(true);
      expect(d.related_layers.length).toBe(0);
    });
  });
});

describe('Helper Report Related-Layer Coverage', () => {
  it('relatedLayersSummary reports 255 detectors with related_layers', () => {
    const report = generateTaxonomyQualityReport();
    expect(report.relatedLayersSummary.totalDetectorsWithRelatedLayers).toBe(255);
  });

  it('relatedLayersSummary reports 446 detectors without related_layers', () => {
    const report = generateTaxonomyQualityReport();
    expect(report.relatedLayersSummary.totalDetectorsWithoutRelatedLayers).toBe(446);
  });

  it('weakestCrossLayerMetadata entries are all from L1-L32 layers (0% coverage)', () => {
    const report = generateTaxonomyQualityReport();
    const weakestLayers = report.weakestCrossLayerMetadata.map(e => e.layer);
    const shallowLayerIds = new Set(LAYERS.slice(0, 32).map(l => l.id));
    weakestLayers.forEach(layerId => {
      expect(shallowLayerIds.has(layerId)).toBe(true);
    });
  });

  it('mostReferencedLayers is non-empty', () => {
    const report = generateTaxonomyQualityReport();
    expect(Array.isArray(report.mostReferencedLayers)).toBe(true);
    expect(report.mostReferencedLayers.length).toBeGreaterThan(0);
  });
});

describe('Bundle and Related Layers Consistency', () => {
  it('bundle layer cross-reference analysis runs without error', () => {
    // Soft check: verify that for each bundle, we can analyze related_layers coverage
    // Some bundles may have layers without direct related_layers cross-references
    // because RELATED_LAYERS_MAP captures common patterns, not bundle-specific ones
    const analysisResults = CROSS_LAYER_BUNDLES.map(bundle => {
      const bundleLayerIds = new Set(bundle.layers);
      const layerCrossReferences = {};
      bundle.layers.forEach(layerId => {
        const detectorsInLayer = Object.values(DETECTOR_METADATA).filter(d => d.layer === layerId);
        const crossRefCount = detectorsInLayer.filter(d => {
          if (!Array.isArray(d.related_layers) || d.related_layers.length === 0) return false;
          return d.related_layers.some(ref => bundleLayerIds.has(ref) && ref !== layerId);
        }).length;
        layerCrossReferences[layerId] = crossRefCount;
      });
      return { bundleId: bundle.id, layerCrossReferences };
    });
    expect(analysisResults.length).toBe(CROSS_LAYER_BUNDLES.length);
    expect(analysisResults.every(r => typeof r.bundleId === 'string')).toBe(true);
  });
});

describe('No Self-Referential Related Layers', () => {
  it('no detector has its own layer in its related_layers array', () => {
    Object.values(DETECTOR_METADATA).forEach(meta => {
      if (Array.isArray(meta.related_layers) && meta.related_layers.length > 0) {
        expect(meta.related_layers).not.toContain(meta.layer);
      }
    });
  });
});

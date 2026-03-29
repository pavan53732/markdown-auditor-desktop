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

describe('Taxonomy Integrity', () => {
  it('should have exactly 256 detectors', () => {
    const ids = Object.keys(DETECTOR_METADATA);
    expect(ids.length).toBe(256);
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
    expect(prompt).toContain('--- DETECTOR CATALOG (256 DETECTORS) ---');
  });

  it('buildSystemPrompt includes detector details', () => {
    const prompt = buildSystemPrompt('api_docs');
    expect(prompt).toContain('[L1-01] direct contradictions');
    expect(prompt).toContain('Trigger: Two statements explicitly negate each other');
    expect(prompt).toContain('Evidence: Conflicting statements.');
  });
});

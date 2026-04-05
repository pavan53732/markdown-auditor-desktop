import { describe, it, expect } from 'vitest';
import { repairJSON, validateResults } from '../jsonRepair';
import { normalizeIssueFromDetector } from '../detectorMetadata';

describe('JSON Repair', () => {
  it('should repair unquoted property names and trailing commas', () => {
    const raw = `{summary: {"total": 0,}, issues: [], root_causes: [],}`;
    const parsed = repairJSON(raw);

    expect(parsed.summary.total).toBe(0);
    expect(parsed.issues).toEqual([]);
  });

  it('should repair single-quoted keys and Python booleans', () => {
    const raw = `{'summary': {'total': 0}, 'issues': [{'severity': 'high', 'category': 'contradiction', 'description': 'x', 'assumption_detected': True, 'detector_id': 'L1-01'}]}`;
    const parsed = repairJSON(raw);

    expect(parsed.issues[0].assumption_detected).toBe(true);
    expect(parsed.issues[0].detector_id).toBe('L1-01');
  });
});

describe('Result Validation', () => {
  it('should accept valid results', () => {
    const results = {
      summary: { total: 1, critical: 0, high: 1, medium: 0, low: 0 },
      issues: [
        {
          id: '1',
          severity: 'high',
          category: 'contradiction',
          description: 'issue',
          detector_id: 'L1-01'
        }
      ]
    };
    expect(validateResults(results)).toBe(true);
  });

  it('should reject malformed detector IDs', () => {
    const results = {
      summary: { total: 1 },
      issues: [{ severity: 'high', category: 'contradiction', description: 'x', detector_id: 'BAD-ID' }]
    };
    expect(() => validateResults(results)).toThrow('malformed detector_id');
  });

  it('should reject layer mismatches', () => {
    const results = {
      summary: { total: 1 },
      issues: [{ severity: 'high', category: 'security', description: 'x', detector_id: 'L1-01' }]
    };
    expect(() => validateResults(results)).toThrow('does not belong to layer');
  });

  it('should reject subcategory mismatches', () => {
    const results = {
      summary: { total: 1 },
      issues: [{ 
        severity: 'high', 
        category: 'contradiction', 
        subcategory: 'invalid sub', 
        description: 'x', 
        detector_id: 'L1-01' 
      }]
    };
    expect(() => validateResults(results)).toThrow('does not belong to subcategory');
  });

  it('should allow missing category if well-formed detector_id is present', () => {
    const results = {
      summary: { total: 1 },
      issues: [{ severity: 'high', description: 'x', detector_id: 'L1-01' }]
    };
    expect(validateResults(results)).toBe(true);
  });

  it('should reject unknown detector IDs', () => {
    const results = {
      summary: { total: 1 },
      issues: [{ severity: 'high', category: 'contradiction', description: 'x', detector_id: 'L99-99' }]
    };
    expect(() => validateResults(results)).toThrow('unknown detector_id');
  });
});

describe('Taxonomy Normalization', () => {
  it('should backfill missing fields from metadata', () => {
    const issue = {
      detector_id: 'L1-01',
      severity: 'low', // Should be clamped to 'high' floor
      description: 'issue'
    };
    
    const enriched = normalizeIssueFromDetector(issue);
    
    expect(enriched.detector_name).toBe('direct contradictions');
    expect(enriched.subcategory).toBe('direct conflicts');
    expect(enriched.category).toBe('contradiction');
    expect(enriched.severity).toBe('high');
  });

  it('should parse detector_id from description if missing', () => {
    const issue = {
      description: '[L1-01] direct contradictions found',
      severity: 'high'
    };
    
    const enriched = normalizeIssueFromDetector(issue);
    
    expect(enriched.detector_id).toBe('L1-01');
    expect(enriched.category).toBe('contradiction');
  });

  it('should remain graceful for unknown detectors during non-validation enrichment', () => {
    const issue = {
      detector_id: 'L99-99',
      category: 'any',
      severity: 'medium',
      description: 'x'
    };
    
    const enriched = normalizeIssueFromDetector(issue);
    expect(enriched).toEqual(issue);
  });

  it('should support older issues without taxonomy fields', () => {
    const issue = {
      category: 'contradiction',
      severity: 'medium',
      description: 'just a description'
    };
    
    const enriched = normalizeIssueFromDetector(issue);
    expect(enriched).toEqual(issue);
  });
});

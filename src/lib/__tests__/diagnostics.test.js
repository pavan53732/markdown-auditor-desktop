import { describe, it, expect } from 'vitest';
import { createInitialDiagnostics, normalizeIssueFromDetector } from '../detectorMetadata';

describe('Taxonomy Diagnostics', () => {
  it('should initialize diagnostics correctly', () => {
    const diag = createInitialDiagnostics();
    expect(diag.normalized_from_detector_count).toBe(0);
    expect(diag.severity_clamped_count).toBe(0);
  });

  it('should track enrichment and clamping', () => {
    const diag = createInitialDiagnostics();
    const issue = {
      detector_id: 'L1-01',
      severity: 'low',
      description: 'issue'
    };
    
    normalizeIssueFromDetector(issue, diag);
    
    expect(diag.normalized_from_detector_count).toBe(1);
    expect(diag.severity_clamped_count).toBe(1);
    expect(diag.unknown_detector_id_count).toBe(0);
  });

  it('should track unknown detector IDs', () => {
    const diag = createInitialDiagnostics();
    const issue = {
      detector_id: 'L99-99',
      severity: 'medium',
      description: 'issue'
    };
    
    normalizeIssueFromDetector(issue, diag);
    
    expect(diag.unknown_detector_id_count).toBe(1);
    expect(diag.normalized_from_detector_count).toBe(0);
  });

  it('should track parsed IDs from description', () => {
    const diag = createInitialDiagnostics();
    const issue = {
      description: '[L1-01] issue',
      severity: 'high'
    };
    
    normalizeIssueFromDetector(issue, diag);
    
    expect(diag.detector_id_parsed_from_description_count).toBe(1);
    expect(diag.normalized_from_detector_count).toBe(1);
  });
});

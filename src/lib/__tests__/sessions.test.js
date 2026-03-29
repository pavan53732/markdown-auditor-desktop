import { describe, it, expect } from 'vitest';
import { normalizeLoadedSession } from '../detectorMetadata';

describe('Session Load Normalization', () => {
  it('should truthfully count total issues during load', () => {
    const rawSession = {
      results: {
        issues: [
          { detector_id: 'L1-01', description: 'issue 1', severity: 'high' },
          { detector_id: 'L1-02', description: 'issue 2', severity: 'medium' },
          { description: 'issue 3 without id', severity: 'low', category: 'contradiction' }
        ]
      }
    };

    const session = normalizeLoadedSession(rawSession);

    expect(session.taxonomyDiagnostics.total_issues_loaded).toBe(3);
    // Normalized count depends on whether fields were missing. 
    // In L1-01 above, name and subcategory are missing, so it should be enriched.
    expect(session.taxonomyDiagnostics.normalized_from_detector_count).toBeGreaterThan(0);
  });

  it('should enrich legacy sessions and reset diagnostics on load', () => {
    const rawSession = {
      results: {
        issues: [
          { detector_id: 'L1-01', description: 'legacy issue', severity: 'low' } // low is below L1-01 floor
        ]
      }
    };

    const session = normalizeLoadedSession(rawSession);
    const enrichedIssue = session.results.issues[0];

    expect(enrichedIssue.detector_name).toBe('direct contradictions');
    expect(enrichedIssue.severity).toBe('high'); // Clamped to floor
    expect(session.taxonomyDiagnostics.normalized_from_detector_count).toBe(1);
    expect(session.taxonomyDiagnostics.severity_clamped_count).toBe(1);
    expect(session.taxonomyDiagnostics.total_issues_loaded).toBe(1);
  });

  it('should handle session without issues gracefully', () => {
    const rawSession = { results: { summary: { total: 0 } } };
    const session = normalizeLoadedSession(rawSession);
    expect(session.taxonomyDiagnostics.total_issues_loaded).toBe(0);
  });
});

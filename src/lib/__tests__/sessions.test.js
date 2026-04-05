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

  it('should preserve saved malformed-agent diagnostics when loading a wrapped session', () => {
    const rawSession = {
      taxonomyDiagnostics: {
        malformed_agent_response_count: 2,
        skipped_agent_pass_count: 1,
        agent_failure_events: [
          {
            agent_id: 'reasoning_evidence_agent',
            agent_label: 'Reasoning & Evidence Agent',
            batch_index: 1,
            batch_count: 1,
            attempt: 2,
            stage: 'json_parse',
            message: 'Invalid JSON: Expected property name',
            raw_response_excerpt: '{summary: { total: 0 }}'
          }
        ]
      },
      results: {
        issues: [
          { detector_id: 'L1-01', description: 'legacy issue', severity: 'high' }
        ]
      }
    };

    const session = normalizeLoadedSession(rawSession);

    expect(session.taxonomyDiagnostics.malformed_agent_response_count).toBe(2);
    expect(session.taxonomyDiagnostics.skipped_agent_pass_count).toBe(1);
    expect(session.taxonomyDiagnostics.agent_failure_events).toHaveLength(1);
    expect(session.taxonomyDiagnostics.agent_failure_events[0].agent_id).toBe('reasoning_evidence_agent');
  });
});

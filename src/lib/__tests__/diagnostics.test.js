import { describe, it, expect } from 'vitest';
import {
  createInitialDiagnostics,
  normalizeIssueFromDetector,
  recordAgentFailure,
  recordAgentRecovery,
  recordAgentSkip
} from '../detectorMetadata';

describe('Taxonomy Diagnostics', () => {
  it('should initialize diagnostics correctly', () => {
    const diag = createInitialDiagnostics();
    expect(diag.normalized_from_detector_count).toBe(0);
    expect(diag.severity_clamped_count).toBe(0);
    expect(diag.indexed_document_count).toBe(0);
    expect(diag.deterministic_anchor_enrichment_count).toBe(0);
    expect(diag.evidence_span_enrichment_count).toBe(0);
    expect(diag.deterministic_rule_issue_count).toBe(0);
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

  it('should capture malformed agent response diagnostics and recovery', () => {
    const diag = createInitialDiagnostics();

    recordAgentFailure(diag, {
      batch_index: 1,
      batch_count: 2,
      agent_id: 'reasoning_evidence_agent',
      agent_label: 'Reasoning & Evidence Agent',
      attempt: 1,
      stage: 'json_parse',
      message: 'Invalid JSON: Expected property name',
      raw_response: '{summary: { total: 0 }}'
    });
    recordAgentRecovery(diag, {
      batch_index: 1,
      batch_count: 2,
      agent_id: 'reasoning_evidence_agent',
      agent_label: 'Reasoning & Evidence Agent',
      attempt: 2
    });

    expect(diag.malformed_agent_response_count).toBe(1);
    expect(diag.recovered_agent_response_count).toBe(1);
    expect(diag.agent_failure_events).toHaveLength(1);
    expect(diag.agent_failure_events[0].recovered).toBe(true);
    expect(diag.agent_failure_events[0].raw_response_excerpt).toContain('{summary');
    expect(diag.warnings[0]).toContain('Recovered malformed');
  });

  it('should track skipped agent passes after repeated malformed responses', () => {
    const diag = createInitialDiagnostics();

    recordAgentSkip(diag, {
      batch_index: 1,
      batch_count: 1,
      agent_id: 'reasoning_evidence_agent',
      agent_label: 'Reasoning & Evidence Agent',
      attempt: 2
    });

    expect(diag.skipped_agent_pass_count).toBe(1);
    expect(diag.warnings[0]).toContain('Skipped Reasoning & Evidence Agent');
  });
});

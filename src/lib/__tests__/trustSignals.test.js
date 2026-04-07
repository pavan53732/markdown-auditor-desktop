import { describe, expect, it } from 'vitest';

import { compareIssuesByTrustStrength, enrichIssueWithTrustSignals, summarizeIssueTrustSignals } from '../trustSignals';

describe('Trust Signals', () => {
  it('weights deterministic and hybrid evidence above model-only findings', () => {
    const modelIssue = enrichIssueWithTrustSignals({
      detector_id: 'L1-01',
      severity: 'high',
      category: 'contradiction',
      description: 'Model-only issue',
      detection_source: 'model',
      evidence: 'Loose evidence'
    });

    const hybridIssue = enrichIssueWithTrustSignals({
      detector_id: 'L1-01',
      severity: 'high',
      category: 'contradiction',
      description: 'Hybrid issue',
      detection_source: 'hybrid',
      document_anchor: 'spec.md#overview:L10',
      evidence_spans: [
        {
          file: 'spec.md',
          anchor: 'spec.md#overview:L10',
          role: 'primary',
          source: 'evidence_match',
          excerpt: 'Anchored excerpt'
        }
      ],
      cross_file_links: [
        {
          type: 'shared_heading',
          target: 'spec-b.md#overview:L8'
        }
      ]
    });

    const ruleIssue = enrichIssueWithTrustSignals({
      detector_id: 'L47-01',
      severity: 'high',
      category: 'workflow_lifecycle_integrity',
      description: 'Rule-backed issue',
      detection_source: 'rule',
      rule_id: 'workflow_ordering_rule',
      document_anchor: 'spec.md#execution-flow:L12',
      evidence_spans: [
        {
          file: 'spec.md',
          anchor: 'spec.md#execution-flow:L12',
          role: 'primary',
          source: 'deterministic_rule_engine',
          excerpt: '1. Agent Proposal'
        }
      ],
      proof_chains: [
        {
          relation: 'violates',
          source_span: { file: 'spec.md', anchor: 'spec.md#execution-flow:L12' },
          target_span: { file: 'spec.md', anchor: 'spec.md#execution-flow:L14' }
        }
      ]
    });

    expect(modelIssue.trust_score).toBeLessThan(hybridIssue.trust_score);
    expect(hybridIssue.trust_score).toBeLessThan(ruleIssue.trust_score);
    expect(ruleIssue.evidence_grade).toMatch(/[AB]/);
    expect(modelIssue.proof_status).toBe('hybrid_supported');
    expect(modelIssue.trust_tier).toBe('weak');
    expect(hybridIssue.proof_status).toBe('hybrid_supported');
    expect(hybridIssue.trust_tier).toBe('supported');
    expect(ruleIssue.proof_status).toBe('deterministic_proof');
    expect(ruleIssue.trust_tier).toMatch(/strong|very_strong/);
    expect(ruleIssue.trust_basis).toContain('deterministic_rule');
    expect(ruleIssue.trust_basis).toContain('rule_receipt');
  });

  it('summarizes average trust and strong-evidence counts', () => {
    const summary = summarizeIssueTrustSignals([
      enrichIssueWithTrustSignals({
        detector_id: 'L1-01',
        severity: 'high',
        category: 'contradiction',
        description: 'Strong anchored issue',
        detection_source: 'hybrid',
        document_anchor: 'spec.md#overview:L10',
        document_anchors: ['spec.md#overview:L10', 'spec-b.md#overview:L8'],
        evidence: 'Anchored contradiction excerpt',
        confidence: 0.92,
        evidence_spans: [
          { file: 'spec.md', anchor: 'spec.md#overview:L10', role: 'primary' },
          { file: 'spec-b.md', anchor: 'spec-b.md#overview:L8', role: 'supporting' }
        ],
        proof_chains: [
          {
            relation: 'contradicts',
            source_span: { file: 'spec.md', anchor: 'spec.md#overview:L10' },
            target_span: { file: 'spec-b.md', anchor: 'spec-b.md#overview:L8' }
          }
        ],
        cross_file_links: [
          {
            type: 'document_reference',
            target: 'spec-b.md#overview:L8'
          }
        ]
      }),
      enrichIssueWithTrustSignals({
        detector_id: 'L3-02',
        severity: 'low',
        category: 'structural',
        description: 'Weak issue',
        detection_source: 'model'
      })
    ]);

    expect(summary.averageTrustScore).toBeGreaterThan(0);
    expect(summary.highTrustIssueCount).toBeGreaterThanOrEqual(1);
    expect(summary.strongEvidenceIssueCount).toBeGreaterThanOrEqual(1);
    expect(summary.deterministicProofIssueCount).toBe(0);
    expect(summary.receiptBackedIssueCount).toBe(0);
    expect(summary.hybridSupportedIssueCount).toBe(1);
    expect(summary.hybridBackedIssueCount).toBe(1);
    expect(summary.modelOnlyIssueCount).toBe(1);
    expect(summary.ruleBackedIssueCount).toBe(0);
  });

  it('ranks hybrid and rule-backed findings above model-only findings', () => {
    const modelIssue = enrichIssueWithTrustSignals({
      detector_id: 'L1-01',
      severity: 'high',
      category: 'contradiction',
      description: 'Model issue',
      detection_source: 'model'
    });

    const hybridIssue = enrichIssueWithTrustSignals({
      detector_id: 'L1-01',
      severity: 'high',
      category: 'contradiction',
      description: 'Hybrid issue',
      detection_source: 'hybrid',
      document_anchor: 'spec.md#overview:L10'
    });

    const ruleIssue = enrichIssueWithTrustSignals({
      detector_id: 'L47-01',
      severity: 'high',
      category: 'workflow_lifecycle_integrity',
      description: 'Rule issue',
      detection_source: 'rule',
      rule_id: 'workflow_ordering_rule'
    });

    expect(compareIssuesByTrustStrength(modelIssue, hybridIssue)).toBeGreaterThan(0);
    expect(compareIssuesByTrustStrength(modelIssue, ruleIssue)).toBeGreaterThan(0);
  });

  it('caps model-only api/spec formalism findings so they cannot overclaim severity', () => {
    const apiIssue = enrichIssueWithTrustSignals({
      detector_id: 'L17-03',
      severity: 'critical',
      category: 'api_contract',
      description: 'Unanchored API contract concern',
      detection_source: 'model'
    });

    const formalismIssue = enrichIssueWithTrustSignals({
      detector_id: 'L33-15',
      severity: 'high',
      category: 'specification_formalism',
      description: 'Unanchored formalism concern',
      detection_source: 'model'
    });

    const hybridApiIssue = enrichIssueWithTrustSignals({
      detector_id: 'L17-03',
      severity: 'high',
      category: 'api_contract',
      description: 'Anchored API concern',
      detection_source: 'hybrid',
      document_anchor: 'api.md#create-payment:L3'
    });

    expect(apiIssue.proof_status).toBe('model_only');
    expect(apiIssue.severity).toBe('medium');
    expect(formalismIssue.proof_status).toBe('model_only');
    expect(formalismIssue.severity).toBe('medium');
    expect(hybridApiIssue.proof_status).toBe('hybrid_supported');
    expect(hybridApiIssue.severity).toBe('high');
  });
});

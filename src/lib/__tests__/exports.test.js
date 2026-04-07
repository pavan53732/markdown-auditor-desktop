import { describe, it, expect } from 'vitest';
import { createInitialDiagnostics, buildExportData, buildSessionData } from '../detectorMetadata';
import { buildMarkdownReport, buildCsvReport } from '../exportFormats';

describe('Diagnostics Persistence Helpers', () => {
  it('buildExportData should include diagnostics', () => {
    const diag = createInitialDiagnostics();
    diag.normalized_from_detector_count = 5;
    
    const results = { summary: { total: 5 }, issues: [] };
    const exportData = buildExportData(results, diag);
    
    expect(exportData.taxonomyDiagnostics).toEqual(diag);
    expect(exportData.summary.total).toBe(5);
  });

  it('buildSessionData should include diagnostics and other metadata', () => {
    const diag = createInitialDiagnostics();
    const results = { summary: { total: 1 }, issues: [] };
    const files = [{ name: 'test.md', content: 'test' }];
    const config = { baseURL: 'url', model: 'm' };
    
    const session = buildSessionData({ results, taxonomyDiagnostics: diag, files, config });
    
    expect(session.taxonomyDiagnostics).toEqual(diag);
    expect(session.files).toEqual(files);
    expect(session.config.model).toBe('m');
    expect(session.timestamp).toBeDefined();
  });

  it('helpers should handle null results gracefully', () => {
    expect(buildExportData(null, {})).toBeNull();
    expect(buildSessionData({ results: null })).toBeNull();
  });

  it('buildMarkdownReport should include trust and evidence summary fields', () => {
    const markdown = buildMarkdownReport({
      results: {
        summary: {
          total: 1,
          critical: 0,
          high: 1,
          medium: 0,
          low: 0,
          files_analyzed: 1,
          analysis_agent_passes: 8,
          average_trust_score: 82,
          high_trust_issue_count: 1,
          strong_evidence_issue_count: 1,
          deterministic_proof_issue_count: 0,
          receipt_backed_issue_count: 0,
          hybrid_supported_issue_count: 1,
          model_only_issue_count: 0,
          detectors_defined: 701,
          detectors_runtime_touched: 12,
          detectors_model_finding_backed: 4,
          detectors_locally_checked: 6,
          detectors_untouched: 689
        },
        issues: [
          {
            severity: 'high',
            description: 'Anchored contradiction',
            detector_id: 'L1-01',
            category: 'contradiction',
            trust_score: 88,
            proof_status: 'hybrid_supported',
            trust_tier: 'very_strong',
            evidence_grade: 'A',
            trust_basis: ['document_anchor', 'evidence_span', 'proof_chain'],
            trust_reasons: ['deterministic local rule', 'document anchor'],
            evidence_grade_reason: 'A-grade evidence driven by deterministic local rule, document anchor.',
            files: ['spec.md']
          }
        ],
        root_causes: []
      },
      taxonomyDiagnostics: createInitialDiagnostics(),
      brandName: 'Markdown Intelligence Auditor',
      brandTagline: 'Deterministic Markdown specification auditing',
      brandIconDataUrl: '',
      generatedAt: '2026-04-07 10:00:00',
      analysisAgentCount: 8,
      totalDetectorCount: 701
    });

    expect(markdown).toContain('Average Trust Score');
    expect(markdown).toContain('Strong-Evidence Issues');
    expect(markdown).toContain('Hybrid-Supported Issues');
    expect(markdown).toContain('**Trust Score:** 88');
    expect(markdown).toContain('**Proof Status:** hybrid_supported');
    expect(markdown).toContain('**Trust Tier:** very_strong');
    expect(markdown).toContain('**Evidence Grade:** A');
    expect(markdown).toContain('**Trust Basis:** document_anchor, evidence_span, proof_chain');
  });

  it('buildCsvReport should serialize trust and evidence columns', () => {
    const csv = buildCsvReport({
      issues: [
        {
          id: 'issue-1',
          detector_id: 'L1-01',
          detector_name: 'Contradiction detector',
          severity: 'high',
          category: 'contradiction',
          subcategory: 'internal_consistency',
          trust_score: 91,
          proof_status: 'receipt_backed',
          trust_tier: 'very_strong',
          evidence_grade: 'A',
          trust_basis: ['rule_receipt', 'document_anchor'],
          trust_reasons: ['document anchor', 'typed proof chains'],
          evidence_grade_reason: 'A-grade evidence driven by document anchor, typed proof chains.',
          description: 'Contradiction issue',
          files: ['spec.md']
        }
      ]
    });

    expect(csv).toContain('TrustScore');
    expect(csv).toContain('ProofStatus');
    expect(csv).toContain('TrustTier');
    expect(csv).toContain('EvidenceGrade');
    expect(csv).toContain('TrustBasis');
    expect(csv).toContain('TrustReasons');
    expect(csv).toContain('91,receipt_backed,very_strong,A');
    expect(csv).toContain('rule_receipt | document_anchor');
    expect(csv).toContain('document anchor | typed proof chains');
  });
});

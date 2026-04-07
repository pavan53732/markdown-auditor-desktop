import { describe, expect, it } from 'vitest';

import {
  applyPostMergeEscalation,
  applyRuntimeDetectorCoverageSummary,
  buildRuntimeDetectorCoverage,
  deduplicateIssues,
  deduplicateRootCauses,
  mergeBatchResults
} from '../auditPipeline';
import { TOTAL_DETECTOR_COUNT } from '../detectorMetadata';

describe('Audit Pipeline Helpers', () => {
  it('builds truthful runtime detector coverage from findings and receipts', () => {
    const coverage = buildRuntimeDetectorCoverage({
      issues: [
        { detector_id: 'L17-03', detection_source: 'rule' },
        { detector_id: 'L33-15', detection_source: 'model' },
        { detector_id: 'L33-15', detection_source: 'hybrid' }
      ],
      deterministicReceipts: [
        { detector_id: 'L17-03' },
        { detector_id: 'L17-04' }
      ]
    });

    expect(coverage.detectorsDefined).toBe(TOTAL_DETECTOR_COUNT);
    expect(coverage.findingBackedDetectorIds).toEqual(['L17-03', 'L33-15']);
    expect(coverage.modelFindingBackedDetectorIds).toEqual(['L33-15']);
    expect(coverage.localCheckedDetectorIds).toEqual(['L17-03', 'L17-04']);
    expect(coverage.runtimeTouchedDetectorIds).toEqual(['L17-03', 'L17-04', 'L33-15']);
    expect(coverage.runtimeTouchedDetectorCount).toBe(3);
    expect(coverage.untouchedDetectorCount).toBe(TOTAL_DETECTOR_COUNT - 3);

    const summary = {};
    applyRuntimeDetectorCoverageSummary(summary, coverage);
    expect(summary.detectors_defined).toBe(TOTAL_DETECTOR_COUNT);
    expect(summary.detectors_finding_backed).toBe(2);
    expect(summary.detectors_model_finding_backed).toBe(1);
    expect(summary.detectors_locally_checked).toBe(2);
    expect(summary.detectors_runtime_touched).toBe(3);
    expect(summary.detectors_evaluated).toBe(3);
    expect(summary.detectors_skipped).toBe(TOTAL_DETECTOR_COUNT - 3);
    expect(summary.detector_coverage_mode).toBe('receipt_backed_and_finding_backed');
  });

  it('escalates clustered section issues and paired component risks', () => {
    const issues = [
      { severity: 'medium', category: 'structural', section: 'Overview', files: ['spec.md'] },
      { severity: 'medium', category: 'structural', section: 'Overview', files: ['spec.md'] },
      { severity: 'medium', category: 'structural', section: 'Overview', files: ['spec.md'] },
      { severity: 'high', category: 'security', section: 'Runtime', files: ['engine.md'] },
      { severity: 'medium', category: 'performance', section: 'Runtime', files: ['engine.md'] }
    ];

    applyPostMergeEscalation(issues);

    expect(issues.slice(0, 3).every((issue) => issue.severity === 'high')).toBe(true);
    expect(issues[0].escalation_reason).toContain('3 or more medium issues');
    expect(issues[3].severity).toBe('critical');
    expect(issues[4].severity).toBe('critical');
  });

  it('deduplicates issues while preserving evidence, anchors, agents, and stronger source', () => {
    const deduped = deduplicateIssues([
      {
        detector_id: 'L17-03',
        severity: 'medium',
        category: 'api_contract',
        description: 'Missing response schema',
        files: ['api.md'],
        section: 'Create Payment',
        line_number: 8,
        document_anchor: 'api.md#create-payment:L8',
        document_anchors: ['api.md#create-payment:L8'],
        evidence_spans: [{ file: 'api.md', anchor: 'api.md#create-payment:L8', role: 'primary' }],
        cross_file_links: [{ type: 'document_reference', target: 'design.md#payment-api:L3' }],
        analysis_agents: ['tool_deployment_agent'],
        detection_source: 'model'
      },
      {
        detector_id: 'L17-03',
        severity: 'high',
        category: 'api_contract',
        description: 'Missing response schema',
        files: ['api.md'],
        section: 'Create Payment',
        line_number: 8,
        document_anchor: 'api.md#create-payment:L8',
        anchor_source: 'deterministic_anchor',
        document_anchors: ['design.md#payment-api:L3'],
        evidence_spans: [{ file: 'design.md', anchor: 'design.md#payment-api:L3', role: 'supporting' }],
        cross_file_links: [{ type: 'document_reference', target: 'design.md#payment-api:L3' }],
        analysis_agents: ['cross_layer_synth_agent'],
        detection_source: 'rule'
      }
    ]);

    expect(deduped).toHaveLength(1);
    expect(deduped[0].severity).toBe('high');
    expect(deduped[0].analysis_agents).toEqual(['tool_deployment_agent', 'cross_layer_synth_agent']);
    expect(deduped[0].detection_source).toBe('hybrid');
    expect(deduped[0].document_anchors).toContain('api.md#create-payment:L8');
    expect(deduped[0].document_anchors).toContain('design.md#payment-api:L3');
    expect(deduped[0].evidence_spans).toHaveLength(2);
    expect(deduped[0].cross_file_links).toHaveLength(1);
  });

  it('merges batch results and deduplicates root causes', () => {
    const merged = mergeBatchResults([
      {
        _sourceFiles: ['a.md'],
        issues: [
          {
            detector_id: 'L17-03',
            severity: 'medium',
            category: 'api_contract',
            description: 'Issue A',
            files: ['a.md'],
            section: 'Overview',
            line_number: 3
          }
        ],
        root_causes: [
          { id: 'rc-1', title: 'Shared root cause', child_issues: ['issue-a'], description: 'desc' }
        ]
      },
      {
        _sourceFiles: ['b.md'],
        issues: [
          {
            detector_id: 'L17-04',
            severity: 'high',
            category: 'api_contract',
            description: 'Issue B',
            files: ['b.md'],
            section: 'Overview',
            line_number: 4
          }
        ],
        root_causes: [
          { id: 'rc-1', title: 'Shared root cause', child_issues: ['issue-b'], impact: 'impact' }
        ]
      }
    ]);

    expect(merged.summary.files_analyzed).toBe(2);
    expect(merged.summary.total).toBe(2);
    expect(merged.root_causes).toHaveLength(1);
    expect(deduplicateRootCauses(merged.root_causes)).toHaveLength(1);
    expect(merged.root_causes[0].child_issues).toEqual(['issue-a', 'issue-b']);
  });
});

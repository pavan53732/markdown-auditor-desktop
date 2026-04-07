import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildHistoryMetadata, normalizeLoadedSession, compareAudits } from '../detectorMetadata';

describe('History Metadata', () => {
  it('should build correct history metadata with default source', () => {
    const results = {
      summary: { total: 10, critical: 1, high: 2, medium: 3, low: 4 },
      root_causes: []
    };
    const files = [{ name: 'file1.md' }, { name: 'file2.md' }];
    const config = { model: 'gpt-4o' };

    const meta = buildHistoryMetadata(results, files, config);

    expect(meta.title).toContain('Audit');
    expect(meta.note).toBe('');
    expect(meta.sourceType).toBe('fresh_analysis');
    expect(meta.fileCount).toBe(2);
    expect(meta.fileNames).toEqual(['file1.md', 'file2.md']);
    expect(meta.issuesCount.total).toBe(10);
    expect(meta.issuesCount.critical).toBe(1);
    expect(meta.model).toBe('gpt-4o');
    expect(meta.auditMode).toBe('universal');
    expect(meta.timestamp).toBeDefined();
  });

  it('should support custom source types like imported_session', () => {
    const meta = buildHistoryMetadata({ summary: {} }, [], {}, 'imported_session');
    expect(meta.sourceType).toBe('imported_session');
  });

  it('should handle null values gracefully', () => {
    expect(buildHistoryMetadata(null)).toBeNull();
  });
});

describe('History Normalization', () => {
  it('should normalize loaded history results', () => {
    const historySession = {
      files: [
        {
          name: 'plan.md',
          content: [
            '# Overview',
            '',
            '## Execution Flow',
            '1. Agent Proposal',
            '2. Governance Enforcement Interface',
            '3. Verification Layer'
          ].join('\n')
        },
        {
          name: 'reference.md',
          content: [
            '# Execution Flow',
            '1. Agent Proposal',
            '2. Governance Enforcement Interface',
            '4. Local Export'
          ].join('\n')
        }
      ],
      taxonomyDiagnostics: {
        malformed_agent_response_count: 1,
        agent_failure_events: [
          {
            agent_id: 'reasoning_evidence_agent',
            agent_label: 'Reasoning & Evidence Agent',
            batch_index: 1,
            attempt: 1,
            stage: 'json_parse',
            message: 'Invalid JSON: Expected property name',
            raw_response_excerpt: '{summary: { total: 0 }}'
          }
        ]
      },
      results: {
        issues: [
          {
            detector_id: 'L1-01',
            description: 'issue 1',
            severity: 'low',
            evidence: '2. Governance Enforcement Interface',
            files: ['plan.md']
          }
        ]
      }
    };

    const normalized = normalizeLoadedSession(historySession);
    
    // L1-01 has a floor of 'high'
    expect(normalized.results.issues[0].severity).toBe('high');
    expect(normalized.results.issues[0].detector_name).toBe('direct contradictions');
    expect(normalized.results.issues[0].section).toBe('Execution Flow');
    expect(normalized.results.issues[0].line_number).toBe(5);
    expect(normalized.results.issues[0].document_anchor).toBe('plan.md#execution-flow:L5');
    expect(normalized.results.issues[0].detection_source).toBe('hybrid');
    expect(normalized.results.issues[0].cross_file_links).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          file: 'reference.md'
        })
      ])
    );
    expect(normalized.results.issues[0].evidence_spans).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          file: 'plan.md',
          anchor: 'plan.md#execution-flow:L5'
        })
      ])
    );
    expect(normalized.results.issues[0].proof_chains).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          relation: 'contradicts',
          source_span: expect.objectContaining({
            anchor: 'plan.md#execution-flow:L5'
          }),
          target_span: expect.objectContaining({
            file: 'reference.md'
          })
        })
      ])
    );
    expect(normalized.results.issues[0].trust_score).toBeGreaterThan(0);
    expect(normalized.results.issues[0].evidence_grade).toMatch(/[A-F]/);
    expect(Array.isArray(normalized.results.issues[0].trust_reasons)).toBe(true);
    expect(normalized.taxonomyDiagnostics.severity_clamped_count).toBe(1);
    expect(normalized.taxonomyDiagnostics.total_issues_loaded).toBe(1);
    expect(normalized.taxonomyDiagnostics.indexed_document_count).toBe(2);
    expect(normalized.taxonomyDiagnostics.indexed_heading_count).toBe(3);
    expect(normalized.taxonomyDiagnostics.project_graph_document_count).toBe(2);
    expect(normalized.taxonomyDiagnostics.project_graph_workflow_group_count).toBeGreaterThanOrEqual(1);
    expect(normalized.taxonomyDiagnostics.deterministic_anchor_enrichment_count).toBe(1);
    expect(normalized.taxonomyDiagnostics.deterministic_graph_link_enrichment_count).toBe(1);
    expect(normalized.taxonomyDiagnostics.deterministic_proof_chain_enrichment_count).toBe(1);
    expect(normalized.taxonomyDiagnostics.proof_chain_edge_count).toBeGreaterThanOrEqual(1);
    expect(normalized.taxonomyDiagnostics.runtime_detector_touched_count).toBeGreaterThanOrEqual(1);
    expect(normalized.taxonomyDiagnostics.agent_failure_events).toHaveLength(1);
    expect(normalized.taxonomyDiagnostics.agent_failure_events[0].agent_id).toBe('reasoning_evidence_agent');
  });
});

describe('History Comparison', () => {
  it('should identify new, resolved, and changed issues', () => {
    const prev = {
      issues: [
        { detector_id: 'L1-01', description: 'issue 1', severity: 'high', files: ['f1.md'] },
        { detector_id: 'L1-02', description: 'issue 2', severity: 'medium', files: ['f1.md'] }
      ]
    };
    const curr = {
      issues: [
        { detector_id: 'L1-01', description: 'issue 1', severity: 'critical', files: ['f1.md'] }, // changed
        { detector_id: 'L1-03', description: 'issue 3', severity: 'low', files: ['f1.md'] }      // new
      ]
    };

    const diff = compareAudits(curr, prev);

    expect(diff.totalNew).toBe(1);
    expect(diff.totalResolved).toBe(1);
    expect(diff.totalChanged).toBe(1);
    expect(diff.changed[0].diffStatus).toBe('changed');
    expect(diff.changed[0].prevSeverity).toBe('high');
    expect(diff.new[0].detector_id).toBe('L1-03');
    expect(diff.resolved[0].detector_id).toBe('L1-02');
  });

  it('should handle empty comparison safely', () => {
    expect(compareAudits(null, null)).toBeNull();
    expect(compareAudits({ issues: [] }, { issues: [] })).toEqual({
      new: [], resolved: [], changed: [], unchanged: [],
      totalNew: 0, totalResolved: 0, totalChanged: 0
    });
  });
});

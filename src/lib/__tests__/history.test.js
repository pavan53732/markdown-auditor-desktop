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
      issues: [
        { detector_id: 'L1-01', description: 'issue 1', severity: 'low' }
      ]
    };

    const normalized = normalizeLoadedSession({ results: historySession });
    
    // L1-01 has a floor of 'high'
    expect(normalized.results.issues[0].severity).toBe('high');
    expect(normalized.results.issues[0].detector_name).toBe('direct contradictions');
    expect(normalized.taxonomyDiagnostics.severity_clamped_count).toBe(1);
    expect(normalized.taxonomyDiagnostics.total_issues_loaded).toBe(1);
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

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildHistoryMetadata, normalizeLoadedSession } from '../detectorMetadata';

describe('History Metadata', () => {
  it('should build correct history metadata', () => {
    const results = {
      summary: { total: 10, critical: 1, high: 2, medium: 3, low: 4 }
    };
    const files = [{ name: 'file1.md' }, { name: 'file2.md' }];
    const config = { model: 'gpt-4o' };
    const profile = 'api_docs';

    const meta = buildHistoryMetadata(results, files, config, profile);

    expect(meta.title).toContain('Audit');
    expect(meta.fileCount).toBe(2);
    expect(meta.fileNames).toEqual(['file1.md', 'file2.md']);
    expect(meta.issuesCount.total).toBe(10);
    expect(meta.issuesCount.critical).toBe(1);
    expect(meta.model).toBe('gpt-4o');
    expect(meta.profile).toBe('api_docs');
    expect(meta.timestamp).toBeDefined();
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

import { describe, it, expect } from 'vitest';
import { createInitialDiagnostics, buildExportData, buildSessionData } from '../detectorMetadata';

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
});

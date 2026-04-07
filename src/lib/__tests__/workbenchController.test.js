import { describe, expect, it, vi } from 'vitest';

import {
  exportAuditJson,
  parseLoadedSessionText,
  buildHistoryComparisonOutcome,
  buildBaselineHistoryEntry,
  saveResultsToHistoryWorkbench
} from '../workbenchController';

function createDownloadStubs() {
  let capturedBlob = null;
  let clicked = false;
  const documentRef = {
    createElement: vi.fn(() => ({
      click: vi.fn(() => {
        clicked = true;
      }),
      set href(value) {
        this._href = value;
      },
      get href() {
        return this._href;
      },
      set download(value) {
        this._download = value;
      },
      get download() {
        return this._download;
      }
    }))
  };
  const urlRef = {
    createObjectURL: vi.fn((blob) => {
      capturedBlob = blob;
      return 'blob:test';
    }),
    revokeObjectURL: vi.fn()
  };

  return {
    documentRef,
    urlRef,
    wasClicked: () => clicked,
    readText: async () => capturedBlob?.text()
  };
}

describe('workbenchController', () => {
  it('exports JSON reports through the shared download controller', async () => {
    const stubs = createDownloadStubs();
    const now = new Date('2026-04-07T10:00:00Z');

    const didExport = exportAuditJson({
      results: { summary: { total: 1 }, issues: [{ detector_id: 'L1-01', description: 'Conflict' }], root_causes: [] },
      taxonomyDiagnostics: { indexed_document_count: 1 },
      now,
      documentRef: stubs.documentRef,
      urlRef: stubs.urlRef
    });

    expect(didExport).toBe(true);
    expect(stubs.documentRef.createElement).toHaveBeenCalledWith('a');
    expect(stubs.urlRef.createObjectURL).toHaveBeenCalledTimes(1);
    expect(stubs.wasClicked()).toBe(true);
    expect(await stubs.readText()).toContain('"total": 1');
  });

  it('parses session JSON into normalized app state', () => {
    const text = JSON.stringify({
      files: [{ name: 'spec.md', content: '# Spec' }],
      results: { summary: { files_analyzed: 1, analysis_agent_passes: 8 }, issues: [], root_causes: [] },
      taxonomyDiagnostics: { indexed_document_count: 1 }
    });

    const loadedState = parseLoadedSessionText(text);
    expect(loadedState.files[0].name).toBe('spec.md');
    expect(loadedState.results.summary.files_analyzed).toBe(1);
    expect(loadedState.analysisStats.agentPasses).toBe(8);
  });

  it('builds history comparison outcomes for current and baseline comparisons', () => {
    const targetResults = { summary: { total: 1 }, issues: [], root_causes: [] };
    const baselineResults = { summary: { total: 2 }, issues: [], root_causes: [] };

    const baselineOutcome = buildHistoryComparisonOutcome({
      baselineEntry: { title: 'Baseline A', results: baselineResults },
      currentResults: null,
      targetResults,
      targetTitle: 'Run B'
    });
    expect(baselineOutcome.mode).toBe('history_to_history');
    expect(baselineOutcome.contextWarning).toContain('Baseline A');

    const currentOutcome = buildHistoryComparisonOutcome({
      baselineEntry: null,
      currentResults: baselineResults,
      targetResults,
      targetTitle: 'Run B'
    });
    expect(currentOutcome.mode).toBe('current_to_history');
    expect(currentOutcome.contextWarning).toContain('Current Run');
  });

  it('persists results to history and returns refreshed history plus baseline metadata helpers', async () => {
    const updatedHistory = [{ id: '1', title: 'Audit' }];
    const electronAPI = {
      addHistorySession: vi.fn(async () => {}),
      pruneHistory: vi.fn(async () => {}),
      listHistory: vi.fn(async () => updatedHistory)
    };
    const results = { summary: { total: 3 }, issues: [], root_causes: [] };

    const refreshed = await saveResultsToHistoryWorkbench({
      electronAPI,
      results,
      taxonomyDiagnostics: { indexed_document_count: 1 },
      files: [{ name: 'spec.md', content: '# Spec' }],
      config: { model: 'gpt-4o', baseURL: 'https://api.example.com' }
    });

    expect(electronAPI.addHistorySession).toHaveBeenCalledTimes(1);
    expect(electronAPI.pruneHistory).toHaveBeenCalledWith(50);
    expect(refreshed).toEqual(updatedHistory);

    const baseline = buildBaselineHistoryEntry({
      id: '1',
      loadedState: { results },
      historyList: updatedHistory
    });
    expect(baseline.title).toBe('Audit');
  });
});

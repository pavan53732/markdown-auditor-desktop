import { describe, expect, it } from 'vitest';

import {
  buildHistoryPersistencePayload,
  buildLoadedSessionAppState,
  normalizeFileDisplayNames
} from '../sessionService';

describe('Session Service', () => {
  it('normalizes duplicate file names for the active session state', () => {
    const normalized = normalizeFileDisplayNames([
      { name: 'spec.md' },
      { name: 'spec.md' },
      { name: 'notes.md' }
    ]);

    expect(normalized.map((file) => file.name)).toEqual(['spec.md [1]', 'spec.md [2]', 'notes.md']);
  });

  it('builds history persistence payloads with metadata and session data', () => {
    const payload = buildHistoryPersistencePayload({
      results: { summary: { total: 1, critical: 0, high: 1, medium: 0, low: 0 }, root_causes: [] },
      taxonomyDiagnostics: { indexed_document_count: 1 },
      files: [{ name: 'spec.md', content: '# Title' }],
      config: { model: 'gpt-4o' },
      sourceType: 'imported_session'
    });

    expect(payload.metadata.sourceType).toBe('imported_session');
    expect(payload.session.files).toHaveLength(1);
    expect(payload.session.results.summary.total).toBe(1);
  });

  it('builds loaded app state from saved sessions', () => {
    const loadedState = buildLoadedSessionAppState({
      files: [
        { name: 'spec.md', content: '# Overview\n\nBody' },
        { name: 'spec.md', content: '# Reference\n\nBody' }
      ],
      taxonomyDiagnostics: {},
      results: {
        summary: {
          total: 0,
          critical: 0,
          high: 0,
          medium: 0,
          low: 0,
          files_analyzed: 2,
          analysis_agent_passes: 8
        },
        issues: []
      }
    });

    expect(loadedState.files.map((file) => file.name)).toEqual(['spec.md [1]', 'spec.md [2]']);
    expect(loadedState.analysisStats).toEqual({
      reused: 0,
      reanalyzed: 2,
      agentPasses: 8
    });
    expect(loadedState.results.summary.total).toBe(0);
  });
});

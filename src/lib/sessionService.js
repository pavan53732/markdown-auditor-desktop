import {
  buildHistoryMetadata,
  buildSessionData,
  normalizeLoadedSession
} from './detectorMetadata';

export function normalizeFileDisplayNames(fileList = []) {
  const totals = new Map();
  fileList.forEach((file) => {
    const baseName = file.originalName || file.name;
    totals.set(baseName, (totals.get(baseName) || 0) + 1);
  });

  const seen = new Map();
  return fileList.map((file) => {
    const baseName = file.originalName || file.name;
    const nextIndex = (seen.get(baseName) || 0) + 1;
    seen.set(baseName, nextIndex);

    return {
      ...file,
      originalName: baseName,
      name: totals.get(baseName) > 1 ? `${baseName} [${nextIndex}]` : baseName
    };
  });
}

export function normalizeHistorySessionPayload(session) {
  if (!session) return null;
  return session.results ? session : { results: session };
}

export function buildLoadedSessionAppState(rawSession) {
  const session = normalizeLoadedSession(normalizeHistorySessionPayload(rawSession));
  if (!session?.results) return null;

  return {
    session,
    files: normalizeFileDisplayNames(session.files || []),
    results: session.results,
    taxonomyDiagnostics: session.taxonomyDiagnostics,
    analysisStats: {
      reused: 0,
      reanalyzed: session.results.summary?.files_analyzed || session.files?.length || 0,
      agentPasses: session.results.summary?.analysis_agent_passes || 0
    }
  };
}

export function buildHistoryPersistencePayload({
  results,
  taxonomyDiagnostics,
  files,
  config,
  sourceType = 'fresh_analysis'
}) {
  const metadata = buildHistoryMetadata(results, files, config, sourceType);
  const session = buildSessionData({ results, taxonomyDiagnostics, files, config });

  if (!metadata || !session) {
    return null;
  }

  return { metadata, session };
}

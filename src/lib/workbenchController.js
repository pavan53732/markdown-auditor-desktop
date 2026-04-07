import { buildMarkdownReport, buildCsvReport } from './exportFormats';
import { buildLoadedSessionAppState, buildHistoryPersistencePayload } from './sessionService';
import { buildExportData, buildSessionData, compareAudits } from './detectorMetadata';

function triggerDownload({ content, type, filename, documentRef = document, urlRef = URL }) {
  const blob = new Blob([content], { type });
  const url = urlRef.createObjectURL(blob);
  const anchor = documentRef.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  urlRef.revokeObjectURL(url);
}

function buildDateStamp(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

export function exportAuditJson({ results, taxonomyDiagnostics, now = new Date(), documentRef = document, urlRef = URL }) {
  if (!results) return false;
  const exportData = buildExportData(results, taxonomyDiagnostics);
  triggerDownload({
    content: JSON.stringify(exportData, null, 2),
    type: 'application/json',
    filename: `audit-results-${buildDateStamp(now)}.json`,
    documentRef,
    urlRef
  });
  return true;
}

export function exportAuditMarkdown({
  results,
  taxonomyDiagnostics,
  brandName,
  brandTagline,
  brandIconDataUrl,
  analysisAgentCount,
  totalDetectorCount,
  now = new Date(),
  generatedAt = now.toLocaleString(),
  documentRef = document,
  urlRef = URL
}) {
  if (!results) return false;
  const markdown = buildMarkdownReport({
    results,
    taxonomyDiagnostics,
    brandName,
    brandTagline,
    brandIconDataUrl,
    generatedAt,
    analysisAgentCount,
    totalDetectorCount
  });
  triggerDownload({
    content: markdown,
    type: 'text/markdown',
    filename: `audit-report-${buildDateStamp(now)}.md`,
    documentRef,
    urlRef
  });
  return true;
}

export function exportAuditCsv({ results, now = new Date(), documentRef = document, urlRef = URL }) {
  if (!results) return false;
  triggerDownload({
    content: buildCsvReport(results),
    type: 'text/csv',
    filename: `audit-results-${buildDateStamp(now)}.csv`,
    documentRef,
    urlRef
  });
  return true;
}

export function exportAuditSession({
  results,
  taxonomyDiagnostics,
  files,
  config,
  now = new Date(),
  documentRef = document,
  urlRef = URL
}) {
  if (!results) return false;
  const session = buildSessionData({ results, taxonomyDiagnostics, files, config });
  triggerDownload({
    content: JSON.stringify(session, null, 2),
    type: 'application/json',
    filename: `audit-session-${buildDateStamp(now)}.json`,
    documentRef,
    urlRef
  });
  return true;
}

export function parseLoadedSessionText(text) {
  const rawSession = JSON.parse(text);
  return buildLoadedSessionAppState(rawSession);
}

export function buildHistoryComparisonOutcome({ baselineEntry, currentResults, targetResults, targetTitle }) {
  if (baselineEntry) {
    return {
      diffSummary: compareAudits(targetResults, baselineEntry.results),
      contextWarning: `Comparing History: "${baselineEntry.title}" (Baseline) vs History: "${targetTitle}"`,
      mode: 'history_to_history'
    };
  }

  if (currentResults) {
    return {
      diffSummary: compareAudits(currentResults, targetResults),
      contextWarning: `Comparing Current Run vs History: "${targetTitle}"`,
      mode: 'current_to_history'
    };
  }

  return null;
}

export async function loadHistoryEntryAppState(electronAPI, id) {
  const session = await electronAPI.readHistorySession(id);
  return buildLoadedSessionAppState(session);
}

export async function clearHistoryWorkbench(electronAPI) {
  await electronAPI.clearHistory();
  return [];
}

export async function deleteHistoryWorkbenchEntry(electronAPI, id) {
  await electronAPI.deleteHistorySession(id);
  return electronAPI.listHistory();
}

export async function updateHistoryWorkbenchEntry(electronAPI, id, updates) {
  await electronAPI.updateHistorySession(id, updates);
  return electronAPI.listHistory();
}

export function buildBaselineHistoryEntry({ id, loadedState, historyList = [] }) {
  if (!loadedState) return null;
  const meta = historyList.find((entry) => entry.id === id);
  return {
    id,
    results: loadedState.results,
    title: meta?.title || 'Selected Baseline'
  };
}

export async function saveResultsToHistoryWorkbench({
  electronAPI,
  results,
  taxonomyDiagnostics,
  files,
  config,
  sourceType = 'imported_session',
  retainLatest = 50
}) {
  const historyPayload = buildHistoryPersistencePayload({
    results,
    taxonomyDiagnostics,
    files,
    config,
    sourceType
  });
  if (!historyPayload) return null;

  await electronAPI.addHistorySession(historyPayload);
  await electronAPI.pruneHistory(retainLatest);
  return electronAPI.listHistory();
}

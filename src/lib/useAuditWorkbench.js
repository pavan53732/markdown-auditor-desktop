import { useState, useEffect, useCallback, useMemo } from 'react';

import { buildSystemPrompt } from './systemPrompt';
import {
  ANALYSIS_AGENT_COUNT,
  ANALYSIS_AGENT_MESH
} from './analysisAgents';
import { runAuditOrchestrator } from './auditOrchestrator';
import {
  CHARS_PER_TOKEN,
  estimateAnalysisTokens
} from './agentMeshRuntime';
import { normalizeFileDisplayNames } from './sessionService';
import {
  exportAuditJson,
  exportAuditMarkdown,
  exportAuditCsv,
  exportAuditSession,
  parseLoadedSessionText,
  buildHistoryComparisonOutcome,
  loadHistoryEntryAppState,
  clearHistoryWorkbench,
  deleteHistoryWorkbenchEntry,
  updateHistoryWorkbenchEntry,
  buildBaselineHistoryEntry,
  saveResultsToHistoryWorkbench
} from './workbenchController';
import {
  createProgressState,
  buildAnalysisStartProgressState,
  buildAnalysisErrorProgressState
} from './executionStateController';
import {
  DEFAULT_RETRIES,
  RECOMMENDED_BATCH_TARGET_TOKENS,
  normalizeTimeoutSeconds,
  normalizeTokenBudget
} from './runtimeConfig';

export function useAuditWorkbench({
  brandName,
  brandTagline,
  brandIconDataUrl,
  totalDetectorCount
}) {
  const [config, setConfig] = useState({ baseURL: '', apiKey: '', model: '' });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [activeLayer, setActiveLayer] = useState('all');
  const [activeSubcategory, setActiveSubcategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [groupingMode, setGroupingMode] = useState('flat');
  const [diffMode, setDiffMode] = useState(false);
  const [diffSummary, setDiffSummary] = useState(null);
  const [taxonomyDiagnostics, setTaxonomyDiagnostics] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyList, setHistoryList] = useState([]);
  const [baselineEntry, setBaselineEntry] = useState(null);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [contextWarning, setContextWarning] = useState(null);
  const [analysisStats, setAnalysisStats] = useState({ reused: 0, reanalyzed: 0, agentPasses: 0 });
  const [progressState, setProgressState] = useState(createProgressState());

  useEffect(() => {
    window.electronAPI.readConfig().then((cfg) => {
      const normalized = {
        ...cfg,
        timeout: normalizeTimeoutSeconds(cfg.timeout),
        retries: Number.isFinite(Number(cfg.retries)) ? Number(cfg.retries) : DEFAULT_RETRIES,
        tokenBudget: normalizeTokenBudget(cfg.tokenBudget)
      };

      setConfig(normalized);

      const needsPersistence =
        normalized.timeout !== cfg.timeout ||
        normalized.retries !== cfg.retries ||
        normalized.tokenBudget !== cfg.tokenBudget;

      if (needsPersistence) {
        window.electronAPI.writeConfig(normalized);
      }
    });

    window.electronAPI.listHistory().then(setHistoryList);
  }, []);

  const updateProgressState = useCallback((patch) => {
    setProgressState((prev) => createProgressState({
      ...prev,
      ...patch
    }));
  }, []);

  const handleClearCache = useCallback(async () => {
    await window.electronAPI.clearCache();
    localStorage.removeItem('audit_cache');
    console.log('[Cache] Analysis cache cleared');
  }, []);

  const canAnalyze = Boolean(config.baseURL && config.model);

  const agentPromptEntries = useMemo(() => {
    return ANALYSIS_AGENT_MESH.map((agent) => {
      const systemPrompt = buildSystemPrompt(agent.id);
      return {
        ...agent,
        systemPrompt,
        systemTokens: Math.ceil(systemPrompt.length / CHARS_PER_TOKEN)
      };
    });
  }, []);

  const maxSystemTokens = useMemo(() => {
    return Math.max(...agentPromptEntries.map((agent) => agent.systemTokens));
  }, [agentPromptEntries]);

  const estimateTokens = useCallback((fileList) => {
    return estimateAnalysisTokens(fileList, maxSystemTokens, ANALYSIS_AGENT_COUNT);
  }, [maxSystemTokens]);

  useEffect(() => {
    if (files.length > 0) {
      const { perPassTotal, total } = estimateTokens(files);
      if (perPassTotal > RECOMMENDED_BATCH_TARGET_TOKENS) {
        setContextWarning(`Warning: Estimated ${perPassTotal.toLocaleString()} tokens per agent pass exceeds the recommended batch target (${RECOMMENDED_BATCH_TARGET_TOKENS.toLocaleString()}). Files will be chunked and batched automatically, and the full ${ANALYSIS_AGENT_COUNT}-agent mesh is estimated at ${total.toLocaleString()} tokens.`);
      } else {
        setContextWarning(null);
      }
    } else {
      setContextWarning(null);
    }
  }, [files, estimateTokens]);

  const handleFilesDropped = useCallback((newFiles) => {
    setFiles((prev) => normalizeFileDisplayNames([...prev, ...newFiles]));
  }, []);

  const handleRemoveFile = useCallback((index) => {
    setFiles((prev) => normalizeFileDisplayNames(prev.filter((_, i) => i !== index)));
  }, []);

  const applyLoadedState = useCallback((loadedState, { closeHistory = false } = {}) => {
    if (!loadedState) return false;
    setFiles(loadedState.files);
    setResults(loadedState.results);
    setTaxonomyDiagnostics(loadedState.taxonomyDiagnostics);
    setAnalysisStats(loadedState.analysisStats);
    setProgressState(createProgressState());
    setError(null);
    setDiffSummary(null);
    setDiffMode(false);
    if (closeHistory) {
      setHistoryOpen(false);
    }
    return true;
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (files.length === 0 || !canAnalyze) return;

    const capturedPrevious = results;

    setAnalyzing(true);
    setError(null);
    setResults(null);
    setTaxonomyDiagnostics(null);
    setActiveLayer('all');
    setActiveSubcategory('all');
    setSearchQuery('');
    setDiffMode(false);
    setDiffSummary(null);
    setContextWarning(null);
    setAnalysisStats({ reused: 0, reanalyzed: 0, agentPasses: 0 });
    setProgressState(buildAnalysisStartProgressState(files.length));

    try {
      const {
        merged,
        diagnostics,
        analysisStats: nextAnalysisStats,
        diffSummary: nextDiffSummary
      } = await runAuditOrchestrator({
        files,
        config,
        capturedPrevious,
        agentPromptEntries,
        maxSystemTokens,
        estimateTokens,
        updateProgressState,
        callAPI: window.electronAPI.callAPI
      });

      setResults(merged);
      setTaxonomyDiagnostics(diagnostics);
      setAnalysisStats(nextAnalysisStats);
      setDiffSummary(nextDiffSummary);

      const updatedHistory = await saveResultsToHistoryWorkbench({
        electronAPI: window.electronAPI,
        results: merged,
        taxonomyDiagnostics: diagnostics,
        files,
        config,
        sourceType: 'fresh_analysis'
      });
      if (updatedHistory) {
        setHistoryList(updatedHistory);
      }
    } catch (err) {
      const diagnostics = err?.diagnostics || null;
      if (
        diagnostics
        && (
          diagnostics.agent_failure_events?.length > 0
          || diagnostics.warnings?.length > 0
          || diagnostics.analysis_mesh_passes_completed > 0
        )
      ) {
        setTaxonomyDiagnostics(diagnostics);
      }
      const diagnosticSuffix = diagnostics?.last_agent_failure
        ? ' See Analysis Diagnostics below for the captured malformed agent response preview.'
        : '';
      setError(`Analysis error: ${err.message}${diagnosticSuffix}`);
      setProgressState(
        err?.progressState
          || buildAnalysisErrorProgressState({
            totalFiles: files.length,
            diagnostics,
            message: 'Analysis stopped due to an error'
          })
      );
    } finally {
      setAnalyzing(false);
    }
  }, [
    agentPromptEntries,
    canAnalyze,
    config,
    estimateTokens,
    files,
    maxSystemTokens,
    results,
    updateProgressState
  ]);

  const handleReset = useCallback(() => {
    setFiles([]);
    setResults(null);
    setError(null);
    setTaxonomyDiagnostics(null);
    setActiveLayer('all');
    setActiveSubcategory('all');
    setSearchQuery('');
    setDiffMode(false);
    setDiffSummary(null);
    setContextWarning(null);
    setAnalysisStats({ reused: 0, reanalyzed: 0, agentPasses: 0 });
    setProgressState(createProgressState());
  }, []);

  const handleSaveSettings = useCallback(async (newConfig) => {
    const normalizedConfig = {
      ...newConfig,
      timeout: normalizeTimeoutSeconds(newConfig.timeout),
      tokenBudget: normalizeTokenBudget(newConfig.tokenBudget)
    };
    await window.electronAPI.writeConfig(normalizedConfig);
    setConfig(normalizedConfig);
    setSettingsOpen(false);
  }, []);

  const filteredIssues = useMemo(() => {
    if (!results?.issues) return [];

    let issuesToFilter = results.issues;
    if (diffMode && diffSummary) {
      issuesToFilter = [...diffSummary.new, ...diffSummary.changed, ...diffSummary.resolved];
    }

    let filtered = issuesToFilter;

    if (activeLayer !== 'all') {
      filtered = filtered.filter((issue) => issue.category === activeLayer);
    }

    if (activeSubcategory !== 'all') {
      filtered = filtered.filter((issue) => issue.subcategory === activeSubcategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((issue) => (
        (issue.description || '').toLowerCase().includes(query)
        || (issue.evidence || '').toLowerCase().includes(query)
        || (issue.section || '').toLowerCase().includes(query)
        || (issue.document_anchor || '').toLowerCase().includes(query)
        || (issue.detector_id || '').toLowerCase().includes(query)
        || (issue.detector_name || '').toLowerCase().includes(query)
        || (issue.subcategory || '').toLowerCase().includes(query)
        || (issue.failure_type || '').toLowerCase().includes(query)
        || (issue.detection_source || '').toLowerCase().includes(query)
        || (issue.proof_status || '').toLowerCase().includes(query)
        || (issue.trust_tier || '').toLowerCase().includes(query)
        || (issue.evidence_grade || '').toLowerCase().includes(query)
        || (Array.isArray(issue.trust_basis) ? issue.trust_basis.join(' ').toLowerCase() : '').includes(query)
        || (Array.isArray(issue.trust_reasons) ? issue.trust_reasons.join(' ').toLowerCase() : '').includes(query)
        || (issue.contract_step || '').toLowerCase().includes(query)
        || (issue.invariant_broken || '').toLowerCase().includes(query)
        || (issue.authority_boundary || '').toLowerCase().includes(query)
        || (issue.constraint_reference || '').toLowerCase().includes(query)
        || (issue.violation_reference || '').toLowerCase().includes(query)
        || (issue.analysis_agent || '').toLowerCase().includes(query)
        || (issue.analysis_agents || []).some((agent) => agent.toLowerCase().includes(query))
        || (issue.evidence_spans || []).some((span) =>
          [span.file, span.section, span.anchor, span.excerpt, span.role, span.source]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(query))
        )
        || (issue.proof_chains || []).some((chain) =>
          [
            chain.id,
            chain.relation,
            chain.evidence_type,
            chain.rationale,
            ...(chain.related_keys || []),
            chain.source_span?.file,
            chain.source_span?.section,
            chain.source_span?.anchor,
            chain.target_span?.file,
            chain.target_span?.section,
            chain.target_span?.anchor
          ]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(query))
        )
        || (issue.cross_file_links || []).some((link) =>
          [link.type, link.label, link.file, link.section, link.target]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(query))
        )
        || (issue.files || []).some((file) => file.toLowerCase().includes(query))
        || (issue.tags || []).some((tag) => tag.toLowerCase().includes(query))
      ));
    }

    return filtered;
  }, [results?.issues, diffMode, diffSummary, searchQuery, activeLayer, activeSubcategory]);

  const exportJSON = useCallback(() => {
    exportAuditJson({ results, taxonomyDiagnostics });
    setExportMenuOpen(false);
  }, [results, taxonomyDiagnostics]);

  const exportMarkdown = useCallback(() => {
    exportAuditMarkdown({
      results,
      taxonomyDiagnostics,
      brandName,
      brandTagline,
      brandIconDataUrl,
      generatedAt: new Date().toLocaleString(),
      analysisAgentCount: ANALYSIS_AGENT_COUNT,
      totalDetectorCount: totalDetectorCount
    });
    setExportMenuOpen(false);
  }, [brandIconDataUrl, brandName, brandTagline, results, taxonomyDiagnostics, totalDetectorCount]);

  const exportCSV = useCallback(() => {
    exportAuditCsv({ results });
    setExportMenuOpen(false);
  }, [results]);

  const saveSession = useCallback(() => {
    exportAuditSession({ results, taxonomyDiagnostics, files, config });
  }, [results, taxonomyDiagnostics, files, config]);

  const loadSession = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event) => {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        try {
          const loadedState = parseLoadedSessionText(loadEvent.target.result);
          applyLoadedState(loadedState);
        } catch {
          setError('Failed to load session: Invalid JSON');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [applyLoadedState]);

  const handleClearHistory = useCallback(async () => {
    const updated = await clearHistoryWorkbench(window.electronAPI);
    setHistoryList(updated);
  }, []);

  const handleDeleteHistory = useCallback(async (id) => {
    const updated = await deleteHistoryWorkbenchEntry(window.electronAPI, id);
    setHistoryList(updated);
  }, []);

  const handleUpdateHistoryEntry = useCallback(async (id, updates) => {
    const updated = await updateHistoryWorkbenchEntry(window.electronAPI, id, updates);
    setHistoryList(updated);
    if (baselineEntry?.id === id) {
      setBaselineEntry((prev) => ({ ...prev, ...updates }));
    }
  }, [baselineEntry?.id]);

  const handleSelectBaseline = useCallback(async (id) => {
    if (!id) {
      setBaselineEntry(null);
      return;
    }
    const loadedState = await loadHistoryEntryAppState(window.electronAPI, id);
    if (loadedState) {
      setBaselineEntry(buildBaselineHistoryEntry({ id, loadedState, historyList }));
    }
  }, [historyList]);

  const handleCompareHistoryEntry = useCallback(async (id) => {
    const loadedState = await loadHistoryEntryAppState(window.electronAPI, id);
    if (!loadedState) return;
    const targetMeta = historyList.find((entry) => entry.id === id);
    const targetTitle = targetMeta?.title || 'Selected Audit';

    const comparisonOutcome = buildHistoryComparisonOutcome({
      baselineEntry,
      currentResults: results,
      targetResults: loadedState.results,
      targetTitle
    });
    if (!comparisonOutcome) {
      alert('Please run an audit first or set a baseline from history to compare against.');
      return;
    }

    setDiffSummary(comparisonOutcome.diffSummary);
    setContextWarning(comparisonOutcome.contextWarning);
    setDiffMode(true);
    setHistoryOpen(false);
  }, [baselineEntry, historyList, results]);

  const handleOpenHistoryEntry = useCallback(async (id) => {
    const loadedState = await loadHistoryEntryAppState(window.electronAPI, id);
    applyLoadedState(loadedState, { closeHistory: true });
  }, [applyLoadedState]);

  const saveToHistory = useCallback(async () => {
    const updatedHistory = await saveResultsToHistoryWorkbench({
      electronAPI: window.electronAPI,
      results,
      taxonomyDiagnostics,
      files,
      config,
      sourceType: 'imported_session'
    });
    if (!updatedHistory) return;
    setHistoryList(updatedHistory);
    alert('Session saved to local history.');
  }, [config, files, results, taxonomyDiagnostics]);

  return {
    config,
    settingsOpen,
    setSettingsOpen,
    files,
    analyzing,
    results,
    error,
    setError,
    activeLayer,
    setActiveLayer,
    activeSubcategory,
    setActiveSubcategory,
    searchQuery,
    setSearchQuery,
    groupingMode,
    setGroupingMode,
    diffMode,
    setDiffMode,
    diffSummary,
    setDiffSummary,
    taxonomyDiagnostics,
    historyOpen,
    setHistoryOpen,
    historyList,
    baselineEntry,
    exportMenuOpen,
    setExportMenuOpen,
    contextWarning,
    setContextWarning,
    analysisStats,
    progressState,
    canAnalyze,
    handleClearCache,
    handleFilesDropped,
    handleRemoveFile,
    handleAnalyze,
    handleReset,
    handleSaveSettings,
    filteredIssues,
    exportJSON,
    exportMarkdown,
    exportCSV,
    saveSession,
    loadSession,
    handleClearHistory,
    handleDeleteHistory,
    handleUpdateHistoryEntry,
    handleSelectBaseline,
    handleCompareHistoryEntry,
    handleOpenHistoryEntry,
    saveToHistory
  };
}

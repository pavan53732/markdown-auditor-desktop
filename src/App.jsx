import React, { useState, useEffect, useCallback, useMemo } from 'react';
import TopBar from './components/TopBar';
import SettingsModal from './components/SettingsModal';
import FileDropZone from './components/FileDropZone';
import AnalyzeButton from './components/AnalyzeButton';
import ProgressPanel from './components/ProgressPanel';
import SummaryDashboard from './components/SummaryDashboard';
import LayerFilterBar from './components/LayerFilterBar';
import IssueList from './components/IssueList';
import DiffSummaryPanel from './components/DiffSummaryPanel';
import HistoryModal from './components/HistoryModal';
import brandIconDataUrl from './assets/brand-icon.png?inline';
import { buildSystemPrompt } from './lib/systemPrompt';
import {
  ANALYSIS_AGENT_COUNT,
  ANALYSIS_AGENT_MESH
} from './lib/analysisAgents';
import { runAuditOrchestrator } from './lib/auditOrchestrator';
import {
  CHARS_PER_TOKEN,
  estimateAnalysisTokens
} from './lib/agentMeshRuntime';
import {
  normalizeFileDisplayNames
} from './lib/sessionService';
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
} from './lib/workbenchController';
import {
  createProgressState,
  buildAnalysisStartProgressState,
  buildAnalysisErrorProgressState
} from './lib/executionStateController';
import {
  DEFAULT_RETRIES,
  RECOMMENDED_BATCH_TARGET_TOKENS,
  normalizeTimeoutSeconds
} from './lib/runtimeConfig';
import {
  TOTAL_DETECTOR_COUNT,
  getAvailableSubcategories
} from './lib/detectorMetadata';
const BRAND_NAME = 'Markdown Intelligence Auditor';
const BRAND_TAGLINE = 'Deterministic Markdown specification auditing';
const MAX_DIAGNOSTIC_EVENTS_VISIBLE = 3;

export default function App() {
  const [config, setConfig] = useState({ baseURL: '', apiKey: '', model: '' });
  const [configLoaded, setConfigLoaded] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [activeLayer, setActiveLayer] = useState('all');
  const [activeSubcategory, setActiveSubcategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [groupingMode, setGroupingMode] = useState('flat'); // flat, file, severity, layer, subcategory, root_cause
  const [diffMode, setDiffMode] = useState(false);
  const [previousResults, setPreviousResults] = useState(null);
  const [diffSummary, setDiffSummary] = useState(null);
  const [taxonomyDiagnostics, setTaxonomyDiagnostics] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyList, setHistoryList] = useState([]);
  const [baselineEntry, setBaselineEntry] = useState(null); // { id, results, title }
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
      setConfigLoaded(true);

      const needsPersistence =
        normalized.timeout !== cfg.timeout ||
        normalized.retries !== cfg.retries ||
        normalized.tokenBudget !== cfg.tokenBudget;

      if (needsPersistence) {
        window.electronAPI.writeConfig(normalized);
      }
    });
    // Load history list
    window.electronAPI.listHistory().then(setHistoryList);
  }, []);

  const updateProgressState = useCallback((patch) => {
    setProgressState((prev) => createProgressState({
      ...prev,
      ...patch
    }));
  }, []);

  const handleClearCache = async () => {
    await window.electronAPI.clearCache();
    localStorage.removeItem('audit_cache');
    console.log('[Cache] Analysis cache cleared');
  };

  const canAnalyze = !!(config.baseURL && config.model);

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

  const analyzeBatch = async (batch, batchIndex, totalBatches, diagnostics, detectorExecutionReceipts = []) => {
    return runAnalysisBatch({
      batch,
      batchIndex,
      totalBatches,
      totalAgentPasses: totalBatches * ANALYSIS_AGENT_COUNT,
      diagnostics,
      detectorExecutionReceipts,
      agentPromptEntries,
      config,
      callAPI: window.electronAPI.callAPI,
      updateProgressState
    });
    const userMessage = batch
      .map((f) => `=== FILE: ${f.name}${f.isChunked ? ` (Chunk ${f.chunkIndex}/${f.chunkCount})` : ''} ===\n\n${f.content}\n\n${'─'.repeat(60)}\n`)
      .join('');

    const agentResults = [];
    const agentRuns = [];
    let rawIssueCount = 0;

    for (const agent of agentPromptEntries) {
      let parsed = null;
      let lastValidationError = null;

      for (let attempt = 1; attempt <= MAX_AGENT_RESPONSE_ATTEMPTS; attempt += 1) {
        updateProgressState({
          stage: 'agent_mesh',
          currentBatch: batchIndex + 1,
          totalBatches,
          filesInCurrentBatch: batch.length,
          currentAgentId: agent.id,
          currentAgentLabel: agent.label,
          currentAgentOwnedLayers: agent.ownedLayers?.length || 0,
          currentAgentOwnedSubcategories: agent.ownedSubcategoryCount || 0,
          currentAgentOwnedDetectors: agent.ownedDetectorCount || 0,
          currentAttempt: attempt,
          maxAttempts: MAX_AGENT_RESPONSE_ATTEMPTS,
          message: `Running ${agent.label} on batch ${batchIndex + 1}/${totalBatches}`
        });

        const response = await window.electronAPI.callAPI({
          baseURL: config.baseURL,
          apiKey: config.apiKey,
          model: config.model,
          systemPrompt: agent.systemPrompt,
          userMessage: attempt === 1
            ? userMessage
            : buildAgentRetryMessage(userMessage, agent, lastValidationError, attempt - 1),
          timeout: config.timeout,
          retries: config.retries
        });

        if (!response.success) {
          if (isTimeoutErrorMessage(response.error)) {
            recordAgentSkip(diagnostics, {
              agent_id: agent.id,
              agent_label: agent.label,
              batch_index: batchIndex + 1,
              batch_count: totalBatches,
              attempt: response.timeoutAttempts || 1,
              reason: 'timeout',
              timeout_seconds: response.requestTimeoutSeconds
            });
            updateProgressState({
              stage: 'agent_mesh',
              completedAgentPasses: diagnostics.analysis_mesh_passes_completed,
              totalAgentPasses: totalBatches * ANALYSIS_AGENT_COUNT,
              currentAgentId: agent.id,
              currentAgentLabel: agent.label,
              currentAgentOwnedLayers: agent.ownedLayers?.length || 0,
              currentAgentOwnedSubcategories: agent.ownedSubcategoryCount || 0,
              currentAgentOwnedDetectors: agent.ownedDetectorCount || 0,
              message: `${agent.label} timed out after ${response.requestTimeoutSeconds || config.timeout || 60}s; continuing in degraded mode`
            });
            parsed = {
              summary: { total: 0, critical: 0, high: 0, medium: 0, low: 0 },
              issues: [],
              root_causes: []
            };
            break;
          }
          throw new Error(`Batch ${batchIndex + 1}/${totalBatches} failed during ${agent.label}: ${response.error}`);
        }

        try {
          parsed = repairJSON(response.raw);
          validateResults(parsed);
          if (attempt > 1) {
            recordAgentRecovery(diagnostics, {
              agent_id: agent.id,
              agent_label: agent.label,
              batch_index: batchIndex + 1,
              batch_count: totalBatches,
              attempt
            });
          }
          break;
        } catch (e) {
          lastValidationError = e;
          recordAgentFailure(diagnostics, {
            batch_index: batchIndex + 1,
            batch_count: totalBatches,
            agent_id: agent.id,
            agent_label: agent.label,
            attempt,
            stage: getAgentFailureStage(e),
            message: e.message,
            raw_response: response.raw
          });

          if (attempt < MAX_AGENT_RESPONSE_ATTEMPTS) {
            diagnostics.malformed_agent_retry_count += 1;
            continue;
          }
          recordAgentSkip(diagnostics, {
            agent_id: agent.id,
            agent_label: agent.label,
            batch_index: batchIndex + 1,
            batch_count: totalBatches,
            attempt
          });
          parsed = {
            summary: { total: 0, critical: 0, high: 0, medium: 0, low: 0 },
            issues: [],
            root_causes: []
          };
          break;
        }
      }

      if (parsed.summary) {
        console.log(`[Batch ${batchIndex + 1}/${totalBatches}] ${agent.id}: detectors=${parsed.summary.detectors_evaluated || 'N/A'}, skipped=${parsed.summary.detectors_skipped || 'N/A'}`);
      }

      const normalizedIssues = (parsed.issues || []).map((issue) => normalizeIssueFromDetector({
        ...issue,
        analysis_agent: issue.analysis_agent || agent.id,
        analysis_agents: Array.isArray(issue.analysis_agents) && issue.analysis_agents.length > 0
          ? Array.from(new Set([...issue.analysis_agents, agent.id]))
          : [agent.id]
      }));
      const agentRun = validateAnalysisAgentResult(agent.id, normalizedIssues, parsed.summary, {
        detectorExecutionReceipts
      });
      agentRuns.push(agentRun);
      diagnostics.analysis_mesh_focus_layer_hit_count += agentRun.focus_layer_hits || 0;
      diagnostics.analysis_mesh_focus_subcategory_hit_count += agentRun.focus_subcategory_hits || 0;
      diagnostics.analysis_mesh_owned_layer_hit_count += agentRun.owned_layer_hits || 0;
      diagnostics.analysis_mesh_owned_subcategory_hit_count += agentRun.owned_subcategory_hits || 0;
      diagnostics.analysis_mesh_owned_detector_hit_count += agentRun.owned_detector_hits || 0;
      diagnostics.analysis_mesh_out_of_focus_issue_count += agentRun.out_of_focus_issue_count || 0;
      diagnostics.analysis_mesh_out_of_owned_scope_issue_count += agentRun.out_of_owned_scope_issue_count || 0;
      diagnostics.analysis_mesh_validation_warning_count += Array.isArray(agentRun.warnings) ? agentRun.warnings.length : 0;
      diagnostics.analysis_mesh_agent_runs = [
        ...(Array.isArray(diagnostics.analysis_mesh_agent_runs) ? diagnostics.analysis_mesh_agent_runs : []),
        agentRun
      ];
      if (Array.isArray(agentRun.warnings) && agentRun.warnings.length > 0) {
        diagnostics.warnings.push(...agentRun.warnings);
      }

      rawIssueCount += normalizedIssues.length;
      diagnostics.analysis_mesh_passes_completed += 1;
      updateProgressState({
        stage: 'agent_mesh',
        completedAgentPasses: diagnostics.analysis_mesh_passes_completed,
        totalAgentPasses: totalBatches * ANALYSIS_AGENT_COUNT,
        ownedDetectorHits: diagnostics.analysis_mesh_owned_detector_hit_count,
        checkedOwnedDetectors: agentRun.receipt_checked_owned_detector_count || 0,
        cleanOwnedDetectors: agentRun.receipt_clean_owned_detector_count || 0,
        untouchedOwnedDetectors: agentRun.untouched_owned_detector_count || 0,
        outOfOwnedScopeIssues: diagnostics.analysis_mesh_out_of_owned_scope_issue_count,
        currentAgentId: agent.id,
        currentAgentLabel: agent.label,
        currentAgentOwnedLayers: agent.ownedLayers?.length || 0,
        currentAgentOwnedSubcategories: agent.ownedSubcategoryCount || 0,
        currentAgentOwnedDetectors: agent.ownedDetectorCount || 0,
        message: `${agent.label} completed batch ${batchIndex + 1}/${totalBatches}`
      });
      agentResults.push({
        ...parsed,
        issues: normalizedIssues,
        _sourceFiles: Array.from(new Set(batch.map((file) => file.sourceName || file.name)))
      });
    }

    const mergedAgentResult = mergeBatchResults(agentResults);
    if (Array.isArray(mergedAgentResult.issues)) {
      mergedAgentResult.issues = mergedAgentResult.issues.map((issue) => enrichIssueWithTrustSignals(issue));
      const trustSummary = summarizeIssueTrustSignals(mergedAgentResult.issues);
      mergedAgentResult.summary.average_trust_score = trustSummary.averageTrustScore;
      mergedAgentResult.summary.high_trust_issue_count = trustSummary.highTrustIssueCount;
      mergedAgentResult.summary.strong_evidence_issue_count = trustSummary.strongEvidenceIssueCount;
      mergedAgentResult.summary.deterministic_proof_issue_count = trustSummary.deterministicProofIssueCount;
      mergedAgentResult.summary.receipt_backed_issue_count = trustSummary.receiptBackedIssueCount;
      mergedAgentResult.summary.hybrid_supported_issue_count = trustSummary.hybridSupportedIssueCount;
      mergedAgentResult.summary.rule_backed_issue_count = trustSummary.ruleBackedIssueCount;
      mergedAgentResult.summary.hybrid_backed_issue_count = trustSummary.hybridBackedIssueCount;
      mergedAgentResult.summary.model_only_issue_count = trustSummary.modelOnlyIssueCount;
    }
    const batchCoverage = buildRuntimeDetectorCoverage({
      issues: mergedAgentResult.issues,
      deterministicReceipts: detectorExecutionReceipts
    });
    applyRuntimeDetectorCoverageSummary(mergedAgentResult.summary, batchCoverage);
    mergedAgentResult.summary.analysis_agents_run = ANALYSIS_AGENT_COUNT;
    mergedAgentResult.summary.analysis_agent_passes = agentResults.length;

    return {
      ...mergedAgentResult,
      _sourceFiles: Array.from(new Set(batch.map((file) => file.sourceName || file.name))),
      _rawIssueCount: rawIssueCount,
      _agentPasses: agentResults.length,
      _analysisMeshRuns: agentRuns
    };
  };

  const handleAnalyze = async () => {
    if (files.length === 0 || !canAnalyze) return;

    const capturedPrevious = results;
    if (results) {
      setPreviousResults(results);
    }

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
  };

  const handleReset = () => {
    setFiles([]);
    setResults(null);
    setError(null);
    setTaxonomyDiagnostics(null);
    setActiveLayer('all');
    setActiveSubcategory('all');
    setSearchQuery('');
    setDiffMode(false);
    setDiffSummary(null);
    setPreviousResults(null);
    setContextWarning(null);
    setAnalysisStats({ reused: 0, reanalyzed: 0, agentPasses: 0 });
    setProgressState(createProgressState());
  };

  const handleSaveSettings = async (newConfig) => {
    const normalizedConfig = {
      ...newConfig,
      timeout: normalizeTimeoutSeconds(newConfig.timeout),
      tokenBudget: normalizeTokenBudget(newConfig.tokenBudget)
    };
    await window.electronAPI.writeConfig(normalizedConfig);
    setConfig(normalizedConfig);
    setSettingsOpen(false);
  };

  const filteredIssues = useMemo(() => {
    if (!results?.issues) return [];

    let issuesToFilter = results.issues;
    if (diffMode && diffSummary) {
      issuesToFilter = [...diffSummary.new, ...diffSummary.changed, ...diffSummary.resolved];
    }

    let filtered = issuesToFilter;

    // Layer Filter
    if (activeLayer !== 'all') {
      filtered = filtered.filter(i => i.category === activeLayer);
    }

    // Subcategory Filter
    if (activeSubcategory !== 'all') {
      filtered = filtered.filter(i => i.subcategory === activeSubcategory);
    }

    // Search Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((issue) => {
        return (
          (issue.description || '').toLowerCase().includes(query) ||
          (issue.evidence || '').toLowerCase().includes(query) ||
          (issue.section || '').toLowerCase().includes(query) ||
          (issue.document_anchor || '').toLowerCase().includes(query) ||
          (issue.detector_id || '').toLowerCase().includes(query) ||
          (issue.detector_name || '').toLowerCase().includes(query) ||
          (issue.subcategory || '').toLowerCase().includes(query) ||
          (issue.failure_type || '').toLowerCase().includes(query) ||
          (issue.detection_source || '').toLowerCase().includes(query) ||
          (issue.proof_status || '').toLowerCase().includes(query) ||
          (issue.trust_tier || '').toLowerCase().includes(query) ||
          (issue.evidence_grade || '').toLowerCase().includes(query) ||
          (Array.isArray(issue.trust_basis) ? issue.trust_basis.join(' ').toLowerCase() : '').includes(query) ||
          (Array.isArray(issue.trust_reasons) ? issue.trust_reasons.join(' ').toLowerCase() : '').includes(query) ||
          (issue.contract_step || '').toLowerCase().includes(query) ||
          (issue.invariant_broken || '').toLowerCase().includes(query) ||
          (issue.authority_boundary || '').toLowerCase().includes(query) ||
          (issue.constraint_reference || '').toLowerCase().includes(query) ||
          (issue.violation_reference || '').toLowerCase().includes(query) ||
          (issue.analysis_agent || '').toLowerCase().includes(query) ||
          (issue.analysis_agents || []).some((agent) => agent.toLowerCase().includes(query)) ||
          (issue.evidence_spans || []).some((span) =>
            [span.file, span.section, span.anchor, span.excerpt, span.role, span.source]
              .filter(Boolean)
              .some((value) => value.toLowerCase().includes(query))
          ) ||
          (issue.proof_chains || []).some((chain) =>
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
          ) ||
          (issue.cross_file_links || []).some((link) =>
            [link.type, link.label, link.file, link.section, link.target]
              .filter(Boolean)
              .some((value) => value.toLowerCase().includes(query))
          ) ||
          (issue.files || []).some(f => f.toLowerCase().includes(query)) ||
          (issue.tags || []).some(t => t.toLowerCase().includes(query))
        );
      });
    }

    return filtered;
  }, [results?.issues, diffMode, diffSummary, searchQuery, activeLayer, activeSubcategory]);

  const renderDiagnosticsPanel = (mode = 'results') => {
    if (!taxonomyDiagnostics) return null;

    const failureEvents = Array.isArray(taxonomyDiagnostics.agent_failure_events)
      ? taxonomyDiagnostics.agent_failure_events.slice(-MAX_DIAGNOSTIC_EVENTS_VISIBLE).reverse()
      : [];
    const hasFailures = failureEvents.length > 0;
    const isErrorMode = mode === 'error';

    return (
      <div className={`${isErrorMode ? 'mt-4 bg-[#1F1111] border-[#7F1D1D]' : 'mb-6 bg-[#111827] border-[#374151]'} p-3 border rounded-xl`}>
        <div className="flex items-center gap-2 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isErrorMode ? '#FCA5A5' : '#6B7280'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <h3 className={`text-[10px] font-bold uppercase tracking-widest ${isErrorMode ? 'text-[#FCA5A5]' : 'text-[#6B7280]'}`}>
            {isErrorMode ? 'Analysis Diagnostics' : 'Taxonomy Diagnostics'}
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          <div>
            <p className="text-[10px] text-[#6B7280] mb-0.5">Enriched</p>
            <p className="text-sm font-semibold text-[#F9FAFB]">{taxonomyDiagnostics.normalized_from_detector_count}</p>
          </div>
          <div>
            <p className="text-[10px] text-[#6B7280] mb-0.5">Parsed IDs</p>
            <p className="text-sm font-semibold text-[#F9FAFB]">{taxonomyDiagnostics.detector_id_parsed_from_description_count}</p>
          </div>
          {taxonomyDiagnostics.unknown_detector_id_count > 0 && (
            <div>
              <p className="text-[10px] text-[#F87171] mb-0.5">Unknown IDs</p>
              <p className="text-sm font-semibold text-[#F87171]">{taxonomyDiagnostics.unknown_detector_id_count}</p>
            </div>
          )}
          {taxonomyDiagnostics.severity_clamped_count > 0 && (
            <div>
              <p className="text-[10px] text-[#60A5FA] mb-0.5">Clamped</p>
              <p className="text-sm font-semibold text-[#60A5FA]">{taxonomyDiagnostics.severity_clamped_count}</p>
            </div>
          )}
          {taxonomyDiagnostics.total_issues_loaded > 0 && (
            <div>
              <p className="text-[10px] text-[#9CA3AF] mb-0.5">Loaded</p>
              <p className="text-sm font-semibold text-[#9CA3AF]">{taxonomyDiagnostics.total_issues_loaded}</p>
            </div>
          )}
          {taxonomyDiagnostics.indexed_document_count > 0 && (
            <div>
              <p className="text-[10px] text-[#9CA3AF] mb-0.5">Indexed Files</p>
              <p className="text-sm font-semibold text-[#F9FAFB]">{taxonomyDiagnostics.indexed_document_count}</p>
            </div>
          )}
          {taxonomyDiagnostics.indexed_heading_count > 0 && (
            <div>
              <p className="text-[10px] text-[#9CA3AF] mb-0.5">Indexed Headings</p>
              <p className="text-sm font-semibold text-[#F9FAFB]">{taxonomyDiagnostics.indexed_heading_count}</p>
            </div>
          )}
          {taxonomyDiagnostics.project_graph_heading_group_count > 0 && (
            <div>
              <p className="text-[10px] text-[#9CA3AF] mb-0.5">Graph Headings</p>
              <p className="text-sm font-semibold text-[#F9FAFB]">{taxonomyDiagnostics.project_graph_heading_group_count}</p>
            </div>
          )}
          {taxonomyDiagnostics.project_graph_glossary_term_group_count > 0 && (
            <div>
              <p className="text-[10px] text-[#9CA3AF] mb-0.5">Graph Terms</p>
              <p className="text-sm font-semibold text-[#F9FAFB]">{taxonomyDiagnostics.project_graph_glossary_term_group_count}</p>
            </div>
          )}
          {taxonomyDiagnostics.project_graph_identifier_group_count > 0 && (
            <div>
              <p className="text-[10px] text-[#9CA3AF] mb-0.5">Graph IDs</p>
              <p className="text-sm font-semibold text-[#F9FAFB]">{taxonomyDiagnostics.project_graph_identifier_group_count}</p>
            </div>
          )}
          {taxonomyDiagnostics.project_graph_workflow_group_count > 0 && (
            <div>
              <p className="text-[10px] text-[#9CA3AF] mb-0.5">Graph Workflows</p>
              <p className="text-sm font-semibold text-[#F9FAFB]">{taxonomyDiagnostics.project_graph_workflow_group_count}</p>
            </div>
          )}
          {taxonomyDiagnostics.project_graph_requirement_group_count > 0 && (
            <div>
              <p className="text-[10px] text-[#9CA3AF] mb-0.5">Graph Requirements</p>
              <p className="text-sm font-semibold text-[#F9FAFB]">{taxonomyDiagnostics.project_graph_requirement_group_count}</p>
            </div>
          )}
          {taxonomyDiagnostics.project_graph_state_group_count > 0 && (
            <div>
              <p className="text-[10px] text-[#9CA3AF] mb-0.5">Graph States</p>
              <p className="text-sm font-semibold text-[#F9FAFB]">{taxonomyDiagnostics.project_graph_state_group_count}</p>
            </div>
          )}
          {taxonomyDiagnostics.project_graph_api_group_count > 0 && (
            <div>
              <p className="text-[10px] text-[#9CA3AF] mb-0.5">Graph APIs</p>
              <p className="text-sm font-semibold text-[#F9FAFB]">{taxonomyDiagnostics.project_graph_api_group_count}</p>
            </div>
          )}
          {taxonomyDiagnostics.project_graph_actor_group_count > 0 && (
            <div>
              <p className="text-[10px] text-[#9CA3AF] mb-0.5">Graph Actors</p>
              <p className="text-sm font-semibold text-[#F9FAFB]">{taxonomyDiagnostics.project_graph_actor_group_count}</p>
            </div>
          )}
          {taxonomyDiagnostics.project_graph_reference_count > 0 && (
            <div>
              <p className="text-[10px] text-[#9CA3AF] mb-0.5">Graph Refs</p>
              <p className="text-sm font-semibold text-[#F9FAFB]">{taxonomyDiagnostics.project_graph_reference_count}</p>
            </div>
          )}
          {taxonomyDiagnostics.project_graph_reference_group_count > 0 && (
            <div>
              <p className="text-[10px] text-[#9CA3AF] mb-0.5">Ref Groups</p>
              <p className="text-sm font-semibold text-[#F9FAFB]">{taxonomyDiagnostics.project_graph_reference_group_count}</p>
            </div>
          )}
          {taxonomyDiagnostics.project_graph_total_group_count > 0 && (
            <div>
              <p className="text-[10px] text-[#9CA3AF] mb-0.5">Graph Total</p>
              <p className="text-sm font-semibold text-[#F9FAFB]">{taxonomyDiagnostics.project_graph_total_group_count}</p>
            </div>
          )}
          {taxonomyDiagnostics.deterministic_anchor_enrichment_count > 0 && (
            <div>
              <p className="text-[10px] text-[#93C5FD] mb-0.5">Anchored</p>
              <p className="text-sm font-semibold text-[#93C5FD]">{taxonomyDiagnostics.deterministic_anchor_enrichment_count}</p>
            </div>
          )}
          {taxonomyDiagnostics.deterministic_line_assignment_count > 0 && (
            <div>
              <p className="text-[10px] text-[#86EFAC] mb-0.5">Line Anchors</p>
              <p className="text-sm font-semibold text-[#86EFAC]">{taxonomyDiagnostics.deterministic_line_assignment_count}</p>
            </div>
          )}
          {taxonomyDiagnostics.deterministic_multi_anchor_count > 0 && (
            <div>
              <p className="text-[10px] text-[#C4B5FD] mb-0.5">Multi-Anchor</p>
              <p className="text-sm font-semibold text-[#C4B5FD]">{taxonomyDiagnostics.deterministic_multi_anchor_count}</p>
            </div>
          )}
          {taxonomyDiagnostics.deterministic_fallback_anchor_count > 0 && (
            <div>
              <p className="text-[10px] text-[#FCD34D] mb-0.5">Fallback Anchors</p>
              <p className="text-sm font-semibold text-[#FCD34D]">{taxonomyDiagnostics.deterministic_fallback_anchor_count}</p>
            </div>
          )}
          {taxonomyDiagnostics.deterministic_graph_link_enrichment_count > 0 && (
            <div>
              <p className="text-[10px] text-[#F9A8D4] mb-0.5">Graph Links</p>
              <p className="text-sm font-semibold text-[#F9A8D4]">{taxonomyDiagnostics.deterministic_graph_link_enrichment_count}</p>
            </div>
          )}
          {taxonomyDiagnostics.evidence_span_enrichment_count > 0 && (
            <div>
              <p className="text-[10px] text-[#A5F3FC] mb-0.5">Evidence Spans</p>
              <p className="text-sm font-semibold text-[#A5F3FC]">{taxonomyDiagnostics.evidence_span_enrichment_count}</p>
            </div>
          )}
          {taxonomyDiagnostics.deterministic_proof_chain_enrichment_count > 0 && (
            <div>
              <p className="text-[10px] text-[#67E8F9] mb-0.5">Proof Chains</p>
              <p className="text-sm font-semibold text-[#67E8F9]">{taxonomyDiagnostics.deterministic_proof_chain_enrichment_count}</p>
            </div>
          )}
          {taxonomyDiagnostics.proof_chain_edge_count > 0 && (
            <div>
              <p className="text-[10px] text-[#22D3EE] mb-0.5">Proof Edges</p>
              <p className="text-sm font-semibold text-[#22D3EE]">{taxonomyDiagnostics.proof_chain_edge_count}</p>
            </div>
          )}
          {taxonomyDiagnostics.deterministic_rule_issue_count > 0 && (
            <div>
              <p className="text-[10px] text-[#FDE68A] mb-0.5">Rule Issues</p>
              <p className="text-sm font-semibold text-[#FDE68A]">{taxonomyDiagnostics.deterministic_rule_issue_count}</p>
            </div>
          )}
          {taxonomyDiagnostics.deterministic_rule_checked_detector_count > 0 && (
            <div>
              <p className="text-[10px] text-[#67E8F9] mb-0.5">Rule Checked</p>
              <p className="text-sm font-semibold text-[#67E8F9]">{taxonomyDiagnostics.deterministic_rule_checked_detector_count}</p>
            </div>
          )}
          {taxonomyDiagnostics.deterministic_rule_clean_detector_count > 0 && (
            <div>
              <p className="text-[10px] text-[#86EFAC] mb-0.5">Rule Clean</p>
              <p className="text-sm font-semibold text-[#86EFAC]">{taxonomyDiagnostics.deterministic_rule_clean_detector_count}</p>
            </div>
          )}
          {taxonomyDiagnostics.deterministic_rule_hit_detector_count > 0 && (
            <div>
              <p className="text-[10px] text-[#FDE68A] mb-0.5">Rule Hit</p>
              <p className="text-sm font-semibold text-[#FDE68A]">{taxonomyDiagnostics.deterministic_rule_hit_detector_count}</p>
            </div>
          )}
          {taxonomyDiagnostics.runtime_detector_touched_count > 0 && (
            <div>
              <p className="text-[10px] text-[#67E8F9] mb-0.5">Touched</p>
              <p className="text-sm font-semibold text-[#67E8F9]">
                {taxonomyDiagnostics.runtime_detector_touched_count}/{taxonomyDiagnostics.runtime_detector_defined_count || TOTAL_DETECTOR_COUNT}
              </p>
            </div>
          )}
          {taxonomyDiagnostics.runtime_detector_locally_checked_count > 0 && (
            <div>
              <p className="text-[10px] text-[#86EFAC] mb-0.5">Local Checked</p>
              <p className="text-sm font-semibold text-[#86EFAC]">{taxonomyDiagnostics.runtime_detector_locally_checked_count}</p>
            </div>
          )}
          {taxonomyDiagnostics.runtime_detector_model_finding_backed_count > 0 && (
            <div>
              <p className="text-[10px] text-[#FCD34D] mb-0.5">Model-Backed</p>
              <p className="text-sm font-semibold text-[#FCD34D]">{taxonomyDiagnostics.runtime_detector_model_finding_backed_count}</p>
            </div>
          )}
          {taxonomyDiagnostics.deterministic_section_assignment_count > 0 && (
            <div>
              <p className="text-[10px] text-[#86EFAC] mb-0.5">Section Anchors</p>
              <p className="text-sm font-semibold text-[#86EFAC]">{taxonomyDiagnostics.deterministic_section_assignment_count}</p>
            </div>
          )}
          {taxonomyDiagnostics.deterministic_file_assignment_count > 0 && (
            <div>
              <p className="text-[10px] text-[#86EFAC] mb-0.5">File Anchors</p>
              <p className="text-sm font-semibold text-[#86EFAC]">{taxonomyDiagnostics.deterministic_file_assignment_count}</p>
            </div>
          )}
          {taxonomyDiagnostics.analysis_mesh_agents_configured > 0 && (
            <div>
              <p className="text-[10px] text-[#9CA3AF] mb-0.5">Agents</p>
              <p className="text-sm font-semibold text-[#F9FAFB]">{taxonomyDiagnostics.analysis_mesh_agents_configured}</p>
            </div>
          )}
          {taxonomyDiagnostics.analysis_mesh_passes_completed > 0 && (
            <div>
              <p className="text-[10px] text-[#9CA3AF] mb-0.5">Agent Passes</p>
              <p className="text-sm font-semibold text-[#F9FAFB]">{taxonomyDiagnostics.analysis_mesh_passes_completed}</p>
            </div>
          )}
          {taxonomyDiagnostics.analysis_mesh_focus_layer_hit_count > 0 && (
            <div>
              <p className="text-[10px] text-[#86EFAC] mb-0.5">Focus Hits</p>
              <p className="text-sm font-semibold text-[#86EFAC]">{taxonomyDiagnostics.analysis_mesh_focus_layer_hit_count}</p>
            </div>
          )}
          {taxonomyDiagnostics.analysis_mesh_focus_subcategory_hit_count > 0 && (
            <div>
              <p className="text-[10px] text-[#A5F3FC] mb-0.5">Focus Subcats</p>
              <p className="text-sm font-semibold text-[#A5F3FC]">{taxonomyDiagnostics.analysis_mesh_focus_subcategory_hit_count}</p>
            </div>
          )}
          {taxonomyDiagnostics.analysis_mesh_owned_layer_hit_count > 0 && (
            <div>
              <p className="text-[10px] text-[#86EFAC] mb-0.5">Owned Layers</p>
              <p className="text-sm font-semibold text-[#86EFAC]">{taxonomyDiagnostics.analysis_mesh_owned_layer_hit_count}</p>
            </div>
          )}
          {taxonomyDiagnostics.analysis_mesh_owned_subcategory_hit_count > 0 && (
            <div>
              <p className="text-[10px] text-[#67E8F9] mb-0.5">Owned Subcats</p>
              <p className="text-sm font-semibold text-[#67E8F9]">{taxonomyDiagnostics.analysis_mesh_owned_subcategory_hit_count}</p>
            </div>
          )}
          {taxonomyDiagnostics.analysis_mesh_owned_detector_hit_count > 0 && (
            <div>
              <p className="text-[10px] text-[#22D3EE] mb-0.5">Owned Detectors</p>
              <p className="text-sm font-semibold text-[#22D3EE]">{taxonomyDiagnostics.analysis_mesh_owned_detector_hit_count}</p>
            </div>
          )}
          {taxonomyDiagnostics.analysis_mesh_owned_detector_checked_count > 0 && (
            <div>
              <p className="text-[10px] text-[#67E8F9] mb-0.5">Checked Owned</p>
              <p className="text-sm font-semibold text-[#67E8F9]">{taxonomyDiagnostics.analysis_mesh_owned_detector_checked_count}</p>
            </div>
          )}
          {taxonomyDiagnostics.analysis_mesh_owned_detector_clean_count > 0 && (
            <div>
              <p className="text-[10px] text-[#86EFAC] mb-0.5">Clean Owned</p>
              <p className="text-sm font-semibold text-[#86EFAC]">{taxonomyDiagnostics.analysis_mesh_owned_detector_clean_count}</p>
            </div>
          )}
          {taxonomyDiagnostics.analysis_mesh_out_of_focus_issue_count > 0 && (
            <div>
              <p className="text-[10px] text-[#FDBA74] mb-0.5">Out Of Focus</p>
              <p className="text-sm font-semibold text-[#FDBA74]">{taxonomyDiagnostics.analysis_mesh_out_of_focus_issue_count}</p>
            </div>
          )}
          {taxonomyDiagnostics.analysis_mesh_out_of_owned_scope_issue_count > 0 && (
            <div>
              <p className="text-[10px] text-[#F59E0B] mb-0.5">Cross-Scope</p>
              <p className="text-sm font-semibold text-[#F59E0B]">{taxonomyDiagnostics.analysis_mesh_out_of_owned_scope_issue_count}</p>
            </div>
          )}
          {taxonomyDiagnostics.analysis_mesh_owned_detector_quiet_count > 0 && (
            <div>
              <p className="text-[10px] text-[#C4B5FD] mb-0.5">Quiet Owned</p>
              <p className="text-sm font-semibold text-[#C4B5FD]">{taxonomyDiagnostics.analysis_mesh_owned_detector_quiet_count}</p>
            </div>
          )}
          {taxonomyDiagnostics.analysis_mesh_owned_detector_untouched_count > 0 && (
            <div>
              <p className="text-[10px] text-[#E879F9] mb-0.5">Untouched Owned</p>
              <p className="text-sm font-semibold text-[#E879F9]">{taxonomyDiagnostics.analysis_mesh_owned_detector_untouched_count}</p>
            </div>
          )}
          {taxonomyDiagnostics.analysis_mesh_validation_warning_count > 0 && (
            <div>
              <p className="text-[10px] text-[#FCA5A5] mb-0.5">Mesh Warnings</p>
              <p className="text-sm font-semibold text-[#FCA5A5]">{taxonomyDiagnostics.analysis_mesh_validation_warning_count}</p>
            </div>
          )}
          {taxonomyDiagnostics.agent_findings_merged_count > 0 && (
            <div>
              <p className="text-[10px] text-[#9CA3AF] mb-0.5">Merged</p>
              <p className="text-sm font-semibold text-[#F9FAFB]">{taxonomyDiagnostics.agent_findings_merged_count}</p>
            </div>
          )}
          {taxonomyDiagnostics.malformed_agent_response_count > 0 && (
            <div>
              <p className="text-[10px] text-[#FCA5A5] mb-0.5">Malformed</p>
              <p className="text-sm font-semibold text-[#FCA5A5]">{taxonomyDiagnostics.malformed_agent_response_count}</p>
            </div>
          )}
          {taxonomyDiagnostics.malformed_agent_retry_count > 0 && (
            <div>
              <p className="text-[10px] text-[#FCD34D] mb-0.5">Retries</p>
              <p className="text-sm font-semibold text-[#FCD34D]">{taxonomyDiagnostics.malformed_agent_retry_count}</p>
            </div>
          )}
          {taxonomyDiagnostics.recovered_agent_response_count > 0 && (
            <div>
              <p className="text-[10px] text-[#86EFAC] mb-0.5">Recovered</p>
              <p className="text-sm font-semibold text-[#86EFAC]">{taxonomyDiagnostics.recovered_agent_response_count}</p>
            </div>
          )}
          {taxonomyDiagnostics.skipped_agent_pass_count > 0 && (
            <div>
              <p className="text-[10px] text-[#F59E0B] mb-0.5">Skipped Passes</p>
              <p className="text-sm font-semibold text-[#F59E0B]">{taxonomyDiagnostics.skipped_agent_pass_count}</p>
            </div>
          )}
          {taxonomyDiagnostics.timeout_agent_pass_count > 0 && (
            <div>
              <p className="text-[10px] text-[#FB923C] mb-0.5">Timeout Skips</p>
              <p className="text-sm font-semibold text-[#FB923C]">{taxonomyDiagnostics.timeout_agent_pass_count}</p>
            </div>
          )}
        </div>

        {taxonomyDiagnostics.warnings?.length > 0 && (
          <div className="mt-3 space-y-1">
            {taxonomyDiagnostics.warnings.slice(-2).map((warning, index) => (
              <p key={`${warning}-${index}`} className="text-xs text-[#FCD34D]">
                {warning}
              </p>
            ))}
          </div>
        )}

        {taxonomyDiagnostics.analysis_mesh_coverage_reconciliation && (
          <details className="mt-3 group">
            <summary className="cursor-pointer text-xs font-semibold text-[#67E8F9] list-none group-open:mb-3">
              Ownership reconciliation
            </summary>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="p-3 bg-[#0F172A] border border-[#374151] rounded-lg">
                <p className="text-[10px] text-[#9CA3AF] mb-1">Finding-backed Detectors</p>
                <p className="text-sm font-semibold text-[#22D3EE]">
                  {taxonomyDiagnostics.analysis_mesh_coverage_reconciliation.finding_backed_detector_count || 0}
                  /{taxonomyDiagnostics.analysis_mesh_coverage_reconciliation.assigned_detector_count || 0}
                </p>
              </div>
              <div className="p-3 bg-[#0F172A] border border-[#374151] rounded-lg">
                <p className="text-[10px] text-[#9CA3AF] mb-1">Checked Owned Detectors</p>
                <p className="text-sm font-semibold text-[#67E8F9]">
                  {taxonomyDiagnostics.analysis_mesh_coverage_reconciliation.checked_detector_count || 0}
                </p>
              </div>
              <div className="p-3 bg-[#0F172A] border border-[#374151] rounded-lg">
                <p className="text-[10px] text-[#9CA3AF] mb-1">Checked Clean Detectors</p>
                <p className="text-sm font-semibold text-[#86EFAC]">
                  {taxonomyDiagnostics.analysis_mesh_coverage_reconciliation.checked_clean_detector_count || 0}
                </p>
              </div>
              <div className="p-3 bg-[#0F172A] border border-[#374151] rounded-lg">
                <p className="text-[10px] text-[#9CA3AF] mb-1">Untouched Owned Detectors</p>
                <p className="text-sm font-semibold text-[#E879F9]">
                  {taxonomyDiagnostics.analysis_mesh_coverage_reconciliation.untouched_detector_count || 0}
                </p>
              </div>
              <div className="p-3 bg-[#0F172A] border border-[#374151] rounded-lg">
                <p className="text-[10px] text-[#9CA3AF] mb-1">Quiet Owned Detectors</p>
                <p className="text-sm font-semibold text-[#C4B5FD]">
                  {taxonomyDiagnostics.analysis_mesh_coverage_reconciliation.quiet_detector_count || 0}
                </p>
              </div>
              <div className="p-3 bg-[#0F172A] border border-[#374151] rounded-lg">
                <p className="text-[10px] text-[#9CA3AF] mb-1">Cross-Scope Issues</p>
                <p className="text-sm font-semibold text-[#F59E0B]">
                  {taxonomyDiagnostics.analysis_mesh_coverage_reconciliation.out_of_owned_scope_issue_count || 0}
                </p>
              </div>
              <div className="p-3 bg-[#0F172A] border border-[#374151] rounded-lg">
                <p className="text-[10px] text-[#9CA3AF] mb-1">Integrity Status</p>
                <p className="text-sm font-semibold text-[#86EFAC]">
                  {taxonomyDiagnostics.analysis_mesh_coverage_reconciliation.integrity_status || 'unknown'}
                </p>
              </div>
            </div>
          </details>
        )}

        {taxonomyDiagnostics.analysis_mesh_agent_runs?.length > 0 && (
          <details className="mt-3 group">
            <summary className="cursor-pointer text-xs font-semibold text-[#93C5FD] list-none group-open:mb-3">
              Analysis mesh coverage ({taxonomyDiagnostics.analysis_mesh_agent_runs.length} runs)
            </summary>
            <div className="space-y-2">
              {taxonomyDiagnostics.analysis_mesh_agent_runs.map((run, index) => (
                <div key={`${run.agent_id || 'unknown'}-${index}`} className="p-3 bg-[#0F172A] border border-[#374151] rounded-lg">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-[10px] font-semibold text-[#DBEAFE] uppercase tracking-wide">
                      {run.agent_label || run.agent_id || 'Unknown Agent'}
                    </span>
                    <span className="text-[10px] text-[#9CA3AF]">Strategy {run.merge_strategy || 'n/a'}</span>
                    <span className="text-[10px] text-[#9CA3AF]">Priority {run.merge_priority ?? 'n/a'}</span>
                    <span className="text-[10px] text-[#86EFAC]">Focus layers {run.focus_layer_hits || 0}</span>
                    <span className="text-[10px] text-[#A5F3FC]">Focus subcats {run.focus_subcategory_hits || 0}</span>
                    <span className="text-[10px] text-[#22D3EE]">Owned detectors {run.owned_detector_coverage_count || 0}/{run.owned_detector_count || 0}</span>
                    <span className="text-[10px] text-[#67E8F9]">Checked {run.receipt_checked_owned_detector_count || 0}</span>
                    <span className="text-[10px] text-[#86EFAC]">Clean {run.receipt_clean_owned_detector_count || 0}</span>
                    <span className="text-[10px] text-[#E879F9]">Untouched {run.untouched_owned_detector_count || 0}</span>
                    <span className="text-[10px] text-[#67E8F9]">Owned layers {run.owned_layer_coverage_count || 0}/{run.owned_layer_count || 0}</span>
                    <span className="text-[10px] text-[#F59E0B]">Cross-scope {run.out_of_owned_scope_issue_count || 0}</span>
                  </div>
                  {run.dominant_layers?.length > 0 && (
                    <p className="text-xs text-[#CBD5E1]">
                      Dominant layers: {run.dominant_layers.map((entry) => `${entry.value} (${entry.count})`).join(', ')}
                    </p>
                  )}
                  {run.dominant_subcategories?.length > 0 && (
                    <p className="text-xs text-[#9CA3AF] mt-1">
                      Dominant subcategories: {run.dominant_subcategories.map((entry) => `${entry.value} (${entry.count})`).join(', ')}
                    </p>
                  )}
                  <p className="text-xs text-[#94A3B8] mt-1">
                    Owned detector ranges: {(run.owned_detector_ranges || []).join(', ') || 'n/a'}
                  </p>
                  {run.warnings?.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {run.warnings.map((warning, warningIndex) => (
                        <p key={`${warning}-${warningIndex}`} className="text-xs text-[#FCA5A5]">
                          {warning}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </details>
        )}

        {hasFailures && (
          <details className="mt-3 group">
            <summary className="cursor-pointer text-xs font-semibold text-[#FCA5A5] list-none group-open:mb-3">
              Captured malformed agent responses ({failureEvents.length})
            </summary>
            <div className="space-y-3">
              {failureEvents.map((event, index) => (
                <div key={`${event.agent_id}-${event.batch_index}-${event.attempt}-${index}`} className="p-3 bg-[#0F172A] border border-[#374151] rounded-lg">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-[10px] font-semibold text-[#FCA5A5] uppercase tracking-wide">{event.agent_label || event.agent_id}</span>
                    <span className="text-[10px] text-[#9CA3AF]">Batch {event.batch_index || '?'}{event.batch_count ? `/${event.batch_count}` : ''}</span>
                    <span className="text-[10px] text-[#9CA3AF]">Attempt {event.attempt}</span>
                    <span className="text-[10px] text-[#93C5FD]">{event.stage}</span>
                    {event.recovered && (
                      <span className="text-[10px] text-[#86EFAC]">Recovered on attempt {event.recovered_on_attempt || event.attempt}</span>
                    )}
                  </div>
                  <p className="text-xs text-[#F9FAFB] mb-2">{event.message}</p>
                  {event.raw_response_excerpt && (
                    <pre className="text-[11px] leading-relaxed whitespace-pre-wrap break-words bg-[#020617] border border-[#1F2937] rounded-lg p-3 text-[#CBD5E1] max-h-56 overflow-auto">
                      {event.raw_response_excerpt}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    );
  };

  const exportJSON = () => {
    exportAuditJson({ results, taxonomyDiagnostics });
    setExportMenuOpen(false);
  };

  const exportMarkdown = () => {
    exportAuditMarkdown({
      results,
      taxonomyDiagnostics,
      brandName: BRAND_NAME,
      brandTagline: BRAND_TAGLINE,
      brandIconDataUrl,
      generatedAt: new Date().toLocaleString(),
      analysisAgentCount: ANALYSIS_AGENT_COUNT,
      totalDetectorCount: TOTAL_DETECTOR_COUNT
    });
    setExportMenuOpen(false);
  };

  const exportCSV = () => {
    exportAuditCsv({ results });
    setExportMenuOpen(false);
  };

  const saveSession = () => {
    exportAuditSession({ results, taxonomyDiagnostics, files, config });
  };

  const loadSession = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const loadedState = parseLoadedSessionText(event.target.result);
          applyLoadedState(loadedState);
        } catch (e) {
          setError('Failed to load session: Invalid JSON');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleClearHistory = async () => {
    const updated = await clearHistoryWorkbench(window.electronAPI);
    setHistoryList(updated);
  };

  const handleDeleteHistory = async (id) => {
    const updated = await deleteHistoryWorkbenchEntry(window.electronAPI, id);
    setHistoryList(updated);
  };

  const handleUpdateHistoryEntry = async (id, updates) => {
    const updated = await updateHistoryWorkbenchEntry(window.electronAPI, id, updates);
    setHistoryList(updated);
    if (baselineEntry?.id === id) {
      setBaselineEntry(prev => ({ ...prev, ...updates }));
    }
  };

  const handleSelectBaseline = async (id) => {
    if (!id) {
      setBaselineEntry(null);
      return;
    }
    const loadedState = await loadHistoryEntryAppState(window.electronAPI, id);
    if (loadedState) {
      setBaselineEntry(buildBaselineHistoryEntry({ id, loadedState, historyList }));
    }
  };

  const handleCompareHistoryEntry = async (id) => {
    const loadedState = await loadHistoryEntryAppState(window.electronAPI, id);
    if (!loadedState) return;
    const targetMeta = historyList.find(e => e.id === id);
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
  };

  const handleOpenHistoryEntry = async (id) => {
    const loadedState = await loadHistoryEntryAppState(window.electronAPI, id);
    applyLoadedState(loadedState, { closeHistory: true });
  };

  const saveToHistory = async () => {
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
  };

  return (
    <div className="h-screen flex flex-col bg-[#111827] text-[#F9FAFB] overflow-hidden">
      <TopBar
        providerReady={canAnalyze}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenHistory={() => setHistoryOpen(true)}
      />

      <SettingsModal
        open={settingsOpen}
        config={config}
        onSave={handleSaveSettings}
        onCancel={() => setSettingsOpen(false)}
        onClearCache={handleClearCache}
      />

      <HistoryModal
        open={historyOpen}
        history={historyList}
        onOpen={handleOpenHistoryEntry}
        onDelete={handleDeleteHistory}
        onClear={handleClearHistory}
        onUpdate={handleUpdateHistoryEntry}
        onCompare={handleCompareHistoryEntry}
        onSelectBaseline={handleSelectBaseline}
        baselineId={baselineEntry?.id}
        onCancel={() => setHistoryOpen(false)}
      />

      <div className="flex-1 overflow-y-auto">
        {!results && !analyzing && (
          <div className="max-w-3xl mx-auto px-6 py-8">
            <FileDropZone
              files={files}
              onFilesDropped={handleFilesDropped}
              onRemoveFile={handleRemoveFile}
            />
            
            {contextWarning && (
              <div className="mt-4 p-3 bg-[#78350F] border border-[#F59E0B] rounded-lg">
                <p className="text-[#FCD34D] text-sm flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  {contextWarning}
                </p>
              </div>
            )}
            
            <div className="mt-6 flex justify-center gap-3">
                <AnalyzeButton
                  fileCount={files.length}
                  providerConfigured={canAnalyze}
                  analyzing={analyzing}
                  onClick={handleAnalyze}
                />
                <button
                  onClick={loadSession}
                  className="px-6 py-2.5 bg-[#1F2937] hover:bg-[#283548] border border-[#374151] rounded-xl text-sm font-medium transition-all"
                  title="Load past session"
                >
                  Load Session
                </button>
            </div>
            {error && (
              <div className="mt-6 p-4 bg-[#3B1111] border border-[#A32D2D] rounded-lg">
                <p className="text-[#F87171] text-sm">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="mt-2 text-xs text-[#9CA3AF] hover:text-[#F9FAFB] underline"
                >
                  Dismiss
                </button>
              </div>
            )}
            {error && taxonomyDiagnostics && renderDiagnosticsPanel('error')}
          </div>
        )}

        {analyzing && (
          <div className="max-w-3xl mx-auto px-6 py-8">
            <ProgressPanel
              model={config.model}
              baseURL={config.baseURL}
              progressState={progressState}
              analysisStats={analysisStats}
            />
          </div>
        )}

        {results && !analyzing && (
          <div className="max-w-5xl mx-auto px-6 py-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold">Audit Results</h2>
                <p className="text-sm text-[#9CA3AF]">
                  {results.summary?.files_analyzed || files.length} files analyzed - deterministic 8-agent mesh - model: {config.model}
                </p>
                {(results.summary?.timeout_agent_passes || 0) > 0 && (
                  <p className="text-xs text-[#FB923C] mt-1">
                    Degraded mode: {results.summary.timeout_agent_passes} agent pass{results.summary.timeout_agent_passes === 1 ? '' : 'es'} timed out and were skipped.
                  </p>
                )}
                {results.summary?.detectors_runtime_touched !== undefined && (
                  <p className="text-xs text-[#6B7280] mt-1">
                    Runtime detector coverage: {results.summary.detectors_runtime_touched}/{results.summary.detectors_defined || TOTAL_DETECTOR_COUNT} touched
                    {Number.isFinite(Number(results.summary.detectors_model_finding_backed)) && ` · model finding-backed ${results.summary.detectors_model_finding_backed}`}
                    {Number.isFinite(Number(results.summary.detectors_locally_checked)) && ` · local checked ${results.summary.detectors_locally_checked}`}
                    {Number.isFinite(Number(results.summary.detectors_untouched)) && ` · untouched ${results.summary.detectors_untouched}`}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={saveSession}
                  className="px-3 py-2 bg-[#1F2937] hover:bg-[#283548] border border-[#374151] rounded-lg text-sm transition-colors"
                  title="Export session to JSON file"
                >
                  Export JSON
                </button>
                <button
                  onClick={saveToHistory}
                  className="px-3 py-2 bg-[#1F2937] hover:bg-[#283548] border border-[#374151] rounded-lg text-sm transition-colors"
                  title="Save session to local history workbench"
                >
                  📜 Save to History
                </button>
                <div className="relative">
                  <button
                    onClick={() => setExportMenuOpen(!exportMenuOpen)}
                    className="px-3 py-2 bg-[#1F2937] hover:bg-[#283548] border border-[#374151] rounded-lg text-sm transition-colors"
                  >
                    Export
                  </button>
                  {exportMenuOpen && (
                    <div className="absolute right-0 mt-1 w-40 bg-[#1F2937] border border-[#374151] rounded-lg shadow-xl z-10">
                      <button onClick={exportJSON} className="w-full px-4 py-2 text-left text-sm hover:bg-[#283548] rounded-t-lg">JSON</button>
                      <button onClick={exportMarkdown} className="w-full px-4 py-2 text-left text-sm hover:bg-[#283548]">Markdown</button>
                      <button onClick={exportCSV} className="w-full px-4 py-2 text-left text-sm hover:bg-[#283548] rounded-b-lg">CSV</button>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-[#1F2937] hover:bg-[#283548] border border-[#374151] rounded-lg text-sm transition-colors"
                >
                  New Audit
                </button>
              </div>
            </div>

            <SummaryDashboard
              summary={results.summary}
              taxonomyDiagnostics={taxonomyDiagnostics}
              analysisStats={analysisStats}
              analysisMesh={results.analysis_mesh}
            />
            
            <DiffSummaryPanel 
              diff={diffSummary} 
              active={diffMode} 
              onToggle={setDiffMode} 
            />

            {diffMode && contextWarning && (
              <div className="mb-6 px-4 py-2 bg-[#1E1B4B] border border-[#4338CA] rounded-lg flex items-center justify-between">
                <p className="text-xs text-[#818CF8] font-medium">
                  <span className="font-bold uppercase tracking-wider mr-2">Mode:</span> {contextWarning}
                </p>
                <button 
                  onClick={() => {
                    setDiffMode(false);
                    setDiffSummary(null);
                    setContextWarning(null);
                  }}
                  className="text-[10px] font-bold text-[#818CF8] hover:underline uppercase"
                >
                  Exit Comparison
                </button>
              </div>
            )}

            {taxonomyDiagnostics && renderDiagnosticsPanel()}

            <div className="mb-4 flex flex-col gap-3">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search issues by description, evidence, tags..."
                  className="w-full px-4 py-2 pl-10 bg-[#1F2937] border border-[#374151] rounded-lg text-sm text-[#F9FAFB] placeholder-[#6B7280] focus:outline-none focus:border-[#60A5FA] transition-colors"
                />
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#9CA3AF]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                )}
              </div>
              
              <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
                <span className="text-xs font-semibold text-[#6B7280] whitespace-nowrap">GROUP BY:</span>
                {[
                  { id: 'flat', label: 'Flat List' },
                  { id: 'file', label: 'File' },
                  { id: 'severity', label: 'Severity' },
                  { id: 'layer', label: 'Layer' },
                  { id: 'subcategory', label: 'Subcategory' },
                  { id: 'root_cause', label: 'Root Cause' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setGroupingMode(mode.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all whitespace-nowrap ${
                      groupingMode === mode.id
                        ? 'bg-[#3B82F6] border-[#3B82F6] text-white shadow-lg shadow-[#3B82F6]/20'
                        : 'bg-[#1F2937] border-[#374151] text-[#9CA3AF] hover:border-[#4B5563]'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>

              {searchQuery && (
                <p className="text-xs text-[#6B7280]">
                  Showing {filteredIssues.length} of {results.issues?.length || 0} issues
                </p>
              )}
            </div>

            <LayerFilterBar
              issues={results.issues}
              activeLayer={activeLayer}
              onLayerChange={(layer) => {
                setActiveLayer(layer);
                setActiveSubcategory('all');
              }}
            />

            {activeLayer !== 'all' && (
              <div className="mb-4 flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar border-b border-[#1F2937]">
                <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest whitespace-nowrap">Filter Subcategory:</span>
                <button
                  onClick={() => setActiveSubcategory('all')}
                  className={`px-2 py-1 rounded text-[10px] font-medium border transition-all whitespace-nowrap ${
                    activeSubcategory === 'all'
                      ? 'bg-[#374151] border-[#4B5563] text-white'
                      : 'bg-transparent border-transparent text-[#6B7280] hover:text-[#9CA3AF]'
                  }`}
                >
                  ALL
                </button>
                {getAvailableSubcategories(activeLayer).map(sub => (
                  <button
                    key={sub}
                    onClick={() => setActiveSubcategory(sub)}
                    className={`px-2 py-1 rounded text-[10px] font-medium border transition-all whitespace-nowrap ${
                      activeSubcategory === sub
                        ? 'bg-[#374151] border-[#4B5563] text-white'
                        : 'bg-transparent border-transparent text-[#6B7280] hover:text-[#9CA3AF]'
                    }`}
                  >
                    {sub.toUpperCase()}
                  </button>
                ))}
              </div>
            )}

            <IssueList 
              issues={filteredIssues} 
              activeLayer={activeLayer} 
              groupingMode={groupingMode}
              rootCauses={results.root_causes || []}
            />

            {error && (
              <div className="mt-6 p-4 bg-[#3B1111] border border-[#A32D2D] rounded-lg">
                <p className="text-[#F87171] text-sm">{error}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


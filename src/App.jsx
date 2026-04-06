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
import { repairJSON, validateResults } from './lib/jsonRepair';
import { ANALYSIS_AGENT_COUNT, ANALYSIS_AGENT_MESH, ANALYSIS_MESH_VERSION } from './lib/analysisAgents';
import { buildMarkdownProjectIndex, enrichIssueWithMarkdownIndex } from './lib/markdownIndex';
import { buildMarkdownProjectGraph, enrichIssueWithProjectGraph } from './lib/projectGraph';
import {
  DEFAULT_RETRIES,
  DEFAULT_SESSION_TOKEN_BUDGET,
  DEFAULT_TIMEOUT_SECONDS,
  RECOMMENDED_BATCH_TARGET_TOKENS,
  BATCH_TOKEN_BUFFER,
  MIN_CHUNK_CHARS,
  normalizeTokenBudget
} from './lib/runtimeConfig';
import {
  TOTAL_DETECTOR_COUNT,
  normalizeIssueFromDetector, 
  getAvailableSubcategories,
  createInitialDiagnostics,
  recordAgentFailure,
  recordAgentRecovery,
  recordAgentSkip,
  buildExportData,
  buildSessionData,
  normalizeLoadedSession,
  resolveInitialCache,
  buildHistoryMetadata,
  compareAudits,
  getIssueIdentity
} from './lib/detectorMetadata';
const CHARS_PER_TOKEN = 4;
const BRAND_NAME = 'Markdown Intelligence Auditor';
const BRAND_TAGLINE = 'Deterministic Markdown specification auditing';
const MAX_AGENT_RESPONSE_ATTEMPTS = 2;
const MAX_DIAGNOSTIC_EVENTS_VISIBLE = 3;

function getAgentFailureStage(error) {
  const message = error?.message || '';
  if (message.includes('Invalid JSON') || message.includes('No JSON object found')) {
    return 'json_parse';
  }
  if (
    message.includes('missing required') ||
    message.includes('Response is not a JSON object') ||
    message.includes('invalid')
  ) {
    return 'schema_validation';
  }
  return 'response_validation';
}

function buildAgentRetryMessage(baseUserMessage, agent, error, attempt) {
  return `${baseUserMessage}

=== FORMAT RETRY REQUIRED ===
The previous ${agent.label} response for this same batch was rejected on attempt ${attempt}.
Validator message: ${error.message}

Return exactly one raw JSON object matching the required schema.
- Use double quotes for every property name and string value
- Do not return markdown fences
- Do not return commentary before or after the JSON object
- Keep the same audit scope and evidence discipline as the original request`;
}

function normalizeFileDisplayNames(fileList) {
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

function normalizeHistorySessionPayload(session) {
  if (!session) return null;
  return session.results ? session : { results: session };
}

const DETECTION_SOURCE_PRIORITY = {
  model: 0,
  hybrid_anchor: 1,
  hybrid_graph: 2
};

function normalizeCrossFileLinks(links = []) {
  if (!Array.isArray(links)) return [];

  const seenTargets = new Set();
  return links
    .filter((link) => link && typeof link === 'object' && typeof link.target === 'string' && link.target.trim())
    .map((link) => ({
      type: typeof link.type === 'string' ? link.type : '',
      label: typeof link.label === 'string' ? link.label : '',
      file: typeof link.file === 'string' ? link.file : '',
      section: typeof link.section === 'string' ? link.section : '',
      target: link.target.trim(),
      related_keys: Array.isArray(link.related_keys)
        ? Array.from(new Set(link.related_keys.filter((value) => typeof value === 'string' && value.trim())))
        : []
    }))
    .filter((link) => {
      if (seenTargets.has(link.target)) return false;
      seenTargets.add(link.target);
      return true;
    });
}

function mergeDetectionSource(existingSource, nextSource) {
  const existingPriority = DETECTION_SOURCE_PRIORITY[existingSource] ?? -1;
  const nextPriority = DETECTION_SOURCE_PRIORITY[nextSource] ?? -1;
  return nextPriority > existingPriority ? nextSource : existingSource;
}

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
  const [fileHashes, setFileHashes] = useState({});
  const [cachedResults, setCachedResults] = useState({}); // { hash: { issues, summary } }
  const [analysisStats, setAnalysisStats] = useState({ reused: 0, reanalyzed: 0, agentPasses: 0 });

  useEffect(() => {
    window.electronAPI.readConfig().then((cfg) => {
      const normalized = {
        ...cfg,
        timeout: Number.isFinite(Number(cfg.timeout)) ? Number(cfg.timeout) : DEFAULT_TIMEOUT_SECONDS,
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
    
    // Migration logic: Load from file first, fallback to localStorage if file is empty
    window.electronAPI.readCache().then((fileCache) => {
      const legacyCacheString = localStorage.getItem('audit_cache');
      const { cache, shouldMigrate } = resolveInitialCache(fileCache, legacyCacheString);
      
      setCachedResults(cache);
      
      if (shouldMigrate) {
        console.log('[Cache] Migrating legacy localStorage cache to file storage');
        window.electronAPI.writeCache(cache);
      } else if (Object.keys(cache).length > 0) {
        console.log('[Cache] Loaded from file-backed store');
      }
    });

    // Load history list
    window.electronAPI.listHistory().then(setHistoryList);
  }, []);

  const saveCache = useCallback((newCache) => {
    setCachedResults(newCache);
    window.electronAPI.writeCache(newCache);
  }, []);

  const handleClearCache = async () => {
    await window.electronAPI.clearCache();
    localStorage.removeItem('audit_cache');
    setCachedResults({});
    console.log('[Cache] Analysis cache cleared');
  };

  const calculateHash = async (text) => {
    const cacheIdentity = [
      ANALYSIS_MESH_VERSION,
      config.baseURL || 'no-base-url',
      config.model || 'no-model',
      text
    ].join('\n');
    const msgUint8 = new TextEncoder().encode(cacheIdentity);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
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
    const systemTokens = maxSystemTokens;
    const userTokens = fileList.reduce((sum, f) => sum + Math.ceil(f.content.length / CHARS_PER_TOKEN), 0);
    const perPassTotal = systemTokens + userTokens;
    return {
      systemTokens,
      userTokens,
      perPassTotal,
      total: perPassTotal * ANALYSIS_AGENT_COUNT
    };
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

  const getAvailableTokens = useCallback(() => {
    return Math.max(1, RECOMMENDED_BATCH_TARGET_TOKENS - maxSystemTokens - BATCH_TOKEN_BUFFER);
  }, [maxSystemTokens]);

  const splitOversizedFile = useCallback((file, maxTokens) => {
    const fileTokens = Math.ceil(file.content.length / CHARS_PER_TOKEN);
    const baseFile = {
      name: file.name,
      path: file.path,
      size: file.size,
      lastModified: file.lastModified
    };

    if (fileTokens <= maxTokens) {
      return [{
        ...baseFile,
        content: file.content,
        chunkIndex: 1,
        chunkCount: 1,
        lineStart: 1,
        lineEnd: Math.max(1, file.content.split('\n').length),
        isChunked: false
      }];
    }

    const maxChars = Math.max(MIN_CHUNK_CHARS, maxTokens * CHARS_PER_TOKEN);
    const overlapChars = Math.floor(maxChars * 0.1); // 10% overlap
    const newlineOffsets = [];
    for (let i = 0; i < file.content.length; i++) {
      if (file.content[i] === '\n') {
        newlineOffsets.push(i);
      }
    }
    const getLineNumberAtOffset = (offset) => {
      let low = 0;
      let high = newlineOffsets.length;

      while (low < high) {
        const mid = Math.floor((low + high) / 2);
        if (newlineOffsets[mid] < offset) {
          low = mid + 1;
        } else {
          high = mid;
        }
      }

      return low + 1;
    };
    const rawChunks = [];
    let start = 0;

    while (start < file.content.length) {
      const maxEnd = Math.min(start + maxChars, file.content.length);
      let end = maxEnd;

      if (end < file.content.length) {
        const newlineBoundary = file.content.lastIndexOf('\n', maxEnd - 1);
        if (newlineBoundary >= start + Math.floor(maxChars * 0.5)) {
          end = newlineBoundary + 1;
        }
      }

      if (end <= start) {
        end = maxEnd;
      }

      const content = file.content.slice(start, end);
      const lineStart = getLineNumberAtOffset(start);
      const lineCount = Math.max(1, content.split('\n').length);
      const lineEnd = lineStart + lineCount - 1;

      rawChunks.push({
        ...baseFile,
        content,
        lineStart,
        lineEnd
      });

      // Move start back by overlap amount, but ensure progress
      const nextStart = end - overlapChars;
      if (nextStart <= start) {
        start = end;
      } else {
        start = nextStart;
      }
    }

    const chunkCount = rawChunks.length;
    return rawChunks.map((chunk, index) => ({
      ...chunk,
      chunkIndex: index + 1,
      chunkCount,
      isChunked: true
    }));
  }, []);

  const batchFiles = (fileList) => {
    const availableTokens = getAvailableTokens();
    const batches = [];
    let currentBatch = [];
    let currentTokens = 0;

    const flattenedFiles = fileList.flatMap(f => splitOversizedFile(f, availableTokens));

    flattenedFiles.forEach((file) => {
      const fileTokens = Math.ceil(file.content.length / CHARS_PER_TOKEN);
      
      if (currentTokens + fileTokens > availableTokens && currentBatch.length > 0) {
        batches.push(currentBatch);
        currentBatch = [file];
        currentTokens = fileTokens;
      } else {
        currentBatch.push(file);
        currentTokens += fileTokens;
      }
    });

    if (currentBatch.length > 0) batches.push(currentBatch);
    return batches;
  };

  const analyzeBatch = async (batch, batchIndex, totalBatches, diagnostics) => {
    const userMessage = batch
      .map((f) => `=== FILE: ${f.name}${f.isChunked ? ` (Chunk ${f.chunkIndex}/${f.chunkCount})` : ''} ===\n\n${f.content}\n\n${'─'.repeat(60)}\n`)
      .join('');

    const agentResults = [];
    let rawIssueCount = 0;

    for (const agent of agentPromptEntries) {
      let parsed = null;
      let lastValidationError = null;

      for (let attempt = 1; attempt <= MAX_AGENT_RESPONSE_ATTEMPTS; attempt += 1) {
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

      rawIssueCount += normalizedIssues.length;
      diagnostics.analysis_mesh_passes_completed += 1;
      agentResults.push({
        ...parsed,
        issues: normalizedIssues,
        _sourceFiles: Array.from(new Set(batch.map((file) => file.sourceName || file.name)))
      });
    }

    const mergedAgentResult = mergeResults(agentResults);
    mergedAgentResult.summary.detectors_evaluated = TOTAL_DETECTOR_COUNT;
    mergedAgentResult.summary.detectors_skipped = 0;
    mergedAgentResult.summary.analysis_agents_run = ANALYSIS_AGENT_COUNT;
    mergedAgentResult.summary.analysis_agent_passes = agentResults.length;

    return {
      ...mergedAgentResult,
      _sourceFiles: Array.from(new Set(batch.map((file) => file.sourceName || file.name))),
      _rawIssueCount: rawIssueCount,
      _agentPasses: agentResults.length
    };
  };

  const deduplicateRootCauses = (rootCauses) => {
    const seen = new Map();

    rootCauses.forEach((rootCause, index) => {
      const key = rootCause.id || rootCause.title || `root-cause-${index}`;

      if (seen.has(key)) {
        const existing = seen.get(key);
        existing.child_issues = [...new Set([...(existing.child_issues || []), ...(rootCause.child_issues || [])])];
        existing.description = existing.description || rootCause.description;
        existing.impact = existing.impact || rootCause.impact;
      } else {
        seen.set(key, {
          ...rootCause,
          child_issues: [...new Set(rootCause.child_issues || [])]
        });
      }
    });

    return Array.from(seen.values());
  };

  const mergeResults = (batchResults) => {
    const merged = {
      summary: { total: 0, critical: 0, high: 0, medium: 0, low: 0, files_analyzed: 0 },
      issues: [],
      root_causes: []
    };

    const seenFiles = new Set();

    batchResults.forEach((res) => {
      merged.issues = [...merged.issues, ...(res.issues || [])];
      merged.root_causes = [...merged.root_causes, ...(res.root_causes || [])];
      res._sourceFiles?.forEach(f => seenFiles.add(f));
    });

    merged.summary.files_analyzed = seenFiles.size;
    merged.issues = deduplicateIssues(merged.issues);
    merged.root_causes = deduplicateRootCauses(merged.root_causes);
    applyPostMergeEscalation(merged.issues);
    
    // Recalculate summary counts after merge/dedupe/escalation
    merged.summary.total = merged.issues.length;
    merged.summary.critical = merged.issues.filter(i => i.severity === 'critical').length;
    merged.summary.high = merged.issues.filter(i => i.severity === 'high').length;
    merged.summary.medium = merged.issues.filter(i => i.severity === 'medium').length;
    merged.summary.low = merged.issues.filter(i => i.severity === 'low').length;

    return merged;
  };

  const applyPostMergeEscalation = (issues) => {
    const severityOrder = { critical: 3, high: 2, medium: 1, low: 0 };

    // Rule 1: ≥3 medium issues in same section → high
    const sectionMediumCounts = {};
    issues.forEach(issue => {
      if (issue.severity === 'medium' && issue.section) {
        const key = `${issue.files?.[0]}::${issue.section}`;
        if (!sectionMediumCounts[key]) sectionMediumCounts[key] = [];
        sectionMediumCounts[key].push(issue);
      }
    });

    Object.values(sectionMediumCounts).forEach(group => {
      if (group.length >= 3) {
        group.forEach(issue => {
          issue.severity = 'high';
          issue.escalation_reason = `Escalated to high because ≥3 medium issues (${group.length}) were found in the same section: ${issue.section}`;
        });
      }
    });

    // Rule 2: Security (L23) + Performance (L24) same component → escalate to critical
    const componentIssues = {};
    issues.forEach(issue => {
      const component = issue.files?.[0] || 'unknown';
      if (!componentIssues[component]) componentIssues[component] = [];
      componentIssues[component].push(issue);
    });
    Object.values(componentIssues).forEach(componentIssueList => {
      const hasSecurity = componentIssueList.some(i => i.category === 'security');
      const hasPerformance = componentIssueList.some(i => i.category === 'performance');
      if (hasSecurity && hasPerformance) {
        componentIssueList.forEach(issue => {
          if (issue.category === 'security' || issue.category === 'performance') {
            if (severityOrder[issue.severity] < severityOrder['critical']) {
              issue.severity = 'critical';
              issue.escalation_reason = `Escalated to critical due to high-risk interaction between security and performance detectors in ${issue.files?.[0]}`;
            }
          }
        });
      }
    });

    // Rule 3: Completeness (L9) + Functional (L6) missing steps → escalate to high
    const sectionIssues = {};
    issues.forEach(issue => {
      if (issue.section) {
        const key = `${issue.files?.[0]}::${issue.section}`;
        if (!sectionIssues[key]) sectionIssues[key] = [];
        sectionIssues[key].push(issue);
      }
    });
    Object.values(sectionIssues).forEach(sectionIssueList => {
      const hasCompleteness = sectionIssueList.some(i => i.category === 'completeness');
      const hasFunctional = sectionIssueList.some(i => i.category === 'functional');
      if (hasCompleteness && hasFunctional) {
        sectionIssueList.forEach(issue => {
          if ((issue.category === 'completeness' || issue.category === 'functional') &&
              severityOrder[issue.severity] < severityOrder['high']) {
            issue.severity = 'high';
            issue.escalation_reason = `Escalated to high because completeness and functional issues both flag missing steps in section: ${issue.section}`;
          }
        });
      }
    });

    // Rule 4: Contradiction (L1) + Intent (L10) same content → escalate to high
    Object.values(sectionIssues).forEach(sectionIssueList => {
      const hasContradiction = sectionIssueList.some(i => i.category === 'contradiction');
      const hasIntent = sectionIssueList.some(i => i.category === 'intent');
      if (hasContradiction && hasIntent) {
        sectionIssueList.forEach(issue => {
          if ((issue.category === 'contradiction' || issue.category === 'intent') &&
              severityOrder[issue.severity] < severityOrder['high']) {
            issue.severity = 'high';
            issue.escalation_reason = `Escalated to high due to conflict between documented content (L1) and stated intent (L10) in section: ${issue.section}`;
          }
        });
      }
    });
  };

  // Deduplication based on detector ID + file + section + line_number (or stable fallback fingerprint)
  const deduplicateIssues = (issues) => {
    const seen = new Map();
    const deduped = [];

    issues.forEach(issue => {
      const key = getIssueIdentity(issue);

      if (seen.has(key)) {
        const existing = seen.get(key);
        if (issue.related_issues) {
          existing.related_issues = [...new Set([...(existing.related_issues || []), ...issue.related_issues])];
        }
        const mergedAgents = [
          ...(existing.analysis_agents || (existing.analysis_agent ? [existing.analysis_agent] : [])),
          ...(issue.analysis_agents || (issue.analysis_agent ? [issue.analysis_agent] : []))
        ];
        if (mergedAgents.length > 0) {
          existing.analysis_agents = Array.from(new Set(mergedAgents));
          existing.analysis_agent = existing.analysis_agents[0];
        }
        if (issue.document_anchors?.length) {
          existing.document_anchors = Array.from(
            new Set([...(existing.document_anchors || []), ...issue.document_anchors.filter(Boolean)])
          );
        }
        if (!existing.document_anchor && issue.document_anchor) {
          existing.document_anchor = issue.document_anchor;
        }
        if (!existing.anchor_source && issue.anchor_source) {
          existing.anchor_source = issue.anchor_source;
        }
        existing.cross_file_links = normalizeCrossFileLinks([
          ...(existing.cross_file_links || []),
          ...(issue.cross_file_links || [])
        ]);
        existing.detection_source = mergeDetectionSource(existing.detection_source, issue.detection_source);
        [
          'why_triggered',
          'failure_type',
          'constraint_reference',
          'violation_reference',
          'contract_step',
          'invariant_broken',
          'authority_boundary',
          'evidence_reference',
          'closed_world_status',
          'deterministic_fix',
          'recommended_fix',
          'root_cause_id'
        ].forEach((field) => {
          if (!existing[field] && issue[field]) {
            existing[field] = issue[field];
          }
        });
        if (existing.assumption_detected === undefined && issue.assumption_detected !== undefined) {
          existing.assumption_detected = issue.assumption_detected;
        }
        const severityOrder = { critical: 3, high: 2, medium: 1, low: 0 };
        if (severityOrder[issue.severity] > severityOrder[existing.severity]) {
          existing.severity = issue.severity;
        }
      } else {
        const normalizedIssue = {
          ...issue,
          cross_file_links: normalizeCrossFileLinks(issue.cross_file_links),
          analysis_agents: Array.isArray(issue.analysis_agents)
            ? Array.from(new Set(issue.analysis_agents))
            : (issue.analysis_agent ? [issue.analysis_agent] : [])
        };
        if (!normalizedIssue.analysis_agent && normalizedIssue.analysis_agents.length > 0) {
          normalizedIssue.analysis_agent = normalizedIssue.analysis_agents[0];
        }
        seen.set(key, normalizedIssue);
        deduped.push(seen.get(key));
      }
    });

    return deduped;
  };

  const handleAnalyze = async () => {
    if (files.length === 0 || !canAnalyze) return;
    
    // Capture current results for comparison before we clear them
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
    const diagnostics = createInitialDiagnostics();
    diagnostics.analysis_mesh_agents_configured = ANALYSIS_AGENT_COUNT;
    const markdownIndex = buildMarkdownProjectIndex(files);
    const projectGraph = buildMarkdownProjectGraph(files);
    diagnostics.indexed_document_count = markdownIndex.summary.documentCount;
    diagnostics.indexed_heading_count = markdownIndex.summary.headingCount;
    diagnostics.project_graph_document_count = projectGraph.summary.documentCount;
    diagnostics.project_graph_heading_group_count = projectGraph.summary.headingGroupCount;
    diagnostics.project_graph_glossary_term_group_count = projectGraph.summary.glossaryTermGroupCount;
    diagnostics.project_graph_identifier_group_count = projectGraph.summary.identifierGroupCount;
    diagnostics.project_graph_workflow_group_count = projectGraph.summary.workflowGroupCount;

    try {
      const filesToAnalyze = [];
      const reusedBatchResults = [];
      let reusedCount = 0;
      let reanalyzedCount = 0;

      const currentHashes = {};
      for (const file of files) {
        const hash = await calculateHash(file.content);
        currentHashes[file.name] = hash;
        
        if (cachedResults[hash]) {
          console.log(`[Cache] Reusing results for ${file.name}`);
          reusedBatchResults.push(cachedResults[hash]);
          reusedCount++;
        } else {
          console.log(`[Cache] Cache miss for ${file.name}, adding to analysis`);
          filesToAnalyze.push(file);
          reanalyzedCount++;
        }
      }
      setFileHashes(currentHashes);
      setAnalysisStats({ reused: reusedCount, reanalyzed: reanalyzedCount, agentPasses: 0 });

      let finalBatchResults = [...reusedBatchResults];
      let currentCache = { ...cachedResults };
      let completedAgentPasses = 0;

      if (filesToAnalyze.length > 0) {
        const { total } = estimateTokens(filesToAnalyze);
        const sessionTokenBudget = normalizeTokenBudget(config.tokenBudget || DEFAULT_SESSION_TOKEN_BUDGET);
        if (sessionTokenBudget && total > sessionTokenBudget) {
          throw new Error(`Estimated ${total.toLocaleString()} tokens for new files exceeds session budget of ${sessionTokenBudget.toLocaleString()}.`);
        }

        const batches = batchFiles(filesToAnalyze);
        
        for (let i = 0; i < batches.length; i++) {
          const result = await analyzeBatch(batches[i], i, batches.length, diagnostics);
          completedAgentPasses += result._agentPasses || 0;
          
          // Update cache for each file in this batch
          const perFileResults = {};
          batches[i].forEach(f => {
            perFileResults[f.sourceName || f.name] = {
              _sourceFiles: [f.sourceName || f.name],
              summary: { ...result.summary, total: 0, critical: 0, high: 0, medium: 0, low: 0 },
              issues: [],
              root_causes: []
            };
          });

          if (result.issues) {
            result.issues.forEach(issue => {
              const primaryFile = issue.files?.[0];
              if (primaryFile && perFileResults[primaryFile]) {
                perFileResults[primaryFile].issues.push(issue);
                if (perFileResults[primaryFile].summary[issue.severity] !== undefined) {
                  perFileResults[primaryFile].summary[issue.severity]++;
                }
                perFileResults[primaryFile].summary.total++;
              }
            });
          }

          if (result.root_causes) {
            Object.entries(perFileResults).forEach(([fileName, fileResult]) => {
              const issueIds = new Set(fileResult.issues.map((issue) => issue.id).filter(Boolean));
              const rootCauseIds = new Set(fileResult.issues.map((issue) => issue.root_cause_id).filter(Boolean));

              fileResult.root_causes = result.root_causes
                .filter((rootCause) => {
                  const matchesByRootCauseId = rootCauseIds.has(rootCause.id);
                  const matchesByChildIssue = Array.isArray(rootCause.child_issues)
                    && rootCause.child_issues.some((childIssueId) => issueIds.has(childIssueId));

                  return matchesByRootCauseId || matchesByChildIssue;
                })
                .map((rootCause) => ({
                  ...rootCause,
                  child_issues: Array.isArray(rootCause.child_issues) && issueIds.size > 0
                    ? rootCause.child_issues.filter((childIssueId) => issueIds.has(childIssueId))
                    : rootCause.child_issues
                }));
            });
          }

          // Accumulate to current session cache
          for (const fileName in perFileResults) {
            const hash = currentHashes[fileName];
            if (hash) {
              currentCache[hash] = perFileResults[fileName];
            }
          }
          saveCache(currentCache);

          finalBatchResults.push(result);
        }
      }

      const merged = mergeResults(finalBatchResults);
      merged.summary.detectors_evaluated = TOTAL_DETECTOR_COUNT;
      merged.summary.detectors_skipped = 0;
      merged.summary.analysis_agents_run = ANALYSIS_AGENT_COUNT;
      merged.summary.analysis_agent_passes = completedAgentPasses;

      // Perform final taxonomy enrichment and collect diagnostics
      if (merged.issues) {
        merged.issues = merged.issues.map((issue) => {
          const taxonomyNormalized = normalizeIssueFromDetector(issue, diagnostics);
          const anchoredIssue = enrichIssueWithMarkdownIndex(taxonomyNormalized, markdownIndex, diagnostics);
          return enrichIssueWithProjectGraph(anchoredIssue, projectGraph, diagnostics);
        });
        merged.issues = deduplicateIssues(merged.issues);
        merged.summary.total = merged.issues.length;
        merged.summary.critical = merged.issues.filter((issue) => issue.severity === 'critical').length;
        merged.summary.high = merged.issues.filter((issue) => issue.severity === 'high').length;
        merged.summary.medium = merged.issues.filter((issue) => issue.severity === 'medium').length;
        merged.summary.low = merged.issues.filter((issue) => issue.severity === 'low').length;
      }
      diagnostics.analysis_mesh_passes_completed = completedAgentPasses;
      diagnostics.agent_findings_merged_count = Math.max(
        0,
        finalBatchResults.reduce((sum, result) => sum + (result._rawIssueCount || result.issues?.length || 0), 0) - (merged.issues?.length || 0)
      );
      setTaxonomyDiagnostics(diagnostics);
      setAnalysisStats({ reused: reusedCount, reanalyzed: reanalyzedCount, agentPasses: completedAgentPasses });

      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      if (merged.issues) {
        merged.issues.sort((a, b) => {
          const sevDiff = (severityOrder[a.severity] ?? 4) - (severityOrder[b.severity] ?? 4);
          if (sevDiff !== 0) return sevDiff;
          return (a.category || '').localeCompare(b.category || '');
        });
      }

      setResults(merged);
      
      // Auto-save to history
      const historyMetadata = buildHistoryMetadata(merged, files, config);
      const historySession = buildSessionData({ results: merged, taxonomyDiagnostics: diagnostics, files, config });
      await window.electronAPI.addHistorySession({ metadata: historyMetadata, session: historySession });
      await window.electronAPI.pruneHistory(50);
      const updatedHistory = await window.electronAPI.listHistory();
      setHistoryList(updatedHistory);

      if (capturedPrevious) {
        setDiffSummary(compareAudits(merged, capturedPrevious));
      } else {
        setDiffSummary(null);
      }
    } catch (err) {
      if (
        diagnostics.agent_failure_events.length > 0 ||
        diagnostics.warnings.length > 0 ||
        diagnostics.analysis_mesh_passes_completed > 0
      ) {
        setTaxonomyDiagnostics(diagnostics);
      }
      const diagnosticSuffix = diagnostics.last_agent_failure
        ? ' See Analysis Diagnostics below for the captured malformed agent response preview.'
        : '';
      setError(`Analysis error: ${err.message}${diagnosticSuffix}`);
    }

    setAnalyzing(false);
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
  };

  const handleSaveSettings = async (newConfig) => {
    await window.electronAPI.writeConfig(newConfig);
    setConfig(newConfig);
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
          (issue.contract_step || '').toLowerCase().includes(query) ||
          (issue.invariant_broken || '').toLowerCase().includes(query) ||
          (issue.authority_boundary || '').toLowerCase().includes(query) ||
          (issue.constraint_reference || '').toLowerCase().includes(query) ||
          (issue.violation_reference || '').toLowerCase().includes(query) ||
          (issue.analysis_agent || '').toLowerCase().includes(query) ||
          (issue.analysis_agents || []).some((agent) => agent.toLowerCase().includes(query)) ||
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
    if (!results) return;
    const exportData = buildExportData(results, taxonomyDiagnostics);
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-results-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportMenuOpen(false);
  };

  const exportMarkdown = () => {
    if (!results) return;

    const generatedAt = new Date().toLocaleString();
    let md = '';

    if (brandIconDataUrl) {
      md += `![${BRAND_NAME} Icon](${brandIconDataUrl})\n\n`;
    }

    md += `# ${BRAND_NAME}\n\n`;
    md += `> ${BRAND_TAGLINE}\n>\n> Generated ${generatedAt}\n\n`;
    md += `## Audit Report Summary\n\n`;
    md += `- **Total Issues:** ${results.summary.total}\n`;
    md += `- **Critical:** ${results.summary.critical}\n`;
    md += `- **High:** ${results.summary.high}\n`;
    md += `- **Medium:** ${results.summary.medium}\n`;
    md += `- **Low:** ${results.summary.low}\n`;
    md += `- **Files Analyzed:** ${results.summary.files_analyzed}\n`;
    md += `- **Analysis Mesh:** ${ANALYSIS_AGENT_COUNT} deterministic agents\n`;
    if (results.summary.analysis_agent_passes > 0) {
      md += `- **Agent Passes:** ${results.summary.analysis_agent_passes}\n`;
    }
    md += `\n`;
    
    md += `## Issues\n\n`;
    (results.issues || []).forEach((issue, i) => {
      md += `### ${i + 1}. [${issue.severity?.toUpperCase()}] ${issue.description}\n\n`;
      md += `**Detector ID:** ${issue.detector_id || 'N/A'}\n`;
      if (issue.detector_name) md += `**Detector Name:** ${issue.detector_name}\n`;
      md += `**Category:** ${issue.category}\n`;
      if (issue.subcategory) md += `**Subcategory:** ${issue.subcategory}\n`;
      if (issue.failure_type) md += `**Failure Type:** ${issue.failure_type}\n`;
      if (issue.contract_step) md += `**Contract Step:** ${issue.contract_step}\n`;
      if (issue.invariant_broken) md += `**Invariant Broken:** ${issue.invariant_broken}\n`;
      if (issue.authority_boundary) md += `**Authority Boundary:** ${issue.authority_boundary}\n`;
      if (issue.constraint_reference) md += `**Constraint Reference:** ${issue.constraint_reference}\n`;
      if (issue.violation_reference) md += `**Violation Reference:** ${issue.violation_reference}\n`;
      if (issue.closed_world_status) md += `**Closed World Status:** ${issue.closed_world_status}\n`;
      if (issue.analysis_agents?.length) md += `**Analysis Agents:** ${issue.analysis_agents.join(', ')}\n`;
      if (issue.section) md += `**Section:** ${issue.section}\n`;
      if (issue.section_slug) md += `**Section Slug:** ${issue.section_slug}\n`;
      if (issue.line_number) md += `**Line:** ${issue.line_number}${issue.line_end ? `-${issue.line_end}` : ''}\n`;
      if (issue.document_anchor) md += `**Document Anchor:** ${issue.document_anchor}\n`;
      if (issue.document_anchors?.length > 1) md += `**Additional Anchors:** ${issue.document_anchors.slice(1).join(', ')}\n`;
      if (issue.anchor_source) md += `**Anchor Source:** ${issue.anchor_source}\n`;
      if (issue.detection_source) md += `**Detection Source:** ${issue.detection_source}\n`;
      if (issue.root_cause_id) md += `**Root Cause ID:** ${issue.root_cause_id}\n`;
      md += `**Files:** ${(issue.files || []).join(', ')}\n\n`;

      if (issue.cross_file_links?.length > 0) {
        md += `**Cross-File Links:**\n`;
        issue.cross_file_links.forEach((link) => {
          const parts = [link.type, link.file, link.section, link.target].filter(Boolean);
          md += `- ${link.label || 'Related location'}${parts.length ? ` (${parts.join(' · ')})` : ''}\n`;
        });
        md += `\n`;
      }
      
      if (issue.why_triggered) {
        md += `**Why Triggered:** ${issue.why_triggered}\n\n`;
      }

      if (issue.escalation_reason) {
        md += `**Escalation Reason:** ${issue.escalation_reason}\n\n`;
      }

      if (issue.deterministic_fix) {
        md += `**Deterministic Fix:** ${issue.deterministic_fix}\n\n`;
      }
      
      if (issue.recommended_fix) {
        md += `**Recommended Fix:** ${issue.recommended_fix}\n\n`;
      }
      
      if (issue.fix_steps && issue.fix_steps.length > 0) {
        md += `**Fix Steps:**\n`;
        issue.fix_steps.forEach((step, idx) => {
          md += `${idx + 1}. ${step}\n`;
        });
        md += `\n`;
      }

      if (issue.verification_steps && issue.verification_steps.length > 0) {
        md += `**Verification Steps:**\n`;
        issue.verification_steps.forEach((step, idx) => {
          md += `- ${step}\n`;
        });
        md += `\n`;
      }
      
      if (issue.evidence) md += `**Evidence:**\n\`\`\`\n${issue.evidence}\n\`\`\`\n\n`;
      md += `---\n\n`;
    });

    if (results.root_causes && results.root_causes.length > 0) {
      md += `## Root Cause Summary\n\n`;
      results.root_causes.forEach((rc) => {
        md += `### ${rc.title} [ID: ${rc.id}]\n\n`;
        md += `**Impact:** ${rc.impact}\n\n`;
        md += `${rc.description}\n\n`;
        md += `**Child Issues:** ${(rc.child_issues || []).join(', ')}\n\n`;
        md += `---\n\n`;
      });
    }

    if (taxonomyDiagnostics) {
      md += `## Taxonomy Diagnostics\n\n`;
      md += `- **Enriched Issues:** ${taxonomyDiagnostics.normalized_from_detector_count}\n`;
      md += `- **Parsed Detector IDs:** ${taxonomyDiagnostics.detector_id_parsed_from_description_count}\n`;
      md += `- **Unknown Detector IDs:** ${taxonomyDiagnostics.unknown_detector_id_count}\n`;
      md += `- **Severity Clamped:** ${taxonomyDiagnostics.severity_clamped_count}\n`;
      md += `- **Indexed Documents:** ${taxonomyDiagnostics.indexed_document_count || 0}\n`;
      md += `- **Indexed Headings:** ${taxonomyDiagnostics.indexed_heading_count || 0}\n`;
      md += `- **Project Graph Documents:** ${taxonomyDiagnostics.project_graph_document_count || 0}\n`;
      md += `- **Project Graph Heading Groups:** ${taxonomyDiagnostics.project_graph_heading_group_count || 0}\n`;
      md += `- **Project Graph Glossary Groups:** ${taxonomyDiagnostics.project_graph_glossary_term_group_count || 0}\n`;
      md += `- **Project Graph Identifier Groups:** ${taxonomyDiagnostics.project_graph_identifier_group_count || 0}\n`;
      md += `- **Project Graph Workflow Groups:** ${taxonomyDiagnostics.project_graph_workflow_group_count || 0}\n`;
      md += `- **Deterministic Anchor Enrichments:** ${taxonomyDiagnostics.deterministic_anchor_enrichment_count || 0}\n`;
      md += `- **Deterministic File Assignments:** ${taxonomyDiagnostics.deterministic_file_assignment_count || 0}\n`;
      md += `- **Deterministic Section Assignments:** ${taxonomyDiagnostics.deterministic_section_assignment_count || 0}\n`;
      md += `- **Deterministic Line Assignments:** ${taxonomyDiagnostics.deterministic_line_assignment_count || 0}\n`;
      md += `- **Deterministic Multi-Anchor Assignments:** ${taxonomyDiagnostics.deterministic_multi_anchor_count || 0}\n`;
      md += `- **Deterministic Fallback Anchors:** ${taxonomyDiagnostics.deterministic_fallback_anchor_count || 0}\n`;
      md += `- **Deterministic Graph Link Enrichments:** ${taxonomyDiagnostics.deterministic_graph_link_enrichment_count || 0}\n`;
      md += `- **Configured Analysis Agents:** ${taxonomyDiagnostics.analysis_mesh_agents_configured}\n`;
      md += `- **Completed Agent Passes:** ${taxonomyDiagnostics.analysis_mesh_passes_completed}\n`;
      md += `- **Merged Agent Findings:** ${taxonomyDiagnostics.agent_findings_merged_count}\n`;
      md += `- **Malformed Agent Responses:** ${taxonomyDiagnostics.malformed_agent_response_count || 0}\n`;
      md += `- **Malformed Response Retries:** ${taxonomyDiagnostics.malformed_agent_retry_count || 0}\n`;
      md += `- **Recovered Agent Responses:** ${taxonomyDiagnostics.recovered_agent_response_count || 0}\n`;
      md += `- **Skipped Agent Passes:** ${taxonomyDiagnostics.skipped_agent_pass_count || 0}\n`;
      if (taxonomyDiagnostics.total_issues_loaded > 0) {
        md += `- **Total Issues Loaded:** ${taxonomyDiagnostics.total_issues_loaded}\n`;
      }
      md += `\n`;

      if (taxonomyDiagnostics.agent_failure_events?.length) {
        md += `### Captured Malformed Agent Responses\n\n`;
        taxonomyDiagnostics.agent_failure_events.forEach((event, index) => {
          md += `#### ${index + 1}. ${event.agent_label || event.agent_id || 'Unknown Agent'}\n\n`;
          md += `- **Batch:** ${event.batch_index || '?'}${event.batch_count ? `/${event.batch_count}` : ''}\n`;
          md += `- **Attempt:** ${event.attempt}\n`;
          md += `- **Stage:** ${event.stage}\n`;
          md += `- **Message:** ${event.message}\n`;
          if (event.recovered) {
            md += `- **Recovered On Attempt:** ${event.recovered_on_attempt || event.attempt}\n`;
          }
          if (event.raw_response_excerpt) {
            md += `\n\`\`\`text\n${event.raw_response_excerpt}\n\`\`\`\n\n`;
          } else {
            md += `\n`;
          }
        });
      }
    }
    
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-report-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    setExportMenuOpen(false);
  };

  const exportCSV = () => {
    if (!results) return;
    const headers = ['ID', 'DetectorID', 'DetectorName', 'Severity', 'Category', 'Subcategory', 'FailureType', 'ContractStep', 'InvariantBroken', 'AuthorityBoundary', 'ConstraintReference', 'ViolationReference', 'ClosedWorldStatus', 'AnalysisAgents', 'Section', 'SectionSlug', 'Line', 'LineEnd', 'DocumentAnchor', 'DocumentAnchors', 'AnchorSource', 'DetectionSource', 'CrossFileLinks', 'RootCauseID', 'Description', 'WhyTriggered', 'EscalationReason', 'DeterministicFix', 'RecommendedFix', 'FixSteps', 'VerificationSteps', 'Effort', 'Evidence', 'Confidence', 'Impact', 'Difficulty', 'Files', 'Tags'];
    const rows = (results.issues || []).map((issue) => [
      issue.id || '',
      issue.detector_id || '',
      `"${(issue.detector_name || '').replace(/"/g, '""')}"`,
      issue.severity || '',
      issue.category || '',
      `"${(issue.subcategory || '').replace(/"/g, '""')}"`,
      issue.failure_type || '',
      issue.contract_step || '',
      `"${(issue.invariant_broken || '').replace(/"/g, '""')}"`,
      `"${(issue.authority_boundary || '').replace(/"/g, '""')}"`,
      `"${(issue.constraint_reference || '').replace(/"/g, '""')}"`,
      `"${(issue.violation_reference || '').replace(/"/g, '""')}"`,
      issue.closed_world_status || '',
      `"${((issue.analysis_agents || (issue.analysis_agent ? [issue.analysis_agent] : []))).join(' | ').replace(/"/g, '""')}"`,
      issue.section || '',
      issue.section_slug || '',
      issue.line_number || '',
      issue.line_end || '',
      `"${(issue.document_anchor || '').replace(/"/g, '""')}"`,
      `"${(issue.document_anchors || []).join(' | ').replace(/"/g, '""')}"`,
      issue.anchor_source || '',
      issue.detection_source || '',
      `"${(issue.cross_file_links || []).map((link) => [link.label, link.target].filter(Boolean).join(' -> ')).join(' | ').replace(/"/g, '""')}"`,
      issue.root_cause_id || '',
      `"${(issue.description || '').replace(/"/g, '""')}"`,
      `"${(issue.why_triggered || '').replace(/"/g, '""')}"`,
      `"${(issue.escalation_reason || '').replace(/"/g, '""')}"`,
      `"${(issue.deterministic_fix || '').replace(/"/g, '""')}"`,
      `"${(issue.recommended_fix || '').replace(/"/g, '""')}"`,
      `"${(issue.fix_steps || []).join(' | ').replace(/"/g, '""')}"`,
      `"${(issue.verification_steps || []).join(' | ').replace(/"/g, '""')}"`,
      issue.estimated_effort || '',
      `"${(issue.evidence || '').replace(/"/g, '""')}"`,
      issue.confidence || '',
      issue.impact_score || '',
      issue.fix_difficulty || '',
      `"${(issue.files || []).join(', ')}"`,
      `"${(issue.tags || []).join(', ')}"`
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-results-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExportMenuOpen(false);
  };

  const saveSession = () => {
    if (!results) return;
    const session = buildSessionData({ results, taxonomyDiagnostics, files, config });
    const blob = new Blob([JSON.stringify(session, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-session-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
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
          const rawSession = JSON.parse(event.target.result);
          const session = normalizeLoadedSession(rawSession);
          if (session.results) {
            setFiles(normalizeFileDisplayNames(session.files || []));
            setResults(session.results);
            setTaxonomyDiagnostics(session.taxonomyDiagnostics);
            setError(null);
            setDiffSummary(null);
            setDiffMode(false);
          }
        } catch (e) {
          setError('Failed to load session: Invalid JSON');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleClearHistory = async () => {
    await window.electronAPI.clearHistory();
    setHistoryList([]);
  };

  const handleDeleteHistory = async (id) => {
    await window.electronAPI.deleteHistorySession(id);
    const updated = await window.electronAPI.listHistory();
    setHistoryList(updated);
  };

  const handleUpdateHistoryEntry = async (id, updates) => {
    await window.electronAPI.updateHistorySession(id, updates);
    const updated = await window.electronAPI.listHistory();
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
    const session = await window.electronAPI.readHistorySession(id);
    if (session) {
      const meta = historyList.find(e => e.id === id);
      const normalized = normalizeLoadedSession(normalizeHistorySessionPayload(session));
      setBaselineEntry({ id, results: normalized.results, title: meta?.title || 'Selected Baseline' });
    }
  };

  const handleCompareHistoryEntry = async (id) => {
    const session = await window.electronAPI.readHistorySession(id);
    if (!session) return;

    const targetNormalized = normalizeLoadedSession(normalizeHistorySessionPayload(session));
    const targetMeta = historyList.find(e => e.id === id);
    const targetTitle = targetMeta?.title || 'Selected Audit';

    if (baselineEntry) {
      // History-to-History comparison
      setDiffSummary(compareAudits(targetNormalized.results, baselineEntry.results));
      setContextWarning(`Comparing History: "${baselineEntry.title}" (Baseline) vs History: "${targetTitle}"`);
    } else if (results) {
      // Current-to-History comparison
      setDiffSummary(compareAudits(results, targetNormalized.results));
      setContextWarning(`Comparing Current Run vs History: "${targetTitle}"`);
    } else {
      alert('Please run an audit first or set a baseline from history to compare against.');
      return;
    }

    setDiffMode(true);
    setHistoryOpen(false);
  };

  const handleOpenHistoryEntry = async (id) => {
    const session = await window.electronAPI.readHistorySession(id);
    if (session) {
      const normalized = normalizeLoadedSession(normalizeHistorySessionPayload(session));
      setFiles(normalizeFileDisplayNames(normalized.files || []));
      setResults(normalized.results);
      setTaxonomyDiagnostics(normalized.taxonomyDiagnostics);
      setError(null);
      setDiffSummary(null);
      setDiffMode(false);
      setHistoryOpen(false);
    }
  };

  const saveToHistory = async () => {
    if (!results) return;
    const historyMetadata = buildHistoryMetadata(results, files, config, 'imported_session');
    const historySession = buildSessionData({ results, taxonomyDiagnostics, files, config });
    await window.electronAPI.addHistorySession({ metadata: historyMetadata, session: historySession });
    
    // Prune history to keep only last 50 entries
    await window.electronAPI.pruneHistory(50);
    
    const updatedHistory = await window.electronAPI.listHistory();
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
                  📂 Load Session
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
            <ProgressPanel model={config.model} baseURL={config.baseURL} />
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
                {results.summary?.detectors_evaluated !== undefined && (
                  <p className="text-xs text-[#6B7280] mt-1">
                    Detectors: {results.summary.detectors_evaluated}/{TOTAL_DETECTOR_COUNT} evaluated
                    {results.summary.detectors_skipped > 0 && ` - ${results.summary.detectors_skipped} skipped`}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={saveSession}
                  className="px-3 py-2 bg-[#1F2937] hover:bg-[#283548] border border-[#374151] rounded-lg text-sm transition-colors"
                  title="Export session to JSON file"
                >
                  💾 Export JSON
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
                    📤 Export
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
                  ← New audit
                </button>
              </div>
            </div>

            <SummaryDashboard summary={results.summary} />
            
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


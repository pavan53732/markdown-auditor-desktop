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
import { buildSystemPrompt } from './lib/systemPrompt';
import { repairJSON, validateResults } from './lib/jsonRepair';
import { DOMAIN_PROFILES } from './lib/domainProfiles';
import { 
  normalizeIssueFromDetector, 
  getAvailableSubcategories,
  createInitialDiagnostics,
  buildExportData,
  buildSessionData,
  normalizeLoadedSession
} from './lib/detectorMetadata';

const MAX_SAFE_TOKENS = 6000;
const CHARS_PER_TOKEN = 4;
const BATCH_TOKEN_BUFFER = 1000;
const MIN_CHUNK_CHARS = 1200;

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
  const [groupingMode, setGroupingMode] = useState('flat'); // flat, file, severity, layer, root_cause
  const [diffMode, setDiffMode] = useState(false);
  const [domainProfile, setDomainProfile] = useState('auto');
  const [previousResults, setPreviousResults] = useState(null);
  const [diffSummary, setDiffSummary] = useState(null);
  const [taxonomyDiagnostics, setTaxonomyDiagnostics] = useState(null);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [contextWarning, setContextWarning] = useState(null);
  const [fileHashes, setFileHashes] = useState({});
  const [cachedResults, setCachedResults] = useState({}); // { hash: { issues, summary } }
  const [analysisStats, setAnalysisStats] = useState({ reused: 0, reanalyzed: 0 });

  useEffect(() => {
    window.electronAPI.readConfig().then((cfg) => {
      setConfig(cfg);
      setConfigLoaded(true);
    });
    
    // Load cached results from localStorage for persistence
    const savedCache = localStorage.getItem('audit_cache');
    if (savedCache) {
      try {
        setCachedResults(JSON.parse(savedCache));
      } catch (e) {
        console.error('Failed to load audit cache', e);
      }
    }
  }, []);

  const saveCache = useCallback((newCache) => {
    setCachedResults(newCache);
    localStorage.setItem('audit_cache', JSON.stringify(newCache));
  }, []);

  const calculateHash = async (text) => {
    const msgUint8 = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const providerConfigured = !!(config.baseURL && config.apiKey && config.model);
  const canAnalyze = !!(config.baseURL && config.model);

  const estimateTokens = useCallback((fileList, profile = domainProfile) => {
    const prompt = buildSystemPrompt(profile);
    const systemTokens = Math.ceil(prompt.length / CHARS_PER_TOKEN);
    const userTokens = fileList.reduce((sum, f) => sum + Math.ceil(f.content.length / CHARS_PER_TOKEN), 0);
    return { systemTokens, userTokens, total: systemTokens + userTokens };
  }, [domainProfile]);

  useEffect(() => {
    if (files.length > 0) {
      const { total } = estimateTokens(files);
      if (total > MAX_SAFE_TOKENS) {
        setContextWarning(`Warning: Estimated ${total.toLocaleString()} tokens exceeds safe limit (${MAX_SAFE_TOKENS.toLocaleString()}). Files will be batched into multiple API calls.`);
      } else {
        setContextWarning(null);
      }
    } else {
      setContextWarning(null);
    }
  }, [files, estimateTokens]);

  const handleFilesDropped = useCallback((newFiles) => {
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleRemoveFile = useCallback((index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const getAvailableTokens = useCallback(() => {
    const prompt = buildSystemPrompt(domainProfile);
    const systemTokens = Math.ceil(prompt.length / CHARS_PER_TOKEN);
    return Math.max(1, MAX_SAFE_TOKENS - systemTokens - BATCH_TOKEN_BUFFER);
  }, [domainProfile]);

  const splitOversizedFile = useCallback((file, maxTokens) => {
    const fileTokens = Math.ceil(file.content.length / CHARS_PER_TOKEN);
    const baseFile = {
      ...file,
      sourceName: file.name
    };

    if (fileTokens <= maxTokens) {
      return [{
        ...baseFile,
        chunkIndex: 1,
        chunkCount: 1,
        lineStart: 1,
        lineEnd: Math.max(1, file.content.split('\n').length),
        isChunked: false
      }];
    }

    if (!file.content) {
      return [{
        ...baseFile,
        chunkIndex: 1,
        chunkCount: 1,
        lineStart: 1,
        lineEnd: 1,
        isChunked: false
      }];
    }

    const maxChars = Math.max(MIN_CHUNK_CHARS, maxTokens * CHARS_PER_TOKEN);
    const overlapChars = Math.floor(maxChars * 0.1); // 10% overlap
    const rawChunks = [];
    let start = 0;
    let lineStart = 1;

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
      lineStart = lineEnd + 1; // This line is not entirely accurate with overlap, but it provides a rough estimate.
    }

    const chunkCount = rawChunks.length;
    return rawChunks.map((chunk, index) => ({
      ...chunk,
      name: `${file.name} [chunk ${index + 1}/${chunkCount}, lines ${chunk.lineStart}-${chunk.lineEnd}]`,
      chunkIndex: index + 1,
      chunkCount,
      isChunked: true
    }));
  }, []);

  const batchFiles = useCallback((fileList) => {
    const availableTokens = getAvailableTokens();
    const preparedFiles = fileList.flatMap((file) => splitOversizedFile(file, availableTokens));
    
    const batches = [];
    let currentBatch = [];
    let currentTokens = 0;
    
    for (const file of preparedFiles) {
      const fileTokens = Math.ceil(file.content.length / CHARS_PER_TOKEN);
      
      if (currentTokens + fileTokens > availableTokens && currentBatch.length > 0) {
        batches.push(currentBatch);
        currentBatch = [file];
        currentTokens = fileTokens;
      } else {
        currentBatch.push(file);
        currentTokens += fileTokens;
      }
    }
    
    if (currentBatch.length > 0) {
      batches.push(currentBatch);
    }
    
    return batches;
  }, [getAvailableTokens, splitOversizedFile]);

  const analyzeBatch = async (batch, batchIndex, totalBatches) => {
    const userMessage = batch
      .map((f) => `=== FILE: ${f.name} ===\n\n${f.content}\n\n${'─'.repeat(60)}\n`)
      .join('');

    const response = await window.electronAPI.callAPI({
      baseURL: config.baseURL,
      apiKey: config.apiKey,
      model: config.model,
      systemPrompt: buildSystemPrompt(domainProfile),
      userMessage,
      timeout: config.timeout,
      retries: config.retries
    });

    if (!response.success) {
      throw new Error(`Batch ${batchIndex + 1}/${totalBatches} failed: ${response.error}`);
    }

    let parsed;
    try {
      parsed = repairJSON(response.raw);
      validateResults(parsed);
    } catch (e) {
      throw new Error(`Batch ${batchIndex + 1}/${totalBatches}: ${e.message}`);
    }

    if (parsed.summary) {
      console.log(`[Batch ${batchIndex + 1}/${totalBatches}] Detectors evaluated: ${parsed.summary.detectors_evaluated || 'N/A'}, Skipped: ${parsed.summary.detectors_skipped || 'N/A'}`);
    }

    // Taxonomy-aware normalization
    if (parsed.issues) {
      parsed.issues = parsed.issues.map(issue => normalizeIssueFromDetector(issue));
    }

    return {
      ...parsed,
      _sourceFiles: Array.from(new Set(batch.map((file) => file.sourceName || file.name)))
    };
  };

  // Post-merge severity escalation rules (applied across all batches)
  const applyPostMergeEscalation = (issues) => {
    const severityOrder = { critical: 3, high: 2, medium: 1, low: 0 };
    
    // Rule 1: ≥3 medium issues in same section → escalate all to high
    const sectionMediumCounts = {};
    issues.forEach(issue => {
      if (issue.severity === 'medium' && issue.section) {
        const key = `${issue.files?.[0]}::${issue.section}`;
        sectionMediumCounts[key] = (sectionMediumCounts[key] || []);
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

    // Rule 3: Security (L23) + Performance (L24) same component → escalate to critical
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

    // Rule 4: Completeness (L9) + Functional (L6) missing steps → escalate to high
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

    // Rule 5: Contradiction (L1) + Intent (L10) same content → escalate to high
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

    return issues;
  };

  // Simple hash function for description text
  const hashDescription = (text) => {
    if (!text) return '0';
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  };

  const getIssueIdentity = (issue) => {
    // Create unique key from detector ID, primary file, section, and line number
    // If line_number is missing, use a stable description+evidence fingerprint as fallback
    const detectorMatch = issue.description?.match(/\[L(\d+)-(\d+)\]/);
    const detectorId = issue.detector_id || (detectorMatch ? `L${detectorMatch[1]}-${detectorMatch[2]}` : 'unknown');
    const primaryFile = issue.files?.[0] || 'unknown';
    const section = issue.section || 'no-section';
    
    if (issue.line_number) {
      return `${detectorId}::${primaryFile}::${section}::${issue.line_number}`;
    }
    
    // Stable fingerprint fallback
    const description = normalizeIdentityText(issue.description);
    const evidenceSnippet = normalizeIdentityText(issue.evidence).slice(0, 240);
    const fingerprintSource = evidenceSnippet
      ? `${description}::${evidenceSnippet}`
      : description;

    return `${detectorId}::${primaryFile}::${section}::fp:${hashDescription(fingerprintSource)}`;
  };

  // Deduplication based on detector ID + file + section + line_number (or stable fallback fingerprint)
  const deduplicateIssues = (issues) => {
    const seen = new Map();
    const deduped = [];

    issues.forEach(issue => {
      const key = getIssueIdentity(issue);

      if (seen.has(key)) {
        // Merge related_issues from duplicate
        const existing = seen.get(key);
        if (issue.related_issues) {
          existing.related_issues = [...new Set([...(existing.related_issues || []), ...issue.related_issues])];
        }
        // Keep the higher severity
        const severityOrder = { critical: 3, high: 2, medium: 1, low: 0 };
        if (severityOrder[issue.severity] > severityOrder[existing.severity]) {
          existing.severity = issue.severity;
        }
      } else {
        seen.set(key, { ...issue });
        deduped.push(seen.get(key));
      }
    });

    return deduped;
  };

  // Cross-layer validation on merged result set
  const crossLayerValidation = (issues) => {
    const validated = [...issues];
    
    // Check for contradictions between Layer 1 (contradiction) and Layer 10 (intent)
    const contradictionIssues = validated.filter(i => i.category === 'contradiction');
    const intentIssues = validated.filter(i => i.category === 'intent');
    
    contradictionIssues.forEach(cIssue => {
      intentIssues.forEach(iIssue => {
        if (cIssue.section === iIssue.section && cIssue.files?.[0] === iIssue.files?.[0]) {
          if (!cIssue.description.includes('CROSS-LAYER')) {
            cIssue.description = `[CROSS-LAYER CONFLICT with Intent] ${cIssue.description}`;
            cIssue.related_issues = [...new Set([...(cIssue.related_issues || []), iIssue.id])];
          }
        }
      });
    });

    // Check for contradictions between Layer 6 (functional) and Layer 20 (execution_path)
    const functionalIssues = validated.filter(i => i.category === 'functional');
    const executionIssues = validated.filter(i => i.category === 'execution_path');
    
    functionalIssues.forEach(fIssue => {
      executionIssues.forEach(eIssue => {
        if (fIssue.section === eIssue.section && fIssue.files?.[0] === eIssue.files?.[0]) {
          if (!fIssue.description.includes('CROSS-LAYER')) {
            fIssue.description = `[CROSS-LAYER CONFLICT with Execution Path] ${fIssue.description}`;
            fIssue.related_issues = [...new Set([...(fIssue.related_issues || []), eIssue.id])];
          }
        }
      });
    });

    // Check for conflicts between Layer 23 (security) and Layer 24 (performance)
    const securityIssues = validated.filter(i => i.category === 'security');
    const performanceIssues = validated.filter(i => i.category === 'performance');
    
    securityIssues.forEach(sIssue => {
      performanceIssues.forEach(pIssue => {
        if (sIssue.files?.[0] === pIssue.files?.[0]) {
          if (!sIssue.description.includes('CROSS-LAYER')) {
            sIssue.description = `[CROSS-LAYER INTERACTION with Performance] ${sIssue.description}`;
            sIssue.related_issues = [...new Set([...(sIssue.related_issues || []), pIssue.id])];
          }
        }
      });
    });

    // Recount severity after all escalations
    const severityCounts = { critical: 0, high: 0, medium: 0, low: 0 };
    validated.forEach(issue => {
      if (severityCounts[issue.severity] !== undefined) {
        severityCounts[issue.severity]++;
      }
    });

    return { issues: validated, severityCounts };
  };

  const mergeResults = (batchResults) => {
    const merged = {
      summary: {
        total: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        files_analyzed: 0,
        layers_triggered: [],
        detectors_evaluated: 0,
        detectors_skipped: 0,
        overall_score: 0,
        improvement_priority: []
      },
      issues: []
    };

    let issueId = 1;
    const seenLayers = new Set();
    const seenDetectors = new Set(); // Track unique detectors across batches
    const uniqueFiles = new Set();
    let maxReportedDetectors = 0;

    for (const batch of batchResults) {
      if (batch.summary) {
        merged.summary.total += batch.summary.total || 0;
        merged.summary.critical += batch.summary.critical || 0;
        merged.summary.high += batch.summary.high || 0;
        merged.summary.medium += batch.summary.medium || 0;
        merged.summary.low += batch.summary.low || 0;
        merged.summary.detectors_skipped += batch.summary.detectors_skipped || 0;
        maxReportedDetectors = Math.max(maxReportedDetectors, batch.summary.detectors_evaluated || 0);
        
        // Track unique detectors from issues in this batch
        if (batch.issues) {
          batch.issues.forEach(issue => {
            const detectorMatch = issue.description?.match(/\[L(\d+)-(\d+)\]/);
            if (detectorMatch) {
              seenDetectors.add(`L${detectorMatch[1]}-${detectorMatch[2]}`);
            }
          });
        }
        
        (batch.summary.layers_triggered || []).forEach(l => seenLayers.add(l));
      }

      (batch._sourceFiles || []).forEach((fileName) => uniqueFiles.add(fileName));

      if (batch.issues) {
        for (const issue of batch.issues) {
          merged.issues.push({
            ...issue,
            id: String(issueId++)
          });
        }
      }
    }

    merged.summary.layers_triggered = Array.from(seenLayers);
    merged.summary.files_analyzed = uniqueFiles.size;

    // Set unique detector count (capped at 256)
    merged.summary.detectors_evaluated = Math.min(Math.max(seenDetectors.size, maxReportedDetectors), 256);

    // Step 1: Deduplicate issues across batches
    console.log(`[Merge] Before deduplication: ${merged.issues.length} issues`);
    merged.issues = deduplicateIssues(merged.issues);
    console.log(`[Merge] After deduplication: ${merged.issues.length} issues`);

    // Step 2: Apply post-merge severity escalation across all batches
    merged.issues = applyPostMergeEscalation(merged.issues);

    // Step 3: Run cross-layer validation on merged result set
    const { issues: validatedIssues, severityCounts } = crossLayerValidation(merged.issues);
    merged.issues = validatedIssues;
    
    // Update summary counts after escalation and validation
    merged.summary.critical = severityCounts.critical;
    merged.summary.high = severityCounts.high;
    merged.summary.medium = severityCounts.medium;
    merged.summary.low = severityCounts.low;
    merged.summary.total = merged.issues.length;

    console.log(`[Final] Unique detectors evaluated: ${merged.summary.detectors_evaluated}/256, Skipped: ${merged.summary.detectors_skipped}`);
    console.log(`[Final] Severity counts - Critical: ${merged.summary.critical}, High: ${merged.summary.high}, Medium: ${merged.summary.medium}, Low: ${merged.summary.low}`);

    return merged;
  };

  const compareAudits = (current, previous) => {
    if (!previous || !current) return null;
    
    const currIssuesMap = new Map();
    current.issues.forEach(i => currIssuesMap.set(getIssueIdentity(i), i));
    
    const prevIssuesMap = new Map();
    previous.issues.forEach(i => prevIssuesMap.set(getIssueIdentity(i), i));
    
    const newIssues = [];
    const resolvedIssues = [];
    const changedSeverity = [];
    const unchanged = [];
    
    // New and changed
    currIssuesMap.forEach((issue, id) => {
      if (!prevIssuesMap.has(id)) {
        newIssues.push({ ...issue, diffStatus: 'new' });
      } else {
        const prev = prevIssuesMap.get(id);
        if (issue.severity !== prev.severity) {
          changedSeverity.push({ ...issue, diffStatus: 'changed', prevSeverity: prev.severity });
        } else {
          unchanged.push({ ...issue, diffStatus: 'unchanged' });
        }
      }
    });
    
    // Resolved
    prevIssuesMap.forEach((issue, id) => {
      if (!currIssuesMap.has(id)) {
        resolvedIssues.push({ ...issue, diffStatus: 'resolved' });
      }
    });
    
    return {
      new: newIssues,
      resolved: resolvedIssues,
      changed: changedSeverity,
      unchanged,
      totalNew: newIssues.length,
      totalResolved: resolvedIssues.length,
      totalChanged: changedSeverity.length
    };
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
    setSearchQuery('');
    setAnalysisStats({ reused: 0, reanalyzed: 0 });

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
      setAnalysisStats({ reused: reusedCount, reanalyzed: reanalyzedCount });

      let finalBatchResults = [...reusedBatchResults];
      let currentCache = { ...cachedResults };

      if (filesToAnalyze.length > 0) {
        const { total } = estimateTokens(filesToAnalyze);
        if (config.tokenBudget && total > config.tokenBudget) {
          throw new Error(`Estimated ${total.toLocaleString()} tokens for new files exceeds session budget of ${config.tokenBudget.toLocaleString()}.`);
        }

        const batches = batchFiles(filesToAnalyze);
        
        for (let i = 0; i < batches.length; i++) {
          const result = await analyzeBatch(batches[i], i, batches.length);
          
          // Update cache for each file in this batch
          const perFileResults = {};
          batches[i].forEach(f => {
            perFileResults[f.sourceName || f.name] = {
              _sourceFiles: [f.sourceName || f.name],
              summary: { ...result.summary, total: 0, critical: 0, high: 0, medium: 0, low: 0 },
              issues: [],
              root_causes: result.root_causes || []
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

      // Perform final taxonomy enrichment and collect diagnostics
      const diagnostics = createInitialDiagnostics();
      if (merged.issues) {
        merged.issues = merged.issues.map(issue => normalizeIssueFromDetector(issue, diagnostics));
      }
      setTaxonomyDiagnostics(diagnostics);

      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      if (merged.issues) {
        merged.issues.sort((a, b) => {
          const sevDiff = (severityOrder[a.severity] ?? 4) - (severityOrder[b.severity] ?? 4);
          if (sevDiff !== 0) return sevDiff;
          return (a.category || '').localeCompare(b.category || '');
        });
      }

      setResults(merged);
      
      if (capturedPrevious) {
        setDiffSummary(compareAudits(merged, capturedPrevious));
      } else {
        setDiffSummary(null);
      }
    } catch (err) {
      setError(`Analysis error: ${err.message}`);
    }

    setAnalyzing(false);
  };

  const handleReset = () => {
    setFiles([]);
    setResults(null);
    setError(null);
    setActiveLayer('all');
    setSearchQuery('');
    setContextWarning(null);
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
          (issue.detector_id || '').toLowerCase().includes(query) ||
          (issue.detector_name || '').toLowerCase().includes(query) ||
          (issue.subcategory || '').toLowerCase().includes(query) ||
          (issue.files || []).some(f => f.toLowerCase().includes(query)) ||
          (issue.tags || []).some(t => t.toLowerCase().includes(query))
        );
      });
    }

    return filtered;
  }, [results?.issues, diffMode, diffSummary, searchQuery, activeLayer, activeSubcategory]);
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
    let md = `# Audit Results\n\n`;
    md += `**Date:** ${new Date().toLocaleDateString()}\n`;
    md += `**Model:** ${config.model}\n`;
    md += `**Files:** ${results.summary?.files_analyzed || 0}\n\n`;
    
    md += `## Summary\n\n`;
    md += `| Severity | Count |\n|----------|-------|\n`;
    md += `| Total | ${results.summary?.total || 0} |\n`;
    md += `| Critical | ${results.summary?.critical || 0} |\n`;
    md += `| High | ${results.summary?.high || 0} |\n`;
    md += `| Medium | ${results.summary?.medium || 0} |\n`;
    md += `| Low | ${results.summary?.low || 0} |\n\n`;
    
    if (results.summary?.detectors_evaluated) {
      md += `## Detector Coverage\n\n`;
      md += `| Metric | Count |\n|--------|-------|\n`;
      md += `| Detectors Evaluated | ${results.summary.detectors_evaluated} |\n`;
      md += `| Detectors Skipped | ${results.summary.detectors_skipped || 0} |\n`;
      md += `| Coverage | ${Math.round((results.summary.detectors_evaluated / 256) * 100)}% |\n\n`;
    }
    
    md += `## Issues\n\n`;
    (results.issues || []).forEach((issue, i) => {
      md += `### ${i + 1}. [${issue.severity?.toUpperCase()}] ${issue.description}\n\n`;
      md += `**Detector ID:** ${issue.detector_id || 'N/A'}\n`;
      if (issue.detector_name) md += `**Detector Name:** ${issue.detector_name}\n`;
      md += `**Category:** ${issue.category}\n`;
      if (issue.subcategory) md += `**Subcategory:** ${issue.subcategory}\n`;
      if (issue.section) md += `**Section:** ${issue.section}\n`;
      if (issue.line_number) md += `**Line:** ${issue.line_number}\n`;
      if (issue.root_cause_id) md += `**Root Cause ID:** ${issue.root_cause_id}\n`;
      md += `**Files:** ${(issue.files || []).join(', ')}\n\n`;
      
      if (issue.why_triggered) {
        md += `**Why Triggered:** ${issue.why_triggered}\n\n`;
      }

      if (issue.escalation_reason) {
        md += `**Escalation Reason:** ${issue.escalation_reason}\n\n`;
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
      if (taxonomyDiagnostics.total_issues_loaded > 0) {
        md += `- **Total Issues Loaded:** ${taxonomyDiagnostics.total_issues_loaded}\n`;
      }
      md += `\n`;
    }
    
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-results-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    setExportMenuOpen(false);
  };

  const exportCSV = () => {
    if (!results) return;
    const headers = ['ID', 'DetectorID', 'DetectorName', 'Severity', 'Category', 'Subcategory', 'Section', 'Line', 'RootCauseID', 'Description', 'Why Triggered', 'Escalation Reason', 'Recommended Fix', 'Fix Steps', 'Verification Steps', 'Effort', 'Evidence', 'Confidence', 'Impact', 'Difficulty', 'Files', 'Tags'];
    const rows = (results.issues || []).map((issue) => [
      issue.id || '',
      issue.detector_id || '',
      `"${(issue.detector_name || '').replace(/"/g, '""')}"`,
      issue.severity || '',
      issue.category || '',
      `"${(issue.subcategory || '').replace(/"/g, '""')}"`,
      issue.section || '',
      issue.line_number || '',
      issue.root_cause_id || '',
      `"${(issue.description || '').replace(/"/g, '""')}"`,
      `"${(issue.why_triggered || '').replace(/"/g, '""')}"`,
      `"${(issue.escalation_reason || '').replace(/"/g, '""')}"`,
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
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
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
            setFiles(session.files || []);
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

  return (
    <div className="h-screen flex flex-col bg-[#111827] text-[#F9FAFB] overflow-hidden">
      <TopBar
        providerConfigured={providerConfigured}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <SettingsModal
        open={settingsOpen}
        config={config}
        onSave={handleSaveSettings}
        onCancel={() => setSettingsOpen(false)}
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
            
            <div className="mt-6 flex flex-col items-center gap-4">
              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-widest">Profile:</label>
                <select
                  value={domainProfile}
                  onChange={(e) => setDomainProfile(e.target.value)}
                  className="bg-[#1F2937] border border-[#374151] rounded-lg text-sm text-[#F9FAFB] px-3 py-1.5 focus:outline-none focus:border-[#60A5FA] transition-colors"
                >
                  {Object.values(DOMAIN_PROFILES).map(p => (
                    <option key={p.id} value={p.id} title={p.description}>{p.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-center gap-3">
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
                  {results.summary?.files_analyzed || files.length} files analyzed · sorted by severity · model: {config.model}
                </p>
                {results.summary?.detectors_evaluated !== undefined && (
                  <p className="text-xs text-[#6B7280] mt-1">
                    Detectors: {results.summary.detectors_evaluated}/256 evaluated
                    {results.summary.detectors_skipped > 0 && ` · ${results.summary.detectors_skipped} skipped`}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={saveSession}
                  className="px-3 py-2 bg-[#1F2937] hover:bg-[#283548] border border-[#374151] rounded-lg text-sm transition-colors"
                  title="Save session"
                >
                  💾 Save
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

            {taxonomyDiagnostics && (
              <div className="mb-6 p-3 bg-[#111827] border border-[#374151] rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  <h3 className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Taxonomy Diagnostics</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
                </div>
              </div>
            )}

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

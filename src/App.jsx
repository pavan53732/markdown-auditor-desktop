import React, { useState, useEffect, useCallback, useMemo } from 'react';
import TopBar from './components/TopBar';
import SettingsModal from './components/SettingsModal';
import FileDropZone from './components/FileDropZone';
import AnalyzeButton from './components/AnalyzeButton';
import ProgressPanel from './components/ProgressPanel';
import SummaryDashboard from './components/SummaryDashboard';
import LayerFilterBar from './components/LayerFilterBar';
import IssueList from './components/IssueList';
import { SYSTEM_PROMPT } from './lib/systemPrompt';

const MAX_SAFE_TOKENS = 6000;
const CHARS_PER_TOKEN = 4;

export default function App() {
  const [config, setConfig] = useState({ baseURL: '', apiKey: '', model: '' });
  const [configLoaded, setConfigLoaded] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [activeLayer, setActiveLayer] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [contextWarning, setContextWarning] = useState(null);

  useEffect(() => {
    window.electronAPI.readConfig().then((cfg) => {
      setConfig(cfg);
      setConfigLoaded(true);
    });
  }, []);

  const providerConfigured = !!(config.baseURL && config.apiKey && config.model);
  const canAnalyze = !!(config.baseURL && config.model);

  const estimateTokens = useCallback((fileList) => {
    const systemTokens = Math.ceil(SYSTEM_PROMPT.length / CHARS_PER_TOKEN);
    const userTokens = fileList.reduce((sum, f) => sum + Math.ceil(f.content.length / CHARS_PER_TOKEN), 0);
    return { systemTokens, userTokens, total: systemTokens + userTokens };
  }, []);

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

  const batchFiles = useCallback((fileList) => {
    const systemTokens = Math.ceil(SYSTEM_PROMPT.length / CHARS_PER_TOKEN);
    const availableTokens = MAX_SAFE_TOKENS - systemTokens - 1000;
    
    const batches = [];
    let currentBatch = [];
    let currentTokens = 0;
    
    for (const file of fileList) {
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
  }, []);

  const analyzeBatch = async (batch, batchIndex, totalBatches) => {
    const userMessage = batch
      .map((f) => `=== FILE: ${f.name} ===\n\n${f.content}\n\n${'─'.repeat(60)}\n`)
      .join('');

    const response = await window.electronAPI.callAPI({
      baseURL: config.baseURL,
      apiKey: config.apiKey,
      model: config.model,
      systemPrompt: SYSTEM_PROMPT,
      userMessage
    });

    if (!response.success) {
      throw new Error(`Batch ${batchIndex + 1}/${totalBatches} failed: ${response.error}`);
    }

    let parsed;
    try {
      const raw = response.raw.replace(/```json|```/g, '').trim();
      parsed = JSON.parse(raw);
    } catch {
      throw new Error(`Batch ${batchIndex + 1}/${totalBatches}: Could not parse response`);
    }

    if (parsed.summary) {
      console.log(`[Batch ${batchIndex + 1}/${totalBatches}] Detectors evaluated: ${parsed.summary.detectors_evaluated || 'N/A'}, Skipped: ${parsed.summary.detectors_skipped || 'N/A'}`);
    }

    return parsed;
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
          issue.description = `[ESCALATED: ${group.length} medium issues in section] ${issue.description}`;
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
              issue.description = `[ESCALATED: Security + Performance interaction] ${issue.description}`;
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
            issue.description = `[ESCALATED: Completeness + Functional missing steps] ${issue.description}`;
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
            issue.description = `[ESCALATED: Contradiction + Intent conflict] ${issue.description}`;
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

  // Deduplication based on detector ID + file + section + line_number (or description hash)
  const deduplicateIssues = (issues) => {
    const seen = new Map();
    const deduped = [];

    issues.forEach(issue => {
      // Create unique key from detector ID, primary file, section, and line number
      // If line_number is missing, use description hash as fallback
      const detectorMatch = issue.description?.match(/\[L(\d+)-(\d+)\]/);
      const detectorId = detectorMatch ? `L${detectorMatch[1]}-${detectorMatch[2]}` : 'unknown';
      const primaryFile = issue.files?.[0] || 'unknown';
      const section = issue.section || 'no-section';
      const lineNumber = issue.line_number ? String(issue.line_number) : `hash:${hashDescription(issue.description)}`;
      const key = `${detectorId}::${primaryFile}::${section}::${lineNumber}`;

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
    if (batchResults.length === 1) return batchResults[0];

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

    for (const batch of batchResults) {
      if (batch.summary) {
        merged.summary.total += batch.summary.total || 0;
        merged.summary.critical += batch.summary.critical || 0;
        merged.summary.high += batch.summary.high || 0;
        merged.summary.medium += batch.summary.medium || 0;
        merged.summary.low += batch.summary.low || 0;
        merged.summary.files_analyzed += batch.summary.files_analyzed || 0;
        merged.summary.detectors_skipped += batch.summary.detectors_skipped || 0;
        
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

    // Set unique detector count (capped at 256)
    merged.summary.detectors_evaluated = Math.min(seenDetectors.size, 256);

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

  const handleAnalyze = async () => {
    if (files.length === 0 || !canAnalyze) return;
    setAnalyzing(true);
    setError(null);
    setResults(null);
    setActiveLayer('all');
    setSearchQuery('');

    try {
      const batches = batchFiles(files);
      const batchResults = [];
      
      for (let i = 0; i < batches.length; i++) {
        const result = await analyzeBatch(batches[i], i, batches.length);
        batchResults.push(result);
      }

      const merged = mergeResults(batchResults);

      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      if (merged.issues) {
        merged.issues.sort((a, b) => {
          const sevDiff = (severityOrder[a.severity] ?? 4) - (severityOrder[b.severity] ?? 4);
          if (sevDiff !== 0) return sevDiff;
          return (a.category || '').localeCompare(b.category || '');
        });
      }

      setResults(merged);
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
    if (!searchQuery.trim()) return results.issues;
    
    const query = searchQuery.toLowerCase();
    return results.issues.filter((issue) => {
      return (
        (issue.description || '').toLowerCase().includes(query) ||
        (issue.evidence || '').toLowerCase().includes(query) ||
        (issue.section || '').toLowerCase().includes(query) ||
        (issue.files || []).some(f => f.toLowerCase().includes(query)) ||
        (issue.tags || []).some(t => t.toLowerCase().includes(query))
      );
    });
  }, [results?.issues, searchQuery]);

  const exportJSON = () => {
    if (!results) return;
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
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
      md += `**Category:** ${issue.category}\n`;
      if (issue.section) md += `**Section:** ${issue.section}\n`;
      if (issue.line_number) md += `**Line:** ${issue.line_number}\n`;
      md += `**Files:** ${(issue.files || []).join(', ')}\n\n`;
      if (issue.evidence) md += `**Evidence:**\n\`\`\`\n${issue.evidence}\n\`\`\`\n\n`;
      md += `---\n\n`;
    });
    
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
    const headers = ['ID', 'Severity', 'Category', 'Section', 'Line', 'Description', 'Evidence', 'Confidence', 'Impact', 'Difficulty', 'Files', 'Tags'];
    const rows = (results.issues || []).map((issue) => [
      issue.id || '',
      issue.severity || '',
      issue.category || '',
      issue.section || '',
      issue.line_number || '',
      `"${(issue.description || '').replace(/"/g, '""')}"`,
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
    const session = {
      timestamp: new Date().toISOString(),
      config: { baseURL: config.baseURL, model: config.model },
      files: files.map(f => f.name),
      results
    };
    const blob = new Blob([JSON.stringify(session, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-session-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
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
            
            <div className="mt-6 flex justify-center">
              <AnalyzeButton
                fileCount={files.length}
                providerConfigured={canAnalyze}
                analyzing={analyzing}
                onClick={handleAnalyze}
              />
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

            <div className="mb-4">
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
              {searchQuery && (
                <p className="mt-1 text-xs text-[#6B7280]">
                  Showing {filteredIssues.length} of {results.issues?.length || 0} issues
                </p>
              )}
            </div>

            <LayerFilterBar
              issues={filteredIssues}
              activeLayer={activeLayer}
              onLayerChange={setActiveLayer}
            />

            <IssueList issues={filteredIssues} activeLayer={activeLayer} />

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
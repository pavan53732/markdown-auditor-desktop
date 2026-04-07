import React from 'react';

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
import DiagnosticsPanel from './components/DiagnosticsPanel';
import brandIconDataUrl from './assets/brand-icon.png?inline';

import { ANALYSIS_AGENT_COUNT } from './lib/analysisAgents';
import { TOTAL_DETECTOR_COUNT, getAvailableSubcategories } from './lib/detectorMetadata';
import { useAuditWorkbench } from './lib/useAuditWorkbench';

const BRAND_NAME = 'Markdown Intelligence Auditor';
const BRAND_TAGLINE = 'Deterministic Markdown specification auditing';

export default function App() {
  const {
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
  } = useAuditWorkbench({
    brandName: BRAND_NAME,
    brandTagline: BRAND_TAGLINE,
    brandIconDataUrl,
    totalDetectorCount: TOTAL_DETECTOR_COUNT
  });

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

            {error && taxonomyDiagnostics && (
              <DiagnosticsPanel taxonomyDiagnostics={taxonomyDiagnostics} mode="error" />
            )}
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
                  {results.summary?.files_analyzed || files.length} files analyzed - deterministic {ANALYSIS_AGENT_COUNT}-agent mesh - model: {config.model}
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
                  Save to History
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

            <DiagnosticsPanel taxonomyDiagnostics={taxonomyDiagnostics} />

            <div className="mb-4 flex flex-col gap-3">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search issues by description, evidence, tags..."
                  className="w-full px-4 py-2 pl-10 bg-[#1F2937] border border-[#374151] rounded-lg text-sm text-[#F9FAFB] placeholder-[#6B7280] focus:outline-none focus:border-[#60A5FA] transition-colors"
                />
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#9CA3AF]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
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
                  { id: 'root_cause', label: 'Root Cause' }
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
                {getAvailableSubcategories(activeLayer).map((subcategory) => (
                  <button
                    key={subcategory}
                    onClick={() => setActiveSubcategory(subcategory)}
                    className={`px-2 py-1 rounded text-[10px] font-medium border transition-all whitespace-nowrap ${
                      activeSubcategory === subcategory
                        ? 'bg-[#374151] border-[#4B5563] text-white'
                        : 'bg-transparent border-transparent text-[#6B7280] hover:text-[#9CA3AF]'
                    }`}
                  >
                    {subcategory.toUpperCase()}
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

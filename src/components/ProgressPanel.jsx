import React from 'react';
import { TOTAL_DETECTOR_COUNT } from '../lib/detectorMetadata';
import { TOTAL_LAYER_COUNT } from '../lib/layers';
import { ANALYSIS_AGENT_COUNT } from '../lib/analysisAgents';
import brandIcon from '../assets/brand-icon.png';

function getHostLabel(baseURL) {
  if (!baseURL) return 'unknown';
  try {
    return new URL(baseURL).host;
  } catch {
    return baseURL;
  }
}

const STAGE_ORDER = [
  { id: 'indexing', label: 'Indexing' },
  { id: 'project_graph', label: 'Project Graph' },
  { id: 'rule_engine', label: 'Rule Engine' },
  { id: 'agent_mesh', label: 'Agent Mesh' },
  { id: 'merge', label: 'Merge' },
  { id: 'finalize', label: 'Finalize' }
];

function buildMetricCards(progressState, analysisStats) {
  return [
    {
      label: 'Indexed Files',
      value: progressState.indexedFiles || progressState.totalFiles || 0,
      tone: '#F9FAFB'
    },
    {
      label: 'Graph Groups',
      value: progressState.graphGroups || 0,
      tone: '#C4B5FD'
    },
    {
      label: 'Rule Issues',
      value: progressState.deterministicRuleIssues || 0,
      tone: '#FDE68A'
    },
    {
      label: 'Proof Chains',
      value: progressState.proofChainEdges || 0,
      tone: '#A5F3FC'
    },
    {
      label: 'Owned Hits',
      value: progressState.ownedDetectorHits || 0,
      tone: '#22D3EE'
    },
    {
      label: 'Checked Owned',
      value: progressState.checkedOwnedDetectors || 0,
      tone: '#67E8F9'
    },
    {
      label: 'Clean Owned',
      value: progressState.cleanOwnedDetectors || 0,
      tone: '#86EFAC'
    },
    {
      label: 'Untouched',
      value: progressState.untouchedOwnedDetectors || 0,
      tone: '#E879F9'
    },
    {
      label: 'Cross-Scope',
      value: progressState.outOfOwnedScopeIssues || 0,
      tone: '#F59E0B'
    },
    {
      label: 'Agent Passes',
      value: `${progressState.completedAgentPasses || analysisStats.agentPasses || 0}/${progressState.totalAgentPasses || 0}`,
      tone: '#93C5FD'
    }
  ];
}

export default function ProgressPanel({
  model,
  baseURL,
  progressState,
  analysisStats
}) {
  const host = getHostLabel(baseURL);
  const activeStageIndex = Math.max(1, progressState?.stageIndex || 1);
  const stageCount = Math.max(1, progressState?.stageCount || STAGE_ORDER.length);
  const stagePercent = Math.min(100, Math.max(8, Math.round((activeStageIndex / stageCount) * 100)));
  const metricCards = buildMetricCards(progressState || {}, analysisStats || {});

  return (
    <div className="flex flex-col items-center py-10">
      <div className="w-full max-w-3xl space-y-6">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-[#2563EB]/25 blur-2xl rounded-full scale-110" />
            <img
              src={brandIcon}
              alt="Markdown Intelligence Auditor"
              className="relative w-20 h-20 rounded-[1.4rem] shadow-[0_24px_48px_rgba(0,0,0,0.35)]"
            />
          </div>
          <div className="w-12 h-12 border-4 border-[#374151] border-t-[#60A5FA] rounded-full animate-spin" />
        </div>

        <div className="text-center space-y-1">
          <p className="text-[#F9FAFB] text-base font-semibold">
            {progressState?.stageLabel || 'Analyzing'}
          </p>
          <p className="text-sm text-[#9CA3AF]">
            {progressState?.message || 'Running deterministic Markdown audit'}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-[#6B7280]">
            <span>Stage Progress</span>
            <span>{activeStageIndex}/{stageCount}</span>
          </div>
          <div className="w-full h-2 bg-[#374151] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#60A5FA] via-[#93C5FD] to-[#C4B5FD] rounded-full transition-all duration-500"
              style={{ width: `${stagePercent}%` }}
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
            {STAGE_ORDER.map((stage, index) => {
              const isActive = stage.id === progressState?.stage;
              const isComplete = index + 1 < activeStageIndex;
              return (
                <div
                  key={stage.id}
                  className={`rounded-lg border px-2 py-2 text-center text-[11px] ${
                    isActive
                      ? 'border-[#60A5FA] bg-[#0F172A] text-[#DBEAFE]'
                      : isComplete
                        ? 'border-[#1D4ED8] bg-[#111827] text-[#93C5FD]'
                        : 'border-[#374151] bg-[#1F2937] text-[#6B7280]'
                  }`}
                >
                  {stage.label}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
          {metricCards.map((card) => (
            <div key={card.label} className="bg-[#1F2937] border border-[#374151] rounded-xl px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.16em] text-[#6B7280] mb-1">{card.label}</p>
              <p className="text-lg font-semibold" style={{ color: card.tone }}>{card.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-[#111827] border border-[#374151] rounded-xl px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-[#6B7280] mb-1">Current Agent</p>
            <p className="text-sm text-[#F9FAFB] font-medium">
              {progressState?.currentAgentLabel || 'Preparing'}
            </p>
            {(progressState?.currentAgentOwnedLayers || progressState?.currentAgentOwnedDetectors) > 0 && (
              <p className="text-xs text-[#67E8F9] mt-1">
                Owns {progressState.currentAgentOwnedLayers || 0} layers / {progressState.currentAgentOwnedSubcategories || 0} subcats / {progressState.currentAgentOwnedDetectors || 0} detectors
              </p>
            )}
            {progressState?.currentBatch > 0 && (
              <p className="text-xs text-[#9CA3AF] mt-1">
                Batch {progressState.currentBatch}/{progressState.totalBatches || 1}
                {progressState.filesInCurrentBatch ? ` - ${progressState.filesInCurrentBatch} files/chunks` : ''}
              </p>
            )}
            {progressState?.currentAttempt > 0 && (
              <p className="text-xs text-[#6B7280] mt-1">
                Attempt {progressState.currentAttempt}/{progressState.maxAttempts || 1}
              </p>
            )}
          </div>

          <div className="bg-[#111827] border border-[#374151] rounded-xl px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-[#6B7280] mb-1">Project Graph</p>
            <p className="text-sm text-[#F9FAFB] font-medium">
              {progressState?.graphDocuments || 0} docs / {progressState?.graphGroups || 0} groups
            </p>
            <p className="text-xs text-[#9CA3AF] mt-1">
              {progressState?.graphReferences || 0} references traced
            </p>
          </div>

          <div className="bg-[#111827] border border-[#374151] rounded-xl px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-[#6B7280] mb-1">Mesh Scope</p>
            <p className="text-sm text-[#F9FAFB] font-medium">
              {TOTAL_LAYER_COUNT} layers / {TOTAL_DETECTOR_COUNT} detectors
            </p>
            <p className="text-xs text-[#9CA3AF] mt-1">
              {ANALYSIS_AGENT_COUNT}-agent deterministic mesh via {model} on {host}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

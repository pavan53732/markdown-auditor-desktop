import React from 'react';

const SEVERITY_CARDS = [
  { key: 'total', label: 'Total Issues', color: '#F9FAFB' },
  { key: 'critical', label: 'Critical', color: '#A32D2D' },
  { key: 'high', label: 'High', color: '#854F0B' },
  { key: 'medium', label: 'Medium', color: '#0C447C' },
  { key: 'low', label: 'Low', color: '#3B6D11' }
];

function buildRuntimeCards(summary, taxonomyDiagnostics, analysisStats, analysisMesh) {
  return [
    {
      label: 'Files',
      value: summary?.files_analyzed ?? 0,
      tone: '#F9FAFB'
    },
    {
      label: 'Rule Issues',
      value: summary?.deterministic_rule_issues ?? taxonomyDiagnostics?.deterministic_rule_issue_count ?? 0,
      tone: '#FDE68A'
    },
    {
      label: 'Graph Groups',
      value: summary?.project_graph_total_groups ?? taxonomyDiagnostics?.project_graph_total_group_count ?? 0,
      tone: '#C4B5FD'
    },
    {
      label: 'Graph Refs',
      value: summary?.project_graph_reference_count ?? taxonomyDiagnostics?.project_graph_reference_count ?? 0,
      tone: '#F9A8D4'
    },
    {
      label: 'Proof Chains',
      value: summary?.proof_chain_edges ?? taxonomyDiagnostics?.proof_chain_edge_count ?? 0,
      tone: '#A5F3FC'
    },
    {
      label: 'Agent Passes',
      value: summary?.analysis_agent_passes ?? analysisStats?.agentPasses ?? 0,
      tone: '#93C5FD'
    },
    {
      label: 'Focus Hits',
      value: summary?.analysis_mesh_focus_layer_hits ?? taxonomyDiagnostics?.analysis_mesh_focus_layer_hit_count ?? 0,
      tone: '#86EFAC'
    },
    {
      label: 'Owned Hits',
      value: summary?.analysis_mesh_owned_detector_finding_coverage
        ?? taxonomyDiagnostics?.analysis_mesh_coverage_reconciliation?.finding_backed_detector_count
        ?? taxonomyDiagnostics?.analysis_mesh_owned_detector_hit_count
        ?? 0,
      tone: '#22D3EE'
    },
    {
      label: 'Checked Owned',
      value: summary?.analysis_mesh_owned_detector_checked_count
        ?? taxonomyDiagnostics?.analysis_mesh_coverage_reconciliation?.checked_detector_count
        ?? taxonomyDiagnostics?.analysis_mesh_owned_detector_checked_count
        ?? 0,
      tone: '#67E8F9'
    },
    {
      label: 'Clean Owned',
      value: summary?.analysis_mesh_owned_detector_clean_count
        ?? taxonomyDiagnostics?.analysis_mesh_coverage_reconciliation?.checked_clean_detector_count
        ?? taxonomyDiagnostics?.analysis_mesh_owned_detector_clean_count
        ?? 0,
      tone: '#86EFAC'
    },
    {
      label: 'Quiet Owned',
      value: summary?.analysis_mesh_owned_detector_quiet_count ?? taxonomyDiagnostics?.analysis_mesh_owned_detector_quiet_count ?? 0,
      tone: '#C4B5FD'
    },
    {
      label: 'Untouched Owned',
      value: summary?.analysis_mesh_owned_detector_untouched_count
        ?? taxonomyDiagnostics?.analysis_mesh_coverage_reconciliation?.untouched_detector_count
        ?? taxonomyDiagnostics?.analysis_mesh_owned_detector_untouched_count
        ?? 0,
      tone: '#E879F9'
    },
    {
      label: 'Cross-Scope',
      value: summary?.analysis_mesh_out_of_owned_scope_issues ?? taxonomyDiagnostics?.analysis_mesh_out_of_owned_scope_issue_count ?? 0,
      tone: '#F59E0B'
    },
    {
      label: 'Timeout Skips',
      value: summary?.timeout_agent_passes ?? taxonomyDiagnostics?.timeout_agent_pass_count ?? 0,
      tone: '#FB923C'
    },
    {
      label: 'Focus Subcats',
      value: summary?.analysis_mesh_focus_subcategory_hits ?? taxonomyDiagnostics?.analysis_mesh_focus_subcategory_hit_count ?? 0,
      tone: '#A5F3FC'
    },
    {
      label: 'Mesh Warnings',
      value: summary?.analysis_mesh_validation_warnings ?? taxonomyDiagnostics?.analysis_mesh_validation_warning_count ?? 0,
      tone: '#FCA5A5'
    },
    {
      label: 'Merged',
      value: taxonomyDiagnostics?.agent_findings_merged_count ?? 0,
      tone: '#FDBA74'
    },
    {
      label: 'Reused',
      value: analysisStats?.reused ?? 0,
      tone: '#C4B5FD'
    },
    {
      label: 'Reanalyzed',
      value: analysisStats?.reanalyzed ?? 0,
      tone: '#93C5FD'
    },
    {
      label: 'Agent Runs',
      value: analysisMesh?.agents?.length ?? taxonomyDiagnostics?.analysis_mesh_agent_runs?.length ?? 0,
      tone: '#F9FAFB'
    }
  ];
}

export default function SummaryDashboard({
  summary,
  taxonomyDiagnostics,
  analysisStats,
  analysisMesh
}) {
  if (!summary) return null;

  const runtimeCards = buildRuntimeCards(summary, taxonomyDiagnostics, analysisStats, analysisMesh);

  return (
    <div className="space-y-4 mb-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {SEVERITY_CARDS.map((card) => (
          <div
            key={card.key}
            className="bg-[#1F2937] border border-[#374151] rounded-lg px-4 py-3 text-center"
          >
            <p className="text-2xl font-bold" style={{ color: card.color }}>
              {summary[card.key] ?? 0}
            </p>
            <p className="text-xs text-[#9CA3AF] mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
        {runtimeCards.map((card) => (
          <div
            key={card.label}
            className="bg-[#111827] border border-[#374151] rounded-lg px-4 py-3"
          >
            <p className="text-[11px] uppercase tracking-[0.16em] text-[#6B7280] mb-1">{card.label}</p>
            <p className="text-lg font-semibold" style={{ color: card.tone }}>
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

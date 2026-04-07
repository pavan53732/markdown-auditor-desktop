import React from 'react';
import { TOTAL_DETECTOR_COUNT } from '../lib/detectorMetadata';

const MAX_DIAGNOSTIC_EVENTS_VISIBLE = 3;

export default function DiagnosticsPanel({ taxonomyDiagnostics, mode = 'results' }) {
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
}

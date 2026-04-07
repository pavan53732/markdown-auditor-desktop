import {
  ANALYSIS_AGENT_COUNT,
  mergeAnalysisMeshRuns
} from './analysisAgents';
import {
  enrichIssueWithMarkdownIndex,
  enrichIssueWithEvidenceSpans
} from './markdownIndex';
import { enrichIssueWithProofChains } from './evidenceGraph';
import { enrichIssueWithProjectGraph } from './projectGraph';
import {
  enrichIssueWithTrustSignals,
  summarizeIssueTrustSignals,
  compareIssuesByTrustStrength
} from './trustSignals';
import {
  buildRuntimeDetectorCoverage,
  applyRuntimeDetectorCoverageSummary,
  deduplicateIssues,
  mergeBatchResults
} from './auditPipeline';
import { normalizeIssueFromDetector } from './detectorMetadata';

const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

function sortIssuesForPresentation(issues = []) {
  return [...issues].sort((left, right) => {
    const severityDelta = (SEVERITY_ORDER[left.severity] ?? 4) - (SEVERITY_ORDER[right.severity] ?? 4);
    if (severityDelta !== 0) return severityDelta;

    const trustStrengthDelta = compareIssuesByTrustStrength(left, right);
    if (trustStrengthDelta !== 0) return trustStrengthDelta;

    return (left.category || '').localeCompare(right.category || '');
  });
}

function enrichMergedIssues(issues, { markdownIndex, projectGraph, diagnostics }) {
  return deduplicateIssues(
    (Array.isArray(issues) ? issues : []).map((issue) => {
      const taxonomyNormalized = normalizeIssueFromDetector(issue, diagnostics);
      const anchoredIssue = enrichIssueWithMarkdownIndex(taxonomyNormalized, markdownIndex, diagnostics);
      const graphEnrichedIssue = enrichIssueWithProjectGraph(anchoredIssue, projectGraph, diagnostics);
      const spannedIssue = enrichIssueWithEvidenceSpans(graphEnrichedIssue, markdownIndex, diagnostics);
      return enrichIssueWithProofChains(spannedIssue, markdownIndex, diagnostics);
    })
  ).map((issue) => enrichIssueWithTrustSignals(issue));
}

function applyTrustSummary(summary, issues) {
  const trustSummary = summarizeIssueTrustSignals(issues);
  summary.average_trust_score = trustSummary.averageTrustScore;
  summary.high_trust_issue_count = trustSummary.highTrustIssueCount;
  summary.strong_evidence_issue_count = trustSummary.strongEvidenceIssueCount;
  summary.deterministic_proof_issue_count = trustSummary.deterministicProofIssueCount;
  summary.receipt_backed_issue_count = trustSummary.receiptBackedIssueCount;
  summary.hybrid_supported_issue_count = trustSummary.hybridSupportedIssueCount;
  summary.rule_backed_issue_count = trustSummary.ruleBackedIssueCount;
  summary.hybrid_backed_issue_count = trustSummary.hybridBackedIssueCount;
  summary.model_only_issue_count = trustSummary.modelOnlyIssueCount;
}

function applyMergedSummary({
  merged,
  diagnostics,
  deterministicRuleResult,
  completedAgentPasses
}) {
  merged.analysis_mesh = mergeAnalysisMeshRuns(merged.analysis_mesh_runs || []);
  merged.summary.analysis_agents_run = ANALYSIS_AGENT_COUNT;
  merged.summary.analysis_agent_passes = completedAgentPasses;
  merged.summary.analysis_mesh_focus_layer_hits = merged.analysis_mesh.focus_layer_hits || 0;
  merged.summary.analysis_mesh_focus_subcategory_hits = merged.analysis_mesh.focus_subcategory_hits || 0;
  merged.summary.analysis_mesh_owned_layer_hits = merged.analysis_mesh.owned_layer_hits || 0;
  merged.summary.analysis_mesh_owned_subcategory_hits = merged.analysis_mesh.owned_subcategory_hits || 0;
  merged.summary.analysis_mesh_owned_detector_hits = merged.analysis_mesh.owned_detector_hits || 0;
  merged.summary.analysis_mesh_out_of_owned_scope_issues = merged.analysis_mesh.out_of_owned_scope_issue_count || 0;
  merged.summary.analysis_mesh_owned_detector_finding_coverage = merged.analysis_mesh.coverage_reconciliation?.finding_backed_detector_count || 0;
  merged.summary.analysis_mesh_owned_detector_checked_count = merged.analysis_mesh.coverage_reconciliation?.checked_detector_count || 0;
  merged.summary.analysis_mesh_owned_detector_clean_count = merged.analysis_mesh.coverage_reconciliation?.checked_clean_detector_count || 0;
  merged.summary.analysis_mesh_owned_detector_untouched_count = merged.analysis_mesh.coverage_reconciliation?.untouched_detector_count || 0;
  merged.summary.analysis_mesh_owned_detector_quiet_count = merged.analysis_mesh.coverage_reconciliation?.quiet_detector_count || 0;
  merged.summary.analysis_mesh_validation_warnings = Number.isFinite(Number(merged.analysis_mesh.validation_warnings))
    ? Number(merged.analysis_mesh.validation_warnings)
    : 0;
  merged.summary.project_graph_total_groups = diagnostics.project_graph_total_group_count;
  merged.summary.project_graph_reference_count = diagnostics.project_graph_reference_count;
  merged.summary.project_graph_reference_groups = diagnostics.project_graph_reference_group_count || 0;
  merged.summary.deterministic_rule_runs = diagnostics.deterministic_rule_runs || 0;
  merged.summary.deterministic_rule_issues = deterministicRuleResult.issues.length;
  merged.summary.deterministic_rule_checked_detectors = deterministicRuleResult.summary?.detectors_checked || 0;
  merged.summary.deterministic_rule_clean_detectors = deterministicRuleResult.summary?.detectors_clean || 0;
  merged.summary.deterministic_rule_hit_detectors = deterministicRuleResult.summary?.detectors_hit || 0;
  merged.summary.detector_execution_receipts = Array.isArray(deterministicRuleResult.summary?.detector_execution_receipts)
    ? deterministicRuleResult.summary.detector_execution_receipts
    : [];
  merged.summary.timeout_agent_passes = diagnostics.timeout_agent_pass_count || 0;
}

function applyMergedDiagnostics({
  merged,
  diagnostics,
  deterministicRuleResult,
  runtimeCoverage,
  finalBatchResults,
  completedAgentPasses
}) {
  diagnostics.analysis_mesh_passes_completed = completedAgentPasses;
  diagnostics.analysis_mesh_focus_layer_hit_count = merged.analysis_mesh.focus_layer_hits || diagnostics.analysis_mesh_focus_layer_hit_count;
  diagnostics.analysis_mesh_focus_subcategory_hit_count = merged.analysis_mesh.focus_subcategory_hits || diagnostics.analysis_mesh_focus_subcategory_hit_count;
  diagnostics.analysis_mesh_owned_layer_hit_count = merged.analysis_mesh.owned_layer_hits || diagnostics.analysis_mesh_owned_layer_hit_count;
  diagnostics.analysis_mesh_owned_subcategory_hit_count = merged.analysis_mesh.owned_subcategory_hits || diagnostics.analysis_mesh_owned_subcategory_hit_count;
  diagnostics.analysis_mesh_owned_detector_hit_count = merged.analysis_mesh.owned_detector_hits || diagnostics.analysis_mesh_owned_detector_hit_count;
  diagnostics.analysis_mesh_out_of_focus_issue_count = merged.analysis_mesh.out_of_focus_issue_count || diagnostics.analysis_mesh_out_of_focus_issue_count;
  diagnostics.analysis_mesh_out_of_owned_scope_issue_count = merged.analysis_mesh.out_of_owned_scope_issue_count || diagnostics.analysis_mesh_out_of_owned_scope_issue_count;
  diagnostics.analysis_mesh_owned_detector_checked_count = merged.analysis_mesh.coverage_reconciliation?.checked_detector_count || diagnostics.analysis_mesh_owned_detector_checked_count || 0;
  diagnostics.analysis_mesh_owned_detector_clean_count = merged.analysis_mesh.coverage_reconciliation?.checked_clean_detector_count || diagnostics.analysis_mesh_owned_detector_clean_count || 0;
  diagnostics.analysis_mesh_owned_detector_untouched_count = merged.analysis_mesh.coverage_reconciliation?.untouched_detector_count || diagnostics.analysis_mesh_owned_detector_untouched_count || 0;
  diagnostics.analysis_mesh_owned_detector_quiet_count = merged.analysis_mesh.coverage_reconciliation?.quiet_detector_count || diagnostics.analysis_mesh_owned_detector_quiet_count;
  diagnostics.analysis_mesh_coverage_reconciliation = merged.analysis_mesh.coverage_reconciliation || diagnostics.analysis_mesh_coverage_reconciliation;
  diagnostics.analysis_mesh_validation_warning_count = Number.isFinite(Number(merged.analysis_mesh.validation_warnings))
    ? Number(merged.analysis_mesh.validation_warnings)
    : diagnostics.analysis_mesh_validation_warning_count;
  diagnostics.analysis_mesh_agent_runs = Array.isArray(merged.analysis_mesh.agents)
    ? merged.analysis_mesh.agents
    : diagnostics.analysis_mesh_agent_runs;
  diagnostics.runtime_detector_defined_count = runtimeCoverage.detectorsDefined;
  diagnostics.runtime_detector_finding_backed_count = runtimeCoverage.findingBackedDetectorCount;
  diagnostics.runtime_detector_model_finding_backed_count = runtimeCoverage.modelFindingBackedDetectorCount;
  diagnostics.runtime_detector_locally_checked_count = runtimeCoverage.localCheckedDetectorCount;
  diagnostics.runtime_detector_touched_count = runtimeCoverage.runtimeTouchedDetectorCount;
  diagnostics.runtime_detector_untouched_count = runtimeCoverage.untouchedDetectorCount;
  diagnostics.deterministic_catalog_detector_count = runtimeCoverage.deterministicCatalogDetectorCount;
  diagnostics.model_driven_catalog_detector_count = runtimeCoverage.modelDrivenCatalogDetectorCount;
  diagnostics.deterministic_catalog_coverage_percent = runtimeCoverage.deterministicCatalogCoveragePercent;
  diagnostics.model_driven_catalog_coverage_percent = runtimeCoverage.modelDrivenCatalogCoveragePercent;
  diagnostics.runtime_layer_coverage = runtimeCoverage.layerCoverage;
  diagnostics.agent_findings_merged_count = Math.max(
    0,
    finalBatchResults.reduce((sum, result) => sum + (result._rawIssueCount || result.issues?.length || 0), 0) - (merged.issues?.length || 0)
  );
  diagnostics.proof_chain_edge_count = merged.summary.proof_chain_edges || diagnostics.proof_chain_edge_count || 0;
  diagnostics.deterministic_rule_checked_detector_count = deterministicRuleResult.summary?.detectors_checked || diagnostics.deterministic_rule_checked_detector_count || 0;
  diagnostics.deterministic_rule_clean_detector_count = deterministicRuleResult.summary?.detectors_clean || diagnostics.deterministic_rule_clean_detector_count || 0;
  diagnostics.deterministic_rule_hit_detector_count = deterministicRuleResult.summary?.detectors_hit || diagnostics.deterministic_rule_hit_detector_count || 0;
}

export function finalizeAuditResults({
  finalBatchResults,
  deterministicRuleResult,
  analysisMeshRuns,
  markdownIndex,
  projectGraph,
  diagnostics,
  completedAgentPasses
}) {
  const merged = mergeBatchResults([...finalBatchResults, deterministicRuleResult]);
  merged.analysis_mesh_runs = analysisMeshRuns;
  applyMergedSummary({
    merged,
    diagnostics,
    deterministicRuleResult,
    completedAgentPasses
  });

  if (merged.issues) {
    merged.issues = enrichMergedIssues(merged.issues, { markdownIndex, projectGraph, diagnostics });
    merged.summary.proof_chain_edges = merged.issues.reduce(
      (sum, issue) => sum + (Array.isArray(issue.proof_chains) ? issue.proof_chains.length : 0),
      0
    );
    merged.summary.total = merged.issues.length;
    merged.summary.critical = merged.issues.filter((issue) => issue.severity === 'critical').length;
    merged.summary.high = merged.issues.filter((issue) => issue.severity === 'high').length;
    merged.summary.medium = merged.issues.filter((issue) => issue.severity === 'medium').length;
    merged.summary.low = merged.issues.filter((issue) => issue.severity === 'low').length;
    applyTrustSummary(merged.summary, merged.issues);
    merged.issues = sortIssuesForPresentation(merged.issues);
  }

  const runtimeCoverage = buildRuntimeDetectorCoverage({
    issues: merged.issues,
    deterministicReceipts: deterministicRuleResult.summary?.detector_execution_receipts || []
  });
  applyRuntimeDetectorCoverageSummary(merged.summary, runtimeCoverage);
  applyMergedDiagnostics({
    merged,
    diagnostics,
    deterministicRuleResult,
    runtimeCoverage,
    finalBatchResults,
    completedAgentPasses
  });

  delete merged.analysis_mesh_runs;
  return merged;
}

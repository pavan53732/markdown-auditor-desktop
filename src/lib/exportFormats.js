import { DETERMINISTIC_RULE_COUNT } from './ruleEngine/index';

function joinParts(parts = []) {
  return parts.filter(Boolean).join(' | ');
}

function quoteCsv(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

export function buildMarkdownReport({
  results,
  taxonomyDiagnostics,
  brandName,
  brandTagline,
  brandIconDataUrl,
  generatedAt,
  analysisAgentCount,
  totalDetectorCount
}) {
  if (!results) return '';

  const timestamp = generatedAt || new Date().toLocaleString();
  let md = '';

  if (brandIconDataUrl) {
    md += `![${brandName} Icon](${brandIconDataUrl})\n\n`;
  }

  md += `# ${brandName}\n\n`;
  md += `> ${brandTagline}\n>\n> Generated ${timestamp}\n\n`;
  md += `## Audit Report Summary\n\n`;
  md += `- **Total Issues:** ${results.summary.total}\n`;
  md += `- **Critical:** ${results.summary.critical}\n`;
  md += `- **High:** ${results.summary.high}\n`;
  md += `- **Medium:** ${results.summary.medium}\n`;
  md += `- **Low:** ${results.summary.low}\n`;
  md += `- **Files Analyzed:** ${results.summary.files_analyzed}\n`;
  md += `- **Analysis Mesh:** ${analysisAgentCount} deterministic agents\n`;
  if (results.summary.analysis_agent_passes > 0) {
    md += `- **Agent Passes:** ${results.summary.analysis_agent_passes}\n`;
  }
  if (Number.isFinite(Number(results.summary.average_trust_score))) {
    md += `- **Average Trust Score:** ${results.summary.average_trust_score}\n`;
    md += `- **High-Trust Issues:** ${results.summary.high_trust_issue_count || 0}\n`;
    md += `- **Strong-Evidence Issues:** ${results.summary.strong_evidence_issue_count || 0}\n`;
    md += `- **Proof-Backed Issues:** ${results.summary.deterministic_proof_issue_count || 0}\n`;
    md += `- **Receipt-Backed Issues:** ${results.summary.receipt_backed_issue_count || 0}\n`;
    md += `- **Hybrid-Supported Issues:** ${results.summary.hybrid_supported_issue_count || 0}\n`;
    md += `- **Model-Only Issues:** ${results.summary.model_only_issue_count || 0}\n`;
  }
  if (Number.isFinite(Number(results.summary.detectors_runtime_touched))) {
    md += `- **Detectors Defined:** ${results.summary.detectors_defined || totalDetectorCount}\n`;
    md += `- **Deterministic Local Rules:** ${DETERMINISTIC_RULE_COUNT}\n`;
    md += `- **Deterministic Catalog Detectors:** ${results.summary.deterministic_catalog_detector_count || 0}\n`;
    md += `- **Model-Driven Catalog Detectors:** ${results.summary.model_driven_catalog_detector_count || 0}\n`;
    md += `- **Runtime Detector Coverage:** ${results.summary.detectors_runtime_touched}\n`;
    md += `- **Model Finding-Backed Detectors:** ${results.summary.detectors_model_finding_backed || 0}\n`;
    md += `- **Locally Checked Detectors:** ${results.summary.detectors_locally_checked || 0}\n`;
    md += `- **Untouched Detectors:** ${results.summary.detectors_untouched || 0}\n`;
    md += `- **Deterministic Catalog Coverage %:** ${results.summary.deterministic_catalog_coverage_percent || 0}\n`;
    md += `- **Model-Driven Catalog Coverage %:** ${results.summary.model_driven_catalog_coverage_percent || 0}\n`;
  }
  md += `- **Trust Tier Semantics:** heuristic runtime weighting, not formal proof\n`;
  md += `- **Deterministic Coverage Mode:** partial local-rule spine plus hybrid/model synthesis\n`;
  md += `\n`;

  if (Array.isArray(results.summary.layer_coverage) && results.summary.layer_coverage.length > 0) {
    const activeLayerCoverage = results.summary.layer_coverage
      .filter((row) => (
        (row.detectors_runtime_touched || 0) > 0
        || (row.detectors_locally_checked || 0) > 0
        || (row.detectors_model_finding_backed || 0) > 0
      ))
      .sort((left, right) => {
        const touchedDelta = (right.detectors_runtime_touched || 0) - (left.detectors_runtime_touched || 0);
        if (touchedDelta !== 0) return touchedDelta;
        return (left.layer_number || 0) - (right.layer_number || 0);
      })
      .slice(0, 12);

    if (activeLayerCoverage.length > 0) {
      md += `## Layer Coverage Snapshot\n\n`;
      md += `| Layer | Touched/Defined | Local Checked/Deterministic | Model Backed/Model-Driven | Deterministic % | Model % |\n`;
      md += `| --- | --- | --- | --- | --- | --- |\n`;
      activeLayerCoverage.forEach((row) => {
        md += `| L${row.layer_number} ${row.layer_label} | ${row.detectors_runtime_touched}/${row.detectors_defined} | ${row.detectors_locally_checked}/${row.deterministic_catalog_detectors} | ${row.detectors_model_finding_backed}/${row.model_driven_catalog_detectors} | ${row.deterministic_catalog_coverage_percent}% | ${row.model_driven_catalog_coverage_percent}% |\n`;
      });
      md += `\n`;
    }
  }

  md += `## Issues\n\n`;
  (results.issues || []).forEach((issue, i) => {
    md += `### ${i + 1}. [${issue.severity?.toUpperCase()}] ${issue.description}\n\n`;
    md += `**Detector ID:** ${issue.detector_id || 'N/A'}\n`;
    if (issue.detector_name) md += `**Detector Name:** ${issue.detector_name}\n`;
    md += `**Category:** ${issue.category}\n`;
    if (issue.subcategory) md += `**Subcategory:** ${issue.subcategory}\n`;
    if (issue.failure_type) md += `**Failure Type:** ${issue.failure_type}\n`;
    if (issue.contract_step) md += `**Contract Step:** ${issue.contract_step}\n`;
    if (issue.rule_id) md += `**Rule ID:** ${issue.rule_id}\n`;
    if (issue.rule_stage) md += `**Rule Stage:** ${issue.rule_stage}\n`;
    if (issue.invariant_broken) md += `**Invariant Broken:** ${issue.invariant_broken}\n`;
    if (issue.authority_boundary) md += `**Authority Boundary:** ${issue.authority_boundary}\n`;
    if (issue.constraint_reference) md += `**Constraint Reference:** ${issue.constraint_reference}\n`;
    if (issue.violation_reference) md += `**Violation Reference:** ${issue.violation_reference}\n`;
    if (issue.closed_world_status) md += `**Closed World Status:** ${issue.closed_world_status}\n`;
    if (issue.trust_score !== undefined) md += `**Trust Score:** ${issue.trust_score}\n`;
    if (issue.proof_status) md += `**Proof Status:** ${issue.proof_status}\n`;
    if (issue.trust_tier) md += `**Trust Tier:** ${issue.trust_tier}\n`;
    if (issue.evidence_grade) md += `**Evidence Grade:** ${issue.evidence_grade}\n`;
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
        md += `- ${link.label || 'Related location'}${parts.length ? ` (${parts.join(' | ')})` : ''}\n`;
      });
      md += `\n`;
    }

    if (issue.evidence_spans?.length > 0) {
      md += `**Evidence Spans:**\n`;
      issue.evidence_spans.forEach((span) => {
        const parts = [span.role, span.file, span.section, span.anchor].filter(Boolean);
        md += `- ${parts.join(' | ')}${span.excerpt ? ` - ${span.excerpt}` : ''}\n`;
      });
      md += `\n`;
    }

    if (issue.proof_chains?.length > 0) {
      md += `**Typed Proof Chains:**\n`;
      issue.proof_chains.forEach((chain) => {
        const parts = [
          chain.relation,
          chain.evidence_type,
          chain.source_span?.anchor || chain.source_span?.file,
          chain.target_span?.anchor || chain.target_span?.file
        ].filter(Boolean);
        md += `- ${parts.join(' | ')}${chain.rationale ? ` - ${chain.rationale}` : ''}\n`;
      });
      md += `\n`;
    }
    if (issue.trust_reasons?.length > 0) {
      md += `**Trust Signals:** ${issue.trust_reasons.join(', ')}\n\n`;
    }
    if (issue.trust_basis?.length > 0) {
      md += `**Trust Basis:** ${issue.trust_basis.join(', ')}\n\n`;
    }
    if (issue.trust_tier) {
      md += `**Trust Tier Note:** Heuristic runtime weighting, not formal proof.\n\n`;
    }
    if (issue.proof_status) {
      md += `**Proof Status Note:** Distinguishes deterministic proof, deterministic receipts, hybrid support, and model-only inference.\n\n`;
    }
    if (issue.evidence_grade_reason) {
      md += `**Evidence Grade Reason:** ${issue.evidence_grade_reason}\n\n`;
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
      issue.verification_steps.forEach((step) => {
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
    md += `- **Project Graph Requirement Groups:** ${taxonomyDiagnostics.project_graph_requirement_group_count || 0}\n`;
    md += `- **Project Graph State Groups:** ${taxonomyDiagnostics.project_graph_state_group_count || 0}\n`;
    md += `- **Project Graph API Groups:** ${taxonomyDiagnostics.project_graph_api_group_count || 0}\n`;
    md += `- **Project Graph Actor Groups:** ${taxonomyDiagnostics.project_graph_actor_group_count || 0}\n`;
    md += `- **Project Graph References:** ${taxonomyDiagnostics.project_graph_reference_count || 0}\n`;
    md += `- **Project Graph Reference Groups:** ${taxonomyDiagnostics.project_graph_reference_group_count || 0}\n`;
    md += `- **Project Graph Total Groups:** ${taxonomyDiagnostics.project_graph_total_group_count || 0}\n`;
    md += `- **Deterministic Anchor Enrichments:** ${taxonomyDiagnostics.deterministic_anchor_enrichment_count || 0}\n`;
    md += `- **Deterministic File Assignments:** ${taxonomyDiagnostics.deterministic_file_assignment_count || 0}\n`;
    md += `- **Deterministic Section Assignments:** ${taxonomyDiagnostics.deterministic_section_assignment_count || 0}\n`;
    md += `- **Deterministic Line Assignments:** ${taxonomyDiagnostics.deterministic_line_assignment_count || 0}\n`;
    md += `- **Deterministic Multi-Anchor Assignments:** ${taxonomyDiagnostics.deterministic_multi_anchor_count || 0}\n`;
    md += `- **Deterministic Fallback Anchors:** ${taxonomyDiagnostics.deterministic_fallback_anchor_count || 0}\n`;
    md += `- **Deterministic Graph Link Enrichments:** ${taxonomyDiagnostics.deterministic_graph_link_enrichment_count || 0}\n`;
    md += `- **Evidence Span Enrichments:** ${taxonomyDiagnostics.evidence_span_enrichment_count || 0}\n`;
    md += `- **Typed Proof-Chain Enrichments:** ${taxonomyDiagnostics.deterministic_proof_chain_enrichment_count || 0}\n`;
    md += `- **Typed Proof-Chain Edges:** ${taxonomyDiagnostics.proof_chain_edge_count || 0}\n`;
    md += `- **Deterministic Rule Issues:** ${taxonomyDiagnostics.deterministic_rule_issue_count || 0}\n`;
    md += `- **Deterministic Rule Checked Detectors:** ${taxonomyDiagnostics.deterministic_rule_checked_detector_count || 0}\n`;
    md += `- **Deterministic Rule Clean Detectors:** ${taxonomyDiagnostics.deterministic_rule_clean_detector_count || 0}\n`;
    md += `- **Deterministic Rule Hit Detectors:** ${taxonomyDiagnostics.deterministic_rule_hit_detector_count || 0}\n`;
    md += `- **Runtime Detectors Defined:** ${taxonomyDiagnostics.runtime_detector_defined_count || totalDetectorCount}\n`;
    md += `- **Runtime Detectors Finding-Backed:** ${taxonomyDiagnostics.runtime_detector_finding_backed_count || 0}\n`;
    md += `- **Runtime Model Finding-Backed Detectors:** ${taxonomyDiagnostics.runtime_detector_model_finding_backed_count || 0}\n`;
    md += `- **Runtime Locally Checked Detectors:** ${taxonomyDiagnostics.runtime_detector_locally_checked_count || 0}\n`;
    md += `- **Runtime Touched Detectors:** ${taxonomyDiagnostics.runtime_detector_touched_count || 0}\n`;
    md += `- **Runtime Untouched Detectors:** ${taxonomyDiagnostics.runtime_detector_untouched_count || 0}\n`;
    md += `- **Deterministic Catalog Detectors:** ${taxonomyDiagnostics.deterministic_catalog_detector_count || 0}\n`;
    md += `- **Model-Driven Catalog Detectors:** ${taxonomyDiagnostics.model_driven_catalog_detector_count || 0}\n`;
    md += `- **Deterministic Catalog Coverage %:** ${taxonomyDiagnostics.deterministic_catalog_coverage_percent || 0}\n`;
    md += `- **Model-Driven Catalog Coverage %:** ${taxonomyDiagnostics.model_driven_catalog_coverage_percent || 0}\n`;
    md += `- **Configured Analysis Agents:** ${taxonomyDiagnostics.analysis_mesh_agents_configured}\n`;
    md += `- **Completed Agent Passes:** ${taxonomyDiagnostics.analysis_mesh_passes_completed}\n`;
    md += `- **Analysis Mesh Focus Layer Hits:** ${taxonomyDiagnostics.analysis_mesh_focus_layer_hit_count || 0}\n`;
    md += `- **Analysis Mesh Focus Subcategory Hits:** ${taxonomyDiagnostics.analysis_mesh_focus_subcategory_hit_count || 0}\n`;
    md += `- **Analysis Mesh Owned Layer Hits:** ${taxonomyDiagnostics.analysis_mesh_owned_layer_hit_count || 0}\n`;
    md += `- **Analysis Mesh Owned Subcategory Hits:** ${taxonomyDiagnostics.analysis_mesh_owned_subcategory_hit_count || 0}\n`;
    md += `- **Analysis Mesh Owned Detector Hits:** ${taxonomyDiagnostics.analysis_mesh_owned_detector_hit_count || 0}\n`;
    md += `- **Analysis Mesh Checked Owned Detectors:** ${taxonomyDiagnostics.analysis_mesh_owned_detector_checked_count || 0}\n`;
    md += `- **Analysis Mesh Clean Owned Detectors:** ${taxonomyDiagnostics.analysis_mesh_owned_detector_clean_count || 0}\n`;
    md += `- **Analysis Mesh Untouched Owned Detectors:** ${taxonomyDiagnostics.analysis_mesh_owned_detector_untouched_count || 0}\n`;
    md += `- **Analysis Mesh Out-of-Focus Issues:** ${taxonomyDiagnostics.analysis_mesh_out_of_focus_issue_count || 0}\n`;
    md += `- **Analysis Mesh Cross-Scope Issues:** ${taxonomyDiagnostics.analysis_mesh_out_of_owned_scope_issue_count || 0}\n`;
    md += `- **Analysis Mesh Quiet Owned Detectors:** ${taxonomyDiagnostics.analysis_mesh_owned_detector_quiet_count || 0}\n`;
    md += `- **Analysis Mesh Validation Warnings:** ${taxonomyDiagnostics.analysis_mesh_validation_warning_count || 0}\n`;
    md += `- **Merged Agent Findings:** ${taxonomyDiagnostics.agent_findings_merged_count}\n`;
    md += `- **Malformed Agent Responses:** ${taxonomyDiagnostics.malformed_agent_response_count || 0}\n`;
    md += `- **Malformed Response Retries:** ${taxonomyDiagnostics.malformed_agent_retry_count || 0}\n`;
    md += `- **Recovered Agent Responses:** ${taxonomyDiagnostics.recovered_agent_response_count || 0}\n`;
    md += `- **Skipped Agent Passes:** ${taxonomyDiagnostics.skipped_agent_pass_count || 0}\n`;
    md += `- **Timeout-Skipped Agent Passes:** ${taxonomyDiagnostics.timeout_agent_pass_count || 0}\n`;
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

  if (results.analysis_mesh?.agents?.length > 0) {
    md += `## Analysis Mesh Coverage\n\n`;
    if (results.analysis_mesh.coverage_reconciliation) {
      md += `### Ownership Reconciliation\n\n`;
      md += `- **Integrity Status:** ${results.analysis_mesh.coverage_reconciliation.integrity_status || 'unknown'}\n`;
      md += `- **Finding-Backed Layers:** ${results.analysis_mesh.coverage_reconciliation.finding_backed_layer_count || 0}/${results.analysis_mesh.coverage_reconciliation.assigned_layer_count || 0}\n`;
      md += `- **Finding-Backed Subcategories:** ${results.analysis_mesh.coverage_reconciliation.finding_backed_subcategory_count || 0}/${results.analysis_mesh.coverage_reconciliation.assigned_subcategory_count || 0}\n`;
      md += `- **Finding-Backed Detectors:** ${results.analysis_mesh.coverage_reconciliation.finding_backed_detector_count || 0}/${results.analysis_mesh.coverage_reconciliation.assigned_detector_count || 0}\n`;
      md += `- **Checked Owned Detectors:** ${results.analysis_mesh.coverage_reconciliation.checked_detector_count || 0}\n`;
      md += `- **Checked Clean Detectors:** ${results.analysis_mesh.coverage_reconciliation.checked_clean_detector_count || 0}\n`;
      md += `- **Untouched Owned Detectors:** ${results.analysis_mesh.coverage_reconciliation.untouched_detector_count || 0}\n`;
      md += `- **Quiet Owned Detectors:** ${results.analysis_mesh.coverage_reconciliation.quiet_detector_count || 0}\n`;
      md += `- **Cross-Scope Issues:** ${results.analysis_mesh.coverage_reconciliation.out_of_owned_scope_issue_count || 0}\n\n`;
    }
    results.analysis_mesh.agents.forEach((agentRun, index) => {
      md += `### ${index + 1}. ${agentRun.agent_label || agentRun.agent_id}\n\n`;
      md += `- **Merge Strategy:** ${agentRun.merge_strategy || 'n/a'}\n`;
      md += `- **Merge Priority:** ${agentRun.merge_priority ?? 'n/a'}\n`;
      md += `- **Issues Emitted:** ${agentRun.issues_emitted || 0}\n`;
      md += `- **Focus Layer Hits:** ${agentRun.focus_layer_hits || 0}\n`;
      md += `- **Focus Subcategory Hits:** ${agentRun.focus_subcategory_hits || 0}\n`;
      md += `- **Owned Layers Covered:** ${agentRun.owned_layer_coverage_count || 0}/${agentRun.owned_layer_count || 0}\n`;
      md += `- **Owned Subcategories Covered:** ${agentRun.owned_subcategory_coverage_count || 0}/${agentRun.owned_subcategory_count || 0}\n`;
      md += `- **Owned Detectors Covered:** ${agentRun.owned_detector_coverage_count || 0}/${agentRun.owned_detector_count || 0}\n`;
      md += `- **Checked Owned Detectors:** ${agentRun.receipt_checked_owned_detector_count || 0}\n`;
      md += `- **Clean Owned Detectors:** ${agentRun.receipt_clean_owned_detector_count || 0}\n`;
      md += `- **Untouched Owned Detectors:** ${agentRun.untouched_owned_detector_count || 0}\n`;
      md += `- **Out-of-Focus Issues:** ${agentRun.out_of_focus_issue_count || 0}\n`;
      md += `- **Cross-Scope Issues:** ${agentRun.out_of_owned_scope_issue_count || 0}\n`;
      if (agentRun.dominant_layers?.length > 0) {
        md += `- **Dominant Layers:** ${agentRun.dominant_layers.map((entry) => `${entry.value} (${entry.count})`).join(', ')}\n`;
      }
      if (agentRun.dominant_subcategories?.length > 0) {
        md += `- **Dominant Subcategories:** ${agentRun.dominant_subcategories.map((entry) => `${entry.value} (${entry.count})`).join(', ')}\n`;
      }
      if (agentRun.owned_detector_ranges?.length > 0) {
        md += `- **Owned Detector Ranges:** ${agentRun.owned_detector_ranges.join(', ')}\n`;
      }
      if (agentRun.warnings?.length > 0) {
        md += `- **Warnings:** ${agentRun.warnings.join(' | ')}\n`;
      }
      md += `\n`;
    });
  }

  return md;
}

export function buildCsvReport(results) {
  if (!results) return '';

  const headers = ['ID', 'DetectorID', 'DetectorName', 'Severity', 'Category', 'Subcategory', 'FailureType', 'ContractStep', 'RuleID', 'RuleStage', 'InvariantBroken', 'AuthorityBoundary', 'ConstraintReference', 'ViolationReference', 'ClosedWorldStatus', 'TrustScore', 'ProofStatus', 'TrustTier', 'EvidenceGrade', 'TrustBasis', 'TrustReasons', 'EvidenceGradeReason', 'AnalysisAgents', 'Section', 'SectionSlug', 'Line', 'LineEnd', 'DocumentAnchor', 'DocumentAnchors', 'AnchorSource', 'DetectionSource', 'EvidenceSpans', 'ProofChains', 'CrossFileLinks', 'RootCauseID', 'Description', 'WhyTriggered', 'EscalationReason', 'DeterministicFix', 'RecommendedFix', 'FixSteps', 'VerificationSteps', 'Effort', 'Evidence', 'Confidence', 'Impact', 'Difficulty', 'Files', 'Tags'];

  const rows = (results.issues || []).map((issue) => [
    issue.id || '',
    issue.detector_id || '',
    quoteCsv(issue.detector_name || ''),
    issue.severity || '',
    issue.category || '',
    quoteCsv(issue.subcategory || ''),
    issue.failure_type || '',
    issue.contract_step || '',
    issue.rule_id || '',
    issue.rule_stage || '',
    quoteCsv(issue.invariant_broken || ''),
    quoteCsv(issue.authority_boundary || ''),
    quoteCsv(issue.constraint_reference || ''),
    quoteCsv(issue.violation_reference || ''),
    issue.closed_world_status || '',
    issue.trust_score ?? '',
    issue.proof_status || '',
    issue.trust_tier || '',
    issue.evidence_grade || '',
    quoteCsv((issue.trust_basis || []).join(' | ')),
    quoteCsv((issue.trust_reasons || []).join(' | ')),
    quoteCsv(issue.evidence_grade_reason || ''),
    quoteCsv((issue.analysis_agents || (issue.analysis_agent ? [issue.analysis_agent] : [])).join(' | ')),
    issue.section || '',
    issue.section_slug || '',
    issue.line_number || '',
    issue.line_end || '',
    quoteCsv(issue.document_anchor || ''),
    quoteCsv((issue.document_anchors || []).join(' | ')),
    issue.anchor_source || '',
    issue.detection_source || '',
    quoteCsv((issue.evidence_spans || []).map((span) => joinParts([span.role, span.anchor || span.file, span.excerpt])).join(' | ')),
    quoteCsv((issue.proof_chains || []).map((chain) => joinParts([chain.relation, chain.source_span?.anchor || chain.source_span?.file, chain.target_span?.anchor || chain.target_span?.file])).join(' | ')),
    quoteCsv((issue.cross_file_links || []).map((link) => joinParts([link.label, link.target])).join(' | ')),
    issue.root_cause_id || '',
    quoteCsv(issue.description || ''),
    quoteCsv(issue.why_triggered || ''),
    quoteCsv(issue.escalation_reason || ''),
    quoteCsv(issue.deterministic_fix || ''),
    quoteCsv(issue.recommended_fix || ''),
    quoteCsv((issue.fix_steps || []).join(' | ')),
    quoteCsv((issue.verification_steps || []).join(' | ')),
    issue.estimated_effort || '',
    quoteCsv(issue.evidence || ''),
    issue.confidence || '',
    issue.impact_score || '',
    issue.fix_difficulty || '',
    quoteCsv((issue.files || []).join(', ')),
    quoteCsv((issue.tags || []).join(', '))
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}

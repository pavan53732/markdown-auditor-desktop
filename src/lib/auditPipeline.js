import { normalizeEvidenceSpans } from './markdownIndex';
import { normalizeProofChains } from './evidenceGraph';
import { DETECTOR_METADATA, TOTAL_DETECTOR_COUNT, getIssueIdentity } from './detectorMetadata';
import { DETERMINISTIC_RULE_DEFINITIONS } from './ruleEngine/index';
import {
  buildRuntimeDetectorCoverage as buildRuntimeDetectorCoverageWithMetadata,
  applyRuntimeDetectorCoverageSummary
} from './detectorCoverage';

export { applyRuntimeDetectorCoverageSummary };

export function buildRuntimeDetectorCoverage({ issues = [], deterministicReceipts = [] } = {}) {
  return buildRuntimeDetectorCoverageWithMetadata({
    issues,
    deterministicReceipts,
    detectorMetadata: DETECTOR_METADATA,
    totalDetectorCount: TOTAL_DETECTOR_COUNT,
    deterministicRuleDefinitions: DETERMINISTIC_RULE_DEFINITIONS
  });
}

export function applyPostMergeEscalation(issues = []) {
  const severityOrder = { critical: 3, high: 2, medium: 1, low: 0 };

  const sectionMediumCounts = {};
  issues.forEach((issue) => {
    if (issue.severity === 'medium' && issue.section) {
      const key = `${issue.files?.[0]}::${issue.section}`;
      if (!sectionMediumCounts[key]) sectionMediumCounts[key] = [];
      sectionMediumCounts[key].push(issue);
    }
  });

  Object.values(sectionMediumCounts).forEach((group) => {
    if (group.length >= 3) {
      group.forEach((issue) => {
        issue.severity = 'high';
        issue.escalation_reason = `Escalated to high because 3 or more medium issues (${group.length}) were found in the same section: ${issue.section}`;
      });
    }
  });

  const componentIssues = {};
  issues.forEach((issue) => {
    const component = issue.files?.[0] || 'unknown';
    if (!componentIssues[component]) componentIssues[component] = [];
    componentIssues[component].push(issue);
  });

  Object.values(componentIssues).forEach((componentIssueList) => {
    const hasSecurity = componentIssueList.some((issue) => issue.category === 'security');
    const hasPerformance = componentIssueList.some((issue) => issue.category === 'performance');

    if (hasSecurity && hasPerformance) {
      componentIssueList.forEach((issue) => {
        if ((issue.category === 'security' || issue.category === 'performance')
          && severityOrder[issue.severity] < severityOrder.critical) {
          issue.severity = 'critical';
          issue.escalation_reason = `Escalated to critical due to high-risk interaction between security and performance detectors in ${issue.files?.[0]}`;
        }
      });
    }
  });

  const sectionIssues = {};
  issues.forEach((issue) => {
    if (issue.section) {
      const key = `${issue.files?.[0]}::${issue.section}`;
      if (!sectionIssues[key]) sectionIssues[key] = [];
      sectionIssues[key].push(issue);
    }
  });

  Object.values(sectionIssues).forEach((sectionIssueList) => {
    const hasCompleteness = sectionIssueList.some((issue) => issue.category === 'completeness');
    const hasFunctional = sectionIssueList.some((issue) => issue.category === 'functional');

    if (hasCompleteness && hasFunctional) {
      sectionIssueList.forEach((issue) => {
        if ((issue.category === 'completeness' || issue.category === 'functional')
          && severityOrder[issue.severity] < severityOrder.high) {
          issue.severity = 'high';
          issue.escalation_reason = `Escalated to high because completeness and functional issues both flag missing steps in section: ${issue.section}`;
        }
      });
    }
  });

  Object.values(sectionIssues).forEach((sectionIssueList) => {
    const hasContradiction = sectionIssueList.some((issue) => issue.category === 'contradiction');
    const hasIntent = sectionIssueList.some((issue) => issue.category === 'intent');

    if (hasContradiction && hasIntent) {
      sectionIssueList.forEach((issue) => {
        if ((issue.category === 'contradiction' || issue.category === 'intent')
          && severityOrder[issue.severity] < severityOrder.high) {
          issue.severity = 'high';
          issue.escalation_reason = `Escalated to high due to conflict between documented content (L1) and stated intent (L10) in section: ${issue.section}`;
        }
      });
    }
  });
}

export function normalizeCrossFileLinks(links = []) {
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

export function mergeDetectionSource(existingSource, nextSource) {
  const normalize = (value) => {
    const source = typeof value === 'string' ? value.trim().toLowerCase() : '';
    if (!source) return '';
    if (source === 'rule') return 'rule';
    if (source === 'model') return 'model';
    if (source === 'hybrid' || source === 'hybrid_anchor' || source === 'hybrid_graph') return 'hybrid';
    return source;
  };

  const detectionSourcePriority = {
    model: 0,
    rule: 1,
    hybrid: 2
  };

  const normalizedExisting = normalize(existingSource);
  const normalizedNext = normalize(nextSource);
  const sources = new Set([normalizedExisting, normalizedNext].filter(Boolean));

  if (sources.has('hybrid')) return 'hybrid';
  if (sources.has('rule') && sources.has('model')) return 'hybrid';

  const existingPriority = detectionSourcePriority[normalizedExisting] ?? -1;
  const nextPriority = detectionSourcePriority[normalizedNext] ?? -1;
  return nextPriority > existingPriority ? normalizedNext : normalizedExisting;
}

export function deduplicateRootCauses(rootCauses = []) {
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
}

export function deduplicateIssues(issues = []) {
  const seen = new Map();
  const deduped = [];

  issues.forEach((issue) => {
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
      existing.evidence_spans = normalizeEvidenceSpans([
        ...(existing.evidence_spans || []),
        ...(issue.evidence_spans || [])
      ]);
      existing.proof_chains = normalizeProofChains([
        ...(existing.proof_chains || []),
        ...(issue.proof_chains || [])
      ]);
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
        detection_source: mergeDetectionSource('', issue.detection_source) || issue.detection_source,
        evidence_spans: normalizeEvidenceSpans(issue.evidence_spans),
        proof_chains: normalizeProofChains(issue.proof_chains),
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
}

export function mergeBatchResults(batchResults = []) {
  const merged = {
    summary: { total: 0, critical: 0, high: 0, medium: 0, low: 0, files_analyzed: 0 },
    issues: [],
    root_causes: []
  };

  const seenFiles = new Set();

  batchResults.forEach((result) => {
    merged.issues = [...merged.issues, ...(result.issues || [])];
    merged.root_causes = [...merged.root_causes, ...(result.root_causes || [])];
    result._sourceFiles?.forEach((file) => seenFiles.add(file));
  });

  merged.summary.files_analyzed = seenFiles.size;
  merged.issues = deduplicateIssues(merged.issues);
  merged.root_causes = deduplicateRootCauses(merged.root_causes);
  applyPostMergeEscalation(merged.issues);
  merged.summary.total = merged.issues.length;
  merged.summary.critical = merged.issues.filter((issue) => issue.severity === 'critical').length;
  merged.summary.high = merged.issues.filter((issue) => issue.severity === 'high').length;
  merged.summary.medium = merged.issues.filter((issue) => issue.severity === 'medium').length;
  merged.summary.low = merged.issues.filter((issue) => issue.severity === 'low').length;

  return merged;
}

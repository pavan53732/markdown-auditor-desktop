function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function normalizeDetectionSource(value) {
  const source = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (source === 'rule' || source === 'model' || source === 'hybrid') return source;
  if (source.startsWith('hybrid')) return 'hybrid';
  return source || 'model';
}

export const TRUST_TIER_PRIORITY = {
  very_strong: 4,
  strong: 3,
  supported: 2,
  tentative: 1,
  weak: 0
};

export const DETECTION_SOURCE_PRIORITY = {
  hybrid: 3,
  rule: 2,
  model: 1
};

export const PROOF_STATUS_PRIORITY = {
  deterministic_proof: 4,
  receipt_backed: 3,
  hybrid_supported: 2,
  model_only: 1
};

const SEVERITY_PRIORITY = {
  critical: 3,
  high: 2,
  medium: 1,
  low: 0
};

const MODEL_ONLY_SEVERITY_CAP_LAYERS = new Set([
  'api_contract',
  'specification_formalism',
  'dependency_graph',
  'execution_path',
  'governance',
  'deterministic_execution',
  'control_plane_authority',
  'world_state_governance'
]);

export function buildTrustTier(score) {
  const numericScore = Number(score) || 0;
  if (numericScore >= 85) return 'very_strong';
  if (numericScore >= 70) return 'strong';
  if (numericScore >= 55) return 'supported';
  if (numericScore >= 40) return 'tentative';
  return 'weak';
}

export function getTrustTierLabel(tier) {
  switch (tier) {
    case 'very_strong': return 'Very Strong';
    case 'strong': return 'Strong';
    case 'supported': return 'Supported';
    case 'tentative': return 'Tentative';
    default: return 'Weak';
  }
}

export function getProofStatusLabel(status) {
  switch (status) {
    case 'deterministic_proof': return 'Deterministic Proof';
    case 'receipt_backed': return 'Receipt-Backed';
    case 'hybrid_supported': return 'Hybrid-Supported';
    default: return 'Model-Only';
  }
}

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter((entry) => entry && typeof entry === 'object') : [];
}

function buildEvidenceGrade(evidenceScore) {
  if (evidenceScore >= 80) return 'A';
  if (evidenceScore >= 65) return 'B';
  if (evidenceScore >= 50) return 'C';
  if (evidenceScore >= 35) return 'D';
  return 'F';
}

function buildEvidenceGradeReason({ evidenceGrade, reasons = [] }) {
  const leading = reasons.slice(0, 3);
  if (leading.length === 0) {
    return evidenceGrade === 'F'
      ? 'Weak direct evidence: the finding lacks anchored or structured proof.'
      : 'Moderate evidence support from the available runtime signals.';
  }

  return `${evidenceGrade}-grade evidence driven by ${leading.join(', ')}.`;
}

function buildTrustBasis({
  detectionSource,
  issue,
  hasDocumentAnchor,
  documentAnchors,
  evidenceSpans,
  proofChains,
  crossFileLinks,
  hasEvidenceText,
  hasTraceabilityReference
}) {
  const trustBasis = new Set();

  if (detectionSource === 'rule') {
    trustBasis.add('deterministic_rule');
  }

  if (detectionSource === 'hybrid' || detectionSource === 'model') {
    trustBasis.add('model_inference');
  }

  if (issue.rule_id) {
    trustBasis.add('rule_receipt');
  }

  if (hasDocumentAnchor) {
    trustBasis.add('document_anchor');
  }

  if (documentAnchors.length > 1) {
    trustBasis.add('multi_anchor');
  }

  if (evidenceSpans.length > 0) {
    trustBasis.add('evidence_span');
  }

  if (proofChains.length > 0) {
    trustBasis.add('proof_chain');
  }

  if (crossFileLinks.length > 0) {
    trustBasis.add('cross_file_reference');
  }

  if (hasEvidenceText) {
    trustBasis.add('verbatim_evidence');
  }

  if (hasTraceabilityReference) {
    trustBasis.add('traceability_reference');
  }

  if (issue.assumption_detected === true) {
    trustBasis.add('assumption_leakage');
  }

  return Array.from(trustBasis);
}

function buildProofStatus({
  detectionSource,
  issue,
  hasDocumentAnchor,
  documentAnchors,
  evidenceSpans,
  proofChains,
  crossFileLinks,
  hasEvidenceText,
  hasTraceabilityReference
}) {
  const hasStructuredDeterministicEvidence =
    hasDocumentAnchor ||
    documentAnchors.length > 1 ||
    evidenceSpans.length > 0 ||
    proofChains.length > 0 ||
    hasTraceabilityReference;

  if (
    detectionSource === 'rule'
    && hasDocumentAnchor
    && evidenceSpans.length > 0
    && (proofChains.length > 0 || Boolean(issue.rule_id))
  ) {
    return 'deterministic_proof';
  }

  if (
    detectionSource === 'rule'
    || (issue.rule_id && (hasStructuredDeterministicEvidence || hasEvidenceText))
  ) {
    return 'receipt_backed';
  }

  if (
    detectionSource === 'hybrid'
    || (detectionSource === 'model' && (hasStructuredDeterministicEvidence || crossFileLinks.length > 0 || hasEvidenceText))
  ) {
    return 'hybrid_supported';
  }

  return 'model_only';
}

function applyTrustTierCap(trustTier, proofStatus) {
  const trustTierOrder = ['weak', 'tentative', 'supported', 'strong', 'very_strong'];
  const currentIndex = trustTierOrder.indexOf(trustTier);
  const maxTier = proofStatus === 'deterministic_proof'
    ? 'very_strong'
    : proofStatus === 'receipt_backed'
      ? 'strong'
      : proofStatus === 'hybrid_supported'
        ? 'supported'
        : 'tentative';
  const maxIndex = trustTierOrder.indexOf(maxTier);
  return trustTierOrder[Math.min(currentIndex, maxIndex)] || trustTier;
}

function applyProofAwareSeverityCap(issue, proofStatus) {
  const layerId = typeof issue?.layer === 'string' && issue.layer.trim()
    ? issue.layer.trim()
    : typeof issue?.category === 'string'
      ? issue.category.trim()
      : '';

  if (proofStatus !== 'model_only' || !MODEL_ONLY_SEVERITY_CAP_LAYERS.has(layerId)) {
    return issue?.severity;
  }

  const currentSeverity = String(issue?.severity || '').toLowerCase();
  if ((SEVERITY_PRIORITY[currentSeverity] ?? 0) <= SEVERITY_PRIORITY.medium) {
    return issue?.severity;
  }

  return 'medium';
}

export function enrichIssueWithTrustSignals(issue) {
  if (!issue || typeof issue !== 'object') return issue;

  const detectionSource = normalizeDetectionSource(issue.detection_source);
  const documentAnchors = Array.isArray(issue.document_anchors)
    ? issue.document_anchors.filter((anchor) => typeof anchor === 'string' && anchor.trim())
    : [];
  const evidenceSpans = normalizeArray(issue.evidence_spans);
  const proofChains = normalizeArray(issue.proof_chains);
  const crossFileLinks = normalizeArray(issue.cross_file_links);
  const confidence = Number.isFinite(Number(issue.confidence))
    ? clamp(Number(issue.confidence), 0, 1)
    : null;
  const hasDocumentAnchor = typeof issue.document_anchor === 'string' && issue.document_anchor.trim().length > 0;
  const hasEvidenceText = typeof issue.evidence === 'string' && issue.evidence.trim().length > 0;
  const hasTraceabilityReference = (
    (typeof issue.constraint_reference === 'string' && issue.constraint_reference.trim())
    || (typeof issue.violation_reference === 'string' && issue.violation_reference.trim())
  );

  const trustReasons = [];
  let trustScore = 0;
  let evidenceScore = 0;

  if (detectionSource === 'rule') {
    trustScore += 42;
    evidenceScore += 18;
    trustReasons.push('deterministic local rule');
  } else if (detectionSource === 'hybrid') {
    trustScore += 32;
    evidenceScore += 14;
    trustReasons.push('hybrid rule/model evidence');
  } else {
    trustScore += 18;
    evidenceScore += 8;
    trustReasons.push('model-driven finding');
  }

  if (issue.rule_id) {
    trustScore += 8;
    evidenceScore += 8;
    trustReasons.push('rule receipt');
  }

  if (hasDocumentAnchor) {
    trustScore += 10;
    evidenceScore += 25;
    trustReasons.push('document anchor');
  }

  if (documentAnchors.length > 1) {
    const anchorBonus = Math.min(6, (documentAnchors.length - 1) * 2);
    trustScore += anchorBonus;
    evidenceScore += Math.min(8, (documentAnchors.length - 1) * 3);
    trustReasons.push('multi-anchor evidence');
  }

  if (evidenceSpans.length > 0) {
    trustScore += 12 + Math.min(6, Math.max(0, evidenceSpans.length - 1) * 2);
    evidenceScore += 25 + Math.min(10, Math.max(0, evidenceSpans.length - 1) * 3);
    trustReasons.push('evidence spans');
  }

  if (proofChains.length > 0) {
    trustScore += Math.min(12, proofChains.length * 4);
    evidenceScore += Math.min(20, proofChains.length * 6);
    trustReasons.push('typed proof chains');
  }

  if (crossFileLinks.length > 0) {
    trustScore += Math.min(8, crossFileLinks.length * 2);
    evidenceScore += Math.min(15, crossFileLinks.length * 4);
    trustReasons.push('cross-file links');
  }

  if (hasEvidenceText) {
    trustScore += 6;
    evidenceScore += 10;
    trustReasons.push('verbatim evidence');
  }

  if (hasTraceabilityReference) {
    trustScore += 4;
    evidenceScore += 6;
    trustReasons.push('traceability reference');
  }

  if (confidence !== null) {
    trustScore += Math.round(confidence * 10);
  }

  if (issue.assumption_detected === true) {
    trustScore -= 15;
    evidenceScore -= 10;
    trustReasons.push('assumption leakage');
  }

  if (!hasDocumentAnchor && evidenceSpans.length === 0 && proofChains.length === 0 && !hasEvidenceText && crossFileLinks.length === 0) {
    trustScore -= 20;
    evidenceScore -= 20;
  }

  if (detectionSource === 'model' && !hasDocumentAnchor && evidenceSpans.length === 0) {
    trustScore -= 10;
  }

  const normalizedTrustScore = clamp(Math.round(trustScore), 0, 100);
  const normalizedEvidenceScore = clamp(Math.round(evidenceScore), 0, 100);
  const evidenceGrade = buildEvidenceGrade(normalizedEvidenceScore);
  const proofStatus = buildProofStatus({
    detectionSource,
    issue,
    hasDocumentAnchor,
    documentAnchors,
    evidenceSpans,
    proofChains,
    crossFileLinks,
    hasEvidenceText,
    hasTraceabilityReference
  });
  const uniqueTrustReasons = Array.from(new Set(trustReasons));
  const trustBasis = buildTrustBasis({
    detectionSource,
    issue,
    hasDocumentAnchor,
    documentAnchors,
    evidenceSpans,
    proofChains,
    crossFileLinks,
    hasEvidenceText,
    hasTraceabilityReference
  });
  const trustTier = applyTrustTierCap(buildTrustTier(normalizedTrustScore), proofStatus);
  const gatedSeverity = applyProofAwareSeverityCap(issue, proofStatus);

  return {
    ...issue,
    detection_source: normalizeDetectionSource(issue.detection_source),
    severity: gatedSeverity,
    proof_status: proofStatus,
    trust_score: normalizedTrustScore,
    trust_tier: trustTier,
    trust_basis: trustBasis,
    evidence_grade: evidenceGrade,
    trust_reasons: uniqueTrustReasons,
    evidence_grade_reason: buildEvidenceGradeReason({
      evidenceGrade,
      reasons: uniqueTrustReasons
    })
  };
}

export function summarizeIssueTrustSignals(issues = []) {
  if (!Array.isArray(issues) || issues.length === 0) {
    return {
      averageTrustScore: 0,
      highTrustIssueCount: 0,
      strongEvidenceIssueCount: 0,
      deterministicProofIssueCount: 0,
      receiptBackedIssueCount: 0,
      hybridSupportedIssueCount: 0,
      ruleBackedIssueCount: 0,
      hybridBackedIssueCount: 0,
      modelOnlyIssueCount: 0
    };
  }

  const normalizedIssues = issues.filter((issue) => issue && typeof issue === 'object');
  const averageTrustScore = normalizedIssues.length > 0
    ? Math.round(
        normalizedIssues.reduce((sum, issue) => sum + (Number.isFinite(Number(issue.trust_score)) ? Number(issue.trust_score) : 0), 0)
        / normalizedIssues.length
      )
    : 0;

  return {
    averageTrustScore,
    highTrustIssueCount: normalizedIssues.filter((issue) => Number(issue.trust_score) >= 75).length,
    strongEvidenceIssueCount: normalizedIssues.filter((issue) => ['A', 'B'].includes(issue.evidence_grade)).length,
    deterministicProofIssueCount: normalizedIssues.filter((issue) => issue.proof_status === 'deterministic_proof').length,
    receiptBackedIssueCount: normalizedIssues.filter((issue) => issue.proof_status === 'receipt_backed').length,
    hybridSupportedIssueCount: normalizedIssues.filter((issue) => issue.proof_status === 'hybrid_supported').length,
    ruleBackedIssueCount: normalizedIssues.filter((issue) => normalizeDetectionSource(issue.detection_source) === 'rule').length,
    hybridBackedIssueCount: normalizedIssues.filter((issue) => normalizeDetectionSource(issue.detection_source) === 'hybrid').length,
    modelOnlyIssueCount: normalizedIssues.filter((issue) => normalizeDetectionSource(issue.detection_source) === 'model').length
  };
}

export function compareIssuesByTrustStrength(a, b) {
  const proofStatusDiff = (PROOF_STATUS_PRIORITY[b?.proof_status] ?? 0)
    - (PROOF_STATUS_PRIORITY[a?.proof_status] ?? 0);
  if (proofStatusDiff !== 0) return proofStatusDiff;

  const sourceDiff = (DETECTION_SOURCE_PRIORITY[normalizeDetectionSource(b?.detection_source)] ?? 0)
    - (DETECTION_SOURCE_PRIORITY[normalizeDetectionSource(a?.detection_source)] ?? 0);
  if (sourceDiff !== 0) return sourceDiff;

  const trustTierDiff = (TRUST_TIER_PRIORITY[b?.trust_tier] ?? -1)
    - (TRUST_TIER_PRIORITY[a?.trust_tier] ?? -1);
  if (trustTierDiff !== 0) return trustTierDiff;

  const trustDiff = (Number(b?.trust_score) || 0) - (Number(a?.trust_score) || 0);
  if (trustDiff !== 0) return trustDiff;

  const evidenceGradeOrder = { A: 4, B: 3, C: 2, D: 1, F: 0 };
  return (evidenceGradeOrder[b?.evidence_grade] ?? -1) - (evidenceGradeOrder[a?.evidence_grade] ?? -1);
}

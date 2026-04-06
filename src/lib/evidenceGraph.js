import {
  buildIssueDocumentAnchor,
  normalizeComparableText,
  normalizeEvidenceSpans,
  parseDocumentAnchor
} from './markdownIndex.js';

const VALID_PROOF_RELATIONS = new Set([
  'supports',
  'contradicts',
  'defines',
  'depends_on',
  'references',
  'violates'
]);

const RELATION_PRIORITY = {
  contradicts: 0,
  violates: 1,
  defines: 2,
  depends_on: 3,
  references: 4,
  supports: 5
};

function normalizeProofRelation(value) {
  const relation = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (VALID_PROOF_RELATIONS.has(relation)) return relation;
  return '';
}

function normalizeRelatedKeys(keys = []) {
  if (!Array.isArray(keys)) return [];
  return Array.from(
    new Set(
      keys
        .filter((value) => typeof value === 'string')
        .map((value) => value.trim())
        .filter(Boolean)
    )
  );
}

function buildProofChainId({ relation, sourceSpan, targetSpan, evidenceType }) {
  return [
    relation,
    evidenceType || '',
    sourceSpan?.anchor || sourceSpan?.file || '',
    targetSpan?.anchor || targetSpan?.file || ''
  ].join('::');
}

function normalizeProofSpan(span = {}) {
  const [normalized] = normalizeEvidenceSpans([span]);
  return normalized || null;
}

function buildFallbackPrimarySpan(issue, projectIndex) {
  if (!issue) return null;

  if (issue.document_anchor) {
    const hydrated = hydrateSpanFromAnchor(issue.document_anchor, projectIndex);
    if (hydrated) {
      return normalizeProofSpan({
        ...hydrated,
        role: 'primary',
        source: issue.anchor_source || hydrated.source || 'document_anchor'
      });
    }
  }

  const file = issue.files?.[0];
  if (!file) return null;

  const documentIndex = projectIndex?.documents?.find(
    (document) => document.name.toLowerCase() === String(file).toLowerCase()
  );

  const heading = documentIndex?.headings?.find((candidate) =>
    (issue.section_slug && candidate.slug === issue.section_slug)
    || (issue.section && candidate.title === issue.section)
  ) || null;

  const lineStart = Number.isFinite(Number(issue.line_number))
    ? Number(issue.line_number)
    : (heading?.lineStart || undefined);
  const lineEnd = Number.isFinite(Number(issue.line_end))
    ? Number(issue.line_end)
    : lineStart;
  const anchor = buildIssueDocumentAnchor({
    files: [file],
    section: issue.section || heading?.title || '',
    section_slug: issue.section_slug || heading?.slug || '',
    line_number: lineStart,
    line_end: lineEnd
  });
  const excerpt = documentIndex && Number.isFinite(Number(lineStart))
    ? documentIndex.lines
        .slice(lineStart - 1, Number.isFinite(Number(lineEnd)) ? lineEnd : lineStart)
        .map((line) => line.trim())
        .filter(Boolean)
        .join(' ')
        .slice(0, 280)
    : '';

  return normalizeProofSpan({
    file,
    section: issue.section || heading?.title || '',
    section_slug: issue.section_slug || heading?.slug || '',
    line_start: lineStart,
    line_end: lineEnd,
    anchor,
    role: 'primary',
    source: issue.anchor_source || 'issue_fallback',
    excerpt
  });
}

function hydrateSpanFromAnchor(anchor, projectIndex) {
  const parsed = parseDocumentAnchor(anchor);
  if (!parsed?.file) return null;

  const documentIndex = projectIndex?.documents?.find(
    (document) => document.name.toLowerCase() === parsed.file.toLowerCase()
  );

  const section = parsed.section_slug
    ? (documentIndex?.headings?.find((heading) => heading.slug === parsed.section_slug)?.title || '')
    : '';

  const excerpt = documentIndex && Number.isFinite(Number(parsed.line_start))
    ? documentIndex.lines
        .slice(parsed.line_start - 1, Number.isFinite(Number(parsed.line_end)) ? parsed.line_end : parsed.line_start)
        .map((line) => line.trim())
        .filter(Boolean)
        .join(' ')
        .slice(0, 280)
    : '';

  return normalizeProofSpan({
    file: parsed.file,
    section,
    section_slug: parsed.section_slug || '',
    line_start: parsed.line_start,
    line_end: parsed.line_end,
    anchor: parsed.anchor,
    role: 'related',
    source: 'document_anchor',
    excerpt
  });
}

function findLinkMetadata(issue, targetSpan) {
  if (!Array.isArray(issue?.cross_file_links) || !targetSpan) return null;

  const targetAnchor = targetSpan.anchor || '';
  const targetFile = (targetSpan.file || '').toLowerCase();

  return issue.cross_file_links.find((link) => {
    const linkTarget = typeof link?.target === 'string' ? link.target.trim() : '';
    const linkFile = typeof link?.file === 'string' ? link.file.trim().toLowerCase() : '';
    return (
      (targetAnchor && linkTarget === targetAnchor)
      || (targetFile && linkFile === targetFile && (!targetAnchor || !linkTarget))
    );
  }) || null;
}

function deriveProofRelation(issue, link) {
  const failureType = normalizeComparableText(issue?.failure_type);
  const category = normalizeComparableText(issue?.category);

  if (
    category === 'contradiction'
    || failureType.includes('contradiction')
    || failureType.includes('conflict')
  ) {
    return 'contradicts';
  }

  if (
    category === 'requirement'
    || category === 'workflow_lifecycle_integrity'
    || category === 'execution_path'
    || failureType.includes('missing')
    || failureType.includes('ordering')
  ) {
    return 'violates';
  }

  switch (link?.type) {
    case 'shared_term':
      return 'defines';
    case 'document_reference':
      return 'references';
    case 'shared_identifier':
    case 'workflow_step':
      return 'depends_on';
    default:
      return 'supports';
  }
}

function buildProofRationale(issue, link, relation, sourceSpan, targetSpan) {
  const targetLabel = link?.label || targetSpan?.section || targetSpan?.file || 'related span';
  const relatedKeys = normalizeRelatedKeys(link?.related_keys);
  const keyClause = relatedKeys.length > 0 ? ` using shared key(s): ${relatedKeys.join(', ')}` : '';
  const base = relation === 'contradicts'
    ? 'The target span expresses a conflicting cross-file statement.'
    : relation === 'violates'
      ? 'The target span exposes a required contract or workflow condition the issue breaks.'
      : relation === 'defines'
        ? 'The target span defines terminology needed to interpret the primary finding.'
        : relation === 'depends_on'
          ? 'The target span is part of the same execution or identifier dependency chain.'
          : relation === 'references'
            ? 'The target span is explicitly referenced by the primary evidence.'
            : 'The target span independently reinforces the same documented condition.';

  return `${base} Proof chain: ${sourceSpan?.anchor || sourceSpan?.file || 'source'} -> ${targetSpan?.anchor || targetSpan?.file || 'target'} via ${targetLabel}${keyClause}.`;
}

export function normalizeProofChains(chains = []) {
  if (!Array.isArray(chains)) return [];

  const byId = new Map();

  chains.forEach((chain) => {
    if (!chain || typeof chain !== 'object') return;

    const sourceSpan = normalizeProofSpan(chain.source_span);
    const targetSpan = normalizeProofSpan(chain.target_span);
    const relation = normalizeProofRelation(chain.relation);
    if (!sourceSpan || !targetSpan || !relation) return;

    const normalized = {
      id: typeof chain.id === 'string' && chain.id.trim()
        ? chain.id.trim()
        : buildProofChainId({
            relation,
            sourceSpan,
            targetSpan,
            evidenceType: typeof chain.evidence_type === 'string' ? chain.evidence_type.trim() : ''
          }),
      relation,
      evidence_type: typeof chain.evidence_type === 'string' ? chain.evidence_type.trim() : '',
      rationale: typeof chain.rationale === 'string' ? chain.rationale.trim() : '',
      related_keys: normalizeRelatedKeys(chain.related_keys),
      source_span: sourceSpan,
      target_span: targetSpan
    };

    const existing = byId.get(normalized.id);
    if (!existing) {
      byId.set(normalized.id, normalized);
      return;
    }

    existing.rationale ||= normalized.rationale;
    existing.evidence_type ||= normalized.evidence_type;
    existing.related_keys = normalizeRelatedKeys([
      ...(existing.related_keys || []),
      ...(normalized.related_keys || [])
    ]);
  });

  return Array.from(byId.values()).sort((a, b) => {
    const relationDiff = (RELATION_PRIORITY[a.relation] ?? 99) - (RELATION_PRIORITY[b.relation] ?? 99);
    if (relationDiff !== 0) return relationDiff;

    const sourceDiff = (a.source_span.anchor || a.source_span.file || '').localeCompare(
      b.source_span.anchor || b.source_span.file || ''
    );
    if (sourceDiff !== 0) return sourceDiff;

    return (a.target_span.anchor || a.target_span.file || '').localeCompare(
      b.target_span.anchor || b.target_span.file || ''
    );
  });
}

export function enrichIssueWithProofChains(issue, projectIndex, diagnostics = null) {
  if (!issue || !projectIndex) return issue;

  const normalizedSpans = normalizeEvidenceSpans(issue.evidence_spans);
  const primarySpan = normalizedSpans.find((span) => span.role === 'primary') || normalizedSpans[0] || buildFallbackPrimarySpan(issue, projectIndex);
  if (!primarySpan) return issue;

  const candidateTargets = [
    ...normalizedSpans.filter((span) => (span.anchor || span.file) !== (primarySpan.anchor || primarySpan.file) && span.role !== 'primary')
  ];

  if (candidateTargets.length === 0 && Array.isArray(issue.cross_file_links)) {
    issue.cross_file_links.forEach((link) => {
      const hydrated = hydrateSpanFromAnchor(link?.target, projectIndex);
      if (hydrated) {
        candidateTargets.push(hydrated);
      }
    });
  }

  const proofChains = normalizeProofChains([
    ...(Array.isArray(issue.proof_chains) ? issue.proof_chains : []),
    ...candidateTargets.map((targetSpan) => {
      const link = findLinkMetadata(issue, targetSpan);
      const relation = deriveProofRelation(issue, link);
      return {
        relation,
        evidence_type: link?.type || targetSpan.source || 'evidence_span',
        related_keys: normalizeRelatedKeys(link?.related_keys),
        rationale: buildProofRationale(issue, link, relation, primarySpan, targetSpan),
        source_span: {
          ...primarySpan,
          role: 'primary'
        },
        target_span: targetSpan
      };
    })
  ]);

  if (proofChains.length === 0) return issue;

  const existingSerialized = JSON.stringify(issue.proof_chains || []);
  const nextSerialized = JSON.stringify(proofChains);
  if (existingSerialized === nextSerialized) return issue;

  if (diagnostics) {
    diagnostics.deterministic_proof_chain_enrichment_count = (diagnostics.deterministic_proof_chain_enrichment_count || 0) + 1;
    diagnostics.proof_chain_edge_count = (diagnostics.proof_chain_edge_count || 0) + proofChains.length;
  }

  return {
    ...issue,
    proof_chains: proofChains
  };
}

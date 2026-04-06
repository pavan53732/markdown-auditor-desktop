import {
  buildHeadingSlug,
  buildIssueDocumentAnchor,
  buildMarkdownProjectIndex,
  normalizeComparableText
} from './markdownIndex.js';

const GLOSSARY_HEADING_PATTERN = /\b(glossary|terminology|definitions|terms|symbols|terminology registry|vocabulary)\b/i;
const WORKFLOW_HEADING_PATTERN = /\b(flow|workflow|steps|process|pipeline|sequence|lifecycle|procedure)\b/i;
const IDENTIFIER_PATTERN = /\b[A-Z]{2,12}[-_][A-Z0-9][A-Z0-9_-]{0,24}\b/g;
const REQUIREMENT_PATTERN = /\b(MUST|SHALL|REQUIRED|SHOULD|RECOMMENDED|MAY|OPTIONAL)\b/g;
const API_PATTERN = /\b(GET|POST|PUT|PATCH|DELETE)\s+(\/[A-Za-z0-9._~:/?#[\]@!$&'()*+,;=%-]*)/g;
const ACTOR_PATTERN = /^\s*(?:[-*+]\s+|\d+\.\s+)?(User|Users|System|Operator|Admin|Client|Server|Host|Runtime|Agent|Agents)\b[:\s-]/i;
const STATE_TRANSITION_PATTERN = /\b([A-Z][A-Z0-9_]{1,31})\b/g;
const MARKDOWN_LINK_PATTERN = /\[([^\]]+)\]\(([^)]+)\)/g;

function createOccurrence({ documentIndex, section, lineNumber, label, type, key, description = '' }) {
  const sectionSlug = section?.slug || buildHeadingSlug(section?.title || '');
  const anchor = buildIssueDocumentAnchor({
    files: [documentIndex.name],
    section: section?.title || '',
    section_slug: sectionSlug,
    line_number: lineNumber
  }) || documentIndex.name;

  return {
    type,
    key,
    file: documentIndex.name,
    section: section?.title || '',
    section_slug: sectionSlug,
    line_number: lineNumber,
    label,
    description,
    target: anchor
  };
}

function addGroupOccurrence(store, key, occurrence) {
  if (!key || !occurrence) return;
  const normalizedKey = normalizeComparableText(key) || String(key).toLowerCase();
  if (!normalizedKey) return;

  if (!store.byKey.has(normalizedKey)) {
    store.byKey.set(normalizedKey, []);
  }

  const current = store.byKey.get(normalizedKey);
  if (!current.some((entry) => entry.target === occurrence.target)) {
    current.push(occurrence);
  }
}

function getSectionForLine(documentIndex, lineNumber) {
  return documentIndex.headings.find((heading) => heading.lineStart <= lineNumber && lineNumber <= heading.lineEnd) || null;
}

function normalizeRequirementKey(line) {
  return normalizeComparableText(String(line || '').replace(REQUIREMENT_PATTERN, ' '));
}

function extractGlossaryOccurrences(documentIndex) {
  const occurrences = [];

  documentIndex.headings.forEach((heading) => {
    if (!GLOSSARY_HEADING_PATTERN.test(heading.title)) return;

    for (let lineIndex = heading.lineStart; lineIndex <= heading.lineEnd; lineIndex += 1) {
      const line = documentIndex.lines[lineIndex - 1];
      if (!line) continue;

      const strongListMatch = line.match(/^\s*[-*+]\s+\*\*([^*]{2,80})\*\*\s*:\s+(.+)$/);
      const strongMatch = line.match(/^\s*\*\*([^*]{2,80})\*\*\s*:\s+(.+)$/);
      const plainMatch = line.match(/^\s*([A-Z][A-Za-z0-9 /()_-]{2,80})\s*:\s+(.+)$/);
      const match = strongListMatch || strongMatch || plainMatch;
      if (!match) continue;

      const term = match[1].trim();
      const definition = match[2].trim();
      const normalizedTerm = normalizeComparableText(term);
      if (!normalizedTerm || normalizedTerm.length < 3) continue;

      occurrences.push(createOccurrence({
        documentIndex,
        section: heading,
        lineNumber: lineIndex,
        label: term,
        description: definition,
        type: 'shared_term',
        key: normalizedTerm
      }));
    }
  });

  return occurrences;
}

function extractIdentifierOccurrences(documentIndex) {
  const occurrences = [];

  documentIndex.lines.forEach((line, index) => {
    const matches = line.match(IDENTIFIER_PATTERN) || [];
    const section = documentIndex.headings.find((heading) => heading.lineStart <= index + 1 && index + 1 <= heading.lineEnd) || null;

    matches.forEach((identifier) => {
      if (/^L\d+-\d+$/i.test(identifier)) return;

      occurrences.push(createOccurrence({
        documentIndex,
        section,
        lineNumber: index + 1,
        label: identifier,
        description: line.trim(),
        type: 'shared_identifier',
        key: identifier.toUpperCase()
      }));
    });
  });

  return occurrences;
}

function extractWorkflowOccurrences(documentIndex) {
  const occurrences = [];

  documentIndex.headings.forEach((heading) => {
    if (!WORKFLOW_HEADING_PATTERN.test(heading.title)) return;

    for (let lineIndex = heading.lineStart; lineIndex <= heading.lineEnd; lineIndex += 1) {
      const line = documentIndex.lines[lineIndex - 1];
      if (!line) continue;

      const orderedMatch = line.match(/^\s*(\d+)\.\s+(.+)$/);
      if (!orderedMatch) continue;

      const stepNumber = orderedMatch[1];
      const stepText = orderedMatch[2].trim();
      const normalizedStepText = normalizeComparableText(stepText);
      if (!normalizedStepText) continue;

      occurrences.push(createOccurrence({
        documentIndex,
        section: heading,
        lineNumber: lineIndex,
        label: `${stepNumber}. ${stepText}`,
        description: stepText,
        type: 'workflow_step',
        key: `${stepNumber}::${normalizedStepText}`
      }));
    }
  });

  return occurrences;
}

function extractRequirementOccurrences(documentIndex) {
  const occurrences = [];

  documentIndex.lines.forEach((line, index) => {
    const matches = line.match(REQUIREMENT_PATTERN) || [];
    if (matches.length === 0) return;

    const normalizedKey = normalizeRequirementKey(line);
    if (!normalizedKey) return;

    const section = getSectionForLine(documentIndex, index + 1);
    occurrences.push(createOccurrence({
      documentIndex,
      section,
      lineNumber: index + 1,
      label: line.trim(),
      description: line.trim(),
      type: 'requirement_clause',
      key: normalizedKey
    }));
  });

  return occurrences;
}

function extractStateOccurrences(documentIndex) {
  const occurrences = [];

  documentIndex.lines.forEach((line, index) => {
    if (!/(->|\u2192)/.test(line)) return;

    const tokens = Array.from(line.matchAll(STATE_TRANSITION_PATTERN))
      .map((match) => match[1])
      .filter((token) => token.length >= 3);

    if (tokens.length < 2) return;

    const section = getSectionForLine(documentIndex, index + 1);
    tokens.forEach((token) => {
      occurrences.push(createOccurrence({
        documentIndex,
        section,
        lineNumber: index + 1,
        label: token,
        description: line.trim(),
        type: 'state_symbol',
        key: token.toUpperCase()
      }));
    });
  });

  return occurrences;
}

function extractApiOccurrences(documentIndex) {
  const occurrences = [];

  documentIndex.lines.forEach((line, index) => {
    const section = getSectionForLine(documentIndex, index + 1);
    Array.from(line.matchAll(API_PATTERN)).forEach((match) => {
      const method = match[1].toUpperCase();
      const path = match[2];
      occurrences.push(createOccurrence({
        documentIndex,
        section,
        lineNumber: index + 1,
        label: `${method} ${path}`,
        description: line.trim(),
        type: 'api_surface',
        key: `${method} ${path}`
      }));
    });
  });

  return occurrences;
}

function extractActorOccurrences(documentIndex) {
  const occurrences = [];

  documentIndex.lines.forEach((line, index) => {
    const match = line.match(ACTOR_PATTERN);
    if (!match) return;

    const actor = match[1].toLowerCase();
    const section = getSectionForLine(documentIndex, index + 1);
    occurrences.push(createOccurrence({
      documentIndex,
      section,
      lineNumber: index + 1,
      label: match[1],
      description: line.trim(),
      type: 'actor_role',
      key: actor.endsWith('s') ? actor.slice(0, -1) : actor
    }));
  });

  return occurrences;
}

function extractReferenceOccurrences(documentIndex) {
  const occurrences = [];

  documentIndex.lines.forEach((line, index) => {
    const section = getSectionForLine(documentIndex, index + 1);
    Array.from(line.matchAll(MARKDOWN_LINK_PATTERN)).forEach((match) => {
      const label = match[1].trim();
      const target = match[2].trim();
      if (!target) return;

      occurrences.push(createOccurrence({
        documentIndex,
        section,
        lineNumber: index + 1,
        label,
        description: target,
        type: 'document_reference',
        key: target
      }));
    });
  });

  return occurrences;
}

function buildHeadingOccurrences(projectIndex) {
  const occurrences = [];

  projectIndex.documents.forEach((documentIndex) => {
    documentIndex.headings.forEach((heading) => {
      const normalizedHeading = normalizeComparableText(heading.title);
      if (!normalizedHeading) return;

      occurrences.push(createOccurrence({
        documentIndex,
        section: heading,
        lineNumber: heading.lineStart,
        label: heading.title,
        description: heading.title,
        type: 'shared_heading',
        key: normalizedHeading
      }));
    });
  });

  return occurrences;
}

function buildGroupSummary(store) {
  return Array.from(store.byKey.values()).filter((occurrences) => occurrences.length > 1);
}

function extractIssueTextContext(issue = {}) {
  return [
    issue.description,
    issue.evidence,
    issue.section,
    issue.detector_name,
    issue.why_triggered
  ]
    .filter(Boolean)
    .map((value) => String(value));
}

function buildCrossFileLinkScore(link) {
  const typeScores = {
    shared_identifier: 90,
    shared_term: 80,
    workflow_step: 75,
    requirement_clause: 85,
    api_surface: 82,
    state_symbol: 78,
    actor_role: 70,
    shared_heading: 65
  };

  return typeScores[link.type] || 50;
}

function mergeCrossFileLinks(linkSets) {
  const byTarget = new Map();

  linkSets.flat().forEach((link) => {
    if (!link?.target) return;
    const existing = byTarget.get(link.target);
    if (!existing) {
      byTarget.set(link.target, link);
      return;
    }

    if ((link.score || 0) > (existing.score || 0)) {
      byTarget.set(link.target, {
        ...link,
        related_keys: Array.from(new Set([...(existing.related_keys || []), ...(link.related_keys || [])]))
      });
      return;
    }

    existing.related_keys = Array.from(new Set([...(existing.related_keys || []), ...(link.related_keys || [])]));
  });

  return Array.from(byTarget.values())
    .sort((a, b) => (b.score || 0) - (a.score || 0) || a.target.localeCompare(b.target))
    .map(({ score, ...link }) => link);
}

function buildGroupLinks({ groups, issueText, excludeFiles, primaryAnchors }) {
  const links = [];

  groups.forEach((occurrences) => {
    const representative = occurrences[0];
    if (!representative) return;

    const normalizedKey = normalizeComparableText(representative.key);
    if (!normalizedKey) return;

    const isRelevant = issueText.some((text) => {
      const normalizedText = normalizeComparableText(text);
      if (normalizedText.includes(normalizedKey)) return true;

      if (representative.type === 'requirement_clause') {
        const normalizedRequirementText = normalizeRequirementKey(text);
        return Boolean(normalizedRequirementText && normalizedRequirementText.includes(normalizedKey));
      }

      return false;
    });
    if (!isRelevant) return;

    occurrences.forEach((occurrence) => {
      if (excludeFiles.has(occurrence.file.toLowerCase())) return;
      if (primaryAnchors.has(occurrence.target)) return;

      links.push({
        type: occurrence.type,
        label: occurrence.label,
        file: occurrence.file,
        section: occurrence.section,
        target: occurrence.target,
        related_keys: [representative.key],
        score: buildCrossFileLinkScore(occurrence)
      });
    });
  });

  return links;
}

function determineDetectionSource(issue) {
  const current = typeof issue.detection_source === 'string' ? issue.detection_source.trim().toLowerCase() : '';
  if (current === 'rule') {
    return Array.isArray(issue.cross_file_links) && issue.cross_file_links.length > 0 ? 'hybrid' : 'rule';
  }
  if (Array.isArray(issue.cross_file_links) && issue.cross_file_links.length > 0) {
    return 'hybrid';
  }
  if (issue.document_anchor || issue.anchor_source) {
    return 'hybrid';
  }
  return current === 'hybrid' ? 'hybrid' : 'model';
}

export function buildMarkdownProjectGraph(files = []) {
  const projectIndex = buildMarkdownProjectIndex(files);
  const headingStore = { byKey: new Map() };
  const glossaryStore = { byKey: new Map() };
  const identifierStore = { byKey: new Map() };
  const workflowStore = { byKey: new Map() };
  const requirementStore = { byKey: new Map() };
  const stateStore = { byKey: new Map() };
  const apiStore = { byKey: new Map() };
  const actorStore = { byKey: new Map() };

  const headingOccurrences = buildHeadingOccurrences(projectIndex);
  const glossaryOccurrences = [];
  const identifierOccurrences = [];
  const workflowOccurrences = [];
  const requirementOccurrences = [];
  const stateOccurrences = [];
  const apiOccurrences = [];
  const actorOccurrences = [];
  const referenceOccurrences = [];

  headingOccurrences.forEach((occurrence) => addGroupOccurrence(headingStore, occurrence.key, occurrence));
  projectIndex.documents.forEach((documentIndex) => {
    const glossaryResults = extractGlossaryOccurrences(documentIndex);
    const identifierResults = extractIdentifierOccurrences(documentIndex);
    const workflowResults = extractWorkflowOccurrences(documentIndex);
    const requirementResults = extractRequirementOccurrences(documentIndex);
    const stateResults = extractStateOccurrences(documentIndex);
    const apiResults = extractApiOccurrences(documentIndex);
    const actorResults = extractActorOccurrences(documentIndex);
    const referenceResults = extractReferenceOccurrences(documentIndex);

    glossaryOccurrences.push(...glossaryResults);
    identifierOccurrences.push(...identifierResults);
    workflowOccurrences.push(...workflowResults);
    requirementOccurrences.push(...requirementResults);
    stateOccurrences.push(...stateResults);
    apiOccurrences.push(...apiResults);
    actorOccurrences.push(...actorResults);
    referenceOccurrences.push(...referenceResults);

    glossaryResults.forEach((occurrence) => addGroupOccurrence(glossaryStore, occurrence.key, occurrence));
    identifierResults.forEach((occurrence) => addGroupOccurrence(identifierStore, occurrence.key, occurrence));
    workflowResults.forEach((occurrence) => addGroupOccurrence(workflowStore, occurrence.key, occurrence));
    requirementResults.forEach((occurrence) => addGroupOccurrence(requirementStore, occurrence.key, occurrence));
    stateResults.forEach((occurrence) => addGroupOccurrence(stateStore, occurrence.key, occurrence));
    apiResults.forEach((occurrence) => addGroupOccurrence(apiStore, occurrence.key, occurrence));
    actorResults.forEach((occurrence) => addGroupOccurrence(actorStore, occurrence.key, occurrence));
  });

  const headingGroups = buildGroupSummary(headingStore);
  const glossaryGroups = buildGroupSummary(glossaryStore);
  const identifierGroups = buildGroupSummary(identifierStore);
  const workflowGroups = buildGroupSummary(workflowStore);
  const requirementGroups = buildGroupSummary(requirementStore);
  const stateGroups = buildGroupSummary(stateStore);
  const apiGroups = buildGroupSummary(apiStore);
  const actorGroups = buildGroupSummary(actorStore);

  return {
    projectIndex,
    headingOccurrences,
    glossaryOccurrences,
    identifierOccurrences,
    workflowOccurrences,
    requirementOccurrences,
    stateOccurrences,
    apiOccurrences,
    actorOccurrences,
    referenceOccurrences,
    headingGroups,
    glossaryGroups,
    identifierGroups,
    workflowGroups,
    requirementGroups,
    stateGroups,
    apiGroups,
    actorGroups,
    summary: {
      documentCount: projectIndex.summary.documentCount,
      headingGroupCount: headingGroups.length,
      glossaryTermGroupCount: glossaryGroups.length,
      identifierGroupCount: identifierGroups.length,
      workflowGroupCount: workflowGroups.length,
      requirementGroupCount: requirementGroups.length,
      stateGroupCount: stateGroups.length,
      apiGroupCount: apiGroups.length,
      actorGroupCount: actorGroups.length,
      referenceCount: referenceOccurrences.length
    }
  };
}

export function enrichIssueWithProjectGraph(issue, projectGraph, diagnostics = null) {
  if (!issue || !projectGraph) return issue;

  const enriched = { ...issue };
  const issueText = extractIssueTextContext(enriched);
  const primaryAnchors = new Set(
    [
      enriched.document_anchor,
      ...(Array.isArray(enriched.document_anchors) ? enriched.document_anchors : [])
    ].filter(Boolean)
  );

  const primaryFile = enriched.files?.[0];
  const excludeFiles = new Set(primaryFile ? [String(primaryFile).toLowerCase()] : []);

  const graphLinks = mergeCrossFileLinks([
    buildGroupLinks({
      groups: projectGraph.headingGroups,
      issueText,
      excludeFiles,
      primaryAnchors
    }),
    buildGroupLinks({
      groups: projectGraph.glossaryGroups,
      issueText,
      excludeFiles,
      primaryAnchors
    }),
    buildGroupLinks({
      groups: projectGraph.identifierGroups,
      issueText,
      excludeFiles,
      primaryAnchors
    }),
    buildGroupLinks({
      groups: projectGraph.workflowGroups,
      issueText,
      excludeFiles,
      primaryAnchors
    }),
    buildGroupLinks({
      groups: projectGraph.requirementGroups,
      issueText,
      excludeFiles,
      primaryAnchors
    }),
    buildGroupLinks({
      groups: projectGraph.stateGroups,
      issueText,
      excludeFiles,
      primaryAnchors
    }),
    buildGroupLinks({
      groups: projectGraph.apiGroups,
      issueText,
      excludeFiles,
      primaryAnchors
    }),
    buildGroupLinks({
      groups: projectGraph.actorGroups,
      issueText,
      excludeFiles,
      primaryAnchors
    })
  ]).slice(0, 6);

  if (graphLinks.length > 0) {
    enriched.cross_file_links = graphLinks;
    if (diagnostics) {
      diagnostics.deterministic_graph_link_enrichment_count += 1;
    }
  }

  enriched.detection_source = determineDetectionSource(enriched);
  return enriched;
}

function stripMarkdownInlineFormatting(value) {
  return String(value || '')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/~~([^~]+)~~/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

function normalizeComparableText(value) {
  return stripMarkdownInlineFormatting(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenizeComparableText(value) {
  const normalized = normalizeComparableText(value);
  return normalized ? normalized.split(' ') : [];
}

function buildHeadingSlug(value) {
  return normalizeComparableText(value).replace(/\s+/g, '-');
}

function isFenceMarker(line) {
  return /^\s*(```|~~~)/.test(line);
}

function isListLikeLine(line) {
  return /^\s*([-+*]|\d+\.)\s+/.test(line);
}

function getTokenOverlapScore(a, b) {
  const aTokens = new Set(tokenizeComparableText(a));
  const bTokens = new Set(tokenizeComparableText(b));

  if (aTokens.size === 0 || bTokens.size === 0) {
    return 0;
  }

  let overlap = 0;
  aTokens.forEach((token) => {
    if (bTokens.has(token)) overlap += 1;
  });

  return overlap / Math.max(aTokens.size, bTokens.size);
}

function buildFileAliases(file = {}) {
  const aliases = new Set();
  [file.name, file.originalName, file.path].forEach((value) => {
    if (!value) return;
    aliases.add(String(value).toLowerCase());
  });

  if (file.path) {
    const pathParts = String(file.path).split(/[/\\]/).filter(Boolean);
    if (pathParts.length > 0) {
      aliases.add(pathParts[pathParts.length - 1].toLowerCase());
    }
  }

  return Array.from(aliases);
}

function createHeadingMatchScore(heading, sectionText) {
  const normalizedSection = normalizeComparableText(sectionText);
  const sectionSlug = buildHeadingSlug(sectionText);

  if (!normalizedSection) return 0;
  if (heading.normalizedTitle === normalizedSection) return 1;
  if (heading.slug === sectionSlug) return 0.98;
  if (heading.normalizedTitle.includes(normalizedSection) || normalizedSection.includes(heading.normalizedTitle)) return 0.88;

  const overlap = getTokenOverlapScore(heading.title, sectionText);
  if (overlap >= 0.75) return 0.75;
  if (overlap >= 0.5) return 0.55;
  return 0;
}

function pickBestUniqueMatch(matches, minimumScore = 0) {
  const eligible = matches
    .filter((entry) => entry && Number.isFinite(entry.score) && entry.score >= minimumScore)
    .sort((a, b) => b.score - a.score);

  if (eligible.length === 0) return null;
  if (eligible.length === 1) return eligible[0];
  if (eligible[0].score > eligible[1].score) return eligible[0];
  return null;
}

function getBestHeadingForSection(documentIndex, sectionText) {
  if (!documentIndex || !sectionText) return null;

  const matches = documentIndex.headings.map((heading) => ({
    heading,
    score: createHeadingMatchScore(heading, sectionText)
  }));

  return pickBestUniqueMatch(matches, 0.55);
}

function buildNormalizedLineWindows(documentIndex, startIndex, maxLines) {
  const windows = [];
  let aggregate = '';

  for (let endIndex = startIndex; endIndex < Math.min(documentIndex.normalizedLines.length, startIndex + maxLines); endIndex += 1) {
    const nextLine = documentIndex.normalizedLines[endIndex];
    if (!nextLine) {
      if (aggregate) {
        aggregate = aggregate.trim();
      }
      continue;
    }

    aggregate = `${aggregate} ${nextLine}`.trim();
    windows.push({
      startLine: startIndex + 1,
      endLine: endIndex + 1,
      text: aggregate
    });
  }

  return windows;
}

function extractIssueEvidenceSnippets(issue = {}) {
  const candidates = [];
  const seen = new Set();

  const pushSnippet = (text, source) => {
    const normalized = normalizeComparableText(text);
    if (!normalized || normalized.length < 18 || seen.has(normalized)) return;
    seen.add(normalized);
    candidates.push({
      source,
      text: String(text).trim(),
      normalized
    });
  };

  [
    { value: issue.evidence, source: 'evidence' },
    { value: issue.description, source: 'description' }
  ].forEach(({ value, source }) => {
    if (!value) return;
    String(value)
      .split(/\r?\n+/)
      .flatMap((segment) => segment.split(/(?<=[.!?;:])\s+/))
      .forEach((segment) => pushSnippet(segment, source));
  });

  return candidates
    .sort((a, b) => b.normalized.length - a.normalized.length)
    .slice(0, 8);
}

function findBestSnippetMatchInDocument(documentIndex, snippets) {
  if (!documentIndex || !Array.isArray(snippets) || snippets.length === 0) {
    return null;
  }

  let bestMatch = null;

  snippets.forEach((snippet) => {
    for (let startIndex = 0; startIndex < documentIndex.normalizedLines.length; startIndex += 1) {
      const windows = buildNormalizedLineWindows(documentIndex, startIndex, 4);
      for (const window of windows) {
        if (!window.text) continue;

        const containsSnippet = window.text.includes(snippet.normalized);
        const containedBySnippet = snippet.normalized.includes(window.text) && window.text.length >= 18;
        if (!containsSnippet && !containedBySnippet) continue;

        const lengthScore = Math.min(window.text.length, snippet.normalized.length);
        const spanPenalty = (window.endLine - window.startLine) * 4;
        const sourceBoost = snippet.source === 'evidence' ? 40 : 20;
        const score = 100 + sourceBoost + lengthScore - spanPenalty;

        if (!bestMatch || score > bestMatch.score) {
          bestMatch = {
            score,
            lineStart: window.startLine,
            lineEnd: window.endLine,
            snippetSource: snippet.source,
            snippetText: snippet.text
          };
        }
      }
    }
  });

  return bestMatch;
}

function getHeadingContainingLine(documentIndex, lineNumber) {
  if (!documentIndex || !Number.isFinite(Number(lineNumber))) return null;

  const targetLine = Number(lineNumber);
  let candidate = null;

  documentIndex.headings.forEach((heading) => {
    if (heading.lineStart <= targetLine && targetLine <= heading.lineEnd) {
      if (!candidate || heading.lineStart >= candidate.lineStart) {
        candidate = heading;
      }
    }
  });

  return candidate;
}

function resolveDocumentCandidates(issue, projectIndex) {
  if (!projectIndex || projectIndex.documents.length === 0) return [];

  const requestedFiles = Array.isArray(issue.files) ? issue.files : [];
  const matches = new Map();

  requestedFiles.forEach((reference) => {
    if (!reference) return;
    const normalizedReference = String(reference).toLowerCase();
    projectIndex.documents.forEach((documentIndex) => {
      if (documentIndex.aliases.includes(normalizedReference)) {
        matches.set(documentIndex.id, documentIndex);
      }
    });
  });

  return Array.from(matches.values());
}

function getBestHeadingFromIssueContext(documentIndex, issue) {
  if (!documentIndex || documentIndex.headings.length === 0) return null;

  const contextCandidates = [
    issue.section,
    issue.detector_name,
    issue.description,
    issue.evidence
  ].filter(Boolean);

  const matches = documentIndex.headings.map((heading) => {
    const score = contextCandidates.reduce((bestScore, candidate) => {
      return Math.max(bestScore, getTokenOverlapScore(heading.title, candidate));
    }, 0);

    return { heading, score };
  });

  return pickBestUniqueMatch(matches, 0.5);
}

function resolveAnchorCandidateForDocument(documentIndex, issue, snippets) {
  if (!documentIndex) return null;

  const explicitSectionMatch = issue.section
    ? getBestHeadingForSection(documentIndex, issue.section)
    : null;
  const lineMatch = findBestSnippetMatchInDocument(documentIndex, snippets);
  const existingLine = Number.isFinite(Number(issue.line_number)) ? Number(issue.line_number) : null;
  const verifiedHeading = existingLine ? getHeadingContainingLine(documentIndex, existingLine) : null;
  const inferredHeading = !explicitSectionMatch ? getBestHeadingFromIssueContext(documentIndex, issue) : null;
  const fallbackHeading = !explicitSectionMatch && !lineMatch && !verifiedHeading && !inferredHeading && documentIndex.headings.length === 1
    ? { heading: documentIndex.headings[0], score: 0.45 }
    : null;
  const resolvedHeading = explicitSectionMatch?.heading
    || (lineMatch ? getHeadingContainingLine(documentIndex, lineMatch.lineStart) : null)
    || verifiedHeading
    || inferredHeading?.heading
    || fallbackHeading?.heading
    || null;

  let anchorSource = '';
  let lineStart = existingLine;
  let lineEnd = Number.isFinite(Number(issue.line_end)) ? Number(issue.line_end) : undefined;
  let score = 0;

  if (lineMatch) {
    lineStart = lineMatch.lineStart;
    lineEnd = lineMatch.lineEnd > lineMatch.lineStart ? lineMatch.lineEnd : undefined;
    anchorSource = lineMatch.snippetSource === 'evidence' ? 'evidence_match' : 'description_match';
    score = lineMatch.score;
  } else if (existingLine && existingLine <= documentIndex.lineCount) {
    anchorSource = 'line_number_verified';
    score = 180;
  } else if (explicitSectionMatch?.heading) {
    lineStart = explicitSectionMatch.heading.lineStart;
    lineEnd = undefined;
    anchorSource = 'section_match';
    score = Math.round(explicitSectionMatch.score * 160);
  } else if (inferredHeading?.heading) {
    lineStart = inferredHeading.heading.lineStart;
    lineEnd = undefined;
    anchorSource = 'heading_inference';
    score = Math.round(inferredHeading.score * 120);
  } else if (fallbackHeading?.heading) {
    lineStart = fallbackHeading.heading.lineStart;
    lineEnd = undefined;
    anchorSource = 'single_heading_fallback';
    score = 70;
  } else if (documentIndex.lineCount > 0) {
    anchorSource = 'single_file_context';
    score = 30;
  }

  const anchorIssue = {
    files: [documentIndex.name],
    section: resolvedHeading?.title || issue.section || '',
    section_slug: resolvedHeading?.slug || (issue.section_slug || buildHeadingSlug(issue.section || '')),
    line_number: Number.isFinite(Number(lineStart)) ? Number(lineStart) : undefined,
    line_end: Number.isFinite(Number(lineEnd)) ? Number(lineEnd) : undefined
  };

  const anchor = buildIssueDocumentAnchor(anchorIssue);
  if (!anchor && anchorSource !== 'single_file_context') return null;

  return {
    documentIndex,
    heading: resolvedHeading,
    lineStart: anchorIssue.line_number,
    lineEnd: anchorIssue.line_end,
    anchorSource,
    score,
    documentAnchor: anchor || documentIndex.name
  };
}

function buildProjectDocumentSummary(projectIndex) {
  return {
    documentCount: projectIndex.documents.length,
    headingCount: projectIndex.documents.reduce((sum, documentIndex) => sum + documentIndex.headings.length, 0)
  };
}

export function buildIssueDocumentAnchor(issue = {}) {
  const filePart = issue.files?.[0];
  if (!filePart) return '';

  const slug = issue.section_slug || buildHeadingSlug(issue.section || '');
  const lineStart = Number.isFinite(Number(issue.line_number)) ? Number(issue.line_number) : null;
  const lineEnd = Number.isFinite(Number(issue.line_end)) ? Number(issue.line_end) : null;

  let anchor = filePart;
  if (slug) {
    anchor += `#${slug}`;
  }

  if (lineStart) {
    anchor += `:L${lineStart}`;
    if (lineEnd && lineEnd > lineStart) {
      anchor += `-L${lineEnd}`;
    }
  }

  return anchor;
}

export function buildMarkdownDocumentIndex(file = {}) {
  const content = String(file.content || '');
  const lines = content.split(/\r?\n/);
  const headings = [];
  const slugCounts = new Map();
  let inFence = false;

  const createUniqueSlug = (title) => {
    const baseSlug = buildHeadingSlug(title) || 'section';
    const nextCount = (slugCounts.get(baseSlug) || 0) + 1;
    slugCounts.set(baseSlug, nextCount);
    return nextCount === 1 ? baseSlug : `${baseSlug}-${nextCount}`;
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    if (isFenceMarker(line)) {
      inFence = !inFence;
      continue;
    }

    if (inFence) continue;

    const atxMatch = line.match(/^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (atxMatch && atxMatch[2]?.trim()) {
      const title = stripMarkdownInlineFormatting(atxMatch[2].trim());
      headings.push({
        level: atxMatch[1].length,
        title,
        normalizedTitle: normalizeComparableText(title),
        slug: createUniqueSlug(title),
        lineStart: index + 1,
        lineEnd: index + 1
      });
      continue;
    }

    const nextLine = lines[index + 1];
    if (
      nextLine &&
      line.trim() &&
      !isListLikeLine(line) &&
      /^\s*(=+|-{2,})\s*$/.test(nextLine)
    ) {
      const title = stripMarkdownInlineFormatting(line.trim());
      headings.push({
        level: nextLine.includes('=') ? 1 : 2,
        title,
        normalizedTitle: normalizeComparableText(title),
        slug: createUniqueSlug(title),
        lineStart: index + 1,
        lineEnd: index + 1
      });
      index += 1;
    }
  }

  headings.forEach((heading, index) => {
    const nextHeading = headings[index + 1];
    heading.lineEnd = nextHeading ? Math.max(heading.lineStart, nextHeading.lineStart - 1) : Math.max(1, lines.length);
  });

  return {
    id: `${file.path || file.name || 'document'}::${file.lastModified || 0}`,
    name: file.name || file.originalName || 'unknown.md',
    originalName: file.originalName || file.name || 'unknown.md',
    path: file.path || '',
    aliases: buildFileAliases(file),
    lineCount: Math.max(1, lines.length),
    headings,
    normalizedLines: lines.map((line) => normalizeComparableText(line)),
    normalizedContent: normalizeComparableText(content)
  };
}

export function buildMarkdownProjectIndex(files = []) {
  const documents = (Array.isArray(files) ? files : [])
    .filter((file) => file && typeof file.content === 'string')
    .map((file) => buildMarkdownDocumentIndex(file));

  return {
    documents,
    summary: buildProjectDocumentSummary({ documents })
  };
}

export function enrichIssueWithMarkdownIndex(issue, projectIndex, diagnostics = null) {
  if (!issue || !projectIndex || projectIndex.documents.length === 0) {
    return issue;
  }

  const enriched = { ...issue };
  const directCandidates = resolveDocumentCandidates(enriched, projectIndex);
  const candidateDocuments = directCandidates.length > 0 ? directCandidates : projectIndex.documents;
  const snippets = extractIssueEvidenceSnippets(enriched);
  const anchorCandidates = candidateDocuments
    .map((documentIndex) => resolveAnchorCandidateForDocument(documentIndex, enriched, snippets))
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || a.documentIndex.name.localeCompare(b.documentIndex.name));

  const bestCandidate = anchorCandidates[0];
  const targetDocument = bestCandidate?.documentIndex || (candidateDocuments.length === 1 ? candidateDocuments[0] : null);

  if (!targetDocument || !bestCandidate) {
    return enriched;
  }

  let anchorChanged = false;
  let fileAssigned = false;
  let sectionAssigned = false;
  let lineAssigned = false;
  let multiAnchorAssigned = false;
  let fallbackAnchorAssigned = false;

  const currentPrimaryFile = enriched.files?.[0];
  const normalizedPrimaryFile = currentPrimaryFile ? String(currentPrimaryFile).toLowerCase() : '';
  if (!currentPrimaryFile || !targetDocument.aliases.includes(normalizedPrimaryFile)) {
    const remainingFiles = Array.isArray(enriched.files)
      ? enriched.files.filter((fileName) => String(fileName).toLowerCase() !== targetDocument.name.toLowerCase())
      : [];
    enriched.files = [targetDocument.name, ...remainingFiles];
    anchorChanged = true;
    fileAssigned = true;
  }

  const resolvedHeading = bestCandidate.heading;

  if (resolvedHeading) {
    if (!enriched.section || normalizeComparableText(enriched.section) !== resolvedHeading.normalizedTitle) {
      enriched.section = resolvedHeading.title;
      sectionAssigned = true;
      anchorChanged = true;
    }

    if (enriched.section_slug !== resolvedHeading.slug) {
      enriched.section_slug = resolvedHeading.slug;
      anchorChanged = true;
    }
  }

  if (Number.isFinite(Number(bestCandidate.lineStart))) {
    const resolvedLineStart = Number(bestCandidate.lineStart);
    const resolvedLineEnd = Number.isFinite(Number(bestCandidate.lineEnd)) && Number(bestCandidate.lineEnd) > resolvedLineStart
      ? Number(bestCandidate.lineEnd)
      : undefined;

    if (enriched.line_number !== resolvedLineStart) {
      enriched.line_number = resolvedLineStart;
      lineAssigned = true;
      anchorChanged = true;
    }

    if ((resolvedLineEnd || null) !== (enriched.line_end || null)) {
      if (resolvedLineEnd) {
        enriched.line_end = resolvedLineEnd;
      } else {
        delete enriched.line_end;
      }
      anchorChanged = true;
    }
  }

  if (enriched.anchor_source !== bestCandidate.anchorSource) {
    enriched.anchor_source = bestCandidate.anchorSource;
    anchorChanged = true;
  }

  if (bestCandidate.anchorSource === 'heading_inference' || bestCandidate.anchorSource === 'single_heading_fallback' || bestCandidate.anchorSource === 'single_file_context') {
    fallbackAnchorAssigned = true;
  }

  const primaryDocumentAnchor = bestCandidate.documentAnchor || buildIssueDocumentAnchor(enriched);
  const additionalAnchors = anchorCandidates
    .slice(1)
    .map((candidate) => candidate.documentAnchor)
    .filter(Boolean);
  const documentAnchors = Array.from(new Set([primaryDocumentAnchor, ...additionalAnchors].filter(Boolean)));

  if (documentAnchors.length > 1) {
    multiAnchorAssigned = true;
  }

  const documentAnchor = primaryDocumentAnchor;
  if (documentAnchor) {
    if (enriched.document_anchor !== documentAnchor) {
      enriched.document_anchor = documentAnchor;
      anchorChanged = true;
    }
    if (
      !Array.isArray(enriched.document_anchors)
      || enriched.document_anchors.length !== documentAnchors.length
      || enriched.document_anchors.some((anchor, index) => anchor !== documentAnchors[index])
    ) {
      enriched.document_anchors = documentAnchors;
      anchorChanged = true;
    }
    if (!enriched.evidence_reference || enriched.evidence_reference.startsWith('detector_catalog:')) {
      enriched.evidence_reference = documentAnchor;
      anchorChanged = true;
    }
    if (enriched.detector_id) {
      const violationReference = `${documentAnchor}::${enriched.detector_id}`;
      if (enriched.violation_reference !== violationReference) {
        enriched.violation_reference = violationReference;
        anchorChanged = true;
      }
    }
  }

  if (diagnostics && anchorChanged) {
    diagnostics.deterministic_anchor_enrichment_count += 1;
    if (fileAssigned) diagnostics.deterministic_file_assignment_count += 1;
    if (sectionAssigned) diagnostics.deterministic_section_assignment_count += 1;
    if (lineAssigned) diagnostics.deterministic_line_assignment_count += 1;
    if (multiAnchorAssigned) diagnostics.deterministic_multi_anchor_count += 1;
    if (fallbackAnchorAssigned) diagnostics.deterministic_fallback_anchor_count += 1;
  }

  return enriched;
}

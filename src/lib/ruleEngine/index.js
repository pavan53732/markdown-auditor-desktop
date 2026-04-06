import {
  buildIssueDocumentAnchor,
  normalizeComparableText,
  normalizeEvidenceSpans
} from '../markdownIndex.js';

const WORKFLOW_HEADING_PATTERN = /\b(flow|workflow|steps|process|pipeline|sequence|lifecycle|procedure)\b/i;
const ROLLBACK_PATTERN = /\b(rollback|revert|undo|restore|recover|backout)\b/i;
const ACTION_PATTERN = /\b(apply|commit|delete|deploy|execute|export|migrate|mutate|release|remove|write)\b/i;
const TERMINAL_PATTERN = /\b(abort|aborted|complete|completed|deployed|done|failed|failure|finished|ready|stable|success|successful)\b/i;
const RFC_KEYWORD_PATTERN = /\b(MUST|SHALL|REQUIRED|SHOULD|RECOMMENDED|MAY|OPTIONAL)\b/g;
const RFC_LOWERCASE_PATTERN = /\b(must|shall|required|should|recommended|may|optional)\b/g;
const MARKDOWN_LINK_PATTERN = /\[([^\]]+)\]\(([^)]+)\)/g;

function createEvidenceSpan({ file, section = '', sectionSlug = '', lineStart, lineEnd, role = 'primary', source = 'rule', excerpt = '' }) {
  return {
    file,
    section,
    section_slug: sectionSlug,
    line_start: Number.isFinite(Number(lineStart)) ? Number(lineStart) : undefined,
    line_end: Number.isFinite(Number(lineEnd)) ? Number(lineEnd) : undefined,
    anchor: buildIssueDocumentAnchor({
      files: [file],
      section,
      section_slug: sectionSlug,
      line_number: lineStart,
      line_end: lineEnd
    }),
    role,
    source,
    excerpt
  };
}

function buildLineExcerpt(documentIndex, startLine, endLine = startLine) {
  if (!documentIndex || !Number.isFinite(Number(startLine))) return '';
  return documentIndex.lines
    .slice(Number(startLine) - 1, Number(endLine))
    .map((line) => line.trim())
    .filter(Boolean)
    .join(' ')
    .slice(0, 280);
}

function getSectionForLine(documentIndex, lineNumber) {
  return documentIndex.headings.find((heading) => heading.lineStart <= lineNumber && lineNumber <= heading.lineEnd) || null;
}

function createRuleIssue({
  detectorId,
  severity,
  description,
  files,
  section = '',
  sectionSlug = '',
  lineNumber,
  lineEnd,
  evidence,
  whyTriggered,
  confidence = 0.99,
  evidenceSpans = [],
  deterministicFix = '',
  recommendedFix = ''
}) {
  const normalizedSpans = normalizeEvidenceSpans(evidenceSpans);
  const documentAnchor = buildIssueDocumentAnchor({
    files,
    section,
    section_slug: sectionSlug,
    line_number: lineNumber,
    line_end: lineEnd
  });

  return {
    detector_id: detectorId,
    severity,
    description,
    files,
    section,
    section_slug: sectionSlug,
    line_number: lineNumber,
    line_end: lineEnd,
    document_anchor: documentAnchor || undefined,
    document_anchors: documentAnchor ? [documentAnchor] : undefined,
    anchor_source: 'deterministic_rule_engine',
    evidence,
    evidence_spans: normalizedSpans,
    why_triggered: whyTriggered,
    confidence,
    detection_source: 'rule',
    analysis_agent: 'deterministic_rule_engine',
    analysis_agents: ['deterministic_rule_engine'],
    deterministic_fix: deterministicFix || undefined,
    recommended_fix: recommendedFix || undefined
  };
}

function pushIssue(issues, issue) {
  if (!issue) return;
  issues.push(issue);
}

function runDuplicateHeadingRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    const groups = new Map();
    documentIndex.headings.forEach((heading) => {
      if (!heading.normalizedTitle) return;
      if (!groups.has(heading.normalizedTitle)) groups.set(heading.normalizedTitle, []);
      groups.get(heading.normalizedTitle).push(heading);
    });

    groups.forEach((group) => {
      if (group.length < 2) return;

      const first = group[0];
      const evidenceSpans = group.map((heading) => createEvidenceSpan({
        file: documentIndex.name,
        section: heading.title,
        sectionSlug: heading.slug,
        lineStart: heading.lineStart,
        role: heading === first ? 'primary' : 'supporting',
        source: 'duplicate_heading',
        excerpt: buildLineExcerpt(documentIndex, heading.lineStart)
      }));

      pushIssue(issues, createRuleIssue({
        detectorId: 'L3-03',
        severity: 'medium',
        description: `Heading "${first.title}" appears ${group.length} times in ${documentIndex.name}, creating duplicate section structure.`,
        files: [documentIndex.name],
        section: first.title,
        sectionSlug: first.slug,
        lineNumber: first.lineStart,
        evidence: `Duplicate heading "${first.title}" appears on lines ${group.map((heading) => heading.lineStart).join(', ')}.`,
        whyTriggered: 'The same normalized heading title is repeated multiple times in the same Markdown file.',
        evidenceSpans,
        deterministicFix: 'Merge the duplicated sections or rename the headings so each section title is unique within the document.',
        recommendedFix: 'Consolidate repeated sections under one heading or give each section a distinct contract-specific title.'
      }));
    });
  });
}

function resolveReferenceTarget(target, projectGraph, sourceDocument) {
  if (!target || /^(https?:|mailto:)/i.test(target)) return { valid: true };

  const [rawFilePart, rawSlugPart] = target.split('#');
  const filePart = rawFilePart.trim();
  const slugPart = (rawSlugPart || '').trim().toLowerCase();

  if (!filePart) {
    const slugExists = sourceDocument.headings.some((heading) => heading.slug === slugPart);
    return {
      valid: slugExists,
      reason: slugExists ? '' : `Anchor "#${slugPart}" does not exist in ${sourceDocument.name}.`
    };
  }

  const normalizedFilePart = filePart.replace(/^\.?[\\/]/, '').toLowerCase();
  const targetDocument = projectGraph.projectIndex.documents.find((documentIndex) =>
    documentIndex.aliases.includes(normalizedFilePart)
    || documentIndex.name.toLowerCase() === normalizedFilePart
  );

  if (!targetDocument) {
    return {
      valid: false,
      reason: `Referenced file "${filePart}" is not part of the loaded Markdown set.`
    };
  }

  if (!slugPart) {
    return { valid: true };
  }

  const slugExists = targetDocument.headings.some((heading) => heading.slug === slugPart);
  return {
    valid: slugExists,
    reason: slugExists ? '' : `Anchor "#${slugPart}" does not exist in ${targetDocument.name}.`
  };
}

function runBrokenCrossReferenceRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    documentIndex.lines.forEach((line, index) => {
      Array.from(line.matchAll(MARKDOWN_LINK_PATTERN)).forEach((match) => {
        const target = match[2].trim();
        const resolution = resolveReferenceTarget(target, projectGraph, documentIndex);
        if (resolution.valid) return;

        const section = getSectionForLine(documentIndex, index + 1);
        pushIssue(issues, createRuleIssue({
          detectorId: 'L13-05',
          severity: 'high',
          description: `Cross-reference "${target}" in ${documentIndex.name} does not resolve to a loaded file or heading.`,
          files: [documentIndex.name],
          section: section?.title || '',
          sectionSlug: section?.slug || '',
          lineNumber: index + 1,
          evidence: line.trim(),
          whyTriggered: resolution.reason,
          evidenceSpans: [
            createEvidenceSpan({
              file: documentIndex.name,
              section: section?.title || '',
              sectionSlug: section?.slug || '',
              lineStart: index + 1,
              source: 'broken_reference',
              excerpt: line.trim()
            })
          ],
          deterministicFix: 'Update the Markdown link target so it points to an existing loaded file and heading slug.',
          recommendedFix: 'Rename the target heading to match the link slug or correct the link target.'
        }));
      });
    });
  });
}

function runRfc2119Rule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    const documentText = documentIndex.lines.join('\n');
    const normativeDocument = /\bRFC ?2119\b|\bRFC ?8174\b/.test(documentText) || /\b(MUST|SHALL|SHOULD|MAY|REQUIRED|RECOMMENDED|OPTIONAL)\b/.test(documentText);
    if (!normativeDocument) return;

    documentIndex.lines.forEach((line, index) => {
      const uppercaseKeywords = Array.from(new Set((line.match(RFC_KEYWORD_PATTERN) || []).map((keyword) => keyword.toUpperCase())));
      const lowercaseKeywords = Array.from(new Set((line.match(RFC_LOWERCASE_PATTERN) || []).map((keyword) => keyword.toLowerCase())));
      const containsMixedLowercase = lowercaseKeywords.length > 0 && uppercaseKeywords.length === 0;
      const containsConflictingUppercase = uppercaseKeywords.length > 1;

      if (!containsMixedLowercase && !containsConflictingUppercase) return;

      const section = getSectionForLine(documentIndex, index + 1);
      const reason = containsMixedLowercase
        ? `Normative line uses lowercase modal keywords (${lowercaseKeywords.join(', ')}) in a document that uses RFC 2119/8174 style requirements.`
        : `Line mixes multiple RFC 2119 keywords (${uppercaseKeywords.join(', ')}) without clarifying precedence.`;

      pushIssue(issues, createRuleIssue({
        detectorId: 'L15-11',
        severity: 'medium',
        description: `RFC 2119 keyword usage is inconsistent on line ${index + 1} of ${documentIndex.name}.`,
        files: [documentIndex.name],
        section: section?.title || '',
        sectionSlug: section?.slug || '',
        lineNumber: index + 1,
        evidence: line.trim(),
        whyTriggered: reason,
        evidenceSpans: [
          createEvidenceSpan({
            file: documentIndex.name,
            section: section?.title || '',
            sectionSlug: section?.slug || '',
            lineStart: index + 1,
            source: 'rfc2119_keyword_rule',
            excerpt: line.trim()
          })
        ],
        deterministicFix: 'Standardize normative keywords to explicit RFC 2119/8174 capitalization and remove ambiguous mixed-strength wording.',
        recommendedFix: 'Use one clearly intended requirement keyword per statement and capitalize it consistently.'
      }));
    });
  });
}

function collectWorkflowSections(documentIndex) {
  return documentIndex.headings.filter((heading) => WORKFLOW_HEADING_PATTERN.test(heading.title)).map((heading) => {
    const lines = [];
    for (let lineNumber = heading.lineStart; lineNumber <= heading.lineEnd; lineNumber += 1) {
      lines.push({
        lineNumber,
        text: documentIndex.lines[lineNumber - 1] || ''
      });
    }

    const numberedSteps = lines
      .map(({ lineNumber, text }) => {
        const match = text.match(/^\s*(\d+)\.\s+(.+)$/);
        if (!match) return null;
        return {
          number: Number(match[1]),
          text: match[2].trim(),
          lineNumber
        };
      })
      .filter(Boolean);

    return { heading, lines, numberedSteps };
  });
}

function runWorkflowOrderingRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectWorkflowSections(documentIndex).forEach(({ heading, numberedSteps }) => {
      if (numberedSteps.length < 2) return;

      let orderingBroken = numberedSteps[0].number !== 1;
      for (let index = 1; index < numberedSteps.length && !orderingBroken; index += 1) {
        const expected = numberedSteps[index - 1].number + 1;
        if (numberedSteps[index].number !== expected) {
          orderingBroken = true;
        }
      }

      if (!orderingBroken) return;

      pushIssue(issues, createRuleIssue({
        detectorId: 'L47-01',
        severity: 'high',
        description: `Workflow step numbering in "${heading.title}" is incomplete or out of order in ${documentIndex.name}.`,
        files: [documentIndex.name],
        section: heading.title,
        sectionSlug: heading.slug,
        lineNumber: numberedSteps[0].lineNumber,
        lineEnd: numberedSteps[numberedSteps.length - 1].lineNumber,
        evidence: numberedSteps.map((step) => `${step.number}. ${step.text}`).join('\n'),
        whyTriggered: 'The numbered workflow steps are not contiguous from step 1, which creates deterministic ordering ambiguity.',
        evidenceSpans: numberedSteps.map((step, index) => createEvidenceSpan({
          file: documentIndex.name,
          section: heading.title,
          sectionSlug: heading.slug,
          lineStart: step.lineNumber,
          role: index === 0 ? 'primary' : 'supporting',
          source: 'workflow_ordering_rule',
          excerpt: `${step.number}. ${step.text}`
        })),
        deterministicFix: 'Renumber the workflow steps into one contiguous deterministic sequence.',
        recommendedFix: 'Ensure numbered workflow sections start at 1 and increase by one without gaps or duplicates.'
      }));
    });
  });
}

function runMissingRollbackRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectWorkflowSections(documentIndex).forEach(({ heading, lines, numberedSteps }) => {
      if (numberedSteps.length < 2) return;

      const sectionText = lines.map((entry) => entry.text).join('\n');
      if (!ACTION_PATTERN.test(sectionText) || ROLLBACK_PATTERN.test(sectionText)) {
        return;
      }

      pushIssue(issues, createRuleIssue({
        detectorId: 'L9-09',
        severity: 'high',
        description: `Workflow section "${heading.title}" in ${documentIndex.name} performs state-changing actions without a rollback path.`,
        files: [documentIndex.name],
        section: heading.title,
        sectionSlug: heading.slug,
        lineNumber: heading.lineStart,
        lineEnd: heading.lineEnd,
        evidence: sectionText.trim().slice(0, 500),
        whyTriggered: 'The section contains state-changing workflow steps but no rollback, revert, undo, restore, or recovery step.',
        evidenceSpans: [
          createEvidenceSpan({
            file: documentIndex.name,
            section: heading.title,
            sectionSlug: heading.slug,
            lineStart: heading.lineStart,
            lineEnd: heading.lineEnd,
            source: 'missing_rollback_rule',
            excerpt: buildLineExcerpt(documentIndex, heading.lineStart, Math.min(heading.lineEnd, heading.lineStart + 6))
          })
        ],
        deterministicFix: 'Add a rollback or recovery step that clearly reverses the state-changing actions in this workflow.',
        recommendedFix: 'Document the exact rollback stage, trigger condition, and recovery boundary for this section.'
      }));
    });
  });
}

function runWorkflowExitCriteriaRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    collectWorkflowSections(documentIndex).forEach(({ heading, lines, numberedSteps }) => {
      if (numberedSteps.length < 2) return;

      const hasTerminalSignal = lines.some(({ text }) => TERMINAL_PATTERN.test(text));
      if (hasTerminalSignal) return;

      pushIssue(issues, createRuleIssue({
        detectorId: 'L47-08',
        severity: 'medium',
        description: `Workflow section "${heading.title}" in ${documentIndex.name} does not define completion, abort, or failure exit criteria.`,
        files: [documentIndex.name],
        section: heading.title,
        sectionSlug: heading.slug,
        lineNumber: heading.lineStart,
        lineEnd: heading.lineEnd,
        evidence: numberedSteps.map((step) => `${step.number}. ${step.text}`).join('\n'),
        whyTriggered: 'The workflow has ordered steps but no explicit terminal, abort, success, or failure condition.',
        evidenceSpans: [
          createEvidenceSpan({
            file: documentIndex.name,
            section: heading.title,
            sectionSlug: heading.slug,
            lineStart: heading.lineStart,
            lineEnd: heading.lineEnd,
            source: 'workflow_exit_rule',
            excerpt: buildLineExcerpt(documentIndex, heading.lineStart, Math.min(heading.lineEnd, heading.lineStart + 6))
          })
        ],
        deterministicFix: 'Add explicit completion, abort, or failure conditions for the workflow.',
        recommendedFix: 'Document the exact exit criteria and final observable state for this workflow.'
      }));
    });
  });
}

function runUndefinedIdentifierRule(projectGraph, issues) {
  const definedTerms = new Set(projectGraph.glossaryOccurrences.map((occurrence) => normalizeComparableText(occurrence.label)));
  const headingTerms = new Set(projectGraph.headingOccurrences.map((occurrence) => normalizeComparableText(occurrence.label)));
  const byIdentifier = new Map();

  projectGraph.identifierOccurrences.forEach((occurrence) => {
    const key = occurrence.key.toUpperCase();
    if (!byIdentifier.has(key)) byIdentifier.set(key, []);
    byIdentifier.get(key).push(occurrence);
  });

  byIdentifier.forEach((occurrences, key) => {
    if (occurrences.length < 2) return;
    if (definedTerms.has(normalizeComparableText(key)) || headingTerms.has(normalizeComparableText(key))) return;

    const first = occurrences[0];
    pushIssue(issues, createRuleIssue({
      detectorId: 'L46-06',
      severity: 'high',
      description: `Identifier "${key}" appears ${occurrences.length} times without a glossary or heading definition across the loaded Markdown set.`,
      files: [first.file],
      section: first.section,
      sectionSlug: first.section_slug,
      lineNumber: first.line_number,
      evidence: occurrences.map((occurrence) => `${occurrence.file}:${occurrence.line_number} ${occurrence.description}`).join('\n'),
      whyTriggered: 'The same identifier is reused across the documents, but no glossary or heading definition binds it to a canonical meaning.',
      evidenceSpans: occurrences.map((occurrence, index) => createEvidenceSpan({
        file: occurrence.file,
        section: occurrence.section,
        sectionSlug: occurrence.section_slug,
        lineStart: occurrence.line_number,
        role: index === 0 ? 'primary' : 'supporting',
        source: 'undefined_identifier_rule',
        excerpt: occurrence.description
      })),
      deterministicFix: 'Define the identifier in a glossary or canonical heading and bind future uses to that definition.',
      recommendedFix: 'Add a terminology registry entry or a dedicated heading that defines the identifier before it is reused.'
    }));
  });
}

function runGlossaryBindingRule(projectGraph, issues) {
  const nonGlossaryContent = projectGraph.projectIndex.documents.flatMap((documentIndex) =>
    documentIndex.lines
      .map((line, index) => ({
        line,
        lineNumber: index + 1,
        section: getSectionForLine(documentIndex, index + 1),
        documentIndex
      }))
      .filter(({ section }) => !/\b(glossary|terminology|definitions|terms|symbols|terminology registry|vocabulary)\b/i.test(section?.title || ''))
  );

  const termBindings = new Map();
  projectGraph.glossaryOccurrences.forEach((occurrence) => {
    if (!termBindings.has(occurrence.key)) termBindings.set(occurrence.key, []);
    termBindings.get(occurrence.key).push(occurrence);
  });

  termBindings.forEach((occurrences, termKey) => {
    const termUsedOutsideGlossary = nonGlossaryContent.some(({ line }) => normalizeComparableText(line).includes(termKey));
    if (termUsedOutsideGlossary) return;

    const first = occurrences[0];
    pushIssue(issues, createRuleIssue({
      detectorId: 'L46-07',
      severity: 'medium',
      description: `Glossary term "${first.label}" is defined but never bound to non-glossary behavior or contract text.`,
      files: [first.file],
      section: first.section,
      sectionSlug: first.section_slug,
      lineNumber: first.line_number,
      evidence: occurrences.map((occurrence) => `${occurrence.file}:${occurrence.line_number} ${occurrence.label}`).join('\n'),
      whyTriggered: 'The term appears in glossary definitions but does not appear in any non-glossary rule, workflow, requirement, or contract text.',
      evidenceSpans: occurrences.map((occurrence, index) => createEvidenceSpan({
        file: occurrence.file,
        section: occurrence.section,
        sectionSlug: occurrence.section_slug,
        lineStart: occurrence.line_number,
        role: index === 0 ? 'primary' : 'supporting',
        source: 'glossary_binding_rule',
        excerpt: occurrence.description || occurrence.label
      })),
      deterministicFix: 'Either bind the glossary term to real behavioral text or remove the unused definition.',
      recommendedFix: 'Reference the term in the requirements, workflows, or contracts it is meant to govern.'
    }));
  });
}

function summarizeIssues(issues, files) {
  return {
    total: issues.length,
    critical: issues.filter((issue) => issue.severity === 'critical').length,
    high: issues.filter((issue) => issue.severity === 'high').length,
    medium: issues.filter((issue) => issue.severity === 'medium').length,
    low: issues.filter((issue) => issue.severity === 'low').length,
    files_analyzed: Array.isArray(files) ? files.length : 0,
    rules_evaluated: 8
  };
}

export function runDeterministicRuleEngine({ files = [], projectGraph, diagnostics = null }) {
  if (!projectGraph?.projectIndex?.documents?.length) {
    return {
      summary: summarizeIssues([], files),
      issues: [],
      root_causes: [],
      _sourceFiles: (files || []).map((file) => file.name)
    };
  }

  const issues = [];
  runDuplicateHeadingRule(projectGraph, issues);
  runBrokenCrossReferenceRule(projectGraph, issues);
  runRfc2119Rule(projectGraph, issues);
  runMissingRollbackRule(projectGraph, issues);
  runWorkflowOrderingRule(projectGraph, issues);
  runWorkflowExitCriteriaRule(projectGraph, issues);
  runUndefinedIdentifierRule(projectGraph, issues);
  runGlossaryBindingRule(projectGraph, issues);

  if (diagnostics) {
    diagnostics.deterministic_rule_issue_count = (diagnostics.deterministic_rule_issue_count || 0) + issues.length;
    diagnostics.deterministic_rule_runs = (diagnostics.deterministic_rule_runs || 0) + 1;
  }

  return {
    summary: summarizeIssues(issues, files),
    issues,
    root_causes: [],
    _sourceFiles: (files || []).map((file) => file.name)
  };
}

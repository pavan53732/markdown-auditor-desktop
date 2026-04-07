import {
  buildIssueDocumentAnchor,
  normalizeComparableText,
  normalizeEvidenceSpans
} from '../markdownIndex.js';

const WORKFLOW_HEADING_PATTERN = /\b(flow|workflow|steps|process|pipeline|sequence|lifecycle|procedure)\b/i;
const GLOSSARY_HEADING_PATTERN = /\b(glossary|terminology|definitions|terms|symbols|terminology registry|vocabulary)\b/i;
const ROLLBACK_PATTERN = /\b(rollback|revert|undo|restore|recover|backout)\b/i;
const ACTION_PATTERN = /\b(apply|commit|delete|deploy|execute|export|migrate|mutate|release|remove|write)\b/i;
const TERMINAL_PATTERN = /\b(abort|aborted|complete|completed|deployed|done|failed|failure|finished|ready|stable|success|successful)\b/i;
const TERMINAL_STATE_TOKEN_PATTERN = /^(ABORT|ABORTED|CANCELLED|CLOSED|COMPLETE|COMPLETED|DONE|FAILED|FAILURE|FINISHED|READY|REJECTED|SUCCESS|SUCCESSFUL|TERMINATED)$/i;
const RFC_KEYWORD_PATTERN = /\b(MUST|SHALL|REQUIRED|SHOULD|RECOMMENDED|MAY|OPTIONAL)\b/g;
const RFC_LOWERCASE_PATTERN = /\b(must|shall|required|should|recommended|may|optional)\b/g;
const MARKDOWN_LINK_PATTERN = /\[([^\]]+)\]\(([^)]+)\)/g;
const API_RESPONSE_PATTERN = /\b(response|responses|return|returns|returned|result|results|output|outputs|status(?:\s+codes?)?|20[0-9]|schema)\b/i;
const API_ERROR_PATTERN = /\b(error|errors|4\d\d|5\d\d|bad request|unauthorized|forbidden|not found|conflict|unprocessable|timeout|failure|failed)\b/i;
const API_INPUT_PATTERN = /\b(request|input|inputs|payload|body|parameter|parameters|query|header|headers|path parameter|path params?)\b/i;
const API_OUTPUT_PATTERN = /\b(response|responses|return|returns|returned|result|results|output|outputs|status(?:\s+codes?)?|20[0-9])\b/i;
const API_RATE_LIMIT_PATTERN = /\b(rate[- ]?limit|quota|throttle|throttling|requests per|rpm|rps)\b/i;
const API_RATE_LIMIT_CONCRETE_PATTERN = /\b\d+\s*(?:req(?:uests?)?|calls?|rpm|rps)\b|\b\d+\s*(?:per )?(?:sec(?:ond)?s?|min(?:ute)?s?|hour|hours|day|days)\b|\bper (?:second|minute|hour|day)\b/i;
const API_AUTH_MENTION_PATTERN = /\b(auth|authenticate|authentication|authorize|authorization|permissions?|secure|security)\b/i;
const API_AUTH_MECHANISM_PATTERN = /\bAuthorization\b|\bBearer\b|\bOAuth\b|\bJWT\b|\bAPI[- ]?Key\b|\btoken\b|\bbasic auth\b|\bmTLS\b|\bcookie\b|\bsession\b/i;
const API_RETRY_PATTERN = /\b(retry|retries|retryable|resend|replayed|duplicate request|at[- ]least[- ]once)\b/i;
const API_IDEMPOTENCY_PATTERN = /\b(idempotent|idempotency|idempotency[- ]key|dedup(?:lication)?|safe to retry)\b/i;
const UPPERCASE_DEFINITION_PATTERN = /^\s*([A-Z][A-Z0-9_]{1,31})\s*[:\-]\s+(.+)$/;

export const DETERMINISTIC_RULE_DEFINITIONS = [
  {
    id: 'broken_heading_hierarchy_rule',
    detectorId: 'L3-01',
    layer: 'structural',
    subcategory: 'broken hierarchy',
    stage: 'indexing',
    owningAgent: 'cross_layer_synthesis_agent'
  },
  {
    id: 'orphan_section_rule',
    detectorId: 'L3-02',
    layer: 'structural',
    subcategory: 'orphan sections',
    stage: 'indexing',
    owningAgent: 'cross_layer_synthesis_agent'
  },
  {
    id: 'duplicate_heading_rule',
    detectorId: 'L3-03',
    layer: 'structural',
    subcategory: 'duplicate sections',
    stage: 'indexing',
    owningAgent: 'cross_layer_synthesis_agent'
  },
  {
    id: 'broken_cross_reference_rule',
    detectorId: 'L13-05',
    layer: 'knowledge_graph',
    subcategory: 'relationship gaps',
    stage: 'project_graph',
    owningAgent: 'memory_world_state_agent'
  },
  {
    id: 'rfc2119_keyword_rule',
    detectorId: 'L15-11',
    layer: 'requirement',
    subcategory: 'RFC2119 misuse',
    stage: 'rule_engine',
    owningAgent: 'spec_absoluteness_agent'
  },
  {
    id: 'duplicated_requirement_rule',
    detectorId: 'L15-06',
    layer: 'requirement',
    subcategory: 'ambiguous acceptance criteria',
    stage: 'project_graph',
    owningAgent: 'spec_absoluteness_agent'
  },
  {
    id: 'requirement_conflict_resolution_rule',
    detectorId: 'L15-21',
    layer: 'requirement',
    subcategory: 'requirement conflict resolution',
    stage: 'project_graph',
    owningAgent: 'spec_absoluteness_agent'
  },
  {
    id: 'missing_terminal_state_rule',
    detectorId: 'L16-04',
    layer: 'state_machine',
    subcategory: 'missing terminal states',
    stage: 'project_graph',
    owningAgent: 'execution_simulation_agent'
  },
  {
    id: 'missing_rollback_rule',
    detectorId: 'L9-09',
    layer: 'completeness',
    subcategory: 'missing rollback',
    stage: 'workflow_rules',
    owningAgent: 'execution_simulation_agent'
  },
  {
    id: 'workflow_ordering_rule',
    detectorId: 'L47-01',
    layer: 'workflow_lifecycle_integrity',
    subcategory: 'required step ordering',
    stage: 'workflow_rules',
    owningAgent: 'execution_simulation_agent'
  },
  {
    id: 'workflow_exit_rule',
    detectorId: 'L47-08',
    layer: 'workflow_lifecycle_integrity',
    subcategory: 'workflow exit criteria',
    stage: 'workflow_rules',
    owningAgent: 'execution_simulation_agent'
  },
  {
    id: 'undefined_identifier_rule',
    detectorId: 'L46-06',
    layer: 'ontology_vocabulary_governance',
    subcategory: 'undefined term rejection',
    stage: 'project_graph',
    owningAgent: 'spec_absoluteness_agent'
  },
  {
    id: 'glossary_binding_rule',
    detectorId: 'L46-07',
    layer: 'ontology_vocabulary_governance',
    subcategory: 'vocabulary-to-contract mapping',
    stage: 'project_graph',
    owningAgent: 'spec_absoluteness_agent'
  },
  {
    id: 'api_return_schema_rule',
    detectorId: 'L17-03',
    layer: 'api_contract',
    subcategory: 'schema mismatch',
    stage: 'api_contract_rules',
    owningAgent: 'tool_deployment_agent'
  },
  {
    id: 'api_error_contract_rule',
    detectorId: 'L17-04',
    layer: 'api_contract',
    subcategory: 'error-contract omissions',
    stage: 'api_contract_rules',
    owningAgent: 'tool_deployment_agent'
  },
  {
    id: 'api_idempotency_rule',
    detectorId: 'L17-09',
    layer: 'api_contract',
    subcategory: 'idempotency gaps',
    stage: 'api_contract_rules',
    owningAgent: 'tool_deployment_agent'
  },
  {
    id: 'api_rate_limit_rule',
    detectorId: 'L17-11',
    layer: 'api_contract',
    subcategory: 'rate-limit ambiguity',
    stage: 'api_contract_rules',
    owningAgent: 'tool_deployment_agent'
  },
  {
    id: 'api_auth_ambiguity_rule',
    detectorId: 'L17-12',
    layer: 'api_contract',
    subcategory: 'auth ambiguity',
    stage: 'api_contract_rules',
    owningAgent: 'tool_deployment_agent'
  },
  {
    id: 'terminology_registry_gap_rule',
    detectorId: 'L33-06',
    layer: 'specification_formalism',
    subcategory: 'terminology registry',
    stage: 'formalism_rules',
    owningAgent: 'spec_absoluteness_agent'
  },
  {
    id: 'state_space_definition_rule',
    detectorId: 'L33-03',
    layer: 'specification_formalism',
    subcategory: 'state-space definition',
    stage: 'formalism_rules',
    owningAgent: 'spec_absoluteness_agent'
  },
  {
    id: 'symbol_consistency_rule',
    detectorId: 'L33-08',
    layer: 'specification_formalism',
    subcategory: 'symbol consistency',
    stage: 'formalism_rules',
    owningAgent: 'spec_absoluteness_agent'
  },
  {
    id: 'formal_terminology_registry_rule',
    detectorId: 'L33-14',
    layer: 'specification_formalism',
    subcategory: 'formal terminology registry enforcement',
    stage: 'formalism_rules',
    owningAgent: 'spec_absoluteness_agent'
  },
  {
    id: 'io_contract_determinism_rule',
    detectorId: 'L33-15',
    layer: 'specification_formalism',
    subcategory: 'input/output contract determinism',
    stage: 'formalism_rules',
    owningAgent: 'spec_absoluteness_agent'
  }
];

export const DETERMINISTIC_RULE_COUNT = DETERMINISTIC_RULE_DEFINITIONS.length;

function getRuleDefinition(ruleId) {
  return DETERMINISTIC_RULE_DEFINITIONS.find((rule) => rule.id === ruleId) || null;
}

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

function extractRequirementKeywords(text = '') {
  return Array.from(
    new Set((String(text || '').match(RFC_KEYWORD_PATTERN) || []).map((keyword) => keyword.toUpperCase()))
  );
}

function normalizeRequirementClause(text = '') {
  return normalizeComparableText(String(text || '').replace(RFC_KEYWORD_PATTERN, ' '));
}

function createRuleIssue({
  ruleId,
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
  const ruleDefinition = getRuleDefinition(ruleId);

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
    analysis_agents: ruleDefinition?.owningAgent
      ? ['deterministic_rule_engine', ruleDefinition.owningAgent]
      : ['deterministic_rule_engine'],
    deterministic_fix: deterministicFix || undefined,
    recommended_fix: recommendedFix || undefined,
    rule_id: ruleId || undefined,
    rule_stage: ruleDefinition?.stage || undefined
  };
}

function pushIssue(issues, issue) {
  if (!issue) return;
  issues.push(issue);
}

function hasMeaningfulSectionBody(documentIndex, heading) {
  if (!documentIndex || !heading) return false;

  for (let lineIndex = heading.lineStart + 1; lineIndex <= heading.lineEnd; lineIndex += 1) {
    const line = documentIndex.lines[lineIndex - 1];
    const normalized = normalizeComparableText(line);
    if (!normalized) continue;
    if (/^[#>*`\-_=:.]+$/.test(String(line || '').trim())) continue;
    return true;
  }

  return false;
}

function runBrokenHeadingHierarchyRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    let previousHeading = null;

    documentIndex.headings.forEach((heading) => {
      if (
        previousHeading
        && Number.isFinite(Number(previousHeading.level))
        && Number.isFinite(Number(heading.level))
        && Number(heading.level) > Number(previousHeading.level) + 1
      ) {
        pushIssue(issues, createRuleIssue({
          ruleId: 'broken_heading_hierarchy_rule',
          detectorId: 'L3-01',
          severity: 'medium',
          description: `Heading "${heading.title}" jumps from H${previousHeading.level} to H${heading.level} in ${documentIndex.name} without an intermediate level.`,
          files: [documentIndex.name],
          section: heading.title,
          sectionSlug: heading.slug,
          lineNumber: heading.lineStart,
          evidence: `${documentIndex.name}:${previousHeading.lineStart} ${previousHeading.title}\n${documentIndex.name}:${heading.lineStart} ${heading.title}`,
          whyTriggered: 'Markdown heading levels skip one or more structural levels, which breaks deterministic section nesting.',
          evidenceSpans: [
            createEvidenceSpan({
              file: documentIndex.name,
              section: previousHeading.title,
              sectionSlug: previousHeading.slug,
              lineStart: previousHeading.lineStart,
              role: 'supporting',
              source: 'broken_heading_hierarchy_rule',
              excerpt: buildLineExcerpt(documentIndex, previousHeading.lineStart)
            }),
            createEvidenceSpan({
              file: documentIndex.name,
              section: heading.title,
              sectionSlug: heading.slug,
              lineStart: heading.lineStart,
              role: 'primary',
              source: 'broken_heading_hierarchy_rule',
              excerpt: buildLineExcerpt(documentIndex, heading.lineStart)
            })
          ],
          deterministicFix: 'Insert the missing intermediate heading level or flatten the section so heading levels only increase by one step at a time.',
          recommendedFix: 'Restructure the section hierarchy so the heading ladder remains H1 -> H2 -> H3 without level skips.'
        }));
      }

      previousHeading = heading;
    });
  });
}

function runOrphanSectionRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    documentIndex.headings.forEach((heading) => {
      if (hasMeaningfulSectionBody(documentIndex, heading)) return;

      pushIssue(issues, createRuleIssue({
        ruleId: 'orphan_section_rule',
        detectorId: 'L3-02',
        severity: 'low',
        description: `Heading "${heading.title}" in ${documentIndex.name} has no meaningful body content under it.`,
        files: [documentIndex.name],
        section: heading.title,
        sectionSlug: heading.slug,
        lineNumber: heading.lineStart,
        evidence: `${documentIndex.name}:${heading.lineStart} ${heading.title}`,
        whyTriggered: 'The heading resolves to an empty section range or contains only formatting/noise lines, leaving the section orphaned.',
        evidenceSpans: [
          createEvidenceSpan({
            file: documentIndex.name,
            section: heading.title,
            sectionSlug: heading.slug,
            lineStart: heading.lineStart,
            lineEnd: heading.lineEnd > heading.lineStart ? heading.lineEnd : undefined,
            role: 'primary',
            source: 'orphan_section_rule',
            excerpt: buildLineExcerpt(documentIndex, heading.lineStart, heading.lineEnd)
          })
        ],
        deterministicFix: 'Either add body content that explains the section or remove/merge the empty heading.',
        recommendedFix: 'Populate the section with the missing contract details or fold the heading into a neighboring section.'
      }));
    });
  });
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
        ruleId: 'duplicate_heading_rule',
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
          ruleId: 'broken_cross_reference_rule',
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
        ruleId: 'rfc2119_keyword_rule',
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

function runDuplicatedRequirementRule(projectGraph, issues) {
  projectGraph.requirementGroups.forEach((occurrences) => {
    if (!Array.isArray(occurrences) || occurrences.length < 2) return;

    const normalizedClauses = Array.from(
      new Set(occurrences.map((occurrence) => normalizeRequirementClause(occurrence.label)).filter(Boolean))
    );
    if (normalizedClauses.length !== 1) return;

    const keywordSet = new Set(occurrences.flatMap((occurrence) => extractRequirementKeywords(occurrence.label)));
    if (keywordSet.size > 1) return;

    const first = occurrences[0];
    pushIssue(issues, createRuleIssue({
      ruleId: 'duplicated_requirement_rule',
      detectorId: 'L15-06',
      severity: 'low',
      description: `Requirement clause "${first.label}" is duplicated ${occurrences.length} times across the loaded Markdown set.`,
      files: Array.from(new Set(occurrences.map((occurrence) => occurrence.file))),
      section: first.section,
      sectionSlug: first.section_slug,
      lineNumber: first.line_number,
      evidence: occurrences.map((occurrence) => `${occurrence.file}:${occurrence.line_number} ${occurrence.label}`).join('\n'),
      whyTriggered: 'The same normalized requirement clause appears multiple times without introducing distinct acceptance semantics or traceability boundaries.',
      evidenceSpans: occurrences.map((occurrence, index) => createEvidenceSpan({
        file: occurrence.file,
        section: occurrence.section,
        sectionSlug: occurrence.section_slug,
        lineStart: occurrence.line_number,
        role: index === 0 ? 'primary' : 'supporting',
        source: 'duplicated_requirement_rule',
        excerpt: occurrence.label
      })),
      deterministicFix: 'Consolidate the duplicate statements into one canonical requirement and replace the rest with explicit cross-references.',
      recommendedFix: 'Keep a single authoritative requirement clause and add traceability links anywhere the same obligation needs to be referenced again.'
    }));
  });
}

function runRequirementConflictResolutionRule(projectGraph, issues) {
  projectGraph.requirementGroups.forEach((occurrences) => {
    if (!Array.isArray(occurrences) || occurrences.length < 2) return;

    const normalizedClauses = Array.from(
      new Set(occurrences.map((occurrence) => normalizeRequirementClause(occurrence.label)).filter(Boolean))
    );
    if (normalizedClauses.length !== 1) return;

    const keywordSet = new Set(occurrences.flatMap((occurrence) => extractRequirementKeywords(occurrence.label)));
    if (keywordSet.size < 2) return;

    const first = occurrences[0];
    pushIssue(issues, createRuleIssue({
      ruleId: 'requirement_conflict_resolution_rule',
      detectorId: 'L15-21',
      severity: 'high',
      description: `Requirement clause "${first.label}" appears with conflicting RFC 2119 strength across the loaded Markdown set.`,
      files: Array.from(new Set(occurrences.map((occurrence) => occurrence.file))),
      section: first.section,
      sectionSlug: first.section_slug,
      lineNumber: first.line_number,
      evidence: occurrences.map((occurrence) => `${occurrence.file}:${occurrence.line_number} ${occurrence.label}`).join('\n'),
      whyTriggered: `The same normalized requirement clause appears with multiple normative strengths (${Array.from(keywordSet).join(', ')}) and no deterministic precedence or conflict-resolution rule is present.`,
      evidenceSpans: occurrences.map((occurrence, index) => createEvidenceSpan({
        file: occurrence.file,
        section: occurrence.section,
        sectionSlug: occurrence.section_slug,
        lineStart: occurrence.line_number,
        role: index === 0 ? 'primary' : 'supporting',
        source: 'requirement_conflict_resolution_rule',
        excerpt: occurrence.label
      })),
      deterministicFix: 'Pick one authoritative requirement strength and define an explicit precedence rule if variants must remain for different contexts.',
      recommendedFix: 'Replace conflicting MUST/SHOULD/MAY variants with one canonical clause or document a deterministic conflict-resolution policy.'
    }));
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

function collectApiSections(projectGraph) {
  const groups = new Map();
  const documentsByName = new Map(
    (projectGraph?.projectIndex?.documents || []).map((documentIndex) => [documentIndex.name, documentIndex])
  );

  (projectGraph?.apiOccurrences || []).forEach((occurrence) => {
    const documentIndex = documentsByName.get(occurrence.file);
    if (!documentIndex) return;

    const section = getSectionForLine(documentIndex, occurrence.line_number);
    const key = `${documentIndex.name}::${section?.slug || `line-${occurrence.line_number}`}`;
    if (!groups.has(key)) {
      groups.set(key, {
        documentIndex,
        section,
        apiOccurrences: [],
        lineNumbers: new Set()
      });
    }

    const entry = groups.get(key);
    entry.apiOccurrences.push(occurrence);
    entry.lineNumbers.add(occurrence.line_number);
  });

  return Array.from(groups.values()).map(({ documentIndex, section, apiOccurrences, lineNumbers }) => {
    const orderedLineNumbers = Array.from(lineNumbers).sort((a, b) => a - b);
    const lineStart = section?.lineStart || orderedLineNumbers[0];
    const lineEnd = section?.lineEnd || orderedLineNumbers[orderedLineNumbers.length - 1];
    const lines = [];
    for (let lineNumber = lineStart; lineNumber <= lineEnd; lineNumber += 1) {
      lines.push({
        lineNumber,
        text: documentIndex.lines[lineNumber - 1] || ''
      });
    }

    return {
      documentIndex,
      section,
      apiOccurrences,
      lineStart,
      lineEnd,
      lines,
      sectionText: lines.map(({ text }) => text).join('\n'),
      methods: Array.from(new Set(apiOccurrences.map((occurrence) => String(occurrence.label || '').split(' ')[0].toUpperCase()).filter(Boolean)))
    };
  });
}

function buildDefinedStateSymbols(projectGraph) {
  const definedSymbols = new Set();

  (projectGraph?.glossaryOccurrences || []).forEach((occurrence) => {
    if (/^[A-Z][A-Z0-9_]{1,31}$/.test(occurrence.label || '')) {
      definedSymbols.add(String(occurrence.label).toUpperCase());
    }
  });

  (projectGraph?.projectIndex?.documents || []).forEach((documentIndex) => {
    documentIndex.headings.forEach((heading) => {
      if (/^[A-Z][A-Z0-9_]{1,31}$/.test(heading.title || '')) {
        definedSymbols.add(String(heading.title).toUpperCase());
      }
    });

    documentIndex.lines.forEach((line) => {
      const match = String(line || '').match(UPPERCASE_DEFINITION_PATTERN);
      if (match) {
        definedSymbols.add(String(match[1]).toUpperCase());
      }
    });
  });

  return definedSymbols;
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
        ruleId: 'workflow_ordering_rule',
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
        ruleId: 'missing_rollback_rule',
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
        ruleId: 'workflow_exit_rule',
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

function runMissingTerminalStateRule(projectGraph, issues) {
  projectGraph.projectIndex.documents.forEach((documentIndex) => {
    const transitionGroups = new Map();

    documentIndex.lines.forEach((line, index) => {
      if (!/(->|\u2192)/.test(line)) return;

      const tokens = Array.from(line.matchAll(/\b([A-Z][A-Z0-9_]{1,31})\b/g))
        .map((match) => match[1])
        .filter((token) => token.length >= 3);
      if (tokens.length < 2) return;

      const section = getSectionForLine(documentIndex, index + 1);
      const groupKey = section?.slug || '__document__';
      if (!transitionGroups.has(groupKey)) {
        transitionGroups.set(groupKey, {
          section,
          transitions: []
        });
      }

      transitionGroups.get(groupKey).transitions.push({
        lineNumber: index + 1,
        line: line.trim(),
        tokens
      });
    });

    transitionGroups.forEach(({ section, transitions }) => {
      if (!Array.isArray(transitions) || transitions.length === 0) return;

      const uniqueTokens = Array.from(new Set(
        transitions.flatMap((transition) => transition.tokens.map((token) => token.toUpperCase()))
      ));
      if (uniqueTokens.length < 2) return;
      if (uniqueTokens.some((token) => TERMINAL_STATE_TOKEN_PATTERN.test(token))) return;

      const first = transitions[0];
      const last = transitions[transitions.length - 1];
      pushIssue(issues, createRuleIssue({
        ruleId: 'missing_terminal_state_rule',
        detectorId: 'L16-04',
        severity: 'medium',
        description: `State transitions in ${documentIndex.name}${section?.title ? ` section "${section.title}"` : ''} do not define a terminal state.`,
        files: [documentIndex.name],
        section: section?.title || '',
        sectionSlug: section?.slug || '',
        lineNumber: first.lineNumber,
        lineEnd: last.lineNumber,
        evidence: transitions.map((transition) => `${documentIndex.name}:${transition.lineNumber} ${transition.line}`).join('\n'),
        whyTriggered: 'The state-transition notation introduces multiple states, but none of the state symbols represent a terminal success, failure, abort, or completed exit state.',
        evidenceSpans: transitions.slice(0, 5).map((transition, index) => createEvidenceSpan({
          file: documentIndex.name,
          section: section?.title || '',
          sectionSlug: section?.slug || '',
          lineStart: transition.lineNumber,
          role: index === 0 ? 'primary' : 'supporting',
          source: 'missing_terminal_state_rule',
          excerpt: transition.line
        })),
        deterministicFix: 'Add explicit terminal states and show how the documented transitions reach them.',
        recommendedFix: 'Document terminal success, failure, or abort states for this state machine and connect the existing transitions to those endpoints.'
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
      ruleId: 'undefined_identifier_rule',
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
      ruleId: 'glossary_binding_rule',
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

function runApiReturnSchemaRule(projectGraph, issues) {
  collectApiSections(projectGraph).forEach(({ documentIndex, section, lineStart, lineEnd, sectionText, apiOccurrences }) => {
    if (API_RESPONSE_PATTERN.test(sectionText)) return;

    const first = apiOccurrences[0];
    pushIssue(issues, createRuleIssue({
      ruleId: 'api_return_schema_rule',
      detectorId: 'L17-03',
      severity: 'high',
      description: `API section "${section?.title || first.label}" in ${documentIndex.name} defines an endpoint without a documented return contract.` ,
      files: [documentIndex.name],
      section: section?.title || '',
      sectionSlug: section?.slug || '',
      lineNumber: lineStart,
      lineEnd,
      evidence: sectionText.trim().slice(0, 500),
      whyTriggered: 'The endpoint section declares an API surface but does not document response status codes, response payloads, or return schema semantics.',
      evidenceSpans: [
        createEvidenceSpan({
          file: documentIndex.name,
          section: section?.title || '',
          sectionSlug: section?.slug || '',
          lineStart,
          lineEnd,
          source: 'api_return_schema_rule',
          excerpt: buildLineExcerpt(documentIndex, lineStart, Math.min(lineEnd, lineStart + 8))
        })
      ],
      deterministicFix: 'Add explicit success response status codes and define the returned payload or response schema for the endpoint.',
      recommendedFix: 'Document the endpoint output contract with concrete success codes and response-body structure.'
    }));
  });
}

function runApiErrorContractRule(projectGraph, issues) {
  collectApiSections(projectGraph).forEach(({ documentIndex, section, lineStart, lineEnd, sectionText, apiOccurrences }) => {
    if (API_ERROR_PATTERN.test(sectionText)) return;

    const first = apiOccurrences[0];
    pushIssue(issues, createRuleIssue({
      ruleId: 'api_error_contract_rule',
      detectorId: 'L17-04',
      severity: 'medium',
      description: `API section "${section?.title || first.label}" in ${documentIndex.name} omits explicit error-contract behavior.`,
      files: [documentIndex.name],
      section: section?.title || '',
      sectionSlug: section?.slug || '',
      lineNumber: lineStart,
      lineEnd,
      evidence: sectionText.trim().slice(0, 500),
      whyTriggered: 'The endpoint section declares a callable API surface but does not mention any error codes, failure responses, or error payload behavior.',
      evidenceSpans: [
        createEvidenceSpan({
          file: documentIndex.name,
          section: section?.title || '',
          sectionSlug: section?.slug || '',
          lineStart,
          lineEnd,
          source: 'api_error_contract_rule',
          excerpt: buildLineExcerpt(documentIndex, lineStart, Math.min(lineEnd, lineStart + 8))
        })
      ],
      deterministicFix: 'Add explicit error status codes and describe the corresponding error payload or failure semantics.',
      recommendedFix: 'Document at least the expected 4xx/5xx outcomes and any stable error-body structure.'
    }));
  });
}

function runApiIdempotencyRule(projectGraph, issues) {
  collectApiSections(projectGraph).forEach(({ documentIndex, section, lineStart, lineEnd, sectionText, methods, apiOccurrences }) => {
    const mutating = methods.some((method) => method === 'POST' || method === 'PATCH');
    if (!mutating || !API_RETRY_PATTERN.test(sectionText) || API_IDEMPOTENCY_PATTERN.test(sectionText)) return;

    const first = apiOccurrences[0];
    pushIssue(issues, createRuleIssue({
      ruleId: 'api_idempotency_rule',
      detectorId: 'L17-09',
      severity: 'high',
      description: `API section "${section?.title || first.label}" in ${documentIndex.name} describes retries for a mutating endpoint without idempotency guarantees.`,
      files: [documentIndex.name],
      section: section?.title || '',
      sectionSlug: section?.slug || '',
      lineNumber: lineStart,
      lineEnd,
      evidence: sectionText.trim().slice(0, 500),
      whyTriggered: 'The endpoint section mentions retry or replay behavior for a POST/PATCH operation but does not define idempotency, deduplication, or idempotency-key semantics.',
      evidenceSpans: [
        createEvidenceSpan({
          file: documentIndex.name,
          section: section?.title || '',
          sectionSlug: section?.slug || '',
          lineStart,
          lineEnd,
          source: 'api_idempotency_rule',
          excerpt: buildLineExcerpt(documentIndex, lineStart, Math.min(lineEnd, lineStart + 8))
        })
      ],
      deterministicFix: 'Document whether the operation is idempotent and, if needed, define an idempotency key or deduplication policy.',
      recommendedFix: 'Add retry-safe semantics before instructing clients to retry a mutating API call.'
    }));
  });
}

function runApiRateLimitRule(projectGraph, issues) {
  collectApiSections(projectGraph).forEach(({ documentIndex, section, lineStart, lineEnd, sectionText, apiOccurrences }) => {
    if (!API_RATE_LIMIT_PATTERN.test(sectionText) || API_RATE_LIMIT_CONCRETE_PATTERN.test(sectionText)) return;

    const first = apiOccurrences[0];
    pushIssue(issues, createRuleIssue({
      ruleId: 'api_rate_limit_rule',
      detectorId: 'L17-11',
      severity: 'medium',
      description: `API section "${section?.title || first.label}" in ${documentIndex.name} mentions rate limiting without a concrete limit or window.`,
      files: [documentIndex.name],
      section: section?.title || '',
      sectionSlug: section?.slug || '',
      lineNumber: lineStart,
      lineEnd,
      evidence: sectionText.trim().slice(0, 500),
      whyTriggered: 'The endpoint section references rate limits or quotas but does not specify a numerical quota, request ceiling, or time window.',
      evidenceSpans: [
        createEvidenceSpan({
          file: documentIndex.name,
          section: section?.title || '',
          sectionSlug: section?.slug || '',
          lineStart,
          lineEnd,
          source: 'api_rate_limit_rule',
          excerpt: buildLineExcerpt(documentIndex, lineStart, Math.min(lineEnd, lineStart + 8))
        })
      ],
      deterministicFix: 'Define the rate-limit quantity and the exact measurement window for the endpoint.',
      recommendedFix: 'Document the quota numerically, for example requests per minute or requests per day.'
    }));
  });
}

function runApiAuthAmbiguityRule(projectGraph, issues) {
  collectApiSections(projectGraph).forEach(({ documentIndex, section, lineStart, lineEnd, sectionText, apiOccurrences }) => {
    if (!API_AUTH_MENTION_PATTERN.test(sectionText) || API_AUTH_MECHANISM_PATTERN.test(sectionText)) return;

    const first = apiOccurrences[0];
    pushIssue(issues, createRuleIssue({
      ruleId: 'api_auth_ambiguity_rule',
      detectorId: 'L17-12',
      severity: 'high',
      description: `API section "${section?.title || first.label}" in ${documentIndex.name} references authentication without naming a concrete mechanism.`,
      files: [documentIndex.name],
      section: section?.title || '',
      sectionSlug: section?.slug || '',
      lineNumber: lineStart,
      lineEnd,
      evidence: sectionText.trim().slice(0, 500),
      whyTriggered: 'The endpoint section mentions authentication or authorization but does not specify a concrete mechanism such as Authorization header, Bearer token, API key, OAuth, JWT, or session semantics.',
      evidenceSpans: [
        createEvidenceSpan({
          file: documentIndex.name,
          section: section?.title || '',
          sectionSlug: section?.slug || '',
          lineStart,
          lineEnd,
          source: 'api_auth_ambiguity_rule',
          excerpt: buildLineExcerpt(documentIndex, lineStart, Math.min(lineEnd, lineStart + 8))
        })
      ],
      deterministicFix: 'Name the exact authentication mechanism and show how clients present credentials to the endpoint.',
      recommendedFix: 'Replace generic auth wording with the concrete credential scheme and header/token contract.'
    }));
  });
}

function runTerminologyRegistryGapRule(projectGraph, issues) {
  const hasGlossaryHeading = (projectGraph?.projectIndex?.documents || []).some((documentIndex) =>
    documentIndex.headings.some((heading) => GLOSSARY_HEADING_PATTERN.test(heading.title))
  );
  if (hasGlossaryHeading || (projectGraph?.glossaryOccurrences || []).length > 0) return;

  const candidateGroups = [
    ...(projectGraph?.identifierGroups || []),
    ...(projectGraph?.stateGroups || []),
    ...(projectGraph?.apiGroups || [])
  ];
  if (candidateGroups.length < 2) return;

  const evidenceOccurrences = candidateGroups
    .slice(0, 4)
    .map((group) => group[0])
    .filter(Boolean);
  if (evidenceOccurrences.length === 0) return;

  const first = evidenceOccurrences[0];
  pushIssue(issues, createRuleIssue({
    ruleId: 'terminology_registry_gap_rule',
    detectorId: 'L33-06',
    severity: 'medium',
    description: 'The loaded Markdown set reuses formal identifiers, states, or API surfaces without a glossary or terminology registry.',
    files: Array.from(new Set(evidenceOccurrences.map((occurrence) => occurrence.file))),
    section: first.section,
    sectionSlug: first.section_slug,
    lineNumber: first.line_number,
    evidence: evidenceOccurrences.map((occurrence) => `${occurrence.file}:${occurrence.line_number} ${occurrence.label}`).join('\n'),
    whyTriggered: 'Multiple formal symbols or contract surfaces are reused across the loaded Markdown set, but there is no glossary, terminology registry, or definitions section to bind those terms canonically.',
    evidenceSpans: evidenceOccurrences.map((occurrence, index) => createEvidenceSpan({
      file: occurrence.file,
      section: occurrence.section,
      sectionSlug: occurrence.section_slug,
      lineStart: occurrence.line_number,
      role: index === 0 ? 'primary' : 'supporting',
      source: 'terminology_registry_gap_rule',
      excerpt: occurrence.description || occurrence.label
    })),
    deterministicFix: 'Add a glossary or terminology registry that defines the repeated identifiers, states, and API symbols used across the documentation set.',
    recommendedFix: 'Create one canonical terminology section and bind repeated formal terms to it.'
  }));
}

function runFormalTerminologyRegistryRule(projectGraph, issues) {
  (projectGraph?.projectIndex?.documents || []).forEach((documentIndex) => {
    documentIndex.headings
      .filter((heading) => GLOSSARY_HEADING_PATTERN.test(heading.title))
      .forEach((heading) => {
        const formalEntries = (projectGraph?.glossaryOccurrences || []).filter(
          (occurrence) => occurrence.file === documentIndex.name && occurrence.section_slug === heading.slug
        );
        if (formalEntries.length > 0) return;

        pushIssue(issues, createRuleIssue({
          ruleId: 'formal_terminology_registry_rule',
          detectorId: 'L33-14',
          severity: 'medium',
          description: `Terminology section "${heading.title}" in ${documentIndex.name} does not contain formal parseable term definitions.`,
          files: [documentIndex.name],
          section: heading.title,
          sectionSlug: heading.slug,
          lineNumber: heading.lineStart,
          lineEnd: heading.lineEnd,
          evidence: buildLineExcerpt(documentIndex, heading.lineStart, heading.lineEnd),
          whyTriggered: 'A glossary or terminology heading exists, but the section does not contain parseable term-definition entries in a formal registry shape.',
          evidenceSpans: [
            createEvidenceSpan({
              file: documentIndex.name,
              section: heading.title,
              sectionSlug: heading.slug,
              lineStart: heading.lineStart,
              lineEnd: heading.lineEnd,
              source: 'formal_terminology_registry_rule',
              excerpt: buildLineExcerpt(documentIndex, heading.lineStart, Math.min(heading.lineEnd, heading.lineStart + 8))
            })
          ],
          deterministicFix: 'Rewrite the terminology section into explicit term-definition entries using a stable formal structure.',
          recommendedFix: 'Use consistent `Term: definition` or `**Term**: definition` entries inside the glossary.'
        }));
      });
  });
}

function runSymbolConsistencyRule(projectGraph, issues) {
  const canonicalGroups = new Map();

  (projectGraph?.identifierOccurrences || []).forEach((occurrence) => {
    const rawLabel = String(occurrence.label || '').toUpperCase();
    const canonical = rawLabel.replace(/[-_]/g, '');
    if (!canonical || canonical.length < 4) return;
    if (!canonicalGroups.has(canonical)) canonicalGroups.set(canonical, new Map());
    const variants = canonicalGroups.get(canonical);
    if (!variants.has(rawLabel)) variants.set(rawLabel, []);
    variants.get(rawLabel).push(occurrence);
  });

  canonicalGroups.forEach((variants) => {
    if (variants.size < 2) return;

    const representativeOccurrences = Array.from(variants.values()).map((occurrences) => occurrences[0]).filter(Boolean);
    const first = representativeOccurrences[0];
    pushIssue(issues, createRuleIssue({
      ruleId: 'symbol_consistency_rule',
      detectorId: 'L33-08',
      severity: 'medium',
      description: `Formal symbol variants ${Array.from(variants.keys()).join(', ')} are used interchangeably without a canonical spelling.`,
      files: Array.from(new Set(representativeOccurrences.map((occurrence) => occurrence.file))),
      section: first.section,
      sectionSlug: first.section_slug,
      lineNumber: first.line_number,
      evidence: representativeOccurrences.map((occurrence) => `${occurrence.file}:${occurrence.line_number} ${occurrence.label}`).join('\n'),
      whyTriggered: 'The same canonical symbol root appears with multiple surface spellings, which breaks formal symbol consistency.',
      evidenceSpans: representativeOccurrences.map((occurrence, index) => createEvidenceSpan({
        file: occurrence.file,
        section: occurrence.section,
        sectionSlug: occurrence.section_slug,
        lineStart: occurrence.line_number,
        role: index === 0 ? 'primary' : 'supporting',
        source: 'symbol_consistency_rule',
        excerpt: occurrence.description || occurrence.label
      })),
      deterministicFix: 'Choose one canonical symbol spelling and replace the other variants with explicit aliases or the canonical form.',
      recommendedFix: 'Standardize the symbol vocabulary so the same concept is never written with competing identifier forms.'
    }));
  });
}

function runStateSpaceDefinitionRule(projectGraph, issues) {
  const definedSymbols = buildDefinedStateSymbols(projectGraph);

  (projectGraph?.projectIndex?.documents || []).forEach((documentIndex) => {
    const transitionGroups = new Map();

    documentIndex.lines.forEach((line, index) => {
      if (!/(->|\u2192)/.test(line)) return;

      const tokens = Array.from(line.matchAll(/\b([A-Z][A-Z0-9_]{1,31})\b/g))
        .map((match) => match[1].toUpperCase())
        .filter((token) => token.length >= 3);
      if (tokens.length < 2) return;

      const section = getSectionForLine(documentIndex, index + 1);
      const groupKey = section?.slug || '__document__';
      if (!transitionGroups.has(groupKey)) {
        transitionGroups.set(groupKey, {
          section,
          transitions: []
        });
      }

      transitionGroups.get(groupKey).transitions.push({
        lineNumber: index + 1,
        line: String(line || '').trim(),
        tokens
      });
    });

    transitionGroups.forEach(({ section, transitions }) => {
      const undefinedTokens = Array.from(new Set(
        transitions.flatMap((transition) => transition.tokens).filter((token) => !definedSymbols.has(token))
      ));
      if (undefinedTokens.length === 0) return;

      const first = transitions[0];
      const last = transitions[transitions.length - 1];
      pushIssue(issues, createRuleIssue({
        ruleId: 'state_space_definition_rule',
        detectorId: 'L33-03',
        severity: 'high',
        description: `State machine symbols in ${documentIndex.name}${section?.title ? ` section "${section.title}"` : ''} are used without explicit state definitions.`,
        files: [documentIndex.name],
        section: section?.title || '',
        sectionSlug: section?.slug || '',
        lineNumber: first.lineNumber,
        lineEnd: last.lineNumber,
        evidence: transitions.map((transition) => `${documentIndex.name}:${transition.lineNumber} ${transition.line}`).join('\n'),
        whyTriggered: `The transition notation references undefined state symbols (${undefinedTokens.join(', ')}) without glossary, heading, or definition-line coverage.`,
        evidenceSpans: transitions.slice(0, 5).map((transition, index) => createEvidenceSpan({
          file: documentIndex.name,
          section: section?.title || '',
          sectionSlug: section?.slug || '',
          lineStart: transition.lineNumber,
          role: index === 0 ? 'primary' : 'supporting',
          source: 'state_space_definition_rule',
          excerpt: transition.line
        })),
        deterministicFix: 'Define each state symbol explicitly in a glossary, heading, or dedicated state definition block before using it in transitions.',
        recommendedFix: 'Add canonical definitions for every state token that appears in transition notation.'
      }));
    });
  });
}

function runIoContractDeterminismRule(projectGraph, issues) {
  collectApiSections(projectGraph).forEach(({ documentIndex, section, lineStart, lineEnd, sectionText, methods, apiOccurrences }) => {
    const hasInputContract = API_INPUT_PATTERN.test(sectionText);
    const hasOutputContract = API_OUTPUT_PATTERN.test(sectionText);
    const mutatingEndpoint = methods.some((method) => ['POST', 'PUT', 'PATCH'].includes(method));
    const missingInput = mutatingEndpoint && !hasInputContract;
    const missingOutput = !hasOutputContract;

    if (!missingInput && !missingOutput) return;

    const first = apiOccurrences[0];
    const reason = missingInput && missingOutput
      ? 'The endpoint section documents an API surface but defines neither an input contract nor an output contract.'
      : missingInput
        ? 'The endpoint section describes a mutating API surface without documenting request inputs or request-body semantics.'
        : 'The endpoint section documents input-side contract details but omits a corresponding output or response contract.';

    pushIssue(issues, createRuleIssue({
      ruleId: 'io_contract_determinism_rule',
      detectorId: 'L33-15',
      severity: 'high',
      description: `API section "${section?.title || first.label}" in ${documentIndex.name} has a non-deterministic input/output contract boundary.`,
      files: [documentIndex.name],
      section: section?.title || '',
      sectionSlug: section?.slug || '',
      lineNumber: lineStart,
      lineEnd,
      evidence: sectionText.trim().slice(0, 500),
      whyTriggered: reason,
      evidenceSpans: [
        createEvidenceSpan({
          file: documentIndex.name,
          section: section?.title || '',
          sectionSlug: section?.slug || '',
          lineStart,
          lineEnd,
          source: 'io_contract_determinism_rule',
          excerpt: buildLineExcerpt(documentIndex, lineStart, Math.min(lineEnd, lineStart + 8))
        })
      ],
      deterministicFix: 'Document both the input-side contract and the output-side contract for the endpoint in one deterministic section.',
      recommendedFix: 'Make request parameters/body and response status/body explicit so the endpoint contract is closed on both sides.'
    }));
  });
}

function buildDetectorExecutionReceipts(issues = []) {
  const issueGroups = new Map();
  issues.forEach((issue) => {
    const detectorId = typeof issue.detector_id === 'string' ? issue.detector_id.trim() : '';
    if (!detectorId) return;
    if (!issueGroups.has(detectorId)) issueGroups.set(detectorId, []);
    issueGroups.get(detectorId).push(issue);
  });

  return DETERMINISTIC_RULE_DEFINITIONS.map((rule) => {
    const ruleIssues = issueGroups.get(rule.detectorId) || [];
    return {
      detector_id: rule.detectorId,
      rule_id: rule.id,
      layer: rule.layer,
      subcategory: rule.subcategory,
      stage: rule.stage,
      owning_agent: rule.owningAgent,
      checked: true,
      status: ruleIssues.length > 0 ? 'hit' : 'clean',
      issue_count: ruleIssues.length,
      evidence_span_count: ruleIssues.reduce(
        (sum, issue) => sum + (Array.isArray(issue.evidence_spans) ? issue.evidence_spans.length : 0),
        0
      )
    };
  });
}

function summarizeIssues(issues, files, detectorExecutionReceipts = []) {
  const checkedSubcategories = Array.from(new Set(
    detectorExecutionReceipts
      .map((receipt) => receipt.subcategory)
      .filter(Boolean)
  ));
  const checkedStages = Array.from(new Set(
    detectorExecutionReceipts
      .map((receipt) => receipt.stage)
      .filter(Boolean)
  ));
  const hitSubcategories = Array.from(new Set(
    detectorExecutionReceipts
      .filter((receipt) => receipt.status === 'hit')
      .map((receipt) => receipt.subcategory)
      .filter(Boolean)
  ));
  const hitStages = Array.from(new Set(
    detectorExecutionReceipts
      .filter((receipt) => receipt.status === 'hit')
      .map((receipt) => receipt.stage)
      .filter(Boolean)
  ));
  const detectorsHit = detectorExecutionReceipts.filter((receipt) => receipt.status === 'hit').length;
  const detectorsChecked = detectorExecutionReceipts.length;

  return {
    total: issues.length,
    critical: issues.filter((issue) => issue.severity === 'critical').length,
    high: issues.filter((issue) => issue.severity === 'high').length,
    medium: issues.filter((issue) => issue.severity === 'medium').length,
    low: issues.filter((issue) => issue.severity === 'low').length,
    files_analyzed: Array.isArray(files) ? files.length : 0,
    rules_evaluated: DETERMINISTIC_RULE_DEFINITIONS.length,
    detectors_checked: detectorsChecked,
    detectors_hit: detectorsHit,
    detectors_clean: Math.max(0, detectorsChecked - detectorsHit),
    rule_subcategories_checked: checkedSubcategories,
    rule_subcategories_hit: hitSubcategories,
    rule_stages_checked: checkedStages,
    rule_stages_hit: hitStages,
    rule_subcategories_covered: checkedSubcategories,
    rule_stages_executed: checkedStages,
    detector_execution_receipts: detectorExecutionReceipts
  };
}

export function runDeterministicRuleEngine({ files = [], projectGraph, diagnostics = null }) {
  if (!projectGraph?.projectIndex?.documents?.length) {
    const detectorExecutionReceipts = buildDetectorExecutionReceipts([]);
    return {
      summary: summarizeIssues([], files, detectorExecutionReceipts),
      issues: [],
      root_causes: [],
      _sourceFiles: (files || []).map((file) => file.name)
    };
  }

  const issues = [];
  runBrokenHeadingHierarchyRule(projectGraph, issues);
  runOrphanSectionRule(projectGraph, issues);
  runDuplicateHeadingRule(projectGraph, issues);
  runBrokenCrossReferenceRule(projectGraph, issues);
  runRfc2119Rule(projectGraph, issues);
  runDuplicatedRequirementRule(projectGraph, issues);
  runRequirementConflictResolutionRule(projectGraph, issues);
  runMissingTerminalStateRule(projectGraph, issues);
  runMissingRollbackRule(projectGraph, issues);
  runWorkflowOrderingRule(projectGraph, issues);
  runWorkflowExitCriteriaRule(projectGraph, issues);
  runUndefinedIdentifierRule(projectGraph, issues);
  runGlossaryBindingRule(projectGraph, issues);
  runApiReturnSchemaRule(projectGraph, issues);
  runApiErrorContractRule(projectGraph, issues);
  runApiIdempotencyRule(projectGraph, issues);
  runApiRateLimitRule(projectGraph, issues);
  runApiAuthAmbiguityRule(projectGraph, issues);
  runTerminologyRegistryGapRule(projectGraph, issues);
  runStateSpaceDefinitionRule(projectGraph, issues);
  runSymbolConsistencyRule(projectGraph, issues);
  runFormalTerminologyRegistryRule(projectGraph, issues);
  runIoContractDeterminismRule(projectGraph, issues);
  const detectorExecutionReceipts = buildDetectorExecutionReceipts(issues);

  if (diagnostics) {
    diagnostics.deterministic_rule_issue_count = (diagnostics.deterministic_rule_issue_count || 0) + issues.length;
    diagnostics.deterministic_rule_runs = (diagnostics.deterministic_rule_runs || 0) + 1;
    diagnostics.deterministic_rule_checked_detector_count = detectorExecutionReceipts.length;
    diagnostics.deterministic_rule_hit_detector_count = detectorExecutionReceipts.filter((receipt) => receipt.status === 'hit').length;
    diagnostics.deterministic_rule_clean_detector_count = detectorExecutionReceipts.filter((receipt) => receipt.status === 'clean').length;
    diagnostics.deterministic_rule_detector_receipts = detectorExecutionReceipts;
  }

  return {
    summary: summarizeIssues(issues, files, detectorExecutionReceipts),
    issues,
    root_causes: [],
    _sourceFiles: (files || []).map((file) => file.name)
  };
}

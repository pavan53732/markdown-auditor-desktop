import { describe, expect, it } from 'vitest';

import {
  buildIssueDocumentAnchor,
  buildMarkdownProjectIndex,
  enrichIssueWithMarkdownIndex
} from '../markdownIndex';

describe('Markdown Indexing', () => {
  it('indexes headings deterministically and ignores fenced pseudo-headings', () => {
    const projectIndex = buildMarkdownProjectIndex([
      {
        name: 'spec.md',
        content: [
          '# Overview',
          '',
          'Intro paragraph.',
          '',
          'Execution Flow',
          '--------------',
          '',
          '```md',
          '# Not a heading inside code',
          '```',
          '',
          '## Recovery Mode',
          'Recovery details.'
        ].join('\n')
      }
    ]);

    expect(projectIndex.summary.documentCount).toBe(1);
    expect(projectIndex.summary.headingCount).toBe(3);
    expect(projectIndex.documents[0].headings.map((heading) => heading.title)).toEqual([
      'Overview',
      'Execution Flow',
      'Recovery Mode'
    ]);
    expect(projectIndex.documents[0].headings.map((heading) => heading.slug)).toEqual([
      'overview',
      'execution-flow',
      'recovery-mode'
    ]);
  });

  it('anchors issues to deterministic file, section, and line references', () => {
    const projectIndex = buildMarkdownProjectIndex([
      {
        name: 'PROJECT_PLAN.md',
        content: [
          '# Overview',
          '',
          'General summary.',
          '',
          '## Execution Flow',
          '1. Agent Proposal',
          '2. Governance Enforcement Interface',
          '3. Verification Layer',
          '',
          '## Recovery',
          'Retry logic follows a fixed policy.'
        ].join('\n')
      }
    ]);

    const diagnostics = {
      deterministic_anchor_enrichment_count: 0,
      deterministic_file_assignment_count: 0,
      deterministic_section_assignment_count: 0,
      deterministic_line_assignment_count: 0
    };

    const enriched = enrichIssueWithMarkdownIndex(
      {
        detector_id: 'L47-01',
        severity: 'high',
        description: 'Required step ordering is incomplete.',
        evidence: '2. Governance Enforcement Interface',
        files: []
      },
      projectIndex,
      diagnostics
    );

    expect(enriched.files).toEqual(['PROJECT_PLAN.md']);
    expect(enriched.section).toBe('Execution Flow');
    expect(enriched.section_slug).toBe('execution-flow');
    expect(enriched.line_number).toBe(7);
    expect(enriched.document_anchor).toBe('PROJECT_PLAN.md#execution-flow:L7');
    expect(enriched.evidence_reference).toBe('PROJECT_PLAN.md#execution-flow:L7');
    expect(enriched.violation_reference).toBe('PROJECT_PLAN.md#execution-flow:L7::L47-01');
    expect(enriched.anchor_source).toBe('evidence_match');
    expect(diagnostics.deterministic_anchor_enrichment_count).toBe(1);
    expect(diagnostics.deterministic_file_assignment_count).toBe(1);
    expect(diagnostics.deterministic_section_assignment_count).toBe(1);
    expect(diagnostics.deterministic_line_assignment_count).toBe(1);
  });

  it('preserves multiple resolved anchors for cross-file findings', () => {
    const projectIndex = buildMarkdownProjectIndex([
      {
        name: 'workflow-a.md',
        content: [
          '# Execution Flow',
          '',
          '2. Governance Enforcement Interface',
          '3. Verification Layer'
        ].join('\n')
      },
      {
        name: 'workflow-b.md',
        content: [
          '# Execution Flow',
          '',
          '2. Governance Enforcement Interface',
          '4. Local Export'
        ].join('\n')
      }
    ]);

    const diagnostics = {
      deterministic_anchor_enrichment_count: 0,
      deterministic_file_assignment_count: 0,
      deterministic_section_assignment_count: 0,
      deterministic_line_assignment_count: 0,
      deterministic_multi_anchor_count: 0,
      deterministic_fallback_anchor_count: 0
    };

    const enriched = enrichIssueWithMarkdownIndex(
      {
        detector_id: 'L47-01',
        severity: 'high',
        description: 'Required step ordering is incomplete.',
        evidence: '2. Governance Enforcement Interface',
        files: ['workflow-a.md', 'workflow-b.md']
      },
      projectIndex,
      diagnostics
    );

    expect(enriched.document_anchor).toBe('workflow-a.md#execution-flow:L3');
    expect(enriched.document_anchors).toEqual([
      'workflow-a.md#execution-flow:L3',
      'workflow-b.md#execution-flow:L3'
    ]);
    expect(diagnostics.deterministic_multi_anchor_count).toBe(1);
  });

  it('falls back to heading inference when section text is vague but document structure is clear', () => {
    const projectIndex = buildMarkdownProjectIndex([
      {
        name: 'recovery.md',
        content: [
          '# Overview',
          '',
          '## Recovery Journal',
          'Every rollback must be recorded with status and timestamp.',
          '',
          '## Export',
          'Write artifacts to disk.'
        ].join('\n')
      }
    ]);

    const diagnostics = {
      deterministic_anchor_enrichment_count: 0,
      deterministic_file_assignment_count: 0,
      deterministic_section_assignment_count: 0,
      deterministic_line_assignment_count: 0,
      deterministic_multi_anchor_count: 0,
      deterministic_fallback_anchor_count: 0
    };

    const enriched = enrichIssueWithMarkdownIndex(
      {
        detector_id: 'L52-02',
        detector_name: 'recovery journal completeness gap',
        severity: 'high',
        description: 'The recovery journal is not fully specified.',
        files: ['recovery.md']
      },
      projectIndex,
      diagnostics
    );

    expect(enriched.section).toBe('Recovery Journal');
    expect(enriched.section_slug).toBe('recovery-journal');
    expect(enriched.document_anchor).toBe('recovery.md#recovery-journal:L3');
    expect(enriched.anchor_source).toBe('heading_inference');
    expect(diagnostics.deterministic_fallback_anchor_count).toBe(1);
  });

  it('builds line-span anchors when a finding carries a range', () => {
    expect(buildIssueDocumentAnchor({
      files: ['spec.md'],
      section_slug: 'execution-flow',
      line_number: 12,
      line_end: 14
    })).toBe('spec.md#execution-flow:L12-L14');
  });
});

import { describe, expect, it } from 'vitest';

import { buildMarkdownProjectIndex, enrichIssueWithEvidenceSpans } from '../markdownIndex';
import { enrichIssueWithProofChains, normalizeProofChains } from '../evidenceGraph';
import { buildMarkdownProjectGraph, enrichIssueWithProjectGraph } from '../projectGraph';

describe('Evidence Graph', () => {
  it('builds typed proof chains from anchored spans and cross-file graph links', () => {
    const files = [
      {
        name: 'alpha.md',
        content: [
          '# Overview',
          '',
          'The system MUST record the transition.',
          'STATE_A -> STATE_B'
        ].join('\n')
      },
      {
        name: 'beta.md',
        content: [
          '# Overview',
          '',
          'The system MUST record the transition.',
          'STATE_A -> STATE_B'
        ].join('\n')
      }
    ];

    const markdownIndex = buildMarkdownProjectIndex(files);
    const projectGraph = buildMarkdownProjectGraph(files);
    const diagnostics = {
      deterministic_proof_chain_enrichment_count: 0,
      proof_chain_edge_count: 0
    };

    const graphEnriched = enrichIssueWithProjectGraph(
      {
        detector_id: 'L15-07',
        severity: 'high',
        category: 'requirement',
        description: 'Requirement traceability gap for transition recording.',
        evidence: 'The system MUST record the transition.',
        files: ['alpha.md'],
        document_anchor: 'alpha.md#overview:L3',
        document_anchors: ['alpha.md#overview:L3'],
        anchor_source: 'evidence_match'
      },
      projectGraph
    );

    const withSpans = enrichIssueWithEvidenceSpans(graphEnriched, markdownIndex);
    const withProofChains = enrichIssueWithProofChains(withSpans, markdownIndex, diagnostics);

    expect(withProofChains.proof_chains).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          relation: 'violates',
          source_span: expect.objectContaining({
            anchor: 'alpha.md#overview:L3'
          }),
          target_span: expect.objectContaining({
            file: 'beta.md'
          })
        })
      ])
    );
    expect(diagnostics.deterministic_proof_chain_enrichment_count).toBe(1);
    expect(diagnostics.proof_chain_edge_count).toBeGreaterThanOrEqual(1);
  });

  it('normalizes and deduplicates proof chains deterministically', () => {
    const chains = normalizeProofChains([
      {
        relation: 'supports',
        evidence_type: 'requirement_clause',
        rationale: 'Primary span is reinforced by the supporting clause.',
        related_keys: ['must record transition'],
        source_span: {
          file: 'alpha.md',
          section: 'Overview',
          section_slug: 'overview',
          line_start: 3,
          anchor: 'alpha.md#overview:L3',
          role: 'primary',
          source: 'evidence_match',
          excerpt: 'The system MUST record the transition.'
        },
        target_span: {
          file: 'beta.md',
          section: 'Overview',
          section_slug: 'overview',
          line_start: 3,
          anchor: 'beta.md#overview:L3',
          role: 'related',
          source: 'requirement_clause',
          excerpt: 'The system MUST record the transition.'
        }
      },
      {
        relation: 'supports',
        evidence_type: 'requirement_clause',
        source_span: {
          file: 'alpha.md',
          section_slug: 'overview',
          line_start: 3,
          anchor: 'alpha.md#overview:L3',
          role: 'primary',
          source: 'evidence_match'
        },
        target_span: {
          file: 'beta.md',
          section_slug: 'overview',
          line_start: 3,
          anchor: 'beta.md#overview:L3',
          role: 'related',
          source: 'requirement_clause'
        }
      }
    ]);

    expect(chains).toHaveLength(1);
    expect(chains[0].relation).toBe('supports');
    expect(chains[0].related_keys).toEqual(['must record transition']);
  });

  it('creates proof chains from file and section fallback when evidence spans are absent', () => {
    const files = [
      {
        name: 'alpha.md',
        content: [
          '# Workflow',
          '',
          '1. Agent Proposal',
          '2. Governance Enforcement Interface'
        ].join('\n')
      },
      {
        name: 'beta.md',
        content: [
          '# Workflow',
          '',
          '1. Agent Proposal',
          '2. Governance Enforcement Interface'
        ].join('\n')
      }
    ];

    const markdownIndex = buildMarkdownProjectIndex(files);
    const issue = enrichIssueWithProofChains(
      {
        detector_id: 'L47-01',
        severity: 'high',
        category: 'workflow_lifecycle_integrity',
        section: 'Workflow',
        files: ['alpha.md'],
        line_number: 3,
        cross_file_links: [
          {
            type: 'workflow_step',
            label: '1. Agent Proposal',
            file: 'beta.md',
            section: 'Workflow',
            target: 'beta.md#workflow:L3',
            related_keys: ['1::agent proposal']
          }
        ]
      },
      markdownIndex
    );

    expect(issue.proof_chains).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          relation: 'depends_on',
          source_span: expect.objectContaining({
            file: 'alpha.md',
            anchor: 'alpha.md#workflow:L3'
          }),
          target_span: expect.objectContaining({
            anchor: 'beta.md#workflow:L3'
          })
        })
      ])
    );
  });
});

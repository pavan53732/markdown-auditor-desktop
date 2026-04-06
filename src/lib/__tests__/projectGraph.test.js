import { describe, expect, it } from 'vitest';

import { buildMarkdownProjectGraph, enrichIssueWithProjectGraph } from '../projectGraph';

describe('Markdown Project Graph', () => {
  it('builds deterministic cross-file heading, glossary, identifier, and workflow groups', () => {
    const graph = buildMarkdownProjectGraph([
      {
        name: 'alpha.md',
        content: [
          '# Overview',
          '',
          '## Glossary',
          '- **Project State Graph**: Shared world model.',
          '',
          '## Execution Flow',
          '1. Agent Proposal',
          '2. Governance Enforcement Interface',
          '',
          'Use PSG-CORE for synchronization.'
        ].join('\n')
      },
      {
        name: 'beta.md',
        content: [
          '# Overview',
          '',
          '## Terminology Registry',
          '**Project State Graph**: Canonical state model.',
          '',
          '## Execution Flow',
          '1. Agent Proposal',
          '2. Governance Enforcement Interface',
          '',
          'PSG-CORE coordinates execution.'
        ].join('\n')
      }
    ]);

    expect(graph.summary.documentCount).toBe(2);
    expect(graph.summary.headingGroupCount).toBeGreaterThanOrEqual(2);
    expect(graph.summary.glossaryTermGroupCount).toBeGreaterThanOrEqual(1);
    expect(graph.summary.identifierGroupCount).toBeGreaterThanOrEqual(1);
    expect(graph.summary.workflowGroupCount).toBeGreaterThanOrEqual(2);
  });

  it('enriches issues with cross-file links and hybrid graph detection source', () => {
    const graph = buildMarkdownProjectGraph([
      {
        name: 'plan-a.md',
        content: [
          '# Execution Flow',
          '',
          '1. Agent Proposal',
          '2. Governance Enforcement Interface',
          '',
          'PSG-CORE enforces state sync.'
        ].join('\n')
      },
      {
        name: 'plan-b.md',
        content: [
          '# Execution Flow',
          '',
          '1. Agent Proposal',
          '2. Governance Enforcement Interface',
          '',
          'PSG-CORE records commits.'
        ].join('\n')
      }
    ]);

    const diagnostics = { deterministic_graph_link_enrichment_count: 0 };
    const enriched = enrichIssueWithProjectGraph(
      {
        detector_id: 'L47-01',
        severity: 'high',
        description: 'Governance Enforcement Interface ordering is inconsistent for PSG-CORE.',
        evidence: '2. Governance Enforcement Interface',
        files: ['plan-a.md'],
        document_anchor: 'plan-a.md#execution-flow:L4',
        document_anchors: ['plan-a.md#execution-flow:L4'],
        anchor_source: 'evidence_match'
      },
      graph,
      diagnostics
    );

    expect(enriched.detection_source).toBe('hybrid_graph');
    expect(enriched.cross_file_links).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          file: 'plan-b.md'
        })
      ])
    );
    expect(diagnostics.deterministic_graph_link_enrichment_count).toBe(1);
  });
});

import { describe, expect, it } from 'vitest';

import { buildMarkdownProjectGraph } from '../projectGraph';
import { runDeterministicRuleEngine } from '../ruleEngine/index';

describe('Deterministic Rule Engine', () => {
  it('emits deterministic rule-backed issues with rule evidence and spans', () => {
    const files = [
      {
        name: 'spec.md',
        content: [
          '# Overview',
          'See [Missing](#missing-anchor).',
          '',
          '## Execution Flow',
          '1. Agent Proposal',
          '2. Governance Enforcement Interface',
          '4. Deploy artifact',
          '5. Verification Layer',
          'The system MUST persist the audit state.',
          'This system should stop here.',
          'PSG-CORE coordinates execution.',
          '',
          '## Overview',
          'Repeated section.',
          '',
          '## Glossary',
          '- **Project State Graph**: Shared world model.'
        ].join('\n')
      },
      {
        name: 'notes.md',
        content: [
          '# Notes',
          'PSG-CORE records state transitions.'
        ].join('\n')
      }
    ];

    const diagnostics = { deterministic_rule_issue_count: 0, deterministic_rule_runs: 0 };
    const projectGraph = buildMarkdownProjectGraph(files);
    const result = runDeterministicRuleEngine({ files, projectGraph, diagnostics });
    const detectorIds = result.issues.map((issue) => issue.detector_id);

    expect(detectorIds).toEqual(expect.arrayContaining([
      'L3-03',
      'L13-05',
      'L47-01',
      'L9-09',
      'L47-08',
      'L15-11',
      'L46-06',
      'L46-07'
    ]));

    expect(result.issues.every((issue) => issue.detection_source === 'rule')).toBe(true);
    expect(result.issues.every((issue) => issue.analysis_agent === 'deterministic_rule_engine')).toBe(true);
    expect(result.issues.every((issue) => Array.isArray(issue.evidence_spans) && issue.evidence_spans.length > 0)).toBe(true);
    expect(diagnostics.deterministic_rule_runs).toBe(1);
    expect(diagnostics.deterministic_rule_issue_count).toBe(result.issues.length);
  });

  it('returns an empty deterministic result when no documents are available', () => {
    const result = runDeterministicRuleEngine({ files: [], projectGraph: { projectIndex: { documents: [] } } });
    expect(result.issues).toEqual([]);
    expect(result.summary.total).toBe(0);
  });
});

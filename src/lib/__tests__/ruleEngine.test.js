import { describe, expect, it } from 'vitest';

import { buildMarkdownProjectGraph } from '../projectGraph';
import { DETERMINISTIC_RULE_DEFINITIONS, runDeterministicRuleEngine } from '../ruleEngine/index';

describe('Deterministic Rule Engine', () => {
  it('emits deterministic rule-backed issues with rule evidence and spans', () => {
    const files = [
      {
        name: 'spec.md',
        content: [
          '# Overview',
          '### Deep Skip',
          'See [Missing](#missing-anchor).',
          '',
          '## Execution Flow',
          '1. Agent Proposal',
          '2. Governance Enforcement Interface',
          '4. Deploy artifact',
          '5. Verification Layer',
          'STATE_A -> STATE_B',
          'The system MUST persist the audit state.',
          'The runtime MUST persist audit receipts.',
          'This system should stop here.',
          'PSG-CORE coordinates execution.',
          '',
          '## Overview',
          'Repeated section.',
          '',
          '## Glossary',
          '- **Project State Graph**: Shared world model.',
          '',
          '### Empty Section'
        ].join('\n')
      },
      {
        name: 'notes.md',
        content: [
          '# Notes',
          'PSG-CORE records state transitions.',
          'The runtime MUST persist audit receipts.'
        ].join('\n')
      },
      {
        name: 'conflict.md',
        content: [
          '# Requirements',
          'The system SHOULD persist the audit state.'
        ].join('\n')
      }
    ];

    const diagnostics = { deterministic_rule_issue_count: 0, deterministic_rule_runs: 0 };
    const projectGraph = buildMarkdownProjectGraph(files);
    const result = runDeterministicRuleEngine({ files, projectGraph, diagnostics });
    const detectorIds = result.issues.map((issue) => issue.detector_id);

    expect(detectorIds).toEqual(expect.arrayContaining([
      'L3-01',
      'L3-02',
      'L3-03',
      'L13-05',
      'L47-01',
      'L9-09',
      'L47-08',
      'L15-11',
      'L15-06',
      'L15-21',
      'L16-04',
      'L46-06',
      'L46-07'
    ]));

    expect(result.issues.every((issue) => issue.detection_source === 'rule')).toBe(true);
    expect(result.issues.every((issue) => issue.analysis_agent === 'deterministic_rule_engine')).toBe(true);
    expect(result.issues.every((issue) => Array.isArray(issue.evidence_spans) && issue.evidence_spans.length > 0)).toBe(true);
    expect(result.summary.detectors_checked).toBe(DETERMINISTIC_RULE_DEFINITIONS.length);
    expect(result.summary.detectors_clean + result.summary.detectors_hit).toBe(result.summary.detectors_checked);
    expect(result.summary.detector_execution_receipts).toHaveLength(DETERMINISTIC_RULE_DEFINITIONS.length);
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L3-01' && receipt.status === 'hit')).toBe(true);
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L3-02' && receipt.status === 'hit')).toBe(true);
    expect(diagnostics.deterministic_rule_runs).toBe(1);
    expect(diagnostics.deterministic_rule_issue_count).toBe(result.issues.length);
    expect(diagnostics.deterministic_rule_checked_detector_count).toBe(DETERMINISTIC_RULE_DEFINITIONS.length);
  });

  it('returns an empty deterministic result when no documents are available', () => {
    const result = runDeterministicRuleEngine({ files: [], projectGraph: { projectIndex: { documents: [] } } });
    expect(result.issues).toEqual([]);
    expect(result.summary.total).toBe(0);
  });

  it('emits deterministic api-contract and specification-formalism issues from anchored section evidence', () => {
    const files = [
      {
        name: 'api.md',
        content: [
          '# API',
          '## Create Payment',
          'POST /payments',
          'Authentication required.',
          'Rate limit applies.',
          'Request body: amount, currency',
          'Retries may occur on network failure.',
          '',
          '## State Flow',
          'DRAFT -> SUBMITTED',
          'SUBMITTED -> PROCESSING',
          'PROCESSING -> DONE',
          'PSG-CORE coordinates processing.'
        ].join('\n')
      },
      {
        name: 'symbols.md',
        content: [
          '# Runtime Notes',
          'PSG_CORE records transitions.',
          'GET /payments/{id}',
          'Response TBD.'
        ].join('\n')
      }
    ];

    const projectGraph = buildMarkdownProjectGraph(files);
    const result = runDeterministicRuleEngine({ files, projectGraph });
    const detectorIds = result.issues.map((issue) => issue.detector_id);

    expect(detectorIds).toEqual(expect.arrayContaining([
      'L17-03',
      'L17-04',
      'L17-09',
      'L17-11',
      'L17-12',
      'L33-03',
      'L33-06',
      'L33-08',
      'L33-15'
    ]));
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L17-03' && receipt.status === 'hit')).toBe(true);
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L33-15' && receipt.status === 'hit')).toBe(true);
  });

  it('flags glossary sections that are not formal terminology registries', () => {
    const files = [
      {
        name: 'glossary.md',
        content: [
          '# Glossary',
          'This section lists terms informally without formal definitions.',
          'API tokens and states are described elsewhere.'
        ].join('\n')
      }
    ];

    const projectGraph = buildMarkdownProjectGraph(files);
    const result = runDeterministicRuleEngine({ files, projectGraph });
    expect(result.issues.some((issue) => issue.detector_id === 'L33-14')).toBe(true);
  });
});

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

  it('emits deterministic governance, execution, world-state, and interaction issues from structured spec gaps', () => {
    const files = [
      {
        name: 'release.md',
        content: [
          '# Release Control',
          '## Release Workflow',
          '1. Operator requests release',
          '2. Agent deploys artifact',
          '3. System writes PSG state',
          'Retries are allowed if deployment fails.',
          '',
          '## UI Surface',
          'The dashboard includes a button and modal for release approval.',
          '',
          '## State Model',
          'DRAFT -> REVIEW',
          'REVIEW -> APPLIED',
          '',
          '## Requirements',
          'The system MUST quickly reconcile the release as needed.'
        ].join('\n')
      }
    ];

    const projectGraph = buildMarkdownProjectGraph(files);
    const result = runDeterministicRuleEngine({ files, projectGraph });
    const detectorIds = result.issues.map((issue) => issue.detector_id);

    expect(detectorIds).toEqual(expect.arrayContaining([
      'L4-01',
      'L29-18',
      'L44-10',
      'L44-13',
      'L43-05',
      'L43-13',
      'L45-03',
      'L45-15',
      'L45-16',
      'L42-03'
    ]));
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L29-18' && receipt.status === 'hit')).toBe(true);
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L43-13' && receipt.status === 'hit')).toBe(true);
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L45-16' && receipt.status === 'hit')).toBe(true);
  });

  it('emits deterministic task-graph validation issues for cycles, ordering, disconnected nodes, and priority inversion', () => {
    const files = [
      {
        name: 'task-graph.md',
        content: [
          '# Planner',
          '## Task Graph',
          '1. P2 Bootstrap runtime',
          '2. P1 Validate dependencies depends on step 4',
          '3. P2 Publish audit report depends on step 2',
          '4. P3 Backfill indexes depends on step 3',
          '5. P0 Notify dashboard'
        ].join('\n')
      }
    ];

    const projectGraph = buildMarkdownProjectGraph(files);
    const result = runDeterministicRuleEngine({ files, projectGraph });
    const detectorIds = result.issues.map((issue) => issue.detector_id);

    expect(detectorIds).toEqual(expect.arrayContaining([
      'L18-01',
      'L18-04',
      'L20-01',
      'L10-07'
    ]));
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L18-01' && receipt.status === 'hit')).toBe(true);
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L18-04' && receipt.status === 'hit')).toBe(true);
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L20-01' && receipt.status === 'hit')).toBe(true);
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L10-07' && receipt.status === 'hit')).toBe(true);
  });

  it('emits deterministic governance-bypass, override-condition, dependency, and parallel-ordering issues', () => {
    const files = [
      {
        name: 'ops.md',
        content: [
          '# Release Runtime',
          '## Task Graph',
          '1. Bootstrap cluster depends on step 2',
          '2. Force apply release in parallel',
          '3. Publish state snapshot depends on step 2',
          '',
          '## Release Workflow',
          '1. Operator requests a break-glass release',
          '2. Runtime force apply release without approval',
          '3. Agents execute deployment in parallel'
        ].join('\n')
      }
    ];

    const projectGraph = buildMarkdownProjectGraph(files);
    const result = runDeterministicRuleEngine({ files, projectGraph });
    const detectorIds = result.issues.map((issue) => issue.detector_id);

    expect(detectorIds).toEqual(expect.arrayContaining([
      'L29-15',
      'L44-12',
      'L18-13',
      'L18-11',
      'L43-08'
    ]));
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L29-15' && receipt.status === 'hit')).toBe(true);
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L44-12' && receipt.status === 'hit')).toBe(true);
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L18-13' && receipt.status === 'hit')).toBe(true);
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L18-11' && receipt.status === 'hit')).toBe(true);
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L43-08' && receipt.status === 'hit')).toBe(true);
  });

  it('emits deterministic interaction-intelligence issues for ambiguous intent, missing scope boundaries, UI mapping, and conflicting interaction modes', () => {
    const files = [
      {
        name: 'interaction.md',
        content: [
          '# Product Intent',
          '## Objective',
          'Enable a simple, self-serve approval-free release experience that improves speed quickly.',
          '',
          '## Change Scope',
          'This change updates the dashboard, approval flow, and release workflow for operators.',
          '',
          '## UX Flow',
          'The system automatically applies the release with no user action.',
          'The user must click Confirm and approve the release in the dashboard.',
          '',
          '## UI Surface',
          'The dashboard includes a button and modal for release approval.'
        ].join('\n')
      }
    ];

    const projectGraph = buildMarkdownProjectGraph(files);
    const result = runDeterministicRuleEngine({ files, projectGraph });
    const detectorIds = result.issues.map((issue) => issue.detector_id);

    expect(detectorIds).toEqual(expect.arrayContaining([
      'L10-10',
      'L10-01',
      'L10-02',
      'L10-03',
      'L42-03'
    ]));
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L10-10' && receipt.status === 'hit')).toBe(true);
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L10-01' && receipt.status === 'hit')).toBe(true);
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L10-02' && receipt.status === 'hit')).toBe(true);
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L10-03' && receipt.status === 'hit')).toBe(true);
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L42-03' && receipt.status === 'hit')).toBe(true);
  });
});

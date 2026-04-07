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

  it('emits deterministic dependency-graph issues for missing prerequisite nodes and optional-vs-required dependency drift', () => {
    const files = [
      {
        name: 'dependencies.md',
        content: [
          '# Planner',
          '## Task Graph',
          '1. Bootstrap runtime',
          '2. Optionally sync cache depends on step 7 if available',
          '3. Mandatory publish report depends on step 1'
        ].join('\n')
      }
    ];

    const projectGraph = buildMarkdownProjectGraph(files);
    const result = runDeterministicRuleEngine({ files, projectGraph });
    const detectorIds = result.issues.map((issue) => issue.detector_id);

    expect(detectorIds).toEqual(expect.arrayContaining([
      'L18-03',
      'L18-05'
    ]));
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L18-03' && receipt.status === 'hit')).toBe(true);
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L18-05' && receipt.status === 'hit')).toBe(true);
  });

  it('emits deterministic compliance, execution-determinism, and transition-determinism issues from ambiguous control flow', () => {
    const files = [
      {
        name: 'controls.md',
        content: [
          '# Governance',
          '## Compliance Flow',
          'SOC 2 compliance requires audit controls.',
          '1. System writes compliance state',
          '2. Runtime applies policy changes in any order',
          '',
          '## State Machine',
          'PENDING -> APPROVED',
          'PENDING -> REJECTED'
        ].join('\n')
      }
    ];

    const projectGraph = buildMarkdownProjectGraph(files);
    const result = runDeterministicRuleEngine({ files, projectGraph });
    const detectorIds = result.issues.map((issue) => issue.detector_id);

    expect(detectorIds).toEqual(expect.arrayContaining([
      'L29-16',
      'L43-09',
      'L43-11'
    ]));
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L29-16' && receipt.status === 'hit')).toBe(true);
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L43-09' && receipt.status === 'hit')).toBe(true);
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L43-11' && receipt.status === 'hit')).toBe(true);
  });

  it('emits deterministic dependency-version, governance-priority, enforcement-path, and delegation issues', () => {
    const files = [
      {
        name: 'governance.md',
        content: [
          '# Release Governance',
          '## Dependencies',
          'runtime-sdk latest',
          'cache-lib v1.0.0',
          'cache-lib v2.0.0',
          '',
          '## Governance Policy',
          'Policy overrides apply during emergency release bypass.',
          'Deploy release artifacts under compliance policy.',
          '',
          '## Control Plane',
          'Delegated agent may decide the deployment override.',
          'Control plane policy applies to release execution.'
        ].join('\n')
      }
    ];

    const projectGraph = buildMarkdownProjectGraph(files);
    const result = runDeterministicRuleEngine({ files, projectGraph });
    const detectorIds = result.issues.map((issue) => issue.detector_id);

    expect(detectorIds).toEqual(expect.arrayContaining([
      'L18-08',
      'L18-06',
      'L29-11',
      'L29-17',
      'L44-02',
      'L44-05'
    ]));
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L18-08' && receipt.status === 'hit')).toBe(true);
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L18-06' && receipt.status === 'hit')).toBe(true);
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L29-11' && receipt.status === 'hit')).toBe(true);
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L29-17' && receipt.status === 'hit')).toBe(true);
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L44-02' && receipt.status === 'hit')).toBe(true);
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L44-05' && receipt.status === 'hit')).toBe(true);
  });

  it('emits deterministic execution-trigger, idempotency, ordering, deadlock, and output-determinism issues', () => {
    const files = [
      {
        name: 'execution.md',
        content: [
          '# Runtime Execution',
          '## Release Workflow',
          '1. Deploy artifact',
          '2. Retry deployment if it fails',
          '3. Publish results in any order',
          '',
          '## Concurrency',
          'Workers run in parallel and wait for lock A before lock B.',
          'Reports may be emitted in any order.'
        ].join('\n')
      }
    ];

    const projectGraph = buildMarkdownProjectGraph(files);
    const result = runDeterministicRuleEngine({ files, projectGraph });
    const detectorIds = result.issues.map((issue) => issue.detector_id);

    expect(detectorIds).toEqual(expect.arrayContaining([
      'L20-02',
      'L20-16',
      'L20-17',
      'L43-03',
      'L43-12'
    ]));
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L20-02' && receipt.status === 'hit')).toBe(true);
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L20-16' && receipt.status === 'hit')).toBe(true);
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L20-17' && receipt.status === 'hit')).toBe(true);
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L43-03' && receipt.status === 'hit')).toBe(true);
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L43-12' && receipt.status === 'hit')).toBe(true);
  });

  it('emits deterministic redundant-dependency and dependency-ownership detail issues from repeated dependency surfaces', () => {
    const files = [
      {
        name: 'dependencies.md',
        content: [
          '# Release Dependencies',
          '## Dependencies',
          'platform-sdk v2.1.0',
          'platform-sdk v2.1.0',
          'Operator and Admin coordinate runtime-sdk v3.0.0',
          'runtime-sdk v3.0.0'
        ].join('\n')
      }
    ];

    const projectGraph = buildMarkdownProjectGraph(files);
    const result = runDeterministicRuleEngine({ files, projectGraph });
    const detectorIds = result.issues.map((issue) => issue.detector_id);

    expect(detectorIds).toEqual(expect.arrayContaining([
      'L18-07',
      'L18-09'
    ]));
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L18-07' && receipt.status === 'hit')).toBe(true);
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L18-09' && receipt.status === 'hit')).toBe(true);
  });

  it('emits deterministic execution-path and governance expansion issues for ambiguous release control flow', () => {
    const files = [
      {
        name: 'governance-flow.md',
        content: [
          '# Release Runtime',
          '## Release Workflow',
          'This workflow is automatically triggered on startup and manually triggered on request.',
          '1. If policy allows, deploy release',
          '2. When policy is absent, queue review',
          'The path mutates session state and may execute in any order.',
          '',
          '## Governance Policy',
          'Operator and Admin release updates and override policy during emergencies.',
          'Agent writes release state directly.',
          '## Control Plane Decisions',
          'The system decides whether to allow release.'
        ].join('\n')
      }
    ];

    const projectGraph = buildMarkdownProjectGraph(files);
    const result = runDeterministicRuleEngine({ files, projectGraph });
    const detectorIds = result.issues.map((issue) => issue.detector_id);

    expect(detectorIds).toEqual(expect.arrayContaining([
      'L20-03',
      'L20-04',
      'L20-05',
      'L20-10',
      'L20-18',
      'L20-19',
      'L29-02',
      'L29-03',
      'L29-06',
      'L29-07',
      'L29-08',
      'L29-21',
      'L44-14'
    ]));
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L20-03' && receipt.status === 'hit')).toBe(true);
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L29-21' && receipt.status === 'hit')).toBe(true);
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L44-14' && receipt.status === 'hit')).toBe(true);
  });

  it('emits deterministic transition, concurrency, and input-determinism issues from under-specified execution semantics', () => {
    const files = [
      {
        name: 'execution-model.md',
        content: [
          '# Runtime Model',
          '## Release Workflow',
          '1. Execute deployment',
          '2. Publish report',
          '',
          '## Concurrency Model',
          'Workers run in parallel across the release path.',
          '',
          '## State Machine',
          'PENDING -> APPROVED',
          'PENDING -> REJECTED'
        ].join('\n')
      }
    ];

    const projectGraph = buildMarkdownProjectGraph(files);
    const result = runDeterministicRuleEngine({ files, projectGraph });
    const detectorIds = result.issues.map((issue) => issue.detector_id);

    expect(detectorIds).toEqual(expect.arrayContaining([
      'L43-01',
      'L43-02',
      'L43-04'
    ]));
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L43-01' && receipt.status === 'hit')).toBe(true);
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L43-02' && receipt.status === 'hit')).toBe(true);
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L43-04' && receipt.status === 'hit')).toBe(true);
  });

  it('emits deterministic memory-world-model issues for snapshot isolation, atomicity, conflict resolution, and read/write consistency', () => {
    const files = [
      {
        name: 'memory.md',
        content: [
          '# Memory Model',
          '## PSG Snapshot',
          'The runtime writes shared PSG state and reads from replica snapshots during release execution.',
          'Operator and Agents update shared state in parallel while readers fetch session state.'
        ].join('\n')
      }
    ];

    const projectGraph = buildMarkdownProjectGraph(files);
    const result = runDeterministicRuleEngine({ files, projectGraph });
    const detectorIds = result.issues.map((issue) => issue.detector_id);

    expect(detectorIds).toEqual(expect.arrayContaining([
      'L35-03',
      'L35-05',
      'L35-08',
      'L35-11'
    ]));
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L35-03' && receipt.status === 'hit')).toBe(true);
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L35-05' && receipt.status === 'hit')).toBe(true);
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L35-08' && receipt.status === 'hit')).toBe(true);
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L35-11' && receipt.status === 'hit')).toBe(true);
  });

  it('emits deterministic tool-execution-safety issues for sandboxing, side-effect validation, forbidden writes, and tool result validation', () => {
    const files = [
      {
        name: 'tools.md',
        content: [
          '# Tool Execution',
          '## Deployment Script',
          'The automation executes deployment scripts and writes directly to the production database and host filesystem.',
          'Tool results and reports are emitted after the run.'
        ].join('\n')
      }
    ];

    const projectGraph = buildMarkdownProjectGraph(files);
    const result = runDeterministicRuleEngine({ files, projectGraph });
    const detectorIds = result.issues.map((issue) => issue.detector_id);

    expect(detectorIds).toEqual(expect.arrayContaining([
      'L37-14',
      'L37-08',
      'L37-11',
      'L37-13'
    ]));
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L37-14' && receipt.status === 'hit')).toBe(true);
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L37-08' && receipt.status === 'hit')).toBe(true);
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L37-11' && receipt.status === 'hit')).toBe(true);
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L37-13' && receipt.status === 'hit')).toBe(true);
  });

  it('emits deterministic context-orchestration issues for duplicate context, overflow, retrieval validation, and relevance ranking', () => {
    const files = [
      {
        name: 'context.md',
        content: [
          '# Context Assembly',
          '## Context Window',
          'Include the entire history, all messages, and the full log for every request.',
          'Context item: release approval state',
          'Context item: release approval state',
          'The system retrieves context from search and source packs before injection.'
        ].join('\n')
      }
    ];

    const projectGraph = buildMarkdownProjectGraph(files);
    const result = runDeterministicRuleEngine({ files, projectGraph });
    const detectorIds = result.issues.map((issue) => issue.detector_id);

    expect(detectorIds).toEqual(expect.arrayContaining([
      'L40-05',
      'L40-09',
      'L40-06',
      'L40-13'
    ]));
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L40-05' && receipt.status === 'hit')).toBe(true);
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L40-09' && receipt.status === 'hit')).toBe(true);
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L40-06' && receipt.status === 'hit')).toBe(true);
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L40-13' && receipt.status === 'hit')).toBe(true);
  });

  it('emits deterministic reasoning-integrity issues for evidence binding, trace completeness, uncertainty propagation, and evidence-free escalation', () => {
    const files = [
      {
        name: 'reasoning.md',
        content: [
          '# Reasoning',
          '## Decision Analysis',
          'This seems likely to be critical and we must block the rollout.',
          'Approve the release.'
        ].join('\n')
      }
    ];

    const projectGraph = buildMarkdownProjectGraph(files);
    const result = runDeterministicRuleEngine({ files, projectGraph });
    const detectorIds = result.issues.map((issue) => issue.detector_id);

    expect(detectorIds).toEqual(expect.arrayContaining([
      'L41-01',
      'L41-07',
      'L41-14',
      'L41-16'
    ]));
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L41-01' && receipt.status === 'hit')).toBe(true);
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L41-07' && receipt.status === 'hit')).toBe(true);
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L41-14' && receipt.status === 'hit')).toBe(true);
    expect(result.summary.detector_execution_receipts.some((receipt) => receipt.detector_id === 'L41-16' && receipt.status === 'hit')).toBe(true);
  });
});

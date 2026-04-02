import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

import { DETECTOR_METADATA, normalizeIssueFromDetector, createInitialDiagnostics } from '../detectorMetadata';

describe('Extended Universal Benchmark Fixtures', () => {
  const fixturesDir = path.join(__dirname, 'fixtures');

  const getFixtureContent = (name) => {
    return fs.readFileSync(path.join(fixturesDir, name), 'utf8');
  };

  const fixtureExpectations = [
    {
      name: 'benchmark-vocabulary-authority.md',
      requiredText: ['phase', 'canonical', 'glossary'],
      detectors: ['L46-01', 'L46-02', 'L46-03']
    },
    {
      name: 'benchmark-workflow-no-skip.md',
      requiredText: ['validation', 'skipped', 'rollback'],
      detectors: ['L47-03', 'L47-04', 'L47-08']
    },
    {
      name: 'benchmark-authority-path-bypass.md',
      requiredText: ['governance gateway', 'execution owner', 'approval chain'],
      detectors: ['L48-01', 'L48-02', 'L48-06']
    },
    {
      name: 'benchmark-artifact-reproducibility.md',
      requiredText: ['timestamp', 'source commit', 'environment snapshot'],
      detectors: ['L49-02', 'L49-03', 'L49-05']
    },
    {
      name: 'benchmark-toolchain-isolation.md',
      requiredText: ['PATH', 'Caches', 'permissions'],
      detectors: ['L50-01', 'L50-04', 'L50-06']
    },
    {
      name: 'benchmark-knowledge-source-authority.md',
      requiredText: ['source of truth', 'forum answer', 'staleness'],
      detectors: ['L51-01', 'L51-02', 'L51-07']
    },
    {
      name: 'benchmark-recovery-loop-collapse.md',
      requiredText: ['Rollback', 'recovery journal', 'emergency recovery'],
      detectors: ['L52-02', 'L52-03', 'L52-06']
    },
    {
      name: 'benchmark-operational-ux-leakage.md',
      requiredText: ['Simple Mode', 'raw stack traces', 'preview'],
      detectors: ['L53-01', 'L53-05', 'L53-07']
    }
  ];

  fixtureExpectations.forEach(({ name, requiredText, detectors }) => {
    it(`verifies ${name} content and metadata mapping`, () => {
      const content = getFixtureContent(name);
      requiredText.forEach((snippet) => {
        expect(content).toContain(snippet);
      });
      detectors.forEach((detectorId) => {
        expect(DETECTOR_METADATA[detectorId]).toBeDefined();
      });
    });
  });

  it('normalizes extended vocabulary authority findings with strict schema fields', () => {
    const diagnostics = createInitialDiagnostics();
    const normalized = normalizeIssueFromDetector({
      severity: 'medium',
      description: '[L46-02] Canonical vocabulary is not enforced across the spec.',
      category: 'ontology_vocabulary_governance',
      files: ['benchmark-vocabulary-authority.md'],
      section: 'Vocabulary Drift Example',
      line_number: 2
    }, diagnostics);

    expect(normalized.detector_id).toBe('L46-02');
    expect(normalized.layer).toBe('ontology_vocabulary_governance');
    expect(normalized.failure_type).toBe('ambiguity_leak');
    expect(normalized.contract_step).toBe('foundation_validation');
    expect(normalized.invariant_broken).toBe('ontology_vocabulary_governance.canonical_vocabulary_enforcement');
    expect(normalized.violation_reference).toContain('benchmark-vocabulary-authority.md');
  });

  it('normalizes authority-path findings with authority boundary metadata', () => {
    const diagnostics = createInitialDiagnostics();
    const normalized = normalizeIssueFromDetector({
      severity: 'critical',
      description: '[L48-06] Mutation gateway is bypassed during maintenance.',
      category: 'authority_path_integrity',
      files: ['benchmark-authority-path-bypass.md']
    }, diagnostics);

    expect(normalized.detector_id).toBe('L48-06');
    expect(normalized.layer).toBe('authority_path_integrity');
    expect(normalized.failure_type).toBe('authority_confusion');
    expect(normalized.authority_boundary).toBe('authority_path_boundary');
    expect(normalized.closed_world_status).toBe('strict_required');
  });

  it('normalizes recovery findings with deterministic fix defaults', () => {
    const diagnostics = createInitialDiagnostics();
    const normalized = normalizeIssueFromDetector({
      severity: 'high',
      description: '[L52-06] Recovery mission may recurse forever.',
      category: 'failure_recovery_integrity',
      files: ['benchmark-recovery-loop-collapse.md']
    }, diagnostics);

    expect(normalized.detector_id).toBe('L52-06');
    expect(normalized.layer).toBe('failure_recovery_integrity');
    expect(normalized.failure_type).toBe('recovery_break');
    expect(normalized.deterministic_fix).toContain('deterministic contract');
    expect(normalized.analysis_agents || []).toEqual([]);
  });
});

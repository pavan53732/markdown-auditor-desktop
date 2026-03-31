import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

import { DETECTOR_METADATA } from '../detectorMetadata';
import { normalizeIssueFromDetector, createInitialDiagnostics } from '../detectorMetadata';

describe('Deep Spec Benchmark Fixtures', () => {
  const fixturesDir = path.join(__dirname, 'fixtures');

  const getFixtureContent = (name) => {
    return fs.readFileSync(path.join(fixturesDir, name), 'utf8');
  };

  it('verifies benchmark-ui-omission.md content and metadata mapping', () => {
    const content = getFixtureContent('benchmark-ui-omission.md');
    expect(content).toContain('Rollback');
    expect(content).toContain('Missing Component');
    
    // Verify related detectors exist
    expect(DETECTOR_METADATA['L42-01']).toBeDefined(); // mandatory UI component existence gap
    expect(DETECTOR_METADATA['L27-09']).toBeDefined(); // mandatory UI component gap
  });

  it('verifies benchmark-governance-bypass.md content and metadata mapping', () => {
    const content = getFixtureContent('benchmark-governance-bypass.md');
    expect(content).toContain('PSG');
    expect(content).toContain('db_writer');
    
    expect(DETECTOR_METADATA['L29-12']).toBeDefined(); // checkpoint omission
    expect(DETECTOR_METADATA['L45-02']).toBeDefined(); // mutation gateway bypass
    expect(DETECTOR_METADATA['L37-04']).toBeDefined(); // forbidden direct write
  });

  it('verifies benchmark-platform-leakage.md content and metadata mapping', () => {
    const content = getFixtureContent('benchmark-platform-leakage.md');
    expect(content).toContain('Android');
    expect(content).toContain('iOS_BackgroundFetch');
    
    expect(DETECTOR_METADATA['L39-01']).toBeDefined(); // platform exclusion violation
    expect(DETECTOR_METADATA['L38-08']).toBeDefined(); // local export enforcement gap
  });

  it('verifies benchmark-non-deterministic-replay.md content and metadata mapping', () => {
    const content = getFixtureContent('benchmark-non-deterministic-replay.md');
    expect(content).toContain('system clock timestamp');
    
    expect(DETECTOR_METADATA['L43-06']).toBeDefined(); // deterministic replay impossible
    expect(DETECTOR_METADATA['L16-16']).toBeDefined(); // non-deterministic transition
    expect(DETECTOR_METADATA['L33-10']).toBeDefined(); // output contract indeterminism
  });

  it('verifies benchmark-context-contamination.md content and metadata mapping', () => {
    const content = getFixtureContent('benchmark-context-contamination.md');
    expect(content).toContain('session_private_key_hint');
    
    expect(DETECTOR_METADATA['L40-02']).toBeDefined(); // context contamination
    expect(DETECTOR_METADATA['L23-01']).toBeDefined(); // secret exposure risk
  });

  // New deep-spec benchmark fixtures

  it('verifies benchmark-simulation-governance-mismatch.md content and metadata mapping', () => {
    const content = getFixtureContent('benchmark-simulation-governance-mismatch.md');
    expect(content).toContain('simulation');
    expect(content).toContain('PSG');
    expect(content).toContain('commit-hash');
    
    expect(DETECTOR_METADATA['L34-08']).toBeDefined(); // post-simulation validation absence
    expect(DETECTOR_METADATA['L29-15']).toBeDefined(); // governance bypass path
    expect(DETECTOR_METADATA['L35-04']).toBeDefined(); // commit binding gap
  });

  it('verifies benchmark-control-plane-override-abuse.md content and metadata mapping', () => {
    const content = getFixtureContent('benchmark-control-plane-override-abuse.md');
    expect(content).toContain('override');
    expect(content).toContain('control plane');
    expect(content).toContain('audit trail');
    
    expect(DETECTOR_METADATA['L44-03']).toBeDefined(); // override condition gap
    expect(DETECTOR_METADATA['L44-07']).toBeDefined(); // audit trail requirement gap
    expect(DETECTOR_METADATA['L44-04']).toBeDefined(); // execution owner boundary gap
  });

  it('verifies benchmark-world-state-atomicity.md content and metadata mapping', () => {
    const content = getFixtureContent('benchmark-world-state-atomicity.md');
    expect(content).toContain('atomicity');
    expect(content).toContain('mutation');
    expect(content).toContain('snapshot');
    
    expect(DETECTOR_METADATA['L45-04']).toBeDefined(); // read write atomicity failure
    expect(DETECTOR_METADATA['L45-02']).toBeDefined(); // mutation gateway bypass
    expect(DETECTOR_METADATA['L45-13']).toBeDefined(); // snapshot isolation atomicity gap
  });

  it('verifies benchmark-export-non-determinism.md content and metadata mapping', () => {
    const content = getFixtureContent('benchmark-export-non-determinism.md');
    expect(content).toContain('export path');
    expect(content).toContain('determinism');
    expect(content).toContain('remote deployment');
    
    expect(DETECTOR_METADATA['L38-05']).toBeDefined(); // export path non-determinism
    expect(DETECTOR_METADATA['L38-14']).toBeDefined(); // remote deployment prohibition rigor gap
    expect(DETECTOR_METADATA['L38-15']).toBeDefined(); // export path determinism detail gap
  });

  it('verifies benchmark-evidence-free-escalation.md content and metadata mapping', () => {
    const content = getFixtureContent('benchmark-evidence-free-escalation.md');
    expect(content).toContain('evidence');
    expect(content).toContain('escalation');
    expect(content).toContain('uncertainty');
    
    expect(DETECTOR_METADATA['L41-16']).toBeDefined(); // evidence-free escalation
    expect(DETECTOR_METADATA['L41-13']).toBeDefined(); // evidence binding rigor gap
    expect(DETECTOR_METADATA['L41-14']).toBeDefined(); // uncertainty propagation failure case
  });

  it('verifies benchmark-uncertainty-dropped.md content and metadata mapping', () => {
    const content = getFixtureContent('benchmark-uncertainty-dropped.md');
    expect(content).toContain('uncertainty');
    expect(content).toContain('propagation');
    expect(content).toContain('reasoning');
    
    expect(DETECTOR_METADATA['L41-02']).toBeDefined(); // uncertainty propagation failure
    expect(DETECTOR_METADATA['L41-08']).toBeDefined(); // uncertainty propagation gap
    expect(DETECTOR_METADATA['L41-04']).toBeDefined(); // multi-step reasoning validation failure
  });

  it('verifies benchmark-ui-fatal-state.md content and metadata mapping', () => {
    const content = getFixtureContent('benchmark-ui-fatal-state.md');
    expect(content).toContain('fatal state');
    expect(content).toContain('recovery');
    expect(content).toContain('UI');
    
    expect(DETECTOR_METADATA['L42-14']).toBeDefined(); // UI fatal-state exposure detail
    expect(DETECTOR_METADATA['L42-13']).toBeDefined(); // mandatory UI component contract enforcement gap
    expect(DETECTOR_METADATA['L42-03']).toBeDefined(); // UI-to-system-state mapping gap
  });

  it('verifies benchmark-tool-side-effect-leakage.md content and metadata mapping', () => {
    const content = getFixtureContent('benchmark-tool-side-effect-leakage.md');
    expect(content).toContain('side-effect');
    expect(content).toContain('sandbox');
    expect(content).toContain('leakage');
    
    expect(DETECTOR_METADATA['L37-15']).toBeDefined(); // direct tool side-effect leakage
    expect(DETECTOR_METADATA['L37-14']).toBeDefined(); // sandbox isolation boundary gap
    expect(DETECTOR_METADATA['L37-08']).toBeDefined(); // side effect validation absence
  });

  // Deterministic normalization tests through real validation path

  it('normalizes simulated issues through detector metadata path', () => {
    const diagnostics = createInitialDiagnostics();
    
    // Simulate an issue from simulation-governance-mismatch fixture
    const simulatedIssue = {
      severity: 'critical',
      description: '[L34-08] Post-simulation validation absent',
      category: 'simulation_verification',
      files: ['benchmark-simulation-governance-mismatch.md']
    };
    
    const normalized = normalizeIssueFromDetector(simulatedIssue, diagnostics);
    expect(normalized.detector_id).toBe('L34-08');
    expect(normalized.layer).toBe('simulation_verification');
    expect(normalized.subcategory).toBe('post-simulation governance');
    expect(diagnostics.normalized_from_detector_count).toBeGreaterThan(0);
  });

  it('normalizes control-plane issues through detector metadata path', () => {
    const diagnostics = createInitialDiagnostics();
    
    const simulatedIssue = {
      severity: 'high',
      description: '[L44-03] Override condition gap',
      category: 'control_plane_authority',
      files: ['benchmark-control-plane-override-abuse.md']
    };
    
    const normalized = normalizeIssueFromDetector(simulatedIssue, diagnostics);
    expect(normalized.detector_id).toBe('L44-03');
    expect(normalized.layer).toBe('control_plane_authority');
    expect(normalized.subcategory).toBe('override conditions');
  });

  it('normalizes world-state atomicity issues through detector metadata path', () => {
    const diagnostics = createInitialDiagnostics();
    
    const simulatedIssue = {
      severity: 'critical',
      description: '[L45-13] Snapshot isolation atomicity gap',
      category: 'world_state_governance',
      files: ['benchmark-world-state-atomicity.md']
    };
    
    const normalized = normalizeIssueFromDetector(simulatedIssue, diagnostics);
    expect(normalized.detector_id).toBe('L45-13');
    expect(normalized.layer).toBe('world_state_governance');
    expect(normalized.subcategory).toBe('snapshot isolation atomicity');
  });

  it('normalizes tool side-effect leakage issues through detector metadata path', () => {
    const diagnostics = createInitialDiagnostics();
    
    const simulatedIssue = {
      severity: 'critical',
      description: '[L37-15] Direct tool side-effect leakage',
      category: 'tool_execution_safety',
      files: ['benchmark-tool-side-effect-leakage.md']
    };
    
    const normalized = normalizeIssueFromDetector(simulatedIssue, diagnostics);
    expect(normalized.detector_id).toBe('L37-15');
    expect(normalized.layer).toBe('tool_execution_safety');
    expect(normalized.subcategory).toBe('direct tool side-effect leakage');
  });

  it('normalizes evidence-free escalation issues through detector metadata path', () => {
    const diagnostics = createInitialDiagnostics();
    
    const simulatedIssue = {
      severity: 'high',
      description: '[L41-16] Evidence-free escalation without supporting evidence',
      category: 'reasoning_integrity',
      files: ['benchmark-evidence-free-escalation.md']
    };
    
    const normalized = normalizeIssueFromDetector(simulatedIssue, diagnostics);
    expect(normalized.detector_id).toBe('L41-16');
    expect(normalized.layer).toBe('reasoning_integrity');
    expect(normalized.subcategory).toBe('evidence-free escalation');
  });

  it('normalizes export non-determinism issues through detector metadata path', () => {
    const diagnostics = createInitialDiagnostics();
    
    const simulatedIssue = {
      severity: 'high',
      description: '[L43-06] Deterministic replay impossible due to export path variance',
      category: 'deterministic_execution',
      files: ['benchmark-export-non-determinism.md']
    };
    
    const normalized = normalizeIssueFromDetector(simulatedIssue, diagnostics);
    expect(normalized.detector_id).toBe('L43-06');
    expect(normalized.layer).toBe('deterministic_execution');
    expect(normalized.subcategory).toBe('deterministic replay capability');
  });

  it('normalizes simulation governance mismatch issues through detector metadata path', () => {
    const diagnostics = createInitialDiagnostics();
    
    const simulatedIssue = {
      severity: 'critical',
      description: '[L34-08] Post-simulation validation absent',
      category: 'simulation_verification',
      files: ['benchmark-simulation-governance-mismatch.md']
    };
    
    const normalized = normalizeIssueFromDetector(simulatedIssue, diagnostics);
    expect(normalized.detector_id).toBe('L34-08');
    expect(normalized.layer).toBe('simulation_verification');
    expect(normalized.subcategory).toBe('post-simulation governance');
  });

  it('normalizes uncertainty dropped issues through detector metadata path', () => {
    const diagnostics = createInitialDiagnostics();
    
    const simulatedIssue = {
      severity: 'high',
      description: '[L41-02] Uncertainty propagation failure in reasoning chain',
      category: 'reasoning_integrity',
      files: ['benchmark-uncertainty-dropped.md']
    };
    
    const normalized = normalizeIssueFromDetector(simulatedIssue, diagnostics);
    expect(normalized.detector_id).toBe('L41-02');
    expect(normalized.layer).toBe('reasoning_integrity');
    expect(normalized.subcategory).toBe('uncertainty propagation');
  });
});

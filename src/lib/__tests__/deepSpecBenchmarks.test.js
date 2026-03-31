import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

import { DETECTOR_METADATA } from '../detectorMetadata';

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
});

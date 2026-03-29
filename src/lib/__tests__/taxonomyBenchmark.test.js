import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

// Note: This is a placeholder test simulating an AI analysis that validates taxonomy expectations.
// In a real e2e benchmark, we would mock the LLM response or parse pre-computed benchmark results.
// Here we are verifying that our taxonomy holds the right detectors for the issues in these fixtures.

import { DETECTOR_METADATA, getAvailableDetectors } from '../detectorMetadata';

describe('Taxonomy Benchmark Verification', () => {

  const readFixture = (name) => {
    return fs.readFileSync(path.join(__dirname, 'fixtures', name), 'utf8');
  };

  it('benchmark-contradiction.md expects contradiction layers', () => {
    const md = readFixture('benchmark-contradiction.md');
    expect(md).toContain('Node.js version 18 exactly');
    expect(md).toContain('Node.js version 20');
    
    // We expect L1-01 "direct contradictions" and L21-02 "conflicting config"
    const l1_01 = DETECTOR_METADATA['L1-01'];
    expect(l1_01).toBeDefined();
    expect(l1_01.layer).toBe('contradiction');
    expect(l1_01.subcategory).toBe('direct conflicts');

    const l1_02 = DETECTOR_METADATA['L1-02'];
    expect(l1_02.subcategory).toBe('configuration precedence conflicts');
    expect(l1_02.related_layers).toContain('L21');
  });

  it('benchmark-missing-steps.md expects functional and structural layers', () => {
    const md = readFixture('benchmark-missing-steps.md');
    expect(md).toContain('requires a running Redis instance');
    
    // We expect L6-08 "missing preconditions" and L3-04 "improper ordering" or L6-03
    const l6_08 = DETECTOR_METADATA['L6-08'];
    expect(l6_08).toBeDefined();
    expect(l6_08.layer).toBe('functional');
    expect(l6_08.subcategory).toBe('structural missing-prerequisite cases');
    expect(l6_08.severity_ceiling).toBe('critical');

    const l3_04 = DETECTOR_METADATA['L3-04'];
    expect(l3_04.subcategory).toBe('missing prerequisites');
    expect(l3_04.severity_ceiling).toBe('critical');
    expect(l3_04.related_layers).toContain('L6');
  });

  it('benchmark-ambiguity.md expects semantic and quantitative layers', () => {
    const md = readFixture('benchmark-ambiguity.md');
    expect(md).toContain('a lot of concurrent users');
    
    // We expect L4-01 "ambiguous wording" and L14-04 "unsupported statistics"
    const l4_01 = DETECTOR_METADATA['L4-01'];
    expect(l4_01).toBeDefined();
    expect(l4_01.subcategory).toBe('semantic ambiguity');
    expect(l4_01.related_layers).toContain('L1');

    const l4Detectors = getAvailableDetectors('semantic');
    expect(l4Detectors.length).toBeGreaterThan(0);
  });
});

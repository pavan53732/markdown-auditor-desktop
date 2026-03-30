import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

import { repairJSON, validateResults } from '../jsonRepair';
import { normalizeIssueFromDetector, createInitialDiagnostics } from '../detectorMetadata';

/**
 * Deterministic Pipeline Benchmark
 * 
 * This suite validates the actual execution path of the application (repair -> validation -> normalization)
 * using mocked JSON responses representing canonical edge cases. It is NOT a live LLM test, but it
 * guarantees that if the AI flags an issue, the app correctly processes, clamps severities, 
 * and backfills taxonomy metadata according to the 40-layer core.
 */
describe('Taxonomy Pipeline Benchmark (Deterministic)', () => {

  const readFixture = (name) => {
    return fs.readFileSync(path.join(__dirname, 'fixtures', name), 'utf8');
  };

  it('processes a canonical contradiction and normalizes severity', () => {
    // Represents an AI response for benchmark-contradiction.md
    const mockedResponse = `
    \`\`\`json
    {
      "summary": { "critical": 0, "high": 1, "medium": 0, "low": 0, "total": 1 },
      "issues": [
        {
          "detector_id": "L1-02",
          "description": "Conflict between node 18 and node 20 requirements.",
          "severity": "critical",
          "files": ["benchmark-contradiction.md"]
        }
      ]
    }
    \`\`\`
    `;

    // 1. Repair
    const parsed = repairJSON(mockedResponse);
    expect(parsed.issues.length).toBe(1);

    // 2. Validate
    expect(() => validateResults(parsed)).not.toThrow();

    // 3. Normalize
    const diagnostics = createInitialDiagnostics();
    const normalizedIssue = normalizeIssueFromDetector(parsed.issues[0], diagnostics);

    // L1-02 ceiling is 'high', so 'critical' should be clamped down to 'high'.
    expect(normalizedIssue.severity).toBe('high');
    expect(normalizedIssue.layer).toBe('contradiction');
    expect(normalizedIssue.subcategory).toBe('configuration precedence conflicts');
    expect(diagnostics.severity_clamped_count).toBe(1);
    expect(diagnostics.normalized_from_detector_count).toBeGreaterThan(0);
  });

  it('processes deep AstraBuild-style system spec issues correctly', () => {
    // Represents an AI response for benchmark-astrabuild-strict.md
    const mockedResponse = `
    {
      "summary": { "critical": 3, "high": 1, "medium": 0, "low": 0, "total": 4 },
      "issues": [
        {
          "detector_id": "L38-01",
          "description": "Requires cloud deployment for local system.",
          "severity": "medium",
          "files": ["benchmark-astrabuild-strict.md"]
        },
        {
          "detector_id": "L37-04",
          "description": "Agent directly writes to the local database instead of using PSG gateway.",
          "severity": "critical"
        },
        {
          "detector_id": "L35-01",
          "description": "Reads current epoch and updates previous without locking.",
          "severity": "critical"
        },
        {
          "detector_id": "L34-01",
          "description": "No pre-simulation step required.",
          "severity": "medium"
        }
      ]
    }
    `;

    const parsed = repairJSON(mockedResponse);
    expect(() => validateResults(parsed)).not.toThrow();

    const diagnostics = createInitialDiagnostics();
    const normalized = parsed.issues.map(i => normalizeIssueFromDetector(i, diagnostics));

    // L38-01 floor is critical, input was medium -> clamps UP to critical
    expect(normalized[0].severity).toBe('critical');
    expect(normalized[0].layer).toBe('deployment_contract');

    // L37-04 floor is critical, input was critical -> stays critical
    expect(normalized[1].severity).toBe('critical');
    expect(normalized[1].layer).toBe('tool_execution_safety');

    // L35-01 floor is high, input was critical -> stays critical (no ceiling defined so it allows higher)
    expect(normalized[2].severity).toBe('critical');
    expect(normalized[2].layer).toBe('memory_world_model');

    // L34-01 floor is high, input was medium -> clamps UP to high
    expect(normalized[3].severity).toBe('high');
    expect(normalized[3].layer).toBe('simulation_verification');

    // Diagnostics should catch the clamp ups
    expect(diagnostics.severity_clamped_count).toBe(2);
  });

  it('handles unknown but well-formed detectors gracefully when category is provided', () => {
    const mockedResponse = `
    {
      "summary": { "total": 1 },
      "issues": [
        {
          "detector_id": "L99-99",
          "category": "state_machine",
          "description": "Future detector.",
          "severity": "low"
        }
      ]
    }
    `;
    const parsed = repairJSON(mockedResponse);
    // Should not throw because category is provided for unknown L99-99
    expect(() => validateResults(parsed)).not.toThrow();
  });
});
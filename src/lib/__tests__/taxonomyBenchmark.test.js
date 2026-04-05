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
 * and backfills taxonomy metadata according to the 45-layer core.
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


  it('processes deep-spec reasoning, control-plane, and world-state issues correctly', () => {
    // Represents an AI response for benchmark-deep-spec.md
    const mockedResponse = `
    {
      "summary": { "critical": 4, "high": 2, "medium": 0, "low": 0, "total": 6 },
      "issues": [
        {
          "detector_id": "L44-01",
          "description": "ActionButton directly modifies ExecutionPolicy in the control plane.",
          "severity": "critical"
        },
        {
          "detector_id": "L45-02",
          "description": "Mutation gateway bypassed for shadow state writes.",
          "severity": "critical"
        },
        {
          "detector_id": "L41-03",
          "description": "Reasoning trace refers to private chat log (unenforceable).",
          "severity": "medium"
        },
        {
          "detector_id": "L41-05",
          "description": "Infinite retries allowed for ActionY.",
          "severity": "high"
        },
        {
          "detector_id": "L4-09",
          "description": "Terminology registry gap.",
          "severity": "low"
        },
        {
          "detector_id": "L33-05",
          "description": "Vague input types for ActionY.",
          "severity": "medium"
        }
      ]
    }
    `;

    const parsed = repairJSON(mockedResponse);
    expect(() => validateResults(parsed)).not.toThrow();

    const diagnostics = createInitialDiagnostics();
    const normalized = parsed.issues.map(i => normalizeIssueFromDetector(i, diagnostics));

    // L44-01 floor is critical
    expect(normalized[0].severity).toBe('critical');
    expect(normalized[0].layer).toBe('control_plane_authority');

    // L45-02 floor is critical
    expect(normalized[1].severity).toBe('critical');
    expect(normalized[1].layer).toBe('world_state_governance');

    // L41-03 floor is high
    expect(normalized[2].severity).toBe('high');
    expect(normalized[2].layer).toBe('reasoning_integrity');

    // L41-05 floor is high
    expect(normalized[3].severity).toBe('high');
    expect(normalized[3].subcategory).toBe('global contradiction detection');

    // L4-09 floor is low
    expect(normalized[4].severity).toBe('low');
    expect(normalized[4].layer).toBe('semantic');

    // L33-05 floor is medium
    expect(normalized[5].severity).toBe('medium');
    expect(normalized[5].layer).toBe('specification_formalism');
  });

  it('rejects unknown detector IDs during result validation', () => {
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
    expect(() => validateResults(parsed)).toThrow('unknown detector_id');
  });

  it('processes governance and tool safety issues correctly', () => {
    const mockedResponse = `
    {
      "summary": { "critical": 2, "high": 2, "medium": 0, "low": 0, "total": 4 },
      "issues": [
        {
          "detector_id": "L29-08",
          "description": "Override conditions undefined for admin actions.",
          "severity": "high"
        },
        {
          "detector_id": "L37-04",
          "description": "Deploy tool writes directly to production DB without gateway.",
          "severity": "critical"
        },
        {
          "detector_id": "L37-05",
          "description": "Deploy tool has broader permissions than its contract.",
          "severity": "critical"
        },
        {
          "detector_id": "L30-09",
          "description": "Deployment changes cannot be reversed.",
          "severity": "high"
        }
      ]
    }
    `;

    const parsed = repairJSON(mockedResponse);
    expect(() => validateResults(parsed)).not.toThrow();

    const diagnostics = createInitialDiagnostics();
    const normalized = parsed.issues.map(i => normalizeIssueFromDetector(i, diagnostics));

    expect(normalized[0].severity).toBe('high');
    expect(normalized[0].layer).toBe('governance');
    expect(normalized[0].subcategory).toBe('override ambiguity');

    expect(normalized[1].severity).toBe('critical');
    expect(normalized[1].layer).toBe('tool_execution_safety');

    expect(normalized[2].severity).toBe('critical');
    expect(normalized[2].layer).toBe('tool_execution_safety');
    expect(normalized[2].subcategory).toBe('execution authority violations');

    expect(normalized[3].severity).toBe('high');
    expect(normalized[3].layer).toBe('resilience');
  });

  it('processes UI surface contract and state machine issues correctly', () => {
    const mockedResponse = `
    {
      "summary": { "critical": 1, "high": 2, "medium": 1, "low": 0, "total": 4 },
      "issues": [
        {
          "detector_id": "L42-04",
          "description": "Fatal error state displayed raw to user without recovery path.",
          "severity": "critical"
        },
        {
          "detector_id": "L42-01",
          "description": "Required confirmation dialog missing from destructive action.",
          "severity": "high"
        },
        {
          "detector_id": "L16-09",
          "description": "System reaches unrecoverable state from normal operation.",
          "severity": "high"
        },
        {
          "detector_id": "L42-06",
          "description": "Color-only status indicators without text alternatives.",
          "severity": "medium"
        }
      ]
    }
    `;

    const parsed = repairJSON(mockedResponse);
    expect(() => validateResults(parsed)).not.toThrow();

    const diagnostics = createInitialDiagnostics();
    const normalized = parsed.issues.map(i => normalizeIssueFromDetector(i, diagnostics));

    expect(normalized[0].severity).toBe('critical');
    expect(normalized[0].layer).toBe('ui_surface_contract');

    expect(normalized[1].severity).toBe('high');
    expect(normalized[1].layer).toBe('ui_surface_contract');

    expect(normalized[2].severity).toBe('critical');
    expect(normalized[2].layer).toBe('state_machine');
    expect(normalized[2].subcategory).toBe('fatal-state exposure');

    expect(normalized[3].severity).toBe('high');
    expect(normalized[3].layer).toBe('ui_surface_contract');
  });

  it('processes deterministic execution and control plane issues correctly', () => {
    const mockedResponse = `
    {
      "summary": { "critical": 2, "high": 2, "medium": 0, "low": 0, "total": 4 },
      "issues": [
        {
          "detector_id": "L43-01",
          "description": "State transition outcome varies between identical runs.",
          "severity": "critical"
        },
        {
          "detector_id": "L43-03",
          "description": "Two operations wait on each other indefinitely.",
          "severity": "critical"
        },
        {
          "detector_id": "L44-06",
          "description": "Control and data plane logic interleaved without isolation.",
          "severity": "high"
        },
        {
          "detector_id": "L44-08",
          "description": "Control plane changes not logged with actor and timestamp.",
          "severity": "high"
        }
      ]
    }
    `;

    const parsed = repairJSON(mockedResponse);
    expect(() => validateResults(parsed)).not.toThrow();

    const diagnostics = createInitialDiagnostics();
    const normalized = parsed.issues.map(i => normalizeIssueFromDetector(i, diagnostics));

    expect(normalized[0].severity).toBe('critical');
    expect(normalized[0].layer).toBe('deterministic_execution');

    expect(normalized[1].severity).toBe('critical');
    expect(normalized[1].layer).toBe('deterministic_execution');

    expect(normalized[2].severity).toBe('high');
    expect(normalized[2].layer).toBe('control_plane_authority');

    expect(normalized[3].severity).toBe('high');
    expect(normalized[3].layer).toBe('control_plane_authority');
  });

  it('processes world state governance and reasoning integrity issues correctly', () => {
    // Represents an AI response for benchmark-world-state.md
    const mockedResponse = `
    {
      "summary": { "critical": 2, "high": 2, "medium": 0, "low": 0, "total": 4 },
      "issues": [
        {
          "detector_id": "L45-02",
          "description": "State modified without going through the mutation gateway.",
          "severity": "critical"
        },
        {
          "detector_id": "L45-08",
          "description": "One subsystem reads another subsystem private state.",
          "severity": "critical"
        },
        {
          "detector_id": "L41-01",
          "description": "Reasoning conclusion not linked to supporting evidence.",
          "severity": "high"
        },
        {
          "detector_id": "L41-06",
          "description": "Self-correction retries have no max iteration limit.",
          "severity": "high"
        }
      ]
    }
    `;

    const parsed = repairJSON(mockedResponse);
    expect(() => validateResults(parsed)).not.toThrow();

    const diagnostics = createInitialDiagnostics();
    const normalized = parsed.issues.map(i => normalizeIssueFromDetector(i, diagnostics));

    expect(normalized[0].severity).toBe('critical');
    expect(normalized[0].layer).toBe('world_state_governance');

    expect(normalized[1].severity).toBe('critical');
    expect(normalized[1].layer).toBe('world_state_governance');

    expect(normalized[2].severity).toBe('high');
    expect(normalized[2].layer).toBe('reasoning_integrity');

    expect(normalized[3].severity).toBe('high');
    expect(normalized[3].layer).toBe('reasoning_integrity');

  });

  it('processes deployment contradiction and platform leakage correctly', () => {
    const mockedResponse = `
    {
      "summary": { "critical": 2, "high": 2, "medium": 0, "low": 0, "total": 4 },
      "issues": [
        {
          "detector_id": "L38-01",
          "description": "System requires cloud deployment but spec says local-only.",
          "severity": "critical"
        },
        {
          "detector_id": "L38-04",
          "description": "Export path determined at runtime, non-deterministic.",
          "severity": "high"
        },
        {
          "detector_id": "L39-05",
          "description": "iOS builds generated as side effect of Android pipeline.",
          "severity": "high"
        },
        {
          "detector_id": "L17-10",
          "description": "API change breaks backward compatibility without migration.",
          "severity": "critical"
        }
      ]
    }
    `;

    const parsed = repairJSON(mockedResponse);
    expect(() => validateResults(parsed)).not.toThrow();

    const diagnostics = createInitialDiagnostics();
    const normalized = parsed.issues.map(i => normalizeIssueFromDetector(i, diagnostics));

    expect(normalized[0].severity).toBe('critical');
    expect(normalized[0].layer).toBe('deployment_contract');
    expect(normalized[0].subcategory).toBe('remote deployment prohibition');

    expect(normalized[1].severity).toBe('high');
    expect(normalized[1].layer).toBe('deployment_contract');

    expect(normalized[2].severity).toBe('high');
    expect(normalized[2].layer).toBe('platform_abstraction');

    expect(normalized[3].severity).toBe('critical');
    expect(normalized[3].layer).toBe('api_contract');
  });

  it('processes reasoning integrity gaps and PSG bypass correctly', () => {
    const mockedResponse = `
    {
      "summary": { "critical": 2, "high": 2, "medium": 1, "low": 0, "total": 5 },
      "issues": [
        {
          "detector_id": "L41-09",
          "description": "Decision reached without intermediate reasoning steps.",
          "severity": "high"
        },
        {
          "detector_id": "L41-05",
          "description": "Agent retries indefinitely without bounded self-correction.",
          "severity": "high"
        },
        {
          "detector_id": "L45-02",
          "description": "Agent bypasses PSG gateway for direct state writes.",
          "severity": "critical"
        },
        {
          "detector_id": "L45-03",
          "description": "State change not bound to commit hash.",
          "severity": "medium"
        },
        {
          "detector_id": "L34-10",
          "description": "High-risk action executes without simulation gate.",
          "severity": "critical"
        }
      ]
    }
    `;

    const parsed = repairJSON(mockedResponse);
    expect(() => validateResults(parsed)).not.toThrow();

    const diagnostics = createInitialDiagnostics();
    const normalized = parsed.issues.map(i => normalizeIssueFromDetector(i, diagnostics));

    expect(normalized[0].severity).toBe('high');
    expect(normalized[0].layer).toBe('reasoning_integrity');
    expect(normalized[0].subcategory).toBe('reasoning trace completeness');

    expect(normalized[1].severity).toBe('high');
    expect(normalized[1].layer).toBe('reasoning_integrity');

    expect(normalized[2].severity).toBe('critical');
    expect(normalized[2].layer).toBe('world_state_governance');

    expect(normalized[3].severity).toBe('high');
    expect(normalized[3].layer).toBe('world_state_governance');

    expect(normalized[4].severity).toBe('critical');
    expect(normalized[4].layer).toBe('simulation_verification');
    expect(normalized[4].subcategory).toBe('pre-simulation governance');
  });

  it('processes newly added empty-coverage detectors correctly', () => {
    const mockedResponse = `
    {
      "summary": { "critical": 1, "high": 3, "medium": 1, "low": 0, "total": 5 },
      "issues": [
        {
          "detector_id": "L8-10",
          "description": "Control-plane logic mixed with data-plane processing.",
          "severity": "critical"
        },
        {
          "detector_id": "L16-11",
          "description": "Two concurrent transitions can produce undefined combined state.",
          "severity": "critical"
        },
        {
          "detector_id": "L23-09",
          "description": "Crypto keys used without rotation or expiration policy.",
          "severity": "high"
        },
        {
          "detector_id": "L19-09",
          "description": "PII flows through system without documented handling.",
          "severity": "critical"
        },
        {
          "detector_id": "L12-09",
          "description": "Trust model assumed but threat model not stated.",
          "severity": "high"
        }
      ]
    }
    `;

    const parsed = repairJSON(mockedResponse);
    expect(() => validateResults(parsed)).not.toThrow();

    const diagnostics = createInitialDiagnostics();
    const normalized = parsed.issues.map(i => normalizeIssueFromDetector(i, diagnostics));

    // L8-10 floor is critical
    expect(normalized[0].severity).toBe('critical');
    expect(normalized[0].layer).toBe('architectural');
    expect(normalized[0].subcategory).toBe('control-plane/data-plane separation');

    // L16-11 floor is critical
    expect(normalized[1].severity).toBe('critical');
    expect(normalized[1].layer).toBe('state_machine');

    // L23-09 floor is high
    expect(normalized[2].severity).toBe('high');
    expect(normalized[2].layer).toBe('security');

    // L19-09 floor is critical
    expect(normalized[3].severity).toBe('critical');
    expect(normalized[3].layer).toBe('data_flow');

    // L12-09 floor is high
    expect(normalized[4].severity).toBe('high');
    expect(normalized[4].layer).toBe('adversarial');
  });

  it('processes simulation governance mismatch correctly', () => {
    const mockedResponse = `
    {
      "summary": { "critical": 2, "high": 2, "medium": 0, "low": 0, "total": 4 },
      "issues": [
        {
          "detector_id": "L34-08",
          "description": "Post-simulation validation absent after sandbox execution.",
          "severity": "high"
        },
        {
          "detector_id": "L29-15",
          "description": "Governance bypass path through direct write outside simulation.",
          "severity": "critical"
        },
        {
          "detector_id": "L35-04",
          "description": "No commit-hash binding recorded for simulation results.",
          "severity": "medium"
        },
        {
          "detector_id": "L34-02",
          "description": "Simulation mutated production state instead of read-only sandbox.",
          "severity": "critical"
        }
      ]
    }
    `;

    const parsed = repairJSON(mockedResponse);
    expect(() => validateResults(parsed)).not.toThrow();

    const diagnostics = createInitialDiagnostics();
    const normalized = parsed.issues.map(i => normalizeIssueFromDetector(i, diagnostics));

    expect(normalized[0].severity).toBe('high');
    expect(normalized[0].layer).toBe('simulation_verification');
    expect(normalized[0].subcategory).toBe('post-simulation governance');

    expect(normalized[1].severity).toBe('critical');
    expect(normalized[1].layer).toBe('governance');

    expect(normalized[2].severity).toBe('medium');
    expect(normalized[2].layer).toBe('memory_world_model');

    expect(normalized[3].severity).toBe('critical');
    expect(normalized[3].layer).toBe('simulation_verification');
  });

  it('processes control-plane override abuse correctly', () => {
    const mockedResponse = `
    {
      "summary": { "critical": 2, "high": 2, "medium": 0, "low": 0, "total": 4 },
      "issues": [
        {
          "detector_id": "L44-03",
          "description": "Override conditions not specified for control-plane decisions.",
          "severity": "high"
        },
        {
          "detector_id": "L44-07",
          "description": "No audit trail recorded for control-plane override actions.",
          "severity": "critical"
        },
        {
          "detector_id": "L44-04",
          "description": "Execution owner boundary ambiguous allowing unauthorized writes.",
          "severity": "high"
        },
        {
          "detector_id": "L44-01",
          "description": "Control-plane separation breached in unified interface.",
          "severity": "critical"
        }
      ]
    }
    `;

    const parsed = repairJSON(mockedResponse);
    expect(() => validateResults(parsed)).not.toThrow();

    const diagnostics = createInitialDiagnostics();
    const normalized = parsed.issues.map(i => normalizeIssueFromDetector(i, diagnostics));

    expect(normalized[0].severity).toBe('high');
    expect(normalized[0].layer).toBe('control_plane_authority');
    expect(normalized[0].subcategory).toBe('override conditions');

    expect(normalized[1].severity).toBe('critical');
    expect(normalized[1].layer).toBe('control_plane_authority');

    expect(normalized[2].severity).toBe('high');
    expect(normalized[2].layer).toBe('control_plane_authority');

    expect(normalized[3].severity).toBe('critical');
    expect(normalized[3].layer).toBe('control_plane_authority');
  });

  it('processes world-state mutation without atomicity correctly', () => {
    const mockedResponse = `
    {
      "summary": { "critical": 3, "high": 1, "medium": 0, "low": 0, "total": 4 },
      "issues": [
        {
          "detector_id": "L45-04",
          "description": "Read/write atomicity failure on independent state fields.",
          "severity": "high"
        },
        {
          "detector_id": "L45-02",
          "description": "Mutation gateway bypassed during system recovery path.",
          "severity": "critical"
        },
        {
          "detector_id": "L45-13",
          "description": "Snapshot isolation not atomic with mutation creating dirty read window.",
          "severity": "critical"
        },
        {
          "detector_id": "L45-01",
          "description": "State mutation invariant breached during transitional states.",
          "severity": "critical"
        }
      ]
    }
    `;

    const parsed = repairJSON(mockedResponse);
    expect(() => validateResults(parsed)).not.toThrow();

    const diagnostics = createInitialDiagnostics();
    const normalized = parsed.issues.map(i => normalizeIssueFromDetector(i, diagnostics));

    expect(normalized[0].severity).toBe('high');
    expect(normalized[0].layer).toBe('world_state_governance');
    expect(normalized[0].subcategory).toBe('read/write atomicity');

    expect(normalized[1].severity).toBe('critical');
    expect(normalized[1].layer).toBe('world_state_governance');

    expect(normalized[2].severity).toBe('critical');
    expect(normalized[2].layer).toBe('world_state_governance');

    expect(normalized[3].severity).toBe('critical');
    expect(normalized[3].layer).toBe('world_state_governance');
  });

  it('processes export path non-determinism correctly', () => {
    const mockedResponse = `
    {
      "summary": { "critical": 1, "high": 3, "medium": 0, "low": 0, "total": 4 },
      "issues": [
        {
          "detector_id": "L38-05",
          "description": "Export path varies by environment with timestamp suffix.",
          "severity": "medium"
        },
        {
          "detector_id": "L38-14",
          "description": "Remote deployment prohibition not rigorously enforced.",
          "severity": "critical"
        },
        {
          "detector_id": "L38-15",
          "description": "Export path determinism detail gap in build environment.",
          "severity": "high"
        },
        {
          "detector_id": "L43-06",
          "description": "Deterministic replay impossible due to export path variance.",
          "severity": "high"
        }
      ]
    }
    `;

    const parsed = repairJSON(mockedResponse);
    expect(() => validateResults(parsed)).not.toThrow();

    const diagnostics = createInitialDiagnostics();
    const normalized = parsed.issues.map(i => normalizeIssueFromDetector(i, diagnostics));

    expect(normalized[0].severity).toBe('medium');
    expect(normalized[0].layer).toBe('deployment_contract');
    expect(normalized[0].subcategory).toBe('export path determinism');

    expect(normalized[1].severity).toBe('critical');
    expect(normalized[1].layer).toBe('deployment_contract');

    expect(normalized[2].severity).toBe('high');
    expect(normalized[2].layer).toBe('deployment_contract');

    expect(normalized[3].severity).toBe('high');
    expect(normalized[3].layer).toBe('deterministic_execution');
  });

  it('processes evidence-free escalation correctly', () => {
    const mockedResponse = `
    {
      "summary": { "critical": 1, "high": 3, "medium": 0, "low": 0, "total": 4 },
      "issues": [
        {
          "detector_id": "L41-16",
          "description": "Escalation to critical severity without supporting evidence.",
          "severity": "high"
        },
        {
          "detector_id": "L41-13",
          "description": "Evidence binding rigor gap in reasoning chain.",
          "severity": "high"
        },
        {
          "detector_id": "L41-14",
          "description": "Uncertainty propagation failure case in high-confidence chain.",
          "severity": "high"
        },
        {
          "detector_id": "L41-15",
          "description": "Bounded self-correction loop rule gap allows infinite retries.",
          "severity": "medium"
        }
      ]
    }
    `;

    const parsed = repairJSON(mockedResponse);
    expect(() => validateResults(parsed)).not.toThrow();

    const diagnostics = createInitialDiagnostics();
    const normalized = parsed.issues.map(i => normalizeIssueFromDetector(i, diagnostics));

    expect(normalized[0].severity).toBe('high');
    expect(normalized[0].layer).toBe('reasoning_integrity');
    expect(normalized[0].subcategory).toBe('evidence-free escalation');

    expect(normalized[1].severity).toBe('high');
    expect(normalized[1].layer).toBe('reasoning_integrity');

    expect(normalized[2].severity).toBe('high');
    expect(normalized[2].layer).toBe('reasoning_integrity');

    expect(normalized[3].severity).toBe('medium');
    expect(normalized[3].layer).toBe('reasoning_integrity');
  });

  it('processes uncertainty dropped in final reasoning correctly', () => {
    const mockedResponse = `
    {
      "summary": { "critical": 0, "high": 4, "medium": 0, "low": 0, "total": 4 },
      "issues": [
        {
          "detector_id": "L41-02",
          "description": "Uncertainty propagation failure creates false certainty.",
          "severity": "high"
        },
        {
          "detector_id": "L41-08",
          "description": "Ignored uncertainty in high-confidence reasoning chain.",
          "severity": "high"
        },
        {
          "detector_id": "L41-04",
          "description": "Multi-step reasoning validation failure in chain summaries.",
          "severity": "high"
        },
        {
          "detector_id": "L41-01",
          "description": "Evidence binding gap allows unsupported inference.",
          "severity": "high"
        }
      ]
    }
    `;

    const parsed = repairJSON(mockedResponse);
    expect(() => validateResults(parsed)).not.toThrow();

    const diagnostics = createInitialDiagnostics();
    const normalized = parsed.issues.map(i => normalizeIssueFromDetector(i, diagnostics));

    expect(normalized[0].severity).toBe('high');
    expect(normalized[0].layer).toBe('reasoning_integrity');
    expect(normalized[0].subcategory).toBe('uncertainty propagation');

    expect(normalized[1].severity).toBe('high');
    expect(normalized[1].layer).toBe('reasoning_integrity');

    expect(normalized[2].severity).toBe('high');
    expect(normalized[2].layer).toBe('reasoning_integrity');

    expect(normalized[3].severity).toBe('high');
    expect(normalized[3].layer).toBe('reasoning_integrity');
  });

  it('processes UI fatal-state exposure correctly', () => {
    const mockedResponse = `
    {
      "summary": { "critical": 2, "high": 2, "medium": 0, "low": 0, "total": 4 },
      "issues": [
        {
          "detector_id": "L42-14",
          "description": "Fatal state exposed to user without recovery path.",
          "severity": "critical"
        },
        {
          "detector_id": "L42-13",
          "description": "Mandatory UI component contract not enforced for error dialogs.",
          "severity": "high"
        },
        {
          "detector_id": "L42-03",
          "description": "UI-to-system-state mapping gap during async operations.",
          "severity": "high"
        },
        {
          "detector_id": "L42-05",
          "description": "Component state-machine mismatch in invalid UI transitions.",
          "severity": "medium"
        }
      ]
    }
    `;

    const parsed = repairJSON(mockedResponse);
    expect(() => validateResults(parsed)).not.toThrow();

    const diagnostics = createInitialDiagnostics();
    const normalized = parsed.issues.map(i => normalizeIssueFromDetector(i, diagnostics));

    expect(normalized[0].severity).toBe('critical');
    expect(normalized[0].layer).toBe('ui_surface_contract');
    expect(normalized[0].subcategory).toBe('UI fatal-state exposure');

    expect(normalized[1].severity).toBe('high');
    expect(normalized[1].layer).toBe('ui_surface_contract');

    expect(normalized[2].severity).toBe('high');
    expect(normalized[2].layer).toBe('ui_surface_contract');

    expect(normalized[3].severity).toBe('medium');
    expect(normalized[3].layer).toBe('ui_surface_contract');
  });

  it('processes direct tool side-effect leakage correctly', () => {
    const mockedResponse = `
    {
      "summary": { "critical": 2, "high": 2, "medium": 0, "low": 0, "total": 4 },
      "issues": [
        {
          "detector_id": "L37-15",
          "description": "Direct tool side-effect leakage to unrelated global state.",
          "severity": "critical"
        },
        {
          "detector_id": "L37-14",
          "description": "Sandbox isolation boundary not enforced for privileged tools.",
          "severity": "critical"
        },
        {
          "detector_id": "L37-08",
          "description": "Side effect validation absence for read-only tool execution.",
          "severity": "high"
        },
        {
          "detector_id": "L37-07",
          "description": "Tool invocation contract gap for validated calls.",
          "severity": "high"
        }
      ]
    }
    `;

    const parsed = repairJSON(mockedResponse);
    expect(() => validateResults(parsed)).not.toThrow();

    const diagnostics = createInitialDiagnostics();
    const normalized = parsed.issues.map(i => normalizeIssueFromDetector(i, diagnostics));

    expect(normalized[0].severity).toBe('critical');
    expect(normalized[0].layer).toBe('tool_execution_safety');
    expect(normalized[0].subcategory).toBe('direct tool side-effect leakage');

    expect(normalized[1].severity).toBe('critical');
    expect(normalized[1].layer).toBe('tool_execution_safety');

    expect(normalized[2].severity).toBe('high');
    expect(normalized[2].layer).toBe('tool_execution_safety');

    expect(normalized[3].severity).toBe('high');
    expect(normalized[3].layer).toBe('tool_execution_safety');
  });
});

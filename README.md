# Markdown Document Intelligence Auditor

Windows desktop application for auditing Markdown documentation with AI across 45 analytical layers and 637 micro-detectors.

## Overview

Markdown Intelligence Auditor is an Electron + React desktop app that accepts one or more `.md` / `.markdown` files, sends them to an OpenAI-compatible provider, and returns a structured report of documentation issues with severity, traceability, remediation guidance, and export support.

The current build includes chunk-aware batching, deterministic post-processing, incremental result reuse, session diffing, root-cause grouping, a structured 637-detector catalog, and portable Windows packaging.

## Current Capabilities

- Drag-and-drop upload for `.md` and `.markdown` files
- 45 analytical layers with explicit, deepened subcategories preventing thematic ambiguity
- 637 code-defined micro-detectors across all 45 layers, including 13 deep-spec layers with full detector coverage
- Full structured detector metadata including trigger patterns, evidence requirements, related layers, and false-positive guards
- Taxonomy benchmark fixtures supporting automated evaluation of classification correctness
- 127 deterministic benchmark tests across 22 benchmark fixtures including 8 new deep-spec fixtures for control plane override abuse, evidence-free escalation, export non-determinism, simulation governance mismatch, tool side-effect leakage, UI fatal state, uncertainty dropped, and world state atomicity
- Programmatic system prompt generation from structured taxonomy and metadata
- Taxonomy-driven runtime normalization: backfilling metadata and enforcing severity bounds
- Advanced semantic validation enforcing category -> subcategory -> detector consistency
- Local regression suite verifying taxonomy integrity and normalization logic
- Runtime taxonomy diagnostics surfaced in UI, Markdown reports, and JSON exports for pipeline observability
- Seven domain profiles (e.g., API Docs, Runbooks, PRDs) adjusting detector emphasis
...
- `total_issues_loaded`: specifically tracks issues processed during session load or import
- 25 cross-layer bundles connecting concepts like Security, Data Flow, Governance, Agent Memory Coordination, Context Orchestration Execution, and Deployment Resilience Contracts, plus deep-spec bundles for tool safety, world state, control plane, reasoning, UI contracts, deterministic execution, deployment, and platform abstraction
- Enhanced UI filtering by subcategory and grouping by subcategory or root cause
- Four-phase analysis flow: scan -> cross-layer correlation -> severity escalation -> final output
- Four deterministic escalation rules applied during runtime normalization
- Severity reporting: `critical`, `high`, `medium`, `low`
- Incremental analysis using SHA-256 file hashing and local cached results
- Session diffing with `new`, `resolved`, and `changed` issue states
- **Local Audit History Workbench**: Search, filter by source/model/profile, sort, label, and compare past audits in a local archive
- Root-cause grouping in addition to the flat issue list
- Detector traceability fields such as `detector_id`, `why_triggered`, and `escalation_reason`
- Remediation guidance including `recommended_fix`, `fix_steps`, `estimated_effort`, and `verification_steps`
- Search, layer filtering, and grouping by file, severity, layer, or root cause
- Export to JSON, Markdown, and CSV
- Session save/load support
- Provider presets and advanced controls for timeout, retries, and token budget
- Portable Windows `.exe` packaging

## Quick Start

1. Double-click the current packaged output at `dist-electron-v4\MarkdownAuditor-portable.exe`
2. Open Settings from the gear icon
3. Configure a provider:
   - `baseURL`
   - `apiKey` if required
   - `model`
   - optional `timeout`, `retries`, and `tokenBudget`
4. Validate the connection
5. Drop one or more Markdown files into the upload area
6. Run the audit
7. Review results, compare against history, manage your audit workbench, and export reports

## Configuration

Provider settings are stored at `%APPDATA%\MarkdownAuditor\config.json`.

Example:

```json
{
  "baseURL": "https://api.openai.com/v1",
  "apiKey": "sk-...",
  "model": "gpt-4o",
  "timeout": 60,
  "retries": 2,
  "tokenBudget": 100000
}
```

Incremental analysis cache is stored in `analysis_cache.json` in the same directory. This file-backed storage ensures reliability for large projects and persists across app updates. The system uses **atomic writes** to prevent cache corruption.

Users can clear this cache at any time through the **Clear Cache** button in the Settings modal.

## Provider Support

The app works with OpenAI-compatible endpoints. Current presets in the UI:

| Provider | Base URL | Example Model |
|----------|----------|---------------|
| OpenAI | `https://api.openai.com/v1` | `gpt-4o` |
| Groq | `https://api.groq.com/openai/v1` | `llama3-70b-8192` |
| OpenRouter | `https://openrouter.ai/api/v1` | `anthropic/claude-3.5-sonnet` |
| Ollama | `http://localhost:11434/v1` | `llama3` |
| Mistral | `https://api.mistral.ai/v1` | `mistral-large-latest` |
| Custom | user-provided | user-provided |

Any additional OpenAI-compatible provider, including services such as Together AI or proxy/routing layers, can be configured through the Custom option if they expose a compatible chat-completions interface.

## Analysis Pipeline

### Analysis Stages

1. `SCAN`
   - read input files
     - evaluate 637 detectors
   - record detector coverage
2. `CROSS-LAYER CORRELATION`
   - relate findings across layers
   - preserve linked issues
   - support root-cause grouping
3. `SEVERITY ESCALATION`
   - apply deterministic escalation rules
4. `FINAL OUTPUT`
   - validate JSON structure
   - normalize and render/export results

### Runtime Processing

- Chunk-aware batching for large files
- Issue deduplication with stable identity keys
- Post-merge escalation across the combined result set
- Cross-layer validation after escalation
- Cached result reuse for unchanged files (file-backed)
- Session diffing against the previous in-memory audit
- Known detector IDs are validated against the structured taxonomy
- Unknown but well-formed detector IDs currently generate runtime warnings instead of hard validation failures

### Deterministic Escalation Rules

- Rule 1: 3 or more medium issues in the same section -> escalate to high
- Rule 2: security + performance issues on the same component -> escalate to critical
- Rule 3: completeness + functional issues on missing steps -> escalate to high
- Rule 4: contradiction + intent issues on the same content -> escalate to high

## Analysis Layers (45 Total)

### Foundation Layers (1-14)

1. Contradiction & Consistency
2. Logical Integrity
3. Structural & Organizational
4. Semantic & Clarity
5. Factual & Evidence
6. Functional & Practical
7. Temporal & State
8. Architectural & Design
9. Completeness & Coverage
10. Intent & Goal Alignment
11. Metacognition & Rationale
12. Adversarial & Edge Cases
13. Knowledge Graph Integrity
14. Quantitative & Numeric

### Advanced Systems Layers (15-24)

15. Requirement Traceability
16. State Machine Consistency
17. API Contract
18. Dependency Graph
19. Data Flow Integrity
20. Execution Path
21. Configuration Consistency
22. Error Handling
23. Security & Isolation
24. Performance & Scalability

### Extended Quality Layers (25-32)

25. Testability & Verification
26. Maintainability & Technical Debt
27. Usability & User Experience
28. Interoperability & Integration
29. Governance & Compliance
30. Resilience & Fault Tolerance
31. Observability & Monitoring
32. Evolution & Future-Proofing

### Deep Specification Layers (33-45)

33. Specification Formalism
34. Simulation & Verification
35. Memory & World Model
36. Agent Orchestration
37. Tool & Execution Safety
38. Deployment Contract
39. Platform Abstraction
40. Context Orchestration
41. Reasoning Integrity
42. UI Surface Contract
43. Deterministic Execution
44. Control Plane Authority
45. World State Governance

## Issue Schema

Typical issue fields include:

- `id`
- `severity`
- `category`
- `subcategory`
- `detector_id`
- `detector_name`
- `layer`
- `files`
- `section`
- `line_number`
- `description`
- `evidence`
- `why_triggered`
- `escalation_reason`
- `confidence`
- `impact_score`
- `fix_difficulty`
- `estimated_effort`
- `related_issues`
- `root_cause_id`
- `recommended_fix`
- `fix_steps`
- `verification_steps`
- `tags`
- `references`

Top-level result output may also include:

- `summary`
- `issues`
- `root_causes`

## Exports

- JSON: full structured result payload
- Markdown: summary, detailed issues, and root cause summary
- CSV: flattened issue data including traceability and remediation fields

## Example Result Shape

```json
{
  "summary": {
    "total": 0,
    "critical": 0,
    "high": 0,
    "medium": 0,
    "low": 0,
    "files_analyzed": 0,
    "layers_triggered": [],
    "detectors_evaluated": 0,
    "detectors_skipped": 0,
    "overall_score": 0,
    "improvement_priority": []
  },
  "issues": [
    {
      "id": "1",
      "severity": "critical",
      "category": "architectural",
      "subcategory": "missing components",
      "detector_id": "L8-02",
      "detector_name": "missing component",
      "layer": "architectural",
      "files": ["file.md"],
      "section": "Architecture",
      "line_number": 42,
      "description": "[L8-02] Missing component: API gateway not defined in architecture",
      "evidence": "Direct quote from the documentation",
      "why_triggered": "The document references traffic routing but does not define the gateway layer.",
      "escalation_reason": "Escalated to critical because the missing component creates architectural ambiguity.",
      "confidence": 0.95,
      "impact_score": 8,
      "fix_difficulty": "moderate",
      "estimated_effort": "2-4 hours",
      "root_cause_id": "RC-01",
      "recommended_fix": "Add a dedicated API gateway section.",
      "fix_steps": [
        "Define the gateway component",
        "Document responsibilities",
        "Update the architecture diagram"
      ],
      "verification_steps": [
        "Verify the gateway appears in diagrams",
        "Verify responsibilities are documented"
      ],
      "tags": ["api", "architecture"],
      "references": ["https://example.com/spec"]
    }
  ],
  "root_causes": [
    {
      "id": "RC-01",
      "title": "Incomplete Architecture Definition",
      "description": "Core components are referenced but not fully documented.",
      "impact": "High",
      "child_issues": ["1"]
    }
  ]
}
```

## Building From Source

```bash
npm install
npm run verify
npm run dist
```

Current packaged output:

- `dist-electron-v4\MarkdownAuditor-portable.exe`

## Technology Stack

- Electron
- React 18
- Vite
- Tailwind CSS
- OpenAI Node SDK
- electron-builder

## Repository Docs

- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [ENHANCEMENTS.md](./ENHANCEMENTS.md)
- [CONTRIBUTING.md](./CONTRIBUTING.md)
- [CHANGELOG.md](./CHANGELOG.md)
- [RELEASE_NOTES.md](./RELEASE_NOTES.md)
- [GEMINI.md](./GEMINI.md)

## Release Readiness

- **Current Version**: 1.12.0
- **Verification Status**: Local verification performed via `npm run verify`
- **Logic Status**: Verified all tests pass via `npm test`
- **Packaging**: Local Windows packaging supported via `npm run dist`
- **Signature**: This portable executable is currently **unsigned**.

## Notes

- The app provides AI-generated remediation guidance, but it does not apply fixes automatically.
- Local OpenAI-compatible endpoints such as Ollama are supported.
- Known detector IDs are checked for taxonomy consistency; unknown detector IDs currently log warnings rather than being rejected outright.
- The packaged executable is currently unsigned, so Windows may show trust warnings on some systems.
- A dedicated license file is not currently present in the repo; add one before public distribution if needed.

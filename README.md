# Markdown Document Intelligence Auditor

Windows desktop application for auditing Markdown documentation with AI across 53 analytical layers, 701 micro-detectors, and a deterministic 8-agent analysis mesh.

## Overview

Markdown Intelligence Auditor is an Electron + React desktop app that accepts one or more `.md` / `.markdown` files, sends them to an OpenAI-compatible provider, and returns a structured report of documentation issues with severity, traceability, remediation guidance, and export support.

The current build includes chunk-aware batching, deterministic multi-pass post-processing, deterministic Markdown indexing for line-and-section anchors, a deterministic cross-file Markdown project graph for related-location enrichment, typed proof-chain enrichment with deterministic span-to-span edges, a staged deterministic rule engine, incremental result reuse, session diffing, root-cause grouping, a structured 701-detector catalog, and portable Windows packaging.

## Current Capabilities

- Drag-and-drop upload for `.md` and `.markdown` files
- 53 analytical layers with explicit, deepened subcategories preventing thematic ambiguity
- 701 code-defined micro-detectors across all 53 layers, including the deep-spec core plus 8 universal governance and reproducibility extensions
- Full structured detector metadata for all detectors, including trigger patterns, evidence requirements, false-positive guards, and `related_layers` cross-references for 255 detectors across the specification-intensive layers
- Taxonomy benchmark fixtures supporting deterministic evaluation of taxonomy validation, normalization, and detector mapping correctness
- 29 deterministic benchmark fixtures inside a 197-test local suite across 18 test files, including deep-spec and universal-audit scenarios for authority bypass, workflow skips, artifact reproducibility, toolchain isolation, recovery loop collapse, operational UX leakage, deterministic anchor enrichment, local rule-engine enforcement, cross-file graph linking, typed proof-chain generation, proof-chain fallback generation, multi-anchor cross-file resolution, unified layer numbering, explicit agent-ownership reconciliation, receipt-backed detector coverage, adaptive timeout handling, and first-class analysis-mesh validation
- Programmatic system prompt generation from structured taxonomy and metadata
- Agent-scoped prompt compaction for the 8-agent mesh: each pass receives a compact full-taxonomy detector index plus richer detector metadata for its focus layers
- Taxonomy-driven runtime normalization: backfilling metadata and enforcing severity bounds
- Deterministic Markdown indexing: heading parsing, section-range mapping, evidence-to-line anchor enrichment, heading-inference fallback, and multi-anchor cross-file resolution across loaded Markdown files
- Deterministic cross-file project graph: terms, requirements, states, APIs, actors, workflows, and references are modeled across loaded Markdown files, with related-location enrichment for cross-file findings
- Typed proof-chain enrichment: findings now preserve deterministic span-to-span edges such as `supports`, `contradicts`, `defines`, `depends_on`, `references`, and `violates`
- Deterministic local rule engine for broken heading hierarchy, orphan sections, duplicate headings, broken cross-references, RFC2119 misuse, missing rollback paths, workflow ordering gaps, workflow exit criteria, undefined identifiers, and unresolved glossary bindings, with per-detector checked/clean/hit execution receipts
- Advanced semantic validation enforcing category -> subcategory -> detector consistency
- Local regression suite verifying taxonomy integrity and normalization logic
- Runtime taxonomy diagnostics surfaced in UI, Markdown reports, and JSON exports for pipeline observability
- Agent-pass malformed JSON resilience: invalid agent responses are retried per pass, captured in diagnostics with a raw response preview, and skipped in degraded mode if they remain malformed
- Provider-timeout resilience: analysis requests now use adaptive timeout growth, and an agent pass that still times out is skipped in degraded mode with a recorded timeout warning instead of aborting the whole audit immediately
- Hardened timeout defaults: saved configs below the safe timeout floor are automatically upgraded, and the settings UI now reflects a higher default/minimum timeout for large audits
- Universal audit mode only: the app always applies the full taxonomy without document-type profile weighting
- Deterministic 8-agent analysis mesh with bounded roles for specification absoluteness, architecture authority, UI/operational integrity, execution/simulation, memory/world state, tool/deployment safety, reasoning/evidence, and cross-layer synthesis
- First-class analysis-mesh runtime summaries: each pass records merge strategy, merge priority, focus-layer hits, focus-subcategory hits, explicit owned layer/detector ranges, dominant layers/subcategories, cross-scope findings, and validation warnings
- Unified layer numbering from `src/lib/layers.js`, so visible layer badges and detector layer mapping share one source of truth
- Stage-aware progress UI showing indexing, project graph, deterministic rule engine, analysis mesh, merge, and finalize stages with live batch/agent progress
- Expanded summary and diagnostics UI showing project-graph counts, rule-engine counts, receipt-backed owned-detector reconciliation, checked/clean/hit/untouched ownership metrics, mesh focus hits, out-of-focus findings, cross-scope findings, and per-agent coverage summaries
- `total_issues_loaded`: specifically tracks issues processed during session load or import
- 31 cross-layer bundles connecting concepts like Security, Data Flow, Governance, Agent Memory Coordination, Context Orchestration Execution, Deployment Resilience Contracts, vocabulary authority, workflow execution, artifact environment integrity, and operational UI contracts
- Enhanced UI filtering by subcategory and grouping by subcategory or root cause
- Deterministic multi-pass analysis model: 8 fixed agent prompts -> validation/repair -> metadata enrichment -> merged output
- Branded in-app surfaces, including the top bar, loading state, and self-contained Markdown report header
- Four deterministic escalation rules applied during runtime normalization
- Severity reporting: `critical`, `high`, `medium`, `low`
- Incremental analysis using SHA-256 file hashing and local cached results
- Session diffing with `new`, `resolved`, and `changed` issue states
- **Local Audit History Workbench**: Search, filter by source/model, sort, label, and compare past audits in a local archive
- Root-cause grouping in addition to the flat issue list
- Detector traceability fields such as `detector_id`, `why_triggered`, and `escalation_reason`
- Strict issue schema fields including `failure_type`, `constraint_reference`, `violation_reference`, `contract_step`, `invariant_broken`, `authority_boundary`, `closed_world_status`, `analysis_agents`, and `deterministic_fix`
- Deterministic anchor fields including `section_slug`, `line_end`, `document_anchor`, `document_anchors`, and `anchor_source`
- Cross-file evidence fields including `detection_source`, `cross_file_links`, `evidence_spans`, and typed `proof_chains`
- Remediation guidance including `recommended_fix`, `fix_steps`, `estimated_effort`, `verification_steps`, and deterministic fix guidance
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
  "timeout": 180,
  "retries": 2,
  "tokenBudget": 10000000
}
```

Incremental analysis cache is stored in `analysis_cache.json` in the same directory. This file-backed storage ensures reliability for large projects and persists across app updates. The system uses **atomic writes** to prevent cache corruption.

Users can clear this cache at any time through the **Clear Cache** button in the Settings modal.

For large Markdown specifications, the app chunks and batches file content automatically. The default session token budget is intentionally high (`10,000,000`) so long-form audits can proceed instead of failing early on conservative defaults, the runtime uses scoped per-agent prompts so the same 701-detector taxonomy does not get re-sent in full detail on every pass, and the Electron main process now uses an adaptive analysis output-token budget instead of a fixed `8000` cap.

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

### Deterministic 8-Agent Analysis Mesh

The runtime performs eight bounded analysis passes over each batch. Each pass uses the same taxonomy but a different fixed audit lens:

1. `SPEC_ABSOLUTENESS`
   - specification completeness
   - terminology and ontology governance
   - closed-world assumption detection
2. `ARCHITECTURE_AUTHORITY`
   - component and authority boundaries
   - control-path integrity
   - workflow/lifecycle correctness
3. `UI_OPERATIONAL`
   - UI surface contracts
   - operational UX guarantees
   - state projection correctness
4. `EXECUTION_SIMULATION`
   - execution invariants
   - simulation/governance ordering
   - retry and recovery integrity
5. `MEMORY_WORLD_STATE`
   - memory authority rules
   - snapshot isolation
   - world-state mutation constraints
6. `TOOL_DEPLOYMENT`
   - tool safety
   - deployment/export contracts
   - environment/toolchain isolation
7. `REASONING_EVIDENCE`
   - evidence binding
   - contradiction detection
   - uncertainty and assumption handling
8. `CROSS_LAYER_SYNTHESIS`
   - merge high-signal findings
   - preserve cross-layer traceability
   - support deterministic root-cause grouping

Each runtime agent now also owns an explicit slice of the taxonomy via a deterministic layer partition. After the mesh completes, the app reconciles:
- finding-backed owned detector coverage
- receipt-backed checked detector coverage
- checked-clean and untouched owned detector counts
- quiet owned detector count
- cross-scope findings emitted outside an agent's owned range
- per-agent owned detector ranges in diagnostics and Markdown exports

### Runtime Processing

- Chunk-aware batching for large files
- Deterministic Markdown indexing
- Deterministic local rule engine
- Cross-file project graph analysis
- Eight sequential agent passes per batch with deterministic prompt construction
- Per-agent runtime validation and merge summarization using the analysis mesh contract instead of treating all agent passes as the same generic loop
- Scoped prompt construction for agent passes: compact global detector index plus full focus-layer detector metadata
- Issue deduplication with stable identity keys
- Agent-result merge with `analysis_agent` / `analysis_agents` provenance
- Post-merge escalation across the combined result set
- Cross-layer validation after escalation
- Deterministic cross-file project-graph enrichment after anchor normalization
- Evidence-span enrichment after anchor and graph normalization
- Cached result reuse for unchanged files (file-backed)
- Session diffing against the previous in-memory audit
- Known detector IDs are validated against the structured taxonomy
- Strict schema normalization backfills `failure_type`, `constraint_reference`, `violation_reference`, `contract_step`, `invariant_broken`, `authority_boundary`, `closed_world_status`, `assumption_detected`, `evidence_reference`, and `deterministic_fix`
- Deterministic anchor enrichment normalizes `files`, `section`, `section_slug`, `line_number`, `line_end`, `document_anchor`, `document_anchors`, `evidence_reference`, and `violation_reference` when Markdown evidence supports exact placement
- Deterministic project-graph enrichment adds `detection_source` and `cross_file_links` when related terms, requirements, states, APIs, actors, headings, identifiers, or workflow steps are found across loaded Markdown files
- Evidence-first enrichment adds `evidence_spans` so issues retain structured proof locations instead of only free-text evidence
- Typed proof-chain enrichment adds deterministic span-to-span edges so related evidence is preserved as explicit proof links instead of only related locations
- Unknown detector IDs are rejected during validation instead of being treated as soft warnings

### Deterministic Escalation Rules

- Rule 1: 3 or more medium issues in the same section -> escalate to high
- Rule 2: security + performance issues on the same component -> escalate to critical
- Rule 3: completeness + functional issues on missing steps -> escalate to high
- Rule 4: contradiction + intent issues on the same content -> escalate to high

## Analysis Layers (53 Total)

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

### Universal Audit Extension Layers (46-53)

46. Ontology Vocabulary Governance
47. Workflow Lifecycle Integrity
48. Authority Path Integrity
49. Artifact Reproducibility
50. Environment Toolchain Isolation
51. Knowledge Source Authority
52. Failure Recovery Integrity
53. Operational UX Contract

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
- `section_slug`
- `line_number`
- `line_end`
- `document_anchor`
- `document_anchors`
- `anchor_source`
- `description`
- `evidence`
- `why_triggered`
- `escalation_reason`
- `failure_type`
- `constraint_reference`
- `violation_reference`
- `contract_step`
- `invariant_broken`
- `authority_boundary`
- `closed_world_status`
- `analysis_agent`
- `analysis_agents`
- `assumption_detected`
- `deterministic_fix`
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
    "analysis_agents_run": 8,
    "analysis_agent_passes": 8,
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
      "failure_type": "invariant_break",
      "constraint_reference": "architectural_design.missing_components.L8-02",
      "violation_reference": "L8-02::missing_component",
      "contract_step": "architecture_contract_validation",
      "invariant_broken": "architectural_missing_components",
      "authority_boundary": "component_contract_surface",
      "closed_world_status": "bounded_inference",
      "analysis_agent": "architecture_authority_agent",
      "analysis_agents": ["architecture_authority_agent", "cross_layer_synthesis_agent"],
      "assumption_detected": false,
      "deterministic_fix": "Define the missing component explicitly, connect it to existing architecture nodes, and re-run validation.",
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

- **Current Version**: 1.13.0
- **Verification Status**: Local verification performed via `npm run verify`
- **Logic Status**: Verified all tests pass via `npm test`
- **Packaging**: Local Windows packaging supported via `npm run dist`
- **Signature**: This portable executable is currently **unsigned**.

## Notes

- The app provides AI-generated remediation guidance, but it does not apply fixes automatically.
- Local OpenAI-compatible endpoints such as Ollama are supported.
- Known detector IDs are checked for taxonomy consistency, and unknown detector IDs are now rejected during AI-result validation instead of being allowed through as soft warnings.
- The packaged executable is currently unsigned, so Windows may show trust warnings on some systems.
- A dedicated license file is not currently present in the repo; add one before public distribution if needed.

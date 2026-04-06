# Enhancements Status

This document tracks the major product-level enhancements currently implemented in the app, along with the next most useful areas for improvement.

## Implemented in Current Build

### Analysis Engine

- 53 analytical layers with explicit deepened subcategories covering weak themes
- 701 code-defined micro-detectors with structured metadata for every detector, with non-empty `related_layers` populated for 255 specification-intensive detectors (L33-L53)
- structured detector metadata in `src/lib/detectorMetadata.js`
- taxonomy benchmark fixtures and evaluation suite
- dynamic detector catalog generation for the system prompt
- deterministic 8-agent analysis mesh defined in `src/lib/analysisAgents.js`
- universal taxonomy plus a single universal audit mode and cross-layer bundles (31 total) composed into prompt generation
- chunk-aware batching for oversized files
- deterministic post-merge normalization
- deterministic Markdown indexing with anchor enrichment and evidence-span construction
- deterministic cross-file project graph over headings, glossary terms, identifiers, workflows, requirements, states, APIs, actors, and document references
- deterministic local rule engine for duplicate headings, broken cross-references, RFC2119 misuse, rollback gaps, workflow ordering gaps, missing workflow terminal states, undefined reused identifiers, and unresolved glossary bindings
- four runtime escalation rules
- cross-layer validation after escalation
- JSON repair before validation
- detector-aware validation for Lx-yy ID format, existence, and semantic consistency
- taxonomy-driven normalization: automatic metadata backfilling, agent provenance merge, and severity bound clamping
- automated test suite for taxonomy integrity, prompt generation, normalization, and session persistence
- 29 deterministic benchmark fixtures within a 184-test local suite across 17 files
- benchmark suites covering control plane override abuse, evidence-free escalation, export non-determinism, simulation governance mismatch, tool side-effect leakage, UI fatal state, uncertainty dropped, world state atomicity, workflow skips, artifact reproducibility, toolchain isolation, recovery loop collapse, and operational UX leakage
- enhanced taxonomy coverage helper (`taxonomyCoverageHelper.js`) with per-layer density analysis, richness metrics, subcategory coverage tracking, and bundle coverage analysis
- universal audit layer expansion with 8 new layers covering ontology governance, workflow integrity, authority paths, artifact reproducibility, environment/toolchain isolation, knowledge-source authority, failure recovery, and operational UX contracts
- related_layers metadata populated for 255 detectors across the deep-spec core and universal extension layers to support cross-layer traceability
- runtime taxonomy diagnostics surfaced in UI, Markdown, and JSON/Session exports
- strict issue schema enrichment for `failure_type`, `constraint_reference`, `violation_reference`, `contract_step`, `invariant_broken`, `authority_boundary`, `closed_world_status`, `analysis_agents`, and `deterministic_fix`
- evidence-first schema enrichment for `document_anchors`, `detection_source`, `cross_file_links`, and `evidence_spans`
- basic response validation before rendering
- file-backed incremental analysis cache (`analysis_cache.json`)

### Incremental and Comparative Workflows

- SHA-256 file hashing for reuse detection
- local file-backed cached reuse of unchanged file results
- automatic migration from legacy `localStorage` cache
- **local audit history workbench**: searchable, editable, and filterable archive of past runs
- **cross-session comparison**: compare any history entry against current results
- per-run reused vs reanalyzed counts
- session diffing against the previous in-memory audit
- `new`, `resolved`, and `changed` issue states

### Result Quality and Explainability

- detector traceability fields
- detector subcategories and detector names
- escalation reasons in normalized issues
- remediation guidance:
  - `recommended_fix`
  - `fix_steps`
  - `estimated_effort`
  - `verification_steps`
- root-cause grouping support

### UI and UX

- drag-and-drop Markdown intake
- search across descriptions, evidence, tags, files, and detector metadata
- single universal audit mode with no document-type profile selector
- layer and subcategory filtering
- grouping by file, severity, layer, subcategory, and root cause
- **audit history workbench modal** with advanced search, filter, and sort
- **editable audit labels and persistent notes**
- **import support** for saving manual sessions into local history
- session diff summary panel
- save/load session workflow
- JSON / Markdown / CSV export

### Provider Controls

- provider presets for OpenAI, Groq, OpenRouter, Ollama, and Mistral
- user-configurable timeout
- user-configurable retries
- session token budget enforcement

### Packaging

- reproducible Windows portable build via `electron-builder`
- output path: `dist-electron-v4\MarkdownAuditor-portable.exe`

## Known Constraints

- File-backed cache improves reliability, but very large cache files (>50MB) may still impact initial load performance.
- Chunk overlap improves context retention, but line range reporting for overlapped chunks is still best-effort.
- Validation is stronger than before, but it is still not a full strict schema validator for every optional field.
- The deterministic 8-agent mesh materially increases latency and token usage compared with the earlier single-pass flow.
- The cross-file graph currently models related locations and shared entities, but it is not yet a fully typed causal evidence graph.
- The packaged executable is unsigned.

## Recommended Next Enhancements

### High Value

- Add a first-class typed evidence graph on top of the current multi-anchor/cross-file link model
- Add explicit cost / token usage reporting per run and per agent pass
- Add automated regression tests for caching, diffing, export behavior, and per-agent merge stability
- Deepen the new universal layers with sharper detectors, deterministic rules, and benchmark fixtures before adding another top-level expansion
- Add richer UI surfacing for analysis-mesh diagnostics, such as per-agent timing and per-pass findings deltas
- Add staged rule-engine coverage for glossary/requirement/state/API drift beyond the current first set of deterministic checks

### Quality of Life

- Add export of root-cause summaries to a dedicated structured file
- Add better chunk-to-source line remapping for very large overlapping batches
- Add dismissal / suppression rules for accepted findings
- Add signed Windows release builds
- Add release automation or CI build verification

## Guidance

When implementing future enhancements, update:

- `README.md`
- `ARCHITECTURE.md`
- `CONTRIBUTING.md`
- `GEMINI.md` when repo-level working rules change

This helps keep product claims, runtime behavior, and contributor expectations aligned.

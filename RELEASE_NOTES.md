# Release Notes

## Unreleased

- **Universal Audit Mode Only**: Removed document-type profiles from the prompt layer, pre-analysis UI, cache identity, and history workbench. The app now always runs the full universal taxonomy without profile-specific weighting.
- **History Workbench Simplification**: History filtering now focuses on model and source, matching the new universal-mode runtime.
- **Prompt Payload Efficiency**: The live 8-agent runtime continues to use scoped prompt compaction, and the local verification suite now covers 181 tests across 16 files.
- **Malformed Agent Response Recovery**: The runtime now retries malformed agent JSON per pass, hardens JSON repair for common object-literal mistakes, surfaces captured bad-response previews in diagnostics, and degrades gracefully by skipping a still-malformed agent pass instead of aborting the entire audit.
- **Adaptive Analysis Output Budgeting**: The Electron main-process analysis call now uses an adaptive output-token budget instead of a fixed `8000` cap, reducing truncation risk for issue-dense audits while still backing off when providers reject higher output budgets.
- **Strict Unknown Detector Rejection**: AI-result validation now rejects unknown detector IDs outright instead of allowing them through as soft warnings.
- **Deterministic Markdown Anchor Enrichment**: The renderer now builds a local Markdown index for headings and section ranges, then enriches findings with `section_slug`, `line_end`, `document_anchor`, and anchored evidence references based on actual Markdown evidence before dedupe, export, history save, and session reload.
- **Cross-File Multi-Anchor Resolution**: Cross-file findings can now preserve multiple resolved Markdown anchors, and vague findings can fall back to deterministic heading inference when the document structure supports a unique section match.
- **Deterministic Cross-File Project Graph**: The renderer now builds a local project graph over the loaded Markdown set, groups shared headings/glossary terms/identifiers/workflow steps, and enriches findings with `detection_source` plus `cross_file_links` so cross-file drift has explicit related-location evidence.
- **181 Automated Tests / 16 Test Files**: The local verification suite now covers the project-graph enrichment path in addition to the prior indexing, validation, history, diagnostics, and benchmark flows.

## v1.13.0

Release date: 2026-04-02

This release expands the universal audit taxonomy from 45 to **53 top-level layers** and from 637 to **701 code-defined micro-detectors**, adds a deterministic **8-agent analysis mesh**, and wires a stricter issue schema through validation, UI rendering, exports, and diagnostics.

### Highlights

- **53 Universal Audit Layers**: Added ontology vocabulary governance, workflow lifecycle integrity, authority path integrity, artifact reproducibility, environment toolchain isolation, knowledge source authority, failure recovery integrity, and operational UX contract coverage.
- **701 Micro-Detectors**: The detector catalog now extends across all 53 layers, with enriched defaults for schema fields such as `failure_type`, `constraint_reference`, `contract_step`, `invariant_broken`, `authority_boundary`, `closed_world_status`, and `deterministic_fix`.
- **Deterministic 8-Agent Mesh**: Analysis now runs through eight fixed passes that each audit a bounded slice of the same taxonomy before deterministic merge and escalation.
- **31 Cross-Layer Bundles**: Added six new bundles to correlate vocabulary authority, workflow execution, authority/governance/world-state, artifact/environment integrity, knowledge/context, and operational UI contracts.
- **29 Benchmark Fixtures / 157 Automated Tests**: Added universal-audit fixtures and a dedicated benchmark suite for authority bypass, workflow skips, artifact reproducibility, toolchain leakage, recovery-loop collapse, and operational UX leakage.
- **Custom Windows App Icon**: The packaged app now uses a branded Markdown-audit icon generated into `build/icon.ico` instead of falling back to Electron's default icon.
- **Branded UI and Report Header**: The same icon now appears in the top bar, loading experience, and Markdown report header for consistent product branding.

### Release Notes

- Runtime latency and token usage are higher than the earlier single-pass flow because each batch now goes through eight agent prompts.
- Unknown detector IDs still produce warnings rather than hard failures during validation.
- The packaged Windows executable remains unsigned; Windows SmartScreen may show a trust warning on first run.

## v1.12.0

Release date: 2026-03-31

This release expands the detector catalog from 612 to **637 code-defined micro-detectors** across the same 45 top-level layers, adds `related_layers` cross-referencing for deep-spec detectors, and grows the deterministic benchmark suite.

### What's New

- **637 Micro-Detectors**: Four new detectors added (L44-14, L44-15, L45-15, L45-16) strengthening control plane and world state governance coverage.
- **related_layers for Deep-Spec Detectors**: Populated `related_layers` metadata for 191 detectors across layers L33-L45, enabling cross-layer traceability for complex specification audits.
- **25 Cross-Layer Bundles**: Added three new bundles — `agent_memory_coordination`, `context_orchestration_execution`, and `deployment_resilience_contract` — for richer cross-layer correlation.
- **136 Automated Tests / 40 Benchmark-Focused Checks**: The local suite expanded from 95 to 136 tests overall, including deterministic benchmark-focused coverage across 21 fixtures for control plane override abuse, evidence-free escalation, export non-determinism, simulation governance mismatch, tool side-effect leakage, UI fatal state, uncertainty dropped, and world state atomicity.

### What's Fixed

- **Taxonomy Coverage Helper**: Enhanced with `related_layers` coverage reporting for comprehensive taxonomy observability.
- **Documentation Coherence**: All current-state docs now consistently reference the 637-detector baseline and accurately describe `related_layers` as deep-spec cross-referencing.

### Known Issues

- The packaged Windows executable remains unsigned; Windows SmartScreen may show a trust warning on first run.
- Unknown detector IDs still produce warnings rather than hard failures during validation.

## v1.11.0

Release date: 2026-03-31

This release expands the detector catalog from 383 to **612 code-defined micro-detectors** across the same 45 top-level layers, providing deeper coverage for documentation auditing without changing the core analytical framework.

### What's New

- **612 Micro-Detectors**: All 45 layers now have richer subcategory coverage. The expanded detector set catches more documentation gaps, inconsistencies, and specification violations across complex Markdown projects.
- **Expanded Benchmark Fixtures**: New deterministic test fixtures cover context contamination, deployment contradictions, governance bypass scenarios, non-deterministic replay detection, platform abstraction leakage, reasoning integrity gaps, and UI contract omissions.
- **Improved Completeness Scoring**: The overall completeness score is now properly clamped to a maximum of 1.0, preventing misleading scores above 100%.

### What's Fixed

- **Test Alignment**: The automated test suite now runs 83 tests across 10 files, all passing, with taxonomy integrity and benchmark evaluation fully aligned to the 612-detector catalog.
- **Subcategory Mapping**: Several detectors had inconsistent subcategory mappings that could cause runtime normalization warnings. These are now corrected.
- **Documentation Coherence**: All current-state docs, prompt text, and UI labels now consistently reference the 612-detector baseline.

### Known Issues

- The packaged Windows executable remains unsigned; Windows SmartScreen may show a trust warning on first run.
- Unknown detector IDs still produce warnings rather than hard failures during validation.
- Very large cache files (>50MB) may impact initial load performance.

## v1.10.0

Release date: 2026-03-31

This release extends the deep-spec taxonomy from 40 to **45 top-level layers** with **383 code-defined micro-detectors**, adding first-class detection for deterministic execution, control-plane authority, and world-state governance.

### Highlights

- **45-Layer Core Taxonomy**: Added three new layers — `Deterministic Execution`, `Control Plane Authority`, and `World State Governance` — covering scheduling non-determinism, deadlock/livelock risks, plane-separation breaches, authority delegation gaps, state mutation invariant violations, PSG gateway bypass, and commit-hash binding.
- **383 Micro-Detectors**: All 45 layers have at least 8 detectors. The three new layers contribute 24 detectors, with additional detectors added to existing deep-spec layers to fill thin coverage gaps.
- **Extended Benchmark Coverage**: New deterministic benchmark fixtures exercise control-plane, world-state, and reasoning-integrity normalization paths alongside existing AstraBuild-style fixtures.
- **Prompt Alignment**: The runtime system prompt now carries explicit instructions for deep-spec auditing invariants (execution invariants, control plane authority, world state governance, reasoning integrity, UI surface contracts, platform abstraction).

### Technical Details

- Source of truth: `src/lib/detectorMetadata.js` (383 detectors), `src/lib/layers.js` (45 layers)
- All layers have complete subcategory coverage with no empty subcategories
- Deterministic benchmark tests verified through real `jsonRepair` and `normalizeIssueFromDetector` paths
- 70 automated tests pass across taxonomy integrity, benchmark, normalization, validation, diagnostics, sessions, exports, cache, and history suites

## v1.9.0

Release date: 2026-03-30

This release brings the **Next-Generation Taxonomy Expansion**, evolving the application from a general document checker into a deep deterministic specification auditor. The core analytical taxonomy has been upgraded from 32 to 40 layers to natively support AstraBuild-style strict execution specs, memory-model specs, agent-system specs, and deployment contracts.

### Highlights

- **40-Layer Core Taxonomy**: Added first-class audit capabilities for `Specification Formalism`, `Simulation & Verification`, `Memory & World Model`, `Agent Orchestration`, `Tool & Execution Safety`, `Deployment Contract`, `Platform Abstraction`, and `Context Orchestration`.
- **Deepened Existing Taxonomy**: Refined subcategories across existing weak themes like "semantic ambiguity," "UI-state mapping," and "rollback infeasibility."
- **Deterministic Benchmark Harness**: Upgraded the test suite into a truthful pipeline benchmark. Tests now run deterministic mocked LLM outputs directly through the `jsonRepair` and taxonomy normalization paths.
- **AstraBuild-Style Fixtures**: Added new benchmark fixtures ensuring the new layers successfully catch missing pre-simulation steps, direct database write violations, and remote deployment prohibitions.
- **Detector Enrichment**: Added 32 new micro-detectors to map the new layers, bringing the catalog to 288 code-defined detectors.

## v1.8.0

Release date: 2026-03-29

This release evolves the local history feature into a full **Audit History Workbench**, providing powerful tools for power users to manage and analyze their audit archive.

### Highlights

- **Searchable History**: Instantly find past audits by title, file names, or your own custom notes.
- **Advanced Workbench UI**: A new, more powerful history interface with filtering by AI model, domain profile, and run source.
- **Cross-Session Comparison**: Pick any past run from your history and immediately compare it against your current audit results to track progress.
- **Custom Labels & Notes**: Give your audits meaningful names like "Baseline Before Refactor" and add persistent notes for future reference.
- **Smart Retention**: Automatically keeps your most recent 50 audits, pruning the oldest to keep your local workspace clean.
- **Import into History**: Manually loaded session JSON files can now be saved into your local history archive with a single click.

### Technical Improvements

- Expanded the history metadata schema to include source types and note persistence.
- Refactored history UI state into a cleaner, more modular structure.
- Enhanced the history service with metadata update and auto-pruning capabilities.

## v1.7.0

Release date: 2026-03-29

This release adds a powerful **Local Audit History** system, making it easier than ever to manage, reopen, and track your documentation audits over time without manual file management.

### Highlights

- **Automated Audit History**: Every successful analysis run is now automatically saved to a local, file-backed history store.
- **History Browser UI**: Access your past audits through a new "History" button in the top bar. Quickly browse issue summaries, timestamps, and model details.
- **One-Click Reopen**: Reopen any past audit from your history into the main UI for deep inspection or comparison.
- **Local Management**: Delete individual entries or clear your entire history directly from the app.

### Technical Improvements

- Implemented a dedicated `HistoryService` in the Electron main process for managing history indexes and session files.
- Added unique UUID generation for history entries to prevent collisions.
- Unified the history opening flow with existing taxonomy normalization to ensure all reopened audits remain enriched.

## v1.6.0

Release date: 2026-03-29

This release introduces a robust local persistence layer, moving the incremental analysis cache from browser-style storage to a dedicated local file.

### Highlights

- **File-Backed Analysis Cache**: Analysis results are now stored in `analysis_cache.json` in the app's local user-data directory. This improves performance for large projects and makes your analysis history more durable.
- **Hardened Persistence**: Added **atomic writes** and corrupt-file resilience to ensure the cache remains valid even if the application closes unexpectedly.
- **Cache Diagnostics**: View your cache entry count directly in the Settings modal.
- **Seamless Migration**: Automatic migration of existing `localStorage` data on first launch.

### Technical Improvements

- Moved filesystem operations to the Electron main process for safety and performance.
- Added explicit IPC handlers for cache lifecycle management.
- Improved error handling for corrupt or missing cache files.

## v1.5.0

Release date: 2026-03-29

This release completes the major taxonomy refactor, moving from prompt-defined heuristics to a fully structured, metadata-driven analysis engine. 

### Highlights

- **Full Structured Detector Catalog**: All 256 detectors are now defined in code (`src/lib/detectorMetadata.js`) with explicit trigger patterns, evidence requirements, and false-positive guards.
- **Dynamic Prompt Generation**: The system prompt is now built programmatically, ensuring the AI receives precise, consistent instructions derived from the latest metadata.
- **Domain-Aware Analysis**: New Domain Profiles (API Docs, Runbooks, PRDs, etc.) allow users to adjust analysis emphasis based on document type.
- **Enhanced Observability**: New Taxonomy Diagnostics block in the UI and exports provide real-time metrics on enrichment, ID parsing, and severity clamping.
- **Regression Safety**: A comprehensive local Vitest suite now covers the entire taxonomy, normalization, and validation pipeline.

### Included Improvements

- **Subcategory Support**: Deeper taxonomy with explicit subcategories for all 32 layers.
- **Truthful Loading Metrics**: Accurate tracking of total issues processed during session imports.
- **Pure Logic Refactor**: Extracted testable helpers for export and session data shaping.
- **Consistent Exports**: JSON, Markdown, and CSV exports now include all enriched traceability and remediation fields.

### Packaging

- Current packaged output: `dist-electron-v4\MarkdownAuditor-portable.exe`
- **Security Note**: This build is unsigned. Windows may display a "Windows protected your PC" warning; users should select "More info" -> "Run anyway" to proceed.

## v1.0.0

Release date: 2026-03-29

Markdown Intelligence Auditor is now documented as a production-ready baseline for desktop Markdown auditing on Windows. This release brings the analysis pipeline, exports, and contributor docs into alignment with the actual runtime behavior.

### Highlights

- Production-grade normalization across both single-batch and multi-batch analysis runs
- Safer oversized-file handling through chunk-aware batching
- Incremental analysis with cache reuse for unchanged files (originally used `localStorage`)
- Session diffing with `new`, `resolved`, and `changed` issue states
- Root-cause grouping, detector traceability, and structured remediation guidance
- Provider presets, timeout/retry/token-budget controls, and portable Windows packaging

### Included In This Baseline

- 32 analytical layers and 256 micro-detectors
- Four deterministic runtime escalation rules
- JSON repair plus response validation before rendering
- Search, filtering, grouping, export, and session save/load workflows
- Updated repository docs: README, architecture, contributing guide, enhancements, and Gemini instructions

### Packaging

- Current packaged output: `dist-electron-v4\MarkdownAuditor-portable.exe`
- Packaging remains unsigned, so Windows trust prompts may still appear on some machines

### Recommended Next Steps

- Add code signing for release builds
- Add stricter validation for optional schema fields
- Improve local logic for chunking and diffing

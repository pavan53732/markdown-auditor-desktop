# Release Notes

## Unreleased

- **Runtime Service Extraction**: Shared chunking/batching/agent-pass execution now lives in `src/lib/agentMeshRuntime.js`, and session/history payload shaping now lives in `src/lib/sessionService.js`, making the runtime easier to test without changing the audit contract.
- **Workbench Controller Extraction**: Export generation, history comparisons, history persistence, and session import/export now route through `src/lib/workbenchController.js`, reducing coupling inside `src/App.jsx`.
- **Docs Truth Alignment**: Current-state docs now describe fresh upload analysis, legacy cache storage, and the dual portable/installer packaging flow more accurately.
- **Deterministic Governance / Execution / Interaction Rules**: The local rule engine now catches ambiguous requirement wording, governance checkpoint gaps, audit-trail requirements, execution-owner boundary clarity gaps, retry/backoff policy gaps, deterministic replay requirement gaps, commit-hash binding omissions, state-transition precondition/postcondition gaps, and UI-to-system-state mapping omissions before model synthesis.
- **Deterministic Task Graph + Interaction Intelligence**: The runtime now validates task-graph acyclicity, dependency ordering, disconnected task nodes, and priority propagation locally, and it now catches intent ambiguity, missing change-scope boundaries, user-intent consistency gaps, and interaction conflicts before model synthesis.
- **Deeper Governance / Execution / Dependency Determinism**: The rule engine now also catches governance-bypass patterns, control-plane override guard gaps, dependency ownership/lifecycle gaps, and parallel resource-ordering violations before model synthesis.
- **Windows Installer Flow**: The build now produces an NSIS installer alongside the portable `.exe`, adding Start Menu/Desktop shortcuts, uninstall support, installation-directory choice, and a cleaner installation path for non-technical users.
- **Universal Audit Mode Only**: Removed document-type profiles from the prompt layer, pre-analysis UI, cache identity, and history workbench. The app now always runs the full universal taxonomy without profile-specific weighting.
- **Fresh Upload Analysis**: Matching file content no longer reuses old cached findings during live analysis runs. Each upload is analyzed fresh, while the legacy cache controls remain available only for clearing old stored cache data.
- **History Workbench Simplification**: History filtering now focuses on model and source, matching the new universal-mode runtime.
- **Prompt Payload Efficiency**: The live 8-agent runtime continues to use scoped prompt compaction, and the local verification suite now covers 230 tests across 23 files.
- **Malformed Agent Response Recovery**: The runtime now retries malformed agent JSON per pass, hardens JSON repair for common object-literal mistakes, surfaces captured bad-response previews in diagnostics, and degrades gracefully by skipping a still-malformed agent pass instead of aborting the entire audit.
- **Adaptive Timeout Recovery**: Analysis requests now grow their timeout window based on prompt size, and an agent pass that still times out is skipped in degraded mode with a recorded timeout warning instead of failing the entire batch immediately.
- **Hardened Timeout Defaults**: Saved configs below the safe timeout floor are automatically upgraded, the default timeout is now higher for large audits, and the results summary calls out degraded-mode timeout skips explicitly.
- **Adaptive Analysis Output Budgeting**: The Electron main-process analysis call now uses an adaptive output-token budget instead of a fixed `8000` cap, reducing truncation risk for issue-dense audits while still backing off when providers reject higher output budgets.
- **Strict Unknown Detector Rejection**: AI-result validation now rejects unknown detector IDs outright instead of allowing them through as soft warnings.
- **Deterministic Markdown Anchor Enrichment**: The renderer now builds a local Markdown index for headings and section ranges, then enriches findings with `section_slug`, `line_end`, `document_anchor`, and anchored evidence references based on actual Markdown evidence before dedupe, export, history save, and session reload.
- **Cross-File Multi-Anchor Resolution**: Cross-file findings can now preserve multiple resolved Markdown anchors, and vague findings can fall back to deterministic heading inference when the document structure supports a unique section match.
- **Deterministic Cross-File Project Graph**: The renderer now builds a local project graph over the loaded Markdown set, groups shared headings, glossary terms, identifiers, workflows, requirements, states, APIs, actors, and document references, and enriches findings with canonical `detection_source` plus `cross_file_links` so cross-file drift has explicit related-location evidence.
- **Deterministic Local Rule Engine**: The runtime now evaluates a local rule layer before agent synthesis, catching broken heading hierarchy, orphan sections, duplicate headings, broken cross-references, RFC2119 misuse, ambiguous requirement wording, duplicated requirements, conflicting requirement strength, missing terminal states, rollback gaps, workflow ordering gaps, missing workflow exit criteria, governance checkpoint gaps, audit-trail requirements, execution-owner boundary clarity gaps, retry/backoff policy gaps, deterministic replay requirement gaps, commit-hash binding omissions, state-transition precondition/postcondition gaps, task-graph DAG/cycle violations, dependency-order gaps, disconnected task nodes, priority propagation mismatches, intent ambiguity, missing change-scope boundaries, user-intent consistency gaps, interaction conflicts, unresolved UI-to-system-state mappings, undefined reused identifiers, unresolved glossary bindings, API return/error/idempotency/rate-limit/auth contract gaps, terminology-registry gaps, malformed terminology registries, symbol inconsistency, state-space definition gaps, and input/output contract determinism without depending on the model alone, and it emits per-detector checked/clean/hit receipts.
- **Evidence-First Issue Schema**: Findings now preserve `document_anchors`, `evidence_spans`, `detection_source`, and `cross_file_links` consistently through runtime normalization, exports, and session/history reloads.
- **Typed Proof Chains**: Findings now preserve deterministic `proof_chains` so cross-file and multi-span evidence can be rendered as typed span-to-span edges such as `supports`, `contradicts`, `defines`, `depends_on`, `references`, and `violates`.
- **Owned Agent Coverage Reconciliation**: The eight-agent mesh now assigns every layer and detector to an explicit owning runtime agent, records owned detector ranges per pass, and reconciles finding-backed, checked, clean, quiet, and untouched owned coverage plus cross-scope findings in diagnostics, exports, and the summary dashboard.
- **Truthful Runtime Detector Coverage**: Result summaries, diagnostics, and exports now distinguish taxonomy-defined detectors from locally checked detectors, model finding-backed detectors, runtime-touched detectors, and untouched detectors instead of force-reporting full-catalog coverage after every run.
- **First-Class Reference Groups**: The project graph now preserves grouped document references so repeated Markdown links can enrich cross-file findings and typed proof chains with explicit reference semantics.
- **Deterministic Trust Scores, Proof Status, and Evidence Grades**: Each finding now receives a runtime-derived `trust_score`, `proof_status`, `trust_basis`, `trust_tier`, `evidence_grade`, `trust_reasons`, and `evidence_grade_reason`, and the summary dashboard/export pipeline surfaces average trust, high-trust issue counts, strong-evidence issue counts, and proof-backed vs receipt-backed vs hybrid-supported vs model-only splits.
- **Clear Trust Semantics**: Trust tiers are now described directly in the UI and exports as heuristic runtime weighting, deterministic local rules are surfaced as a partial trust spine instead of implied full proof, and `model_only` findings in `api_contract`, `specification_formalism`, `dependency_graph`, `execution_path`, `governance`, `deterministic_execution`, `control_plane_authority`, and `world_state_governance` are severity-capped so unsupported contract claims cannot overstate risk.
- **Unified Layer Numbering + Deeper Runtime UI**: Layer numbers now come from one source of truth in `layers.js`, the progress panel is stage-aware, and the summary/diagnostics surfaces now show graph groups, rule counts, owned-detector reconciliation, focus hits, out-of-focus findings, and mesh warnings instead of only generic progress or severity totals.
- **230 Automated Tests / 23 Test Files**: The local verification suite now covers deterministic trust-signal enrichment, proof-status/trust-basis validation, trust-tier/source-priority ordering, proof-aware severity gating, extracted report-format generation, extracted audit-pipeline coverage/escalation/merge behavior, extracted agent-mesh runtime behavior, extracted session-service normalization behavior, extracted workbench-controller behavior, deeper governance/execution/dependency deterministic-rule coverage, typed proof-chain generation and fallback generation, the rule-engine, receipt-backed detector coverage, richer graph/evidence paths, unified layer numbering, explicit agent-ownership reconciliation, adaptive timeout handling, hardened timeout normalization, and analysis-mesh runtime validation.
- **Clean Renderer Build Output**: The renderer chunking strategy now splits React cleanly without reintroducing circular-chunk warnings, so production builds and portable packaging complete without the previous Vite warning noise.

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

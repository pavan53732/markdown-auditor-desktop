# Changelog

All notable changes to this project should be documented in this file.

This changelog establishes the current production-ready baseline for the app as it exists in this repository.

## [Unreleased]

### Added

- **Layer-Level Deterministic Coverage Dashboard**: Added `src/lib/detectorCoverage.js` plus `src/components/LayerCoverageDashboard.jsx` so runtime summaries, diagnostics reloads, and Markdown exports now surface per-layer touched, locally checked, model-backed, untouched, and deterministic-vs-model-driven coverage snapshots instead of only whole-catalog totals.
- **UI-Shell Extraction**: Added `src/lib/useAuditWorkbench.js` and `src/components/DiagnosticsPanel.jsx` so `src/App.jsx` now acts as a thinner UI shell while extracted controller/hooks own most renderer-side analysis orchestration and diagnostics rendering.
- **Deterministic Rule Expansion To 99 Rules**: Expanded the local rule engine again with additional receipt-backed rules for snapshot isolation, memory conflict resolution, PSG write atomicity, read/write consistency, tool sandbox isolation, tool side-effect validation, forbidden direct tool writes, tool result validation, duplicate context assembly, context overflow handling, retrieval validation, retrieval relevance ranking, reasoning evidence binding, reasoning trace completeness, uncertainty propagation, evidence-free escalation, plus the earlier dependency, execution-path, governance, and control-plane expansions.
- **GitHub Releases Binary Distribution**: Windows `.exe` artifacts are now treated as generated release outputs that should be attached to GitHub Releases instead of being committed into the repository or tracked through Git LFS.
- **Windows Code-Signing Support**: Moved Electron Builder configuration into `electron-builder.config.cjs`, added `scripts/windowsSigningSupport.cjs`, `scripts/verifyWindowsSigning.cjs`, and `scripts/runSignedWindowsDist.cjs`, and introduced a gated `npm run dist:signed` workflow that supports dedicated certificate files, certificate-store SHA1 lookup, standard `CSC_LINK` / `WIN_CSC_LINK` flows, and Azure Trusted Signing without changing the default local unsigned build path.
- **More Deterministic Governance / Execution / Dependency Rules**: Expanded the local rule engine again with deterministic checks for missing execution triggers, execution idempotency gaps, execution-order indeterminism, policy-priority conflicts, enforcement-path gaps, authority-delegation ambiguity, policy-enforcement-point gaps, dependency-version ambiguity, transitive dependency conflicts, deadlock/livelock risk articulation, and output-determinism gaps.
- **Windows Installer Build**: Added an NSIS installer target alongside the portable package so the app now supports Start Menu/Desktop shortcuts, uninstall support, installation-directory selection, and a cleaner install flow for non-technical users.
- **Runtime Service Modules**: Added `src/lib/agentMeshRuntime.js` for shared chunking/batching/agent-pass execution logic and `src/lib/sessionService.js` for session/history payload normalization and persistence helpers.
- **Workbench Controller Extraction**: Added `src/lib/workbenchController.js` so export generation, history comparisons, history persistence, and session import/export flows no longer live entirely inside `src/App.jsx`.
- **Deterministic Governance / Execution / Interaction Rules**: Expanded the local rule engine with rule-backed checks for ambiguous requirement wording, governance checkpoint gaps, audit-trail requirements, execution-owner boundary clarity, retry/backoff policy gaps, deterministic replay prerequisites, commit-hash binding, state-transition preconditions/postconditions, and UI-to-system-state mapping contracts.
- **Deterministic Task Graph + Interaction Intelligence Systems**: Added local task-graph validation for DAG/cycle detection, dependency-order validation, disconnected-node detection, and priority propagation, plus interaction-intelligence checks for intent ambiguity, missing change-scope boundaries, user-intent consistency, and interaction conflicts using existing taxonomy detectors with receipt-backed coverage.
- **Deeper Governance / Execution / Dependency Determinism**: Expanded the local rule engine again with governance-bypass detection, control-plane override guard validation, dependency ownership/lifecycle checks, and parallel resource ordering validation so more formal contract failures are caught before model synthesis.
- **Deterministic Coverage Percentage Metrics**: Added deterministic-vs-model-driven catalog coverage percentages to runtime summaries, diagnostics, exports, and session reload normalization so coverage depth is visible instead of implied.
- **Audit Orchestrator Modularization**: Added `src/lib/auditOrchestrator.js`, `src/lib/pipelineController.js`, `src/lib/resultAggregator.js`, and `src/lib/executionStateController.js` so `src/App.jsx` no longer owns the full staged analysis pipeline inline.
- **More Deterministic Governance / Execution / Dependency Rules**: Added receipt-backed local rules for missing prerequisite-node detection, optional-vs-required dependency ambiguity, compliance-gate omission, execution-determinism gaps, and transition-determinism failures.
- **Deterministic Local Rule Engine**: Added `src/lib/ruleEngine/index.js` and integrated it into the staged audit pipeline so duplicate headings, broken cross-references, RFC2119 misuse, rollback gaps, workflow ordering/terminal-state issues, undefined reused identifiers, unresolved glossary bindings, API return/error/idempotency/rate-limit/auth contract gaps, terminology-registry gaps, malformed terminology registries, symbol inconsistency, state-space definition gaps, and input/output contract determinism can be caught locally before agent synthesis.
- **Evidence-First Schema Enrichment**: Findings now preserve structured `evidence_spans` alongside `document_anchor` / `document_anchors`, making exports, history reloads, and UI rendering less dependent on free-text evidence alone.
- **First-Class Analysis Mesh Runtime Model**: Each agent pass now produces a validated runtime summary with merge strategy, merge priority, focus-layer hits, focus-subcategory hits, dominant layers/subcategories, and validation warnings, and the merged audit output now carries an `analysis_mesh` summary instead of treating all passes as interchangeable prompt calls.
- **Typed Proof Chains**: Added deterministic `proof_chains` so findings can preserve typed span-to-span evidence edges such as `supports`, `contradicts`, `defines`, `depends_on`, `references`, and `violates` instead of only related-location links.
- **First-Class Reference Groups**: The deterministic project graph now groups repeated document references and uses those grouped references during cross-file enrichment and typed proof-chain generation instead of treating references as loose occurrence counts only.
- **Deterministic Trust Signals**: Added runtime-derived `trust_score`, `proof_status`, `trust_basis`, `trust_tier`, `evidence_grade`, `trust_reasons`, and `evidence_grade_reason` so issues can be ranked by structural support from rules, anchors, evidence spans, proof chains, cross-file links, and assumption leakage instead of severity alone, while distinguishing deterministic proof, receipt-backed support, hybrid support, and model-only inference.

### Fixed

- **Stale Report Reuse On Upload**: The renderer no longer reuses cached per-file findings during analysis runs, so every upload is analyzed fresh instead of surfacing an old report for matching file content.
- **Loose Agent Ownership Integration**: The 8-agent mesh now assigns every layer and detector to an explicit owning runtime agent, surfaces owned detector ranges per pass, and reconciles finding-backed owned coverage versus cross-scope findings after merge instead of relying only on focus metadata.
- **Packaged Main-Process Startup Crash**: Replaced the ESM-only `uuid` import in `electron/historyService.js` with Node's built-in `crypto.randomUUID()` so the packaged Electron main process no longer crashes on startup with `ERR_REQUIRE_ESM`.
- **Large Markdown Budget Wall**: Raised the minimum/default session token budget above 5 million and switched the old 6,000-token warning to a much higher batch target so large specs are chunked and batched instead of failing immediately on outdated defaults.
- **Oversized Agent Prompt Payloads**: Switched the live 8-agent runtime from sending the full detailed 701-detector catalog on every pass to a scoped prompt format with a compact full-taxonomy detector index plus rich focus-layer detector metadata per agent, substantially reducing per-pass prompt size for large audits.
- **Profile Drift in Universal Audits**: Removed document-type profiles from the runtime, prompt layer, pre-analysis UI, cache identity, and history workbench so the app now always runs in a single universal audit mode.
- **Malformed Agent JSON Failures**: Added stronger JSON repair, per-agent malformed-response retry, degraded-mode skipped-pass continuation, and captured raw-response diagnostics so a single bad agent pass is less likely to abort the whole audit without actionable evidence.
- **Provider Timeout Abortions**: Analysis requests now use adaptive timeout growth in the Electron main process, and an agent pass that still times out is skipped in degraded mode with a recorded timeout warning instead of crashing the whole batch immediately.
- **Low Timeout Config Drift**: Saved configs below the safe timeout floor are now normalized upward automatically, and the settings UI reflects the hardened default/minimum timeout so large audits stop failing on outdated timeout values.
- **History Diagnostics Loss**: Local history now preserves taxonomy diagnostics and malformed-agent trace data when reopening or comparing saved audits, instead of dropping them by saving only the bare results object.
- **Stale Filter State Across Audits**: Starting a new audit or resetting the workbench now clears stale subcategory and comparison state so earlier filters do not silently hide issues from the next run.
- **Fixed 8000 Output-Token Cap**: Replaced the fixed `max_tokens: 8000` analysis request cap in `electron/main.js` with an adaptive output-budget policy that expands on `finish_reason: "length"` and backs off when a provider rejects larger budgets.
- **Unknown Detector Soft-Warning**: AI-result validation now rejects unknown detector IDs instead of only logging warnings, preventing unsupported detector IDs from entering runtime results.
- **Weak Document Anchoring**: Added a deterministic Markdown indexing layer that parses headings, resolves section ranges, and enriches findings with file, section, line, and anchor metadata from the actual Markdown source before export, history save, and session reload.
- **Single-Anchor Cross-File Findings**: Deterministic anchoring now preserves multiple resolved anchors for cross-file findings and uses heading-inference fallback when evidence is too weak for a direct line match but the Markdown structure still yields a unique deterministic section.
- **Shallow Cross-File Graphing**: Expanded the deterministic cross-file Markdown project graph so it now models headings, glossary terms, identifiers, workflows, requirements, states, APIs, actors, and document references across loaded files, enriches findings with canonical `detection_source` values plus `cross_file_links`, and preserves the new evidence across UI rendering, exports, history reloads, and session normalization.
- **Fragile Layer Numbering**: Layer numbers, visible layer badges, and detector layer mapping now come from `src/lib/layers.js` as a single source of truth instead of depending on detector metadata object-key ordering.
- **Hidden Runtime Depth in UI**: Progress and summary surfaces now expose staged runtime progress, project-graph counts, deterministic rule counts, per-agent focus hits, mesh warnings, and merged findings instead of compressing everything into a generic spinner and severity-only cards.
- **Prompt and UI Encoding Drift**: Removed remaining encoding/polish cracks from the live prompt, runtime comments/messages, badges, and shipped UI controls so the runtime no longer carries mojibake in the main audit surfaces.
- **Renderer Bundle Warning Noise**: Simplified the Vite chunk split so the production renderer build no longer emits the earlier large-chunk warning or the follow-on circular-chunk warning during packaging verification.
- **Detector Coverage Ambiguity**: The deterministic rule engine now emits per-detector checked/clean/hit receipts, the analysis mesh reconciles checked/clean/hit/untouched ownership coverage per agent, and the UI/exports surface those receipt-backed metrics instead of treating every quiet detector as the same state.
- **False Full-Catalog Coverage Claims**: Runtime summaries and diagnostics no longer force `701/701` detector coverage after every run. They now report truthful receipt-backed and finding-backed coverage across locally checked detectors, model-backed detectors, runtime-touched detectors, and untouched detectors.
- **Weak Reference Semantics**: Cross-file graph summaries and session reloads now preserve first-class reference groups, so repeated Markdown references can participate in graph enrichment and typed proof chains the same way headings, identifiers, and requirement groups do.
- **Thin Deterministic Requirement/State Coverage**: The local rule engine now catches duplicated requirements, conflicting requirement strength, and missing terminal states in addition to the earlier structural/workflow/glossary checks.
- **Thin Deterministic API/Formalism Coverage**: The local rule engine now catches API return-schema omissions, missing error contracts, idempotency gaps, rate-limit ambiguity, auth-mechanism ambiguity, terminology-registry gaps, malformed registry sections, symbol inconsistency, undefined state-space symbols, and input/output contract determinism gaps instead of leaving those layers entirely model-driven.
- **App-Level Orchestration Hotspot**: Extracted runtime detector-coverage accounting, issue/root-cause deduplication, batch-result merging, and post-merge escalation into `src/lib/auditPipeline.js`, reducing orchestration weight inside `src/App.jsx` while keeping the live coverage math and merge behavior identical.
- **Docs Truth Drift**: Updated current-state docs so they describe fresh upload analysis, legacy cache storage, and the dual portable/installer packaging flow instead of older incremental-reuse and portable-only wording.

### Changed

- **Verification Coverage**: The local suite now covers 244 tests across 24 files, including Windows signing-config validation, layer-level coverage reporting, extracted `useAuditWorkbench` coverage, extracted diagnostics rendering support, new memory/tool/context/reasoning deterministic-rule coverage, and the earlier deterministic rule-engine, pipeline, and analysis-mesh coverage.
- **Hybrid Staged Pipeline**: The live runtime now follows a deeper staged flow of Markdown indexing -> deterministic rule evaluation -> cross-file project-graph analysis -> agent synthesis -> merge/severity calibration -> export/history persistence.
- **Trust Tier Ordering**: Findings now carry explicit trust tiers plus proof-backed, receipt-backed, hybrid-supported, and model-only summary splits, and same-severity ordering now weights stronger proof status and source-backed findings above pure model findings.
- **Proof-Aware Severity Gating**: `model_only` findings in `api_contract`, `specification_formalism`, `dependency_graph`, `execution_path`, `governance`, `deterministic_execution`, `control_plane_authority`, and `world_state_governance` are now capped at medium severity so unsupported formal-contract claims cannot overstate risk ahead of deterministic proof support.
- **Trust Messaging Honesty**: UI and export surfaces now explicitly describe trust tiers as heuristic runtime weighting and describe deterministic local rules as a partial trust spine rather than full formal proof.
- **Verification Coverage**: The local suite now covers 244 tests across 24 files, including dedicated trust-signal coverage, proof-status/trust-basis validation, trust-tier/source-priority ordering coverage, proof-aware severity gating coverage, report-format generation coverage, audit-pipeline coverage/escalation/merge coverage, extracted audit-orchestrator / pipeline-controller coverage, extracted agent-mesh runtime coverage, extracted session-service normalization coverage, extracted workbench-controller coverage, extracted `useAuditWorkbench` coverage, layer-level coverage dashboard coverage, evidence-graph coverage, proof-chain fallback coverage, rule-engine coverage, deterministic task-graph validation, deterministic interaction-intelligence validation, deeper governance/execution/dependency deterministic-rule coverage, new deterministic memory/tool/context/reasoning coverage, unified layer-numbering checks, explicit agent-ownership reconciliation, receipt-backed detector coverage, adaptive timeout handling, and richer validation/history expectations for evidence spans, typed proof chains, hybrid detection sources, and analysis-mesh runtime summaries.

## [1.13.0] - 2026-04-02
### Added

- **Universal Taxonomy Expansion (53 Layers / 701 Detectors)**: Extended the taxonomy with eight new universal audit layers covering ontology vocabulary governance, workflow lifecycle integrity, authority path integrity, artifact reproducibility, environment toolchain isolation, knowledge source authority, failure recovery integrity, and operational UX contracts.
- **Deterministic 8-Agent Analysis Mesh**: Added a fixed multi-pass runtime mesh (`analysisAgents.js`) with bounded roles for specification absoluteness, architecture authority, UI/operational integrity, execution/simulation, memory/world state, tool/deployment safety, reasoning/evidence, and cross-layer synthesis.
- **Strict Issue Schema Enrichment**: Added normalized fields for `failure_type`, `constraint_reference`, `violation_reference`, `contract_step`, `invariant_broken`, `authority_boundary`, `closed_world_status`, `analysis_agent`, `analysis_agents`, `assumption_detected`, `evidence_reference`, and `deterministic_fix`.
- **Extended Benchmark Coverage**: Added 8 new universal-audit fixtures and a dedicated `extendedUniversalBenchmarks.test.js` suite covering authority bypass, workflow skips, artifact reproducibility, toolchain isolation, knowledge-source authority, recovery-loop failure, and operational UX leakage scenarios.
- **Branded Windows Icon Assets**: Added a generated icon pipeline that produces both `build/icon.png` and `build/icon.ico`, giving the packaged Windows app a custom Markdown-audit icon instead of the Electron default.

### Changed

- **Cross-Layer Bundle Expansion**: Increased cross-layer bundles from 25 to 31 to cover vocabulary authority, workflow execution, authority/governance/world-state, artifact environment integrity, knowledge-memory-context, and operational UI contracts.
- **Runtime Orchestration**: `src/App.jsx` now executes eight deterministic analysis passes per batch, merges agent provenance, enriches diagnostics with mesh metrics, and exports the stricter issue fields across JSON, Markdown, and CSV outputs.
- **Cache Identity Hardening**: Incremental cache hashing now includes the analysis mesh version, selected profile, provider base URL, and model to avoid stale reuse across runtime-capability changes.
- **Progress and Issue UI Alignment**: Progress and issue rendering now surface mesh-aware status text, analysis-agent provenance, stricter traceability fields, and deterministic fix guidance.
- **Branding Surface Alignment**: The custom audit icon now appears in the top bar, loading state, and self-contained Markdown report header for a more consistent app identity.
- **Documentation and Tests**: Current-state docs now reflect the 53-layer / 701-detector baseline, and the local suite now covers 157 tests across 11 files with 29 benchmark fixtures.

### Fixed

- **Schema Wiring Consistency**: Prompt generation, repair/validation, normalization, exports, diagnostics, and issue-card rendering are now aligned for the expanded issue schema instead of leaving partially wired fields.
- **Taxonomy Runtime Truthfulness**: User-facing architecture and capability docs now describe the implemented universal taxonomy and agent mesh rather than the older 45-layer / 637-detector single-pass baseline.

## [1.12.0] - 2026-03-31

### Added

- **Taxonomy Expansion to 637 Detectors**: Extended the detector catalog from 612 to 637 code-defined micro-detectors across the existing 45 top-level layers. Four new detectors added: L44-14, L44-15, L45-15, L45-16.
- **related_layers Population**: Populated `related_layers` metadata for 191 deep-spec detectors (L33-L45, 13 layers) to support cross-layer traceability.
- **Cross-Layer Bundle Expansion**: Increased cross-layer bundles from 22 to 25, adding agent_memory_coordination, context_orchestration_execution, and deployment_resilience_contract.
- **Enhanced Taxonomy Coverage Helper**: Updated `taxonomyCoverageHelper.js` with `related_layers` coverage reporting for comprehensive taxonomy observability.
- **Benchmark Suite Growth**: The local automated suite increased from 95 to 136 tests overall, with benchmark fixtures covering control plane override abuse, evidence-free escalation, export non-determinism, simulation governance mismatch, tool side-effect leakage, UI fatal state, uncertainty dropped, and world state atomicity.

### Changed

- **Test Suite Growth**: Test suite now includes 136 tests across all test files, fully aligned to the 637-detector catalog.
- **Documentation Alignment**: All current-state documentation and runtime prompt text now reflect the 637-detector baseline, with `related_layers` described accurately as deep-spec cross-references.

## [1.11.0] - 2026-03-31

### Added

- **Taxonomy Expansion to 612 Detectors**: Extended the detector catalog from 383 to 612 code-defined micro-detectors across the existing 45 top-level layers. All layers now have deeper subcategory coverage with no thin-coverage gaps remaining.
- **Deterministic Benchmark Suite Additions**: Added new benchmark fixtures and a dedicated deep-spec benchmark test file exercising context contamination, deployment contradiction, governance bypass, non-deterministic replay, platform leakage, reasoning gaps, and UI omission detection paths.
- **Test Suite Stabilization**: Test suite now includes 83 tests across 10 test files covering taxonomy integrity, benchmark evaluation, normalization, validation, diagnostics, sessions, exports, cache, and history suites.

### Changed

- **Completeness Score Semantics**: Fixed completeness score clamping to ensure it never exceeds a maximum of 1.0.
- **Subcategory Mapping Fixes**: Corrected subcategory mappings for several detectors to ensure consistent category → subcategory → detector alignment during runtime normalization.
- **UI/Prompt/Docs Alignment**: All current-state documentation and runtime prompt text now reflect the 612-detector baseline.

## [1.10.0] - 2026-03-31

### Added

- **Deep-Spec Taxonomy Expansion (45 Layers / 383 Detectors)**: Extended the taxonomy from 40 to 45 top-level layers with 383 code-defined micro-detectors. The new layers cover Deterministic Execution, Control Plane Authority, and World State Governance, adding first-class detection for scheduling non-determinism, deadlock risks, plane-separation breaches, authority delegation gaps, state mutation invariant violations, and PSG gateway bypasses.
- **Deeper Subcategories and Detectors for Existing Deep Layers**: Expanded Reasoning Integrity, UI Surface Contract, Specification Formalism, Simulation & Verification, Memory & World Model, Agent Orchestration, Tool & Execution Safety, Deployment Contract, Platform Abstraction, and Context Orchestration layers with additional subcategories and detectors where coverage was thin.
- **Extended Benchmark Fixtures**: Added new benchmark test cases exercising control-plane, world-state, and deterministic-execution detector normalization paths.
- **Runtime Prompt Alignment**: System prompt now reflects 45 layers and 383 detectors with specific instructions for deep-spec auditing invariants.

### Changed

- Updated all current-state documentation (README, ARCHITECTURE, CONTRIBUTING, GEMINI, ENHANCEMENTS) to reflect the 45-layer/383-detector baseline.
- Removed temporary migration scripts used during the expansion pass.

## [1.9.0] - 2026-03-30

### Added

- **Next-Generation Taxonomy Expansion**: Upgraded the core taxonomy from 32 to 40 top-level layers to support strict execution/system specs (AstraBuild-style), adding layers for Specification Formalism, Simulation & Verification, Memory & World Model, Agent Orchestration, Tool & Execution Safety, Deployment Contract, Platform Abstraction, and Context Orchestration.
- **Deepened Existing Taxonomy**: Enriched existing layers (e.g. semantic, architectural, state_machine, resilience) with clearer, non-overlapping subcategories covering gaps like terminology registry enforcement, UI-to-system-state mapping, rollback infeasibility, and more.
- **Deterministic Pipeline Benchmarking**: Upgraded `taxonomyBenchmark.test.js` from a simple string matcher to a realistic deterministic pipeline test. It now routes mocked LLM responses through the real `jsonRepair` and `normalizeIssueFromDetector` logic to verify severity clamping and metadata backfilling.
- **AstraBuild-Style Benchmark Fixtures**: Added new benchmark fixtures validating strict agent execution and deployment rules against the new layers.
- **Detector Metadata Enhancements**: Added 32 new code-defined detectors for the new layers, enhanced `related_layers` cross-referencing, and tightened trigger patterns.
- **Taxonomy Coverage Helper**: Created and updated `taxonomyCoverageHelper.js` to analyze the new 40-layer catalog for thin coverage and missing metadata fields.

## [1.8.0] - 2026-03-29

### Added

- **Audit History Workbench**: Transformed the basic history list into a searchable, filterable, and editable local archive.
- **Comparison Workflows**: Integrated cross-session comparison allowing users to compare past history entries against the current run.
- **Enhanced History UI**: Added real-time search (by title, notes, files) and advanced filtering (by model, profile, source).
- **Editable Labels & Notes**: Users can now customize audit titles and add persistent notes to any history entry.
- **Import into History**: Added support for importing manually loaded session JSON files into the local history archive.
- **Automatic Retention**: Implemented a 50-entry history pruning policy to manage local storage footprint.
- **History Metadata Polish**: Enriched index with source type, custom notes, and root-cause count metadata.

### Changed

- Updated `HistoryModal` with a full-featured management toolbar.
- Standardized `buildHistoryMetadata` to support richer workbench features.

### Fixed

- Resolved UI layout inconsistencies in the history entry list.

## [1.7.0] - 2026-03-29

### Added

- **Local Audit History**: Automatic file-backed persistence of every successful analysis run.
- **History Browser**: New compact UI modal accessible from the top bar to browse, reopen, and delete past audits.
- Automated History Management: Dedicated `HistoryService` in the Electron layer handling index and session files.
- Metadata Indexing: Lightweight history index storing timestamps, file counts, issue summaries, and model info.
- Dedicated Testing: Added automated Vitest suite for the history metadata and normalization logic.

### Changed

- Updated `TopBar` to include an "Audit History" button for quick access.
- Integrated `normalizeLoadedSession` into the history opening flow to ensure consistent taxonomy enrichment.

### Fixed

- Improved consistency between manually loaded sessions and history-reopened sessions.

## [1.6.0] - 2026-03-29

### Added

- File-Backed Persistence: Migrated incremental analysis cache from browser `localStorage` to a local JSON file (`analysis_cache.json`) for improved reliability and scale.
- **Cache Hardening**: Implemented atomic writes (via temp files) to prevent cache corruption during crashes.
- **Resilience**: Added graceful handling for missing or corrupt cache files with automatic fallback to a safe state.
- **Dedicated Testing**: Added automated Vitest suite for the `CacheService` persistence layer.
- Cache Management: Added a "Clear Cache" button and real-time entry count display in the Settings modal.
- Improved Observability: Added cache stats (entry count, existence) to the Settings UI.

### Changed

- Enhanced `electron/main.js` with dedicated IPC handlers for safe filesystem access to the analysis cache.
- Updated `App.jsx` to orchestration cache lifecycle through the Electron preload bridge.

## [1.5.0] - 2026-03-29

### Added

- Fully migrated all 256 detectors to structured code metadata in `src/lib/detectorMetadata.js`
- Programmatic system prompt generation replacing legacy hardcoded detector lists
- Detector-aware validation for known category -> subcategory -> detector consistency
- Structured detector metadata fields: trigger patterns, required evidence, and false-positive guards
- Domain profiles (API Docs, Runbooks, PRD, etc.) wired to detector emphasis
- Cross-layer bundles for advanced correlation and escalation rules
- Release-consistency pass: reconciled versions and metadata for production readiness

### Changed
... (existing changes) ...

- Refactored `src/lib/systemPrompt.js` into a dynamic prompt builder
- Improved AI precision by providing explicit trigger and evidence rules per detector
- Updated documentation (README, ARCHITECTURE, CONTRIBUTING) to reflect the new taxonomy architecture

### Fixed

- Eliminated "hallucinated" subcategories through strict runtime validation against the taxonomy
- Synchronized detector IDs across prompt, validation, and UI

### Notes

- Unknown detector IDs currently warn during validation instead of failing hard

## [1.4.0] - 2026-03-29

### Added

- Diagnostics Visibility: Added `total_issues_loaded` to the Taxonomy Diagnostics UI block
- Extracted reusable pure helpers for JSON export and session shaping in `detectorMetadata.js`
- Deepened automated tests for session load normalization and data export shaping
- UI labeling improvements for taxonomy diagnostics clarity

### Changed

- Refactored `App.jsx` to use `buildExportData`, `buildSessionData`, and `normalizeLoadedSession` helpers
- Enforced consistent diagnostics persistence across JSON, Markdown, and Session formats

### Fixed

- Semantics of `total_issues_loaded`: now accurately reflects the total volume of issues processed during load/import
- Consistency between UI diagnostics block and exported report summaries

## [1.3.0] - 2026-03-29

### Added

- Local regression suite using Vitest covering taxonomy integrity, prompt generation, validation, and normalization
- Runtime taxonomy diagnostics: tracking enrichment, parsing, and clamping metrics during analysis
- Taxonomy observability UI: compact diagnostics block in the results summary area
- Markdown export enhancement: now includes structured taxonomy diagnostics summary
- New `npm test` script for local verification

### Fixed

- Resolved a taxonomy mismatch in the Knowledge Graph layer where 'circular references' was missing from subcategories
- Improved validation error messages for detector/layer and detector/subcategory mismatches

## [1.2.0] - 2026-03-29

### Added

- Taxonomy-driven runtime normalization: automatic metadata backfilling for `detector_name`, `subcategory`, and `layer`
- Severity bound enforcement: `severity_floor` and `severity_ceiling` metadata now clamping output severity at runtime
- Improved detector integrity policy: strict validation of Lx-yy ID format and semantic consistency
- Advanced UI controls: filtering by subcategory and grouping by subcategory
- Enhanced search: now covers `detector_id`, `detector_name`, and `subcategory` fields

### Changed

- Refactored validation to distinguish between malformed, unknown, and mismatched detector IDs
- Updated `IssueList` to support hierarchical grouping by subcategory
- UI filters now reset subcategory selection when the top-level layer filter changes

### Fixed

- Ensured metadata enrichment survives JSON/Markdown/CSV exports and session saves
- Improved robustness of detector ID parsing from description as a fallback

## [1.1.0] - 2026-03-29


### Added

- Electron + React desktop workflow for auditing `.md` and `.markdown` files
- 32 analytical layers with 256 micro-detectors
- Drag-and-drop Markdown intake and multi-file analysis
- Provider settings with validation, persistence, and OpenAI-compatible endpoint support
- Provider presets for OpenAI, Groq, OpenRouter, Ollama, Mistral, and custom endpoints
- Severity-based issue reporting with `critical`, `high`, `medium`, and `low`
- Search, layer filtering, and grouping by file, severity, layer, and root cause
- Detector traceability fields including `detector_id`, `why_triggered`, and `escalation_reason`
- Remediation fields including `recommended_fix`, `fix_steps`, `estimated_effort`, and `verification_steps`
- Session save/load support
- JSON, Markdown, and CSV export support
- Portable Windows packaging to `dist-electron-v4\MarkdownAuditor-portable.exe`
- `GEMINI.md` project instructions for Gemini CLI workflows

### Changed

- Batching now supports oversized files through chunk-aware splitting instead of sending one oversized file as a single request
- Normalization now runs for both single-batch and multi-batch analysis paths
- Runtime escalation and docs are aligned around four deterministic escalation rules
- Deduplication and diffing now use a shared stable issue identity strategy
- Markdown docs were refreshed to match current runtime behavior and packaging paths

### Fixed

- Fixed single-batch normalization gaps so deduplication, escalation, validation, and severity recount all run consistently
- Fixed multi-batch cache overwrite behavior during incremental analysis
- Fixed session diff lag caused by asynchronous previous-result state updates
- Fixed export coverage for newer traceability, remediation, and root-cause fields
- Fixed PostCSS config module-format warning during builds

### Known Limitations

- Incremental cache originally used renderer `localStorage` (migrated to file-backed in 1.6.0)
- Chunk overlap improves context retention, but some chunk-derived line mapping remains best effort
- The packaged Windows executable is currently unsigned

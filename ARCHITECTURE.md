# Architecture Documentation

## System Overview

Markdown Intelligence Auditor is a desktop application built with Electron, React, and Vite. It accepts Markdown files, sends chunked/batched requests to an OpenAI-compatible provider, deterministically indexes the source Markdown for headings and line anchors, builds a deterministic cross-file project graph over the loaded Markdown set, normalizes the returned findings, and presents a searchable, exportable audit report.

The current architecture supports:

- 53 analytical layers with 701 code-defined micro-detectors
- Full structured detector metadata (trigger patterns, evidence, FP guards)
- Programmatic system prompt generation using a dynamic builder and fixed agent-role prompts
- Detector-aware validation for known detector/category/subcategory combinations
- A single universal audit mode that always applies the full taxonomy without document-type profile weighting
- 31 cross-layer logical bundles
- Deterministic 8-agent analysis mesh with bounded, mergeable passes
- chunk-aware batching for large files
- deterministic runtime normalization
- deterministic Markdown indexing and anchor enrichment for file/section/line evidence, heading-inference fallback, multi-anchor cross-file resolution, and evidence-span construction
- deterministic local rule-engine enforcement for duplicate headings, broken cross-references, RFC2119 misuse, duplicated requirements, requirement-strength conflicts, missing terminal states, rollback gaps, workflow ordering/terminal-state issues, undefined reused identifiers, unresolved glossary bindings, API return/error/idempotency/rate-limit/auth contract gaps, terminology-registry gaps, malformed terminology registries, symbol inconsistency, state-space definition gaps, and input/output contract determinism
- deterministic cross-file project graph enrichment for headings, glossary terms, identifiers, workflows, requirements, states, APIs, actors, and document references, including first-class reference grouping
- deterministic typed proof-chain enrichment with span-to-span evidence edges
- truthful receipt-backed runtime coverage accounting for taxonomy-defined, locally checked, model finding-backed, runtime-touched, and untouched detectors
- deterministic trust-score, proof-status, trust-basis, trust-tier, and evidence-grade enrichment so issues can be ranked by structural support and source-backed strength instead of severity alone, with trust tiers presented as heuristic weighting rather than formal proof, proof status explicitly distinguishing deterministic proof, deterministic receipts, hybrid support, and model-only inference, and `model_only` findings in `api_contract` / `specification_formalism` capped so unsupported formal-contract claims cannot overstate severity
- fresh per-upload analysis without runtime reuse of cached findings
- session diffing and root-cause grouping
- **Audit History Workbench** for local session management
- portable Windows packaging

## Runtime Architecture

```text
Electron Main Process
- window creation
- config persistence
- provider validation
- AI API execution via OpenAI SDK
- History Service (index and session management)
- Cache Service (file-backed storage)

Renderer Process (React)
- file intake and local UI state
- hashing, caching, batching, merging, diffing
- taxonomy orchestration (layers, universal audit mode, bundles, subcategories, detectors, agent mesh)
- deterministic 8-pass agent execution with first-class per-agent validation, merge strategies, and focus-hit summaries
- taxonomy-driven normalization: metadata backfilling and severity clamping
- result rendering with advanced subcategory filtering and grouping
- renderer-branded asset usage for the top bar, progress state, and Markdown export header
- deterministic rule-engine, project-graph enrichment, and cross-file/evidence-span preservation in exports/history
- History Workbench UI (search, filter, sort, edit, compare)
- export generation (JSON, Markdown, CSV) using dedicated report-format helpers, plus extracted audit-pipeline helpers for runtime coverage accounting and post-merge escalation

Provider Layer
- OpenAI-compatible endpoint
- timeout / retry controls
- JSON response consumed, validated (strict semantic consistency), and normalized in renderer
```

## Directory Structure

```text
.
|-- GEMINI.md
|-- package.json
|-- vite.config.mjs
|-- tailwind.config.js
|-- postcss.config.js
|-- electron/
|   |-- main.js
|   |-- preload.js
|   |-- cacheService.js
|   `-- historyService.js
|-- src/
|   |-- App.jsx
|   |-- main.jsx
|   |-- index.html
|   |-- index.css
|   |-- components/
|   |   |-- AnalyzeButton.jsx
|   |   |-- DiffSummaryPanel.jsx
|   |   |-- FileDropZone.jsx
|   |   |-- HistoryModal.jsx
|   |   |-- IssueCard.jsx
|   |   |-- IssueList.jsx
|   |   |-- LayerFilterBar.jsx
|   |   |-- ProgressPanel.jsx
|   |   |-- SettingsModal.jsx
|   |   |-- SummaryDashboard.jsx
|   |   `-- TopBar.jsx
|   `-- lib/
|       |-- analysisAgents.js
|       |-- auditPipeline.js (Runtime coverage accounting and post-merge escalation helpers)
|       |-- crossLayerBundles.js
|       |-- detectorMetadata.js (Source of truth for 701 detectors)
|       |-- auditMode.js
|       |-- evidenceGraph.js (Deterministic typed proof-chain enrichment)
|       |-- exportFormats.js (Markdown and CSV report generation)
|       |-- jsonRepair.js (Advanced semantic validation)
|       |-- layers.js
|       |-- markdownIndex.js (Deterministic Markdown heading/anchor indexing and evidence spans)
|       |-- projectGraph.js (Deterministic cross-file Markdown relationship graph)
|       |-- ruleEngine/
|       |   `-- index.js (Deterministic local rule engine)
|       |-- taxonomyCoverageHelper.js (Per-layer density, richness, subcategory, and bundle coverage analysis)
|       `-- systemPrompt.js (Dynamic prompt generator for the deterministic agent mesh)

## Taxonomy Verification and Diagnostics

The system supports a local verification workflow with deepened 53-layer coverage:

1.  **Integrity Validation**: Local automated tests verify the 701-detector catalog against the 53-layer schema.
2.  **Semantic Enforcement**: Validation logic ensures that AI-reported detector IDs, layers, and subcategories are mutually consistent.
3.  **Benchmark Evaluation**: Canonical Markdown fixtures across `taxonomyBenchmark.test.js`, `deepSpecBenchmarks.test.js`, and `extendedUniversalBenchmarks.test.js` exercise deterministic taxonomy validation, normalization, and detector mapping behavior across 29 benchmark fixtures.
4.  **Expanded Coverage**: The benchmark suites now cover deep-spec and universal-audit scenarios such as authority bypass, workflow skips, export non-determinism, simulation governance mismatch, tool side-effect leakage, UI fatal state, uncertainty drops, artifact reproducibility gaps, toolchain leakage, recovery loop collapse, operational UX leakage, prompt compaction behavior, history metadata migration, runtime budget normalization, deterministic Markdown anchor enrichment, deterministic rule-engine enforcement, deterministic project-graph linking, typed proof-chain generation, proof-chain fallback generation, multi-anchor cross-file resolution, unified layer numbering, explicit agent-ownership reconciliation, receipt-backed detector coverage, adaptive timeout handling, deterministic trust-signal enrichment, proof-status/trust-basis validation, trust-tier/source-priority ordering, proof-aware severity gating, extracted report-format generation, extracted audit-pipeline coverage/escalation/merge coverage, and first-class analysis-mesh validation. The full local suite currently contains 213 tests across 20 files.
5.  **Enhanced Taxonomy Coverage Helper**: `taxonomyCoverageHelper.js` provides per-layer density analysis, richness metrics, subcategory coverage tracking, bundle coverage analysis, and `related_layers` coverage reporting for comprehensive taxonomy observability.
6.  **Runtime Diagnostics**: The application tracks enrichment, parsing, clamping, Markdown indexing, deterministic anchor assignment, evidence-span construction, typed proof-chain construction, multi-anchor resolution, fallback anchor assignment, rule-engine issue counts, rule-engine checked/clean/hit detector receipts, project-graph grouping, reference-group counts, graph-link enrichment, per-agent focus-layer and focus-subcategory hits, owned-layer / owned-detector hits, checked-clean-untouched ownership metrics, truthful runtime detector coverage metrics, trust-score/proof-status/trust-basis/trust-tier/evidence-grade enrichment, source-backed trust summary splits, cross-scope findings, and first-class analysis-mesh validation metrics during analysis and session loading.
7.  **Observability**: Diagnostics are surfaced in the UI results summary and exports to ensure pipeline transparency, including indexed files, indexed headings, project-graph grouping counts for headings/terms/identifiers/workflows/requirements/states/APIs/actors/references, deterministic anchor assignments, evidence-span enrichments, typed proof-chain counts, deterministic rule counts and execution receipts, graph-link enrichments, multi-anchor counts, fallback-anchor counts, configured agent count, completed passes, owned-detector reconciliation metrics, runtime detector coverage metrics, trust metrics, mesh warnings, and merged findings.
|-- build/
|   |-- icon.ico
|   `-- icon.png
|-- dist/
`-- dist-electron-v4/
    `-- MarkdownAuditor-portable.exe
```

## Main Processes

### Electron Main Process

`electron/main.js` is responsible for:

- creating the application window
- reading and writing config in `%APPDATA%\MarkdownAuditor\config.json`
- managing the `CacheService` for analysis reuse
- managing the `HistoryService` for audit persistence
- validating provider connectivity
- sending chat-completions requests with timeout and retry settings

### Electron Preload

`electron/preload.js` exposes a bridge for:

- config persistence (`readConfig`, `writeConfig`)
- cache management (`readCache`, `writeCache`, `clearCache`, `getCacheStats`)
- history management (`listHistory`, `readHistorySession`, `addHistorySession`, `updateHistorySession`, `deleteHistorySession`, `clearHistory`, `pruneHistory`)
- API execution (`validateAPI`, `callAPI`)

### React Renderer

`src/App.jsx` is the orchestration layer for:

- file intake
- hashing and incremental cache lookup
- chunking and batching
- API request orchestration
- deterministic Markdown indexing
- deterministic local rule-engine evaluation
- deterministic cross-file project-graph construction
- 8-pass deterministic agent execution using `analysisAgents.js`
- JSON repair and response validation
- deterministic Markdown indexing and evidence-to-line enrichment
- deterministic project-graph construction and cross-file related-location enrichment
- evidence-span enrichment, typed proof-chain construction, and evidence-source normalization
- merge, deduplication, escalation, and cross-layer validation
- history management and comparison workflows
- diffing and root-cause-aware grouping
- export and session save/load

`src/lib/detectorMetadata.js` is the taxonomy source of truth for:

- layer subcategories
- all 701 detector definitions
- detector prompt generation helpers
- known-detector validation helpers
- detector-driven defaults for `failure_type`, `constraint_reference`, `contract_step`, `invariant_broken`, `authority_boundary`, `closed_world_status`, `evidence_reference`, and `deterministic_fix`
- session/export normalization for `detection_source`, `cross_file_links`, `document_anchors`, `evidence_spans`, and `proof_chains`
- pure helpers for export and session data shaping (`buildExportData`, `buildSessionData`, `normalizeLoadedSession`, `resolveInitialCache`, `buildHistoryMetadata`)

## Key UI Components

| Component | Responsibility |
|----------|----------------|
| `TopBar.jsx` | title, provider status, history access, settings access |
| `SettingsModal.jsx` | provider config, presets, cache management, token budget |
| `HistoryModal.jsx` | history browser workbench: search, filter, sort, edit, compare |
| `FileDropZone.jsx` | drag-and-drop and file selection |
| `AnalyzeButton.jsx` | audit trigger state |
| `ProgressPanel.jsx` | stage-aware runtime progress with indexing, graph, rule-engine, agent, batch, and finalize visibility |
| `SummaryDashboard.jsx` | severity summary plus runtime depth cards for graph groups, rule issues, owned-detector reconciliation, mesh passes, focus hits, reuse, and merge warnings |
| `DiffSummaryPanel.jsx` | comparison between two audits |
| `LayerFilterBar.jsx` | category/layer filtering |
| `IssueList.jsx` | flat and grouped issue views |
| `IssueCard.jsx` | issue detail rendering including traceability, typed proof chains, and remediation |

## Component Tree

```text
App
|-- TopBar
|-- SettingsModal
|-- HistoryModal
|-- FileDropZone
|-- AnalyzeButton
|-- ProgressPanel
`-- Results View
    |-- SummaryDashboard
    |-- DiffSummaryPanel
    |-- Search Box
    |-- Grouping Controls
    |-- LayerFilterBar
    `-- IssueList
        `-- IssueCard
```

## Renderer State Model

### Primary State

| Variable | Description |
|----------|-------------|
| `config` | provider configuration including timeout/retry/token budget |
| `configLoaded` | whether config has been loaded |
| `settingsOpen` | settings modal visibility |
| `files` | loaded markdown file objects |
| `analyzing` | analysis in progress flag |
| `results` | current audit result payload |
| `error` | error string if API or parsing fails |
| `activeLayer` | current layer filter |
| `activeSubcategory` | current subcategory filter |
| `searchQuery` | free-text issue search |
| `groupingMode` | flat / file / severity / layer / subcategory / root_cause |
| `diffMode` | whether comparison/diff mode is active |
| `previousResults` | prior results used for comparison |
| `diffSummary` | computed comparison summary |
| `historyOpen` | history workbench visibility |
| `historyList` | metadata index of past audits |
## Persistence

### Config

- stored in `%APPDATA%\MarkdownAuditor\config.json`

### Incremental Cache

- stored in `analysis_cache.json` under the app's local Electron user-data directory
- keyed by SHA-256 file hash
- automatically migrates legacy `localStorage` data on first launch if the file-backed store is empty
- **Resilience**: Uses atomic writes (write-to-temp then rename) to prevent file corruption.
- **Fault Tolerance**: If the cache file is missing or corrupted, the system falls back to an empty cache safely without interrupting analysis.

### Local Audit History (History Workbench)

- stored under `history/` in the app's local Electron user-data directory
- `index.json`: lightweight metadata index for the history browser
- `sessions/*.json`: full session result payloads keyed by unique UUIDs
- sessions are automatically saved after every successful analysis run
- **Workbench Features**: Search, filter, sort, editable labels/notes, and cross-session comparison.
- **Retention**: Automatically maintains the most recent 50 entries.

### Saved Sessions

- exported and reloaded as JSON files
- include selected files, result payload, and taxonomy diagnostics
- re-enriched automatically on load to ensure taxonomy consistency and update diagnostics

## Build and Packaging

Build steps:

1. `npm run build`
2. `npm run dist`

Current packaged output:

- `dist-electron-v4\MarkdownAuditor-portable.exe`

Packaging notes:

- Electron Builder is configured for a Windows portable target
- code signing is currently disabled / not configured

## Security Posture

- `contextIsolation: true`
- `nodeIntegration: false`
- only a narrow preload bridge is exposed to the renderer
- provider config is stored under `%APPDATA%\MarkdownAuditor\config.json`
- no general filesystem access is exposed to the renderer

## Known Constraints

- file-backed cache improves reliability, but very large cache files (>50MB) may still impact initial load performance
- chunk overlap improves context preservation, but chunk-derived line ranges should be treated as best effort when overlap is involved
- full diff accuracy still depends on stable model output across repeated runs
- anchor enrichment is deterministic but still limited by the quality of the model-provided evidence text when a finding does not already include a usable section or file hint
- results and sessions include automated taxonomy diagnostics for pipeline observability

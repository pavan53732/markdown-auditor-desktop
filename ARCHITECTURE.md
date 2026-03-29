# Architecture Documentation

## System Overview

Markdown Intelligence Auditor is a desktop application built with Electron, React, and Vite. It accepts Markdown files, sends chunked/batched requests to an OpenAI-compatible provider, normalizes the returned findings, and presents a searchable, exportable audit report.

The current architecture supports:

- 32 analytical layers with 256 code-defined micro-detectors
- Full structured detector metadata (trigger patterns, evidence, FP guards)
- Programmatic system prompt generation using a dynamic builder
- Detector-aware validation for known detector/category/subcategory combinations
- Domain-aware profiles (e.g. API Docs, Runbooks)
- Cross-layer logical bundles
- chunk-aware batching for large files
- deterministic runtime normalization
- incremental cache reuse for unchanged files
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
- taxonomy orchestration (profiles, bundles, subcategories, detectors)
- taxonomy-driven normalization: metadata backfilling and severity clamping
- result rendering with advanced subcategory filtering and grouping
- History Workbench UI (search, filter, sort, edit, compare)
- export generation (JSON, Markdown, CSV)

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
|-- vite.config.js
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
|       |-- crossLayerBundles.js
|       |-- detectorMetadata.js (Source of truth for 256 detectors)
|       |-- domainProfiles.js
|       |-- jsonRepair.js (Advanced semantic validation)
|       |-- layers.js
|       `-- systemPrompt.js (Dynamic prompt generator)

## Taxonomy Verification and Diagnostics

The system supports a local verification workflow:

1.  **Integrity Validation**: Local automated tests verify the 256-detector catalog against the 32-layer schema.
2.  **Semantic Enforcement**: Validation logic ensures that AI-reported detector IDs, layers, and subcategories are mutually consistent.
3.  **Runtime Diagnostics**: The application tracks enrichment, parsing, and clamping metrics during analysis and session loading.
4.  **Observability**: Diagnostics are surfaced in the UI results summary and exports to ensure pipeline transparency.
|-- build/
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
- JSON repair and response validation
- merge, deduplication, escalation, and cross-layer validation
- history management and comparison workflows
- diffing and root-cause-aware grouping
- export and session save/load

`src/lib/detectorMetadata.js` is the taxonomy source of truth for:

- layer subcategories
- all 256 detector definitions
- detector prompt generation helpers
- known-detector validation helpers
- pure helpers for export and session data shaping (`buildExportData`, `buildSessionData`, `normalizeLoadedSession`, `resolveInitialCache`, `buildHistoryMetadata`)

## Key UI Components

| Component | Responsibility |
|----------|----------------|
| `TopBar.jsx` | title, provider status, history access, settings access |
| `SettingsModal.jsx` | provider config, presets, cache management, token budget |
| `HistoryModal.jsx` | history browser workbench: search, filter, sort, edit, compare |
| `FileDropZone.jsx` | drag-and-drop and file selection |
| `AnalyzeButton.jsx` | audit trigger state |
| `ProgressPanel.jsx` | in-progress audit status |
| `SummaryDashboard.jsx` | severity summary cards |
| `DiffSummaryPanel.jsx` | comparison between two audits |
| `LayerFilterBar.jsx` | category/layer filtering |
| `IssueList.jsx` | flat and grouped issue views |
| `IssueCard.jsx` | issue detail rendering including traceability and remediation |

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
| `domainProfile` | currently selected evaluation domain profile |
| `activeLayer` | current layer filter |
| `activeSubcategory` | current subcategory filter |
| `searchQuery` | free-text issue search |
| `groupingMode` | flat / file / severity / layer / subcategory / root_cause |
| `diffMode` | whether comparison/diff mode is active |
| `previousResults` | prior results used for comparison |
| `diffSummary` | computed comparison summary |
| `historyOpen` | history workbench visibility |
| `historyList` | metadata index of past audits |
| `fileHashes` | current per-file SHA-256 hashes |
| `cachedResults` | incremental cache keyed by file hash |

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
- unknown detector IDs currently warn instead of failing hard during validation
- results and sessions include automated taxonomy diagnostics for pipeline observability

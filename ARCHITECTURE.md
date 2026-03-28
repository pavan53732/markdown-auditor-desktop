# Architecture Documentation

## System Overview

Markdown Intelligence Auditor is a desktop application built with Electron, React, and Vite. It accepts Markdown files, sends chunked/batched requests to an OpenAI-compatible provider, normalizes the returned findings, and presents a searchable, exportable audit report.

The current architecture supports:

- 32 analytical layers and 256 micro-detectors
- chunk-aware batching for large files
- deterministic runtime normalization
- incremental cache reuse for unchanged files
- session diffing and root-cause grouping
- portable Windows packaging

## Runtime Architecture

```text
Electron Main Process
- window creation
- config persistence
- provider validation
- AI API execution via OpenAI SDK

Renderer Process (React)
- file intake and local UI state
- hashing, caching, batching, merging, diffing
- result rendering, filtering, grouping, exporting

Provider Layer
- OpenAI-compatible endpoint
- timeout / retry controls
- JSON response consumed and normalized in renderer
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
|   `-- preload.js
|-- src/
|   |-- App.jsx
|   |-- main.jsx
|   |-- index.html
|   |-- index.css
|   |-- components/
|   |   |-- AnalyzeButton.jsx
|   |   |-- DiffSummaryPanel.jsx
|   |   |-- FileDropZone.jsx
|   |   |-- IssueCard.jsx
|   |   |-- IssueList.jsx
|   |   |-- LayerFilterBar.jsx
|   |   |-- ProgressPanel.jsx
|   |   |-- SettingsModal.jsx
|   |   |-- SummaryDashboard.jsx
|   |   `-- TopBar.jsx
|   `-- lib/
|       |-- jsonRepair.js
|       |-- layers.js
|       `-- systemPrompt.js
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
- validating provider connectivity
- sending chat-completions requests with timeout and retry settings

### Electron Preload

`electron/preload.js` exposes a narrow bridge:

- `readConfig`
- `writeConfig`
- `validateAPI`
- `callAPI`

### React Renderer

`src/App.jsx` is the orchestration layer for:

- file intake
- hashing and incremental cache lookup
- chunking and batching
- API request orchestration
- JSON repair and response validation
- merge, deduplication, escalation, and cross-layer validation
- diffing and root-cause-aware grouping
- export and session save/load

## Key UI Components

| Component | Responsibility |
|----------|----------------|
| `TopBar.jsx` | title, provider status, settings access |
| `SettingsModal.jsx` | provider config, presets, timeout/retry/token budget |
| `FileDropZone.jsx` | drag-and-drop and file selection |
| `AnalyzeButton.jsx` | audit trigger state |
| `ProgressPanel.jsx` | in-progress audit status |
| `SummaryDashboard.jsx` | severity summary cards |
| `DiffSummaryPanel.jsx` | comparison with previous audit |
| `LayerFilterBar.jsx` | category/layer filtering |
| `IssueList.jsx` | flat and grouped issue views |
| `IssueCard.jsx` | issue detail rendering including traceability and remediation |

## Component Tree

```text
App
|-- TopBar
|-- SettingsModal
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
| `error` | user-visible error message |
| `activeLayer` | current layer filter |
| `searchQuery` | free-text issue search |
| `groupingMode` | flat / file / severity / layer / root_cause |
| `diffMode` | whether diff-focused issue mode is active |
| `previousResults` | previous in-memory audit for comparison |
| `diffSummary` | computed comparison summary |
| `exportMenuOpen` | export menu visibility |
| `contextWarning` | token-budget warning for large inputs |
| `fileHashes` | current per-file SHA-256 hashes |
| `cachedResults` | incremental cache keyed by file hash |
| `analysisStats` | reused vs reanalyzed counts |

### Derived State

| Variable | Description |
|----------|-------------|
| `providerConfigured` | all main provider fields present |
| `canAnalyze` | enough configuration exists to send analysis requests |
| `filteredIssues` | search-filtered issue list |

## IPC Surface

| Channel | Direction | Purpose |
|---------|-----------|---------|
| `config:read` | renderer -> main | load provider config |
| `config:write` | renderer -> main | persist provider config |
| `api:validate` | renderer -> main | lightweight provider connectivity test |
| `api:call` | renderer -> main | execute the full audit request |

## Analysis Flow

### 1. File Intake

- User drops or selects `.md` / `.markdown` files
- Renderer stores `{ name, content }`
- SHA-256 hash is computed for each file

### 2. Incremental Reuse

- Hashes are checked against `localStorage` cache
- Unchanged files reuse prior per-file results
- Changed or uncached files go through analysis

### 3. Chunking and Batching

- Oversized files are split into chunks
- Chunks are batched under a token budget
- Requests are sent sequentially per batch

### 4. Parse and Validate

- Markdown fences are stripped if present
- malformed JSON gets repaired when possible
- top-level and per-issue fields are validated before use

### 5. Merge and Normalize

- batch and cached results are merged
- issue identity is normalized with a shared stable key
- deduplication runs on the merged result set
- deterministic escalation rules run after deduplication
- cross-layer validation updates issue metadata
- severity counts are recalculated

### 6. Render and Export

- results can be searched, filtered, diffed, and grouped
- exports are available in JSON, Markdown, and CSV
- sessions can be saved to disk and reloaded

## Stable Identity and Diffing

The app uses a shared issue identity strategy for both deduplication and audit comparison.

Identity is based on:

- `detector_id` or detector parsed from description
- primary file
- section
- line number when present
- stable description/evidence fingerprint fallback when line number is missing

This keeps dedupe and diffing aligned instead of using separate matching heuristics.

## Escalation Rules

Runtime escalation currently implements four deterministic rules:

1. 3 or more medium issues in the same section -> high
2. security + performance on the same component -> critical
3. completeness + functional missing-step issues -> high
4. contradiction + intent conflict in the same section -> high

Escalation rationale is stored in `escalation_reason`.

## Result Schema

### Top-Level Structure

```json
{
  "summary": {},
  "issues": [],
  "root_causes": []
}
```

### Issue Fields

Important issue fields include:

- `severity`
- `category`
- `detector_id`
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

### Root Cause Fields

- `id`
- `title`
- `description`
- `impact`
- `child_issues`

### Example Issue Object

```json
{
  "id": "1",
  "severity": "critical",
  "category": "architectural",
  "detector_id": "L8-02",
  "layer": "architectural",
  "files": ["file.md"],
  "section": "Architecture",
  "line_number": 42,
  "description": "[L8-02] Missing component: API gateway not defined in architecture",
  "evidence": "Direct quote from the documentation",
  "why_triggered": "Traffic routing is described but the gateway component is never defined.",
  "escalation_reason": "Escalated to critical because the missing component creates a high-risk ambiguity.",
  "confidence": 0.95,
  "impact_score": 8,
  "fix_difficulty": "moderate",
  "estimated_effort": "2-4 hours",
  "related_issues": ["2"],
  "root_cause_id": "RC-01",
  "recommended_fix": "Add a dedicated API gateway section.",
  "fix_steps": [
    "Define the gateway component",
    "Document its responsibilities",
    "Update the architecture diagram"
  ],
  "verification_steps": [
    "Verify the gateway appears in diagrams",
    "Verify responsibilities are documented"
  ],
  "tags": ["api", "architecture"],
  "references": ["https://example.com/spec"]
}
```

## Persistence

### Config

- stored in `%APPDATA%\MarkdownAuditor\config.json`

### Incremental Cache

- stored in renderer `localStorage`
- keyed by SHA-256 file hash

### Saved Sessions

- exported and reloaded as JSON files
- include selected files and result payload

## Build and Packaging

Build steps:

1. `npm run build`
2. `npm run dist`

Portable output:

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

## Error Handling Overview

| Situation | Current Handling |
|----------|------------------|
| missing config | analyze button remains disabled |
| provider validation failure | inline error shown in settings modal |
| API failure | user-visible analysis error message |
| malformed AI JSON | repair attempt first, then hard error |
| invalid schema | validation failure message |
| unsupported file type | silently ignored by the drop zone |

## Dependencies

### Runtime

- `openai`

### Development

- `electron`
- `electron-builder`
- `react`
- `react-dom`
- `vite`
- `@vitejs/plugin-react`
- `tailwindcss`
- `postcss`
- `autoprefixer`

## Known Constraints

- Incremental cache currently uses `localStorage`, which may not scale well for very large projects
- chunk overlap improves context preservation, but chunk-derived line ranges should be treated as best effort when overlap is involved
- full diff accuracy still depends on stable model output across repeated runs

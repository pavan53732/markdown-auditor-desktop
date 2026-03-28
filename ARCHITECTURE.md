# Architecture Documentation

## System Overview

The Markdown Document Intelligence Auditor is an Electron desktop application that combines a React frontend with a Node.js backend (Electron main process) to analyze markdown files using AI providers. It features 32 analysis layers with 256 micro-detectors and a multi-phase reasoning engine.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Electron Main Process                 │
│  - Window management                                     │
│  - IPC handlers (config, API calls)                      │
│  - OpenAI SDK integration                                │
│  - File system access (config persistence)               │
└───────────────────────┬─────────────────────────────────┘
                        │ IPC (contextBridge)
┌───────────────────────┴─────────────────────────────────┐
│                   React Renderer Process                  │
│  - UI components (TopBar, SettingsModal, FileDropZone)   │
│  - State management (config, files, results, analyzing)  │
│  - User interaction handling                              │
│  - 32-layer filter system                                 │
└─────────────────────────────────────────────────────────┘
```

## Directory Structure

```
markdown-auditor/
├── package.json              # Project config, dependencies, build settings
├── vite.config.js            # Vite build configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── postcss.config.js         # PostCSS configuration
├── generate-icon.js          # Icon generation script
│
├── electron/
│   ├── main.js               # Electron main process
│   └── preload.js            # Context bridge (IPC exposure)
│
├── src/
│   ├── index.html            # HTML entry point
│   ├── main.jsx              # React entry point
│   ├── index.css             # Global styles (Tailwind)
│   ├── App.jsx               # Main application component
│   │
│   ├── components/
│   │   ├── TopBar.jsx        # Title + gear icon + provider status
│   │   ├── SettingsModal.jsx # AI provider configuration modal
│   │   ├── FileDropZone.jsx  # Drag-and-drop file upload
│   │   ├── AnalyzeButton.jsx # Trigger analysis button
│   │   ├── ProgressPanel.jsx # 33 rotating status messages
│   │   ├── SummaryDashboard.jsx # 5 metric cards
│   │   ├── LayerFilterBar.jsx # 32-layer filter pills
│   │   ├── IssueCard.jsx     # Expandable issue card
│   │   └── IssueList.jsx     # Filtered issue list
│   │
│   └── lib/
│       ├── layers.js         # 32 analysis layer definitions
│       ├── systemPrompt.js   # AI system prompt (32 layers, 256 detectors)
│       ├── configStore.js    # Config read/write helpers
│       └── aiClient.js       # AI API call builder
│
├── build/
│   └── icon.png              # App icon
│
├── dist/                     # Vite build output
└── dist-electron-v2/         # Electron-builder output
    └── MarkdownAuditor-portable.exe
```

## Component Architecture

### App.jsx (Root Component)

```
App
├── TopBar                    # Always visible
├── SettingsModal             # Conditional (settingsOpen)
├── FileDropZone              # Conditional (!results && !analyzing)
├── AnalyzeButton             # Conditional (!results && !analyzing)
├── ProgressPanel             # Conditional (analyzing)
└── Results View              # Conditional (results && !analyzing)
    ├── SummaryDashboard
    ├── Search Box
    ├── LayerFilterBar (32 layers)
    └── IssueList
        └── IssueCard (multiple)
```

## State Management

The app uses React's built-in state management with `useState` and `useEffect`.

### State Variables

| Variable | Type | Description |
|----------|------|-------------|
| `config` | `{ baseURL, apiKey, model }` | AI provider configuration |
| `configLoaded` | `boolean` | Whether config has been loaded |
| `settingsOpen` | `boolean` | Settings modal visibility |
| `files` | `[{ name, content }]` | Loaded markdown files |
| `analyzing` | `boolean` | Whether analysis is in progress |
| `results` | `object \| null` | Analysis results from AI |
| `error` | `string \| null` | Error message to display |
| `activeLayer` | `string` | Currently selected filter layer |
| `searchQuery` | `string` | Text search filter |
| `exportMenuOpen` | `boolean` | Export dropdown visibility |

### Derived State

| Variable | Formula | Description |
|----------|---------|-------------|
| `providerConfigured` | `!!(baseURL && apiKey && model)` | All 3 fields saved (for status dot) |
| `canAnalyze` | `!!(baseURL && model)` | Ready to analyze (apiKey optional) |
| `filteredIssues` | `issues.filter(search)` | Issues filtered by search query |

## IPC Communication

### Main Process Handlers

| Channel | Direction | Payload | Response |
|---------|-----------|---------|----------|
| `config:read` | Renderer → Main | none | `{ baseURL, apiKey, model }` |
| `config:write` | Renderer → Main | `{ baseURL, apiKey, model }` | `{ success: true }` |
| `api:validate` | Renderer → Main | `{ baseURL, apiKey, model }` | `{ success, message } \| { success, error }` |
| `api:call` | Renderer → Main | `{ baseURL, apiKey, model, systemPrompt, userMessage }` | `{ success, raw } \| { success, error }` |

## AI Integration

### Multi-Phase Reasoning Flow

The AI follows a deterministic 4-phase execution:

```
PHASE 1: SCAN
├── Read all provided files completely
├── Evaluate all 256 detectors across all 32 layers
├── Document which detectors were evaluated
├── Document which detectors were skipped (with reason)
└── Collect all raw findings

PHASE 2: CROSS-LAYER CORRELATION
├── Verify findings across layers do not contradict each other
├── Identify when multiple detectors flag the same root cause
├── Group related findings under a single root issue
└── Use related_issues field to link correlated findings

PHASE 3: SEVERITY ESCALATION
├── Rule 1: ≥3 medium issues same section → escalate to high
├── Rule 2: Critical issue → check if invalidates others
├── Rule 3: Security + Performance same component → critical
├── Rule 4: Completeness + Functional missing steps → high
└── Rule 5: Contradiction + Intent same content → high

PHASE 4: FINAL OUTPUT
├── Compile final JSON report
├── Include detectors_evaluated count (≤256)
├── Include detectors_skipped count with reasons
├── Verify all required fields present
└── Return ONLY raw JSON
```

### Analysis Layers (32 Total, 256 Detectors)

| Layer | ID | Detectors | Description |
|-------|----|----|----|
| 1 | contradiction | L1-01 to L1-08 | Direct/indirect contradictions, terminology inconsistency |
| 2 | logical | L2-01 to L2-08 | Logical fallacies, invalid assumptions, circular reasoning |
| 3 | structural | L3-01 to L3-08 | Broken hierarchy, missing sections, poor flow |
| 4 | semantic | L4-01 to L4-08 | Ambiguous statements, undefined terms, vague language |
| 5 | factual | L5-01 to L5-08 | Unsupported claims, missing citations, outdated info |
| 6 | functional | L6-01 to L6-08 | Functional impossibilities, broken workflows |
| 7 | temporal | L7-01 to L7-08 | Timeline contradictions, sequence errors |
| 8 | architectural | L8-01 to L8-08 | Architecture conflicts, component misalignment |
| 9 | completeness | L9-01 to L9-08 | Missing edge cases, incomplete workflows |
| 10 | intent | L10-01 to L10-08 | Goal misalignment, scope creep |
| 11 | metacognition | L11-01 to L11-08 | Overconfident claims, shallow reasoning |
| 12 | adversarial | L12-01 to L12-08 | Claims easily disproved, unaddressed failure modes |
| 13 | knowledge_graph | L13-01 to L13-08 | Entity relationship conflicts, orphaned concepts |
| 14 | quantitative | L14-01 to L14-08 | Calculation errors, unit inconsistencies |
| 15 | requirement | L15-01 to L15-08 | Requirement ambiguity, missing acceptance criteria |
| 16 | state_machine | L16-01 to L16-08 | Undefined states, invalid transitions |
| 17 | api_contract | L17-01 to L17-08 | Undefined parameters, missing return schema |
| 18 | dependency_graph | L18-01 to L18-08 | Circular dependency, missing dependency |
| 19 | data_flow | L19-01 to L19-08 | Missing data producer/consumer, transformation ambiguity |
| 20 | execution_path | L20-01 to L20-08 | Unreachable paths, dead-end workflows |
| 21 | configuration | L21-01 to L21-08 | Missing config keys, conflicting config |
| 22 | error_handling | L22-01 to L22-08 | Missing error paths, silent failure risks |
| 23 | security | L23-01 to L23-08 | API key exposure, injection risks |
| 24 | performance | L24-01 to L24-08 | O(N²) workflows, memory growth risks |
| 25 | testability | L25-01 to L25-08 | Untestable claims, missing test cases |
| 26 | maintainability | L26-01 to L26-08 | Code duplication, tight coupling |
| 27 | usability | L27-01 to L27-08 | Confusing workflows, accessibility gaps |
| 28 | interoperability | L28-01 to L28-08 | Protocol mismatches, format incompatibility |
| 29 | governance | L29-01 to L29-08 | Policy violations, regulatory gaps |
| 30 | resilience | L30-01 to L30-08 | Single points of failure, missing fallbacks |
| 31 | observability | L31-01 to L31-08 | Missing logging, metrics, tracing |
| 32 | evolution | L32-01 to L32-08 | Missing versioning, migration paths |

### Response Format

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
      "files": ["file.md"],
      "section": "Section Name",
      "line_number": 42,
      "description": "[L8-02] Missing component: API gateway not defined",
      "evidence": "Direct quote from documentation",
      "confidence": 0.95,
      "impact_score": 8,
      "fix_difficulty": "moderate",
      "related_issues": ["2"],
      "tags": ["api", "architecture"],
      "references": ["https://example.com/spec"]
    }
  ]
}
```

## Styling

- **Framework:** Tailwind CSS 3.x
- **Theme:** Dark mode (hardcoded, not toggleable)
- **Colors:**
  - Background: `#111827` (dark gray)
  - Text: `#F9FAFB` (light)
  - Cards: `#1F2937` (slightly lighter)
  - Borders: `#374151`
  - Accent: `#60A5FA` (blue)

## Error Handling

| Error Type | Handling |
|------------|----------|
| `NOT_CONFIGURED` | Analyze button disabled + tooltip |
| `NO_FILES` | Analyze button disabled |
| `VALIDATE_FAIL` | Inline error in settings modal |
| `API_ERROR` | Error panel with message + Dismiss button |
| `JSON_PARSE_ERR` | Error panel: "Could not parse response" |
| `NETWORK_ERROR` | Error panel: "Network error" |
| `WRONG_FILE` | Silent reject (only .md accepted) |

## Security

1. **Context Isolation:** Enabled (`contextIsolation: true`)
2. **Node Integration:** Disabled in renderer (`nodeIntegration: false`)
3. **IPC Bridge:** Only exposes specific methods via `contextBridge`
4. **API Key Storage:** Stored in `%APPDATA%\MarkdownAuditor\config.json`
5. **No External Servers:** App works offline except for AI API calls

## Build Process

1. **Vite Build:** Transpiles React + Tailwind → `dist/`
2. **Electron Builder:** Packages Electron + `dist/` → portable `.exe`
3. **No Code Signing:** Disabled for portable distribution

## Dependencies

### Runtime
- `openai` (v4+) — AI SDK for OpenAI-compatible APIs

### Development
- `electron` (v33+) — Desktop shell
- `electron-builder` — Packaging
- `react` (v18) — UI framework
- `react-dom` (v18) — React DOM renderer
- `vite` (v6) — Build tool
- `@vitejs/plugin-react` — React support for Vite
- `tailwindcss` (v3) — CSS framework
- `postcss` — CSS processing
- `autoprefixer` — CSS vendor prefixes

## Intentionally Excluded Features

- **Suggested Fixes:** App focuses on identification, not remediation
- **Offline/Local AI:** Cloud-only design per user requirements
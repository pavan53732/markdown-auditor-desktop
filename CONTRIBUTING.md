# Contributing Guide

## Development Setup

### Prerequisites

- Node.js 20+
- npm 10+
- Windows 10/11 x64 recommended for packaging verification

### Installation

```bash
git clone <repository-url>
cd markdown-intelligence-auditor
npm install
```

## Common Commands

```bash
# Start Vite dev server
npm run dev

# Build renderer output
npm run build

# Run Electron against built files
npm run electron:dev

# Create portable + installer Windows packages
npm run dist
```

Optional signed Windows release build after configuring certificate environment variables:

```bash
npm run verify:windows-signing
npm run dist:signed
```

Generated packaged output:

- `dist-electron-v4\MarkdownAuditor-portable.exe`
- `dist-electron-v4\MarkdownAuditor-setup-1.13.0.exe`

## Project Docs

- [README.md](./README.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [ENHANCEMENTS.md](./ENHANCEMENTS.md)
- [CHANGELOG.md](./CHANGELOG.md)
- [RELEASE_NOTES.md](./RELEASE_NOTES.md)
- [GEMINI.md](./GEMINI.md)

## Current Feature Surface

### Analysis

- 53 layers / 701 detectors
- structured detector metadata catalog in `src/lib/detectorMetadata.js`
- deterministic 8-agent prompt generation from the universal taxonomy, universal audit mode, cross-layer bundles (31 total), and detector metadata
- detector-aware validation for known detector IDs
- chunk-aware batching
- deterministic Markdown indexing, evidence-span enrichment, and cross-file project graph analysis
- deterministic local rule engine before agent synthesis with 83 receipt-backed rules
- deterministic normalization
- four escalation rules
- cross-layer validation
- fresh upload analysis with legacy cache cleanup controls
- session diffing
- root-cause grouping
- 29 deterministic benchmark fixtures within a 240-test local suite across 24 files
- enhanced taxonomy coverage helper with per-layer density, richness, subcategory, and bundle coverage analysis
- strict issue schema enrichment including `failure_type`, `constraint_reference`, `contract_step`, `invariant_broken`, `authority_boundary`, `closed_world_status`, `analysis_agents`, and `deterministic_fix`
- evidence-first issue fields including `document_anchors`, `detection_source`, `cross_file_links`, and `evidence_spans`
- layer-level runtime detector coverage reporting in the summary dashboard and Markdown exports

### UI

- drag-and-drop file upload
- search
- layer filtering
- grouping modes
- diff summary panel
- expanded issue cards with traceability and remediation guidance
- save/load sessions
- JSON / Markdown / CSV export

### Provider Controls

- provider presets
- timeout
- retries
- token budget

## Rules for Contributors

### Keep Docs in Sync

If you change product behavior, update the relevant docs in the same change:

- `README.md` for user-facing behavior
- `ARCHITECTURE.md` for system/runtime flow
- `ENHANCEMENTS.md` for status / roadmap changes
- `GEMINI.md` if repository working rules change

### When Changing Result Schema

If you add or change any AI-returned field, update all affected layers:

1. `src/lib/systemPrompt.js`
2. `src/lib/jsonRepair.js`
3. `src/App.jsx`
4. `src/components/IssueCard.jsx`
5. export/session/history workflow logic in `src/lib/exportFormats.js`, `src/lib/workbenchController.js`, and any related runtime callers
6. docs that describe the schema

### When Changing Identity, Diffing, or Normalization

Be especially careful with:

- single-batch vs multi-batch behavior
- fresh uploads vs legacy cache-management behavior
- issue identity reuse across deduplication and diffing
- chunked vs non-chunked files

## Adding or Modifying Features

### New UI Component

1. Add the component under `src/components/`
2. Wire it through `src/App.jsx` or the appropriate parent
3. Verify it is backed by real runtime behavior
4. Update docs if user-visible

### Analysis Prompt or Taxonomy Work

The taxonomy is defined in `src/lib/detectorMetadata.js` (detectors and subcategories), `src/lib/layers.js` (top-level layer registry), `src/lib/auditMode.js` (single universal audit mode), `src/lib/crossLayerBundles.js` (logical groupings), and `src/lib/analysisAgents.js` (the fixed deterministic analysis mesh).

The staged analysis pipeline also relies on:
- `src/lib/markdownIndex.js` for deterministic heading/anchor/evidence-span indexing
- `src/lib/projectGraph.js` for deterministic cross-file entity grouping
- `src/lib/ruleEngine/index.js` for local deterministic rule evaluation before agent synthesis

The system prompt is dynamically generated in `src/lib/systemPrompt.js`.

To add or update a detector:
1. Edit `rawMetadata` in `src/lib/detectorMetadata.js`.
2. Ensure the subcategory exists in `LAYER_SUBCATEGORIES`.
3. Preserve the detector ID format and layer numbering (`Lx-yy`).
4. The prompt and validation logic will automatically pick up the changes.

Prefer extending an existing layer with sharper subcategories and detectors before adding a new top-level layer. Add a new layer only when the issue family cannot be represented cleanly within the current 53-layer taxonomy without ambiguity.

The prompt should stay aligned with runtime behavior:
- do not promise rules that runtime logic does not implement
- keep field names consistent with the UI and exports
- update sample schema in `src/lib/systemPrompt.js` when fields change
- remember that unknown detector IDs are rejected during validation, so prompt/schema drift must be fixed at the source

### Adding a New Analysis Layer

Use this only when an issue family is genuinely new. If the gap can be captured by a better subcategory, detector, benchmark fixture, or bundle inside the existing 53 layers, prefer that smaller change first.

1. Add the layer definition to `src/lib/layers.js`.
2. Add the subcategory list to `LAYER_SUBCATEGORIES` in `src/lib/detectorMetadata.js`.
3. Add the detectors to `rawMetadata` in `src/lib/detectorMetadata.js`.
4. Make sure any new category is rendered correctly by:
   - `src/components/LayerFilterBar.jsx`
   - `src/components/IssueCard.jsx`
   - `src/components/IssueList.jsx`
5. Update docs that describe the layer inventory.
6. Verify exports and filtering still work.

### Adding or Changing Export Formats

1. Update export logic in `src/lib/exportFormats.js` and any runtime callers such as `src/lib/workbenchController.js`
2. Ensure any new issue fields are serialized safely
3. Verify saved output opens cleanly
4. Update `README.md` if user-visible export behavior changed

## Manual Verification Checklist

Run through the relevant subset before closing a change:

1. App launches
2. Settings modal opens and saves config
3. Provider presets populate fields correctly
4. Connection validation still works
5. Markdown drag-and-drop works
6. Invalid file types are ignored
7. Analyze button enable/disable states are correct
8. Deterministic rule-engine findings render correctly when local rules trigger
9. Cross-file findings preserve `detection_source`, `cross_file_links`, and `evidence_spans`
10. Build succeeds with `npm run build`
11. Packaging succeeds with `npm run dist` when packaging-related changes are touched
12. Results render correctly
13. Layer filters work
14. Grouping modes work
15. Diff mode renders correctly when previous results exist
16. Issue cards show new traceability/remediation fields when present
17. JSON / Markdown / CSV exports still open and contain expected fields
18. Session save/load still works
19. Fresh upload analysis does not accidentally reuse stale cached findings
20. Known detector/category/subcategory combinations validate correctly
21. Older sessions without newer taxonomy fields still load safely

## Build Notes

### If Build Fails Because Files Are In Use

Close any running app instance and try again.

On Windows:

```powershell
Stop-Process -Name "electron" -Force -ErrorAction SilentlyContinue
```

### Packaging Notes

- current build targets are Windows portable and NSIS installer
- current output directory is `dist-electron-v4`
- signed release builds are supported through `electron-builder.config.cjs`, but local artifacts remain unsigned unless signing credentials are configured
- packaged `.exe` artifacts are generated locally and should be attached to GitHub Releases instead of being committed into the repository

### Additional Troubleshooting

If packaging fails because assets or paths changed:

- confirm `build/icon.png` still exists
- confirm `package.json` build output paths are current
- confirm no running process is locking `dist/` or `dist-electron-v4/`

If a schema change appears in the UI but not in exports:

- inspect report generation in `src/lib/exportFormats.js`
- inspect export/session workflow wiring in `src/lib/workbenchController.js`
- inspect issue rendering in `src/components/IssueCard.jsx`

## Issue Field Reference

Common issue fields currently used by the app:

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

## Architecture Reminder

The renderer currently owns:

- hashing
- cache lookup
- batching
- JSON repair / validation
- merge / dedupe / escalation
- diffing
- export logic

The Electron main process currently owns:

- config persistence
- provider validation
- AI API execution

Keep that split in mind when making changes.

## Prompt / Rule Alignment Reminder

If runtime logic changes:

- keep `src/lib/systemPrompt.js` aligned with implemented rules
- do not leave stale escalation-rule counts in docs
- do not leave stale build paths such as older `dist-electron-*` directories in markdown files

## Testing

The project uses [Vitest](https://vitest.dev/) for automated logic and taxonomy tests.

### Running Tests

```bash
npm test
```

### Test Coverage

Tests are located in `src/lib/__tests__` and cover:
- **Taxonomy Integrity**: Verifies the 701-detector catalog consistency.
- **Normalization & Validation**: Verifies that results are correctly enriched and semantics are enforced.
- **Prompt Generation**: Verifies the dynamic builder logic.
- **Cache Service**: Verifies the file-backed persistence layer, atomic writes, and corruption handling.
- **Diagnostics**: Verifies runtime observability metrics.
- **Benchmark Suites**: `taxonomyBenchmark.test.js`, `deepSpecBenchmarks.test.js`, and `extendedUniversalBenchmarks.test.js` cover 29 benchmark fixtures, while the full local suite currently contains 240 tests across 24 files.
- **Taxonomy Coverage Helper**: `taxonomyCoverageHelper.js` provides per-layer density analysis, richness metrics, subcategory coverage tracking, and bundle coverage analysis for comprehensive taxonomy observability.

ALWAYS run tests before submitting changes to the taxonomy or prompt generation logic.

## Maintenance Workflow

This project is optimized for local maintenance and personal use.

### 1. Verification
- Before making significant changes, run `npm run verify` to ensure the existing tests pass and the application builds correctly.
- Add new tests in `src/lib/__tests__/` for any new logic or taxonomy additions.

### 2. Versioning
- If a new version is desired, update the version in `package.json`.
- Document changes in `CHANGELOG.md` and `RELEASE_NOTES.md`.

### 3. Local Packaging
- To create fresh local Windows artifacts, run `npm run dist`.
- To require a signed Windows release build, configure signing credentials and run `npm run dist:signed`.
- The current packaged outputs will be located in `dist-electron-v4\MarkdownAuditor-portable.exe` and `dist-electron-v4\MarkdownAuditor-setup-1.13.0.exe`.
- Treat those `.exe` files as release artifacts, not source-controlled repository files.
- It is recommended to perform a quick smoke test of the generated executable.

### 4. Security Note
- The packaged executables are unsigned on machines without signing credentials. Windows SmartScreen may still show a warning when running either `.exe` for the first time on those builds. Select "More info" -> "Run anyway" to proceed.

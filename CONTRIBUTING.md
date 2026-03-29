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

# Create portable Windows package
npm run dist
```

Current packaged output:

- `dist-electron-v4\MarkdownAuditor-portable.exe`

## Project Docs

- [README.md](./README.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [ENHANCEMENTS.md](./ENHANCEMENTS.md)
- [CHANGELOG.md](./CHANGELOG.md)
- [RELEASE_NOTES.md](./RELEASE_NOTES.md)
- [GEMINI.md](./GEMINI.md)

## Current Feature Surface

### Analysis

- 32 layers / 256 detectors
- structured detector metadata catalog in `src/lib/detectorMetadata.js`
- dynamic prompt generation from domain profiles, cross-layer bundles, and detector metadata
- detector-aware validation for known detector IDs
- chunk-aware batching
- deterministic normalization
- four escalation rules
- cross-layer validation
- incremental cached reuse
- session diffing
- root-cause grouping

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
5. export logic in `src/App.jsx`
6. docs that describe the schema

### When Changing Identity, Diffing, or Normalization

Be especially careful with:

- single-batch vs multi-batch behavior
- cached vs uncached behavior
- issue identity reuse across deduplication and diffing
- chunked vs non-chunked files

## Adding or Modifying Features

### New UI Component

1. Add the component under `src/components/`
2. Wire it through `src/App.jsx` or the appropriate parent
3. Verify it is backed by real runtime behavior
4. Update docs if user-visible

### Analysis Prompt or Taxonomy Work

The taxonomy is defined in `src/lib/detectorMetadata.js` (detectors and subcategories), `src/lib/domainProfiles.js` (domain-specific emphasis), and `src/lib/crossLayerBundles.js` (logical groupings).

The system prompt is dynamically generated in `src/lib/systemPrompt.js`.

To add or update a detector:
1. Edit `rawMetadata` in `src/lib/detectorMetadata.js`.
2. Ensure the subcategory exists in `LAYER_SUBCATEGORIES`.
3. Preserve the detector ID format and layer numbering (`Lx-yy`).
4. The prompt and validation logic will automatically pick up the changes.

The prompt should stay aligned with runtime behavior:
- do not promise rules that runtime logic does not implement
- keep field names consistent with the UI and exports
- update sample schema in `src/lib/systemPrompt.js` when fields change
- remember that unknown detector IDs are currently soft-warned, not hard-failed

### Adding a New Analysis Layer

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

1. Update export logic in `src/App.jsx`
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
8. Build succeeds with `npm run build`
9. Packaging succeeds with `npm run dist` when packaging-related changes are touched
10. Results render correctly
11. Layer filters work
12. Grouping modes work
13. Diff mode renders correctly when previous results exist
14. Issue cards show new traceability/remediation fields when present
15. JSON / Markdown / CSV exports still open and contain expected fields
16. Session save/load still works
17. Cached reuse does not break multi-file analysis
18. Known detector/category/subcategory combinations validate correctly
19. Older sessions without newer taxonomy fields still load safely

## Build Notes

### If Build Fails Because Files Are In Use

Close any running app instance and try again.

On Windows:

```powershell
Stop-Process -Name "electron" -Force -ErrorAction SilentlyContinue
```

### Packaging Notes

- current build target is Windows portable
- current output directory is `dist-electron-v4`
- executable is not code-signed

### Additional Troubleshooting

If packaging fails because assets or paths changed:

- confirm `build/icon.png` still exists
- confirm `package.json` build output paths are current
- confirm no running process is locking `dist/` or `dist-electron-v4/`

If a schema change appears in the UI but not in exports:

- inspect Markdown export in `src/App.jsx`
- inspect CSV export in `src/App.jsx`
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
- **Taxonomy Integrity**: Verifies the 256-detector catalog consistency.
- **Normalization & Validation**: Verifies that results are correctly enriched and semantics are enforced.
- **Prompt Generation**: Verifies the dynamic builder logic.
- **Diagnostics**: Verifies runtime observability metrics.

ALWAYS run tests before submitting changes to the taxonomy or prompt generation logic.

# Release Notes

## v1.9.0

Release date: 2026-03-30

This release focuses on deepening the **Analytical Taxonomy**, enriching the existing 32 layers with stronger subcategories, precise cross-references, and benchmark-driven quality controls without bloating the top-level structure.

### Highlights

- **Deepened Taxonomy**: Refined subcategories across weak themes like "contradiction drift," "semantic ambiguity," and "missing prerequisites," improving classifier accuracy without adding new top-level layers.
- **Benchmark Driven**: Added a suite of canonical Markdown benchmark fixtures ensuring the taxonomy handles edge cases correctly during local development.
- **Detector Enrichment**: Enhanced existing micro-detectors with `related_layers` mappings and tighter false-positive guards.
- **Quality Tooling**: Introduced an internal helper to report on taxonomy coverage, ensuring every category remains robust and healthy.

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

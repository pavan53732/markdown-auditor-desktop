# Changelog

All notable changes to this project should be documented in this file.

This changelog establishes the current production-ready baseline for the app as it exists in this repository.

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

- Automated regression suite using Vitest covering taxonomy integrity, prompt generation, validation, and normalization
- Runtime taxonomy diagnostics: tracking enrichment, parsing, and clamping metrics during analysis
- Taxonomy observability UI: compact diagnostics block in the results summary area
- Markdown export enhancement: now includes structured taxonomy diagnostics summary
- New `npm test` script for developer verification

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

- Incremental cache currently uses renderer `localStorage`
- Chunk overlap improves context retention, but some chunk-derived line mapping remains best effort
- The packaged Windows executable is currently unsigned

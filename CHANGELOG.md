# Changelog

All notable changes to this project should be documented in this file.

This changelog establishes the current production-ready baseline for the app as it exists in this repository.

## [1.0.0] - 2026-03-29

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


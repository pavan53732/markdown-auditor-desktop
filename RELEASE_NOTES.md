# Release Notes

## v1.0.0

Release date: 2026-03-29

Markdown Intelligence Auditor is now documented as a production-ready baseline for desktop Markdown auditing on Windows. This release brings the analysis pipeline, exports, and contributor docs into alignment with the actual runtime behavior.

### Highlights

- Production-grade normalization across both single-batch and multi-batch analysis runs
- Safer oversized-file handling through chunk-aware batching
- Incremental analysis with cache reuse for unchanged files
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

- Portable Windows executable output: `dist-electron-v4\MarkdownAuditor-portable.exe`
- Packaging remains unsigned, so Windows trust prompts may still appear on some machines

### Recommended Next Steps

- Add code signing for release builds
- Move incremental cache storage from `localStorage` to a file-backed store
- Add stricter validation for optional schema fields
- Add automated regression tests for caching, diffing, and export behavior


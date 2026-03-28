# Enhancements Status

This document tracks the major product-level enhancements currently implemented in the app, along with the next most useful areas for improvement.

## Implemented in Current Build

### Analysis Engine

- 32 analytical layers and 256 micro-detectors
- chunk-aware batching for oversized files
- deterministic post-merge normalization
- four runtime escalation rules
- cross-layer validation after escalation
- JSON repair before validation
- basic response validation before rendering

### Incremental and Comparative Workflows

- SHA-256 file hashing for reuse detection
- local cached reuse of unchanged file results
- per-run reused vs reanalyzed counts
- session diffing against the previous in-memory audit
- `new`, `resolved`, and `changed` issue states

### Result Quality and Explainability

- detector traceability fields
- escalation reasons in normalized issues
- remediation guidance:
  - `recommended_fix`
  - `fix_steps`
  - `estimated_effort`
  - `verification_steps`
- root-cause grouping support

### UI and UX

- drag-and-drop Markdown intake
- search across descriptions, evidence, tags, and files
- layer filtering
- grouping by file, severity, layer, and root cause
- session diff summary panel
- save/load session workflow
- JSON / Markdown / CSV export

### Provider Controls

- provider presets for OpenAI, Groq, OpenRouter, Ollama, and Mistral
- user-configurable timeout
- user-configurable retries
- session token budget enforcement

### Packaging

- reproducible Windows portable build via `electron-builder`
- output path: `dist-electron-v4\MarkdownAuditor-portable.exe`

## Known Constraints

- Incremental cache uses renderer `localStorage`, which may become a limitation for very large document sets.
- Chunk overlap improves context retention, but line range reporting for overlapped chunks is still best-effort.
- Validation is stronger than before, but it is still not a full strict schema validator for every optional field.
- The packaged executable is unsigned.

## Recommended Next Enhancements

### High Value

- Move analysis cache from `localStorage` to a file-backed Electron store
- Add stricter schema validation for optional traceability and remediation fields
- Add session history browsing instead of only save/load by file
- Add explicit cost / token usage reporting per run
- Add automated regression tests for caching, diffing, and export behavior

### Quality of Life

- Add export of root-cause summaries to a dedicated structured file
- Add better chunk-to-source line remapping
- Add dismissal / suppression rules for accepted findings
- Add signed Windows release builds
- Add release automation or CI build verification

## Guidance

When implementing future enhancements, update:

- `README.md`
- `ARCHITECTURE.md`
- `CONTRIBUTING.md`
- `GEMINI.md` when repo-level working rules change

This helps keep product claims, runtime behavior, and contributor expectations aligned.

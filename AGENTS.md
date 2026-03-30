# AGENTS.md

## Project

Markdown Intelligence Auditor is a Windows desktop application for auditing Markdown documentation with AI-assisted analysis.

Core stack:
- Electron
- React
- Vite
- Tailwind CSS
- OpenAI-compatible provider integration
- Windows portable packaging via `electron-builder`

## Mission

Treat this repository as a production-oriented codebase for deterministic documentation and specification auditing.

Your job is to:
- make real code changes, not just recommendations
- preserve shipped behavior unless the task explicitly requires change
- keep runtime logic, prompts, tests, UI, exports, and docs aligned
- avoid overstating what the product does

## Source Of Truth

When repository markdown and code disagree, trust the code first.

Primary source-of-truth files:
- `src/lib/layers.js`
- `src/lib/detectorMetadata.js`
- `src/lib/systemPrompt.js`
- `src/lib/jsonRepair.js`
- `src/lib/domainProfiles.js`
- `src/lib/crossLayerBundles.js`
- `src/lib/__tests__/taxonomy.test.js`
- `src/lib/__tests__/taxonomyBenchmark.test.js`
- `src/App.jsx`
- `src/components/ProgressPanel.jsx`

Supporting docs:
- `README.md`
- `ARCHITECTURE.md`
- `ENHANCEMENTS.md`
- `CONTRIBUTING.md`
- `CHANGELOG.md`
- `RELEASE_NOTES.md`

If counts or capabilities change:
- derive the current layer count from `src/lib/layers.js`
- derive the current detector count from `src/lib/detectorMetadata.js` or `src/lib/__tests__/taxonomy.test.js`
- do not trust stale prose

## Non-Negotiable Engineering Rules

- Inspect the current code before editing.
- Prefer small, coherent, end-to-end changes over speculative rewrites.
- Do not claim a feature is complete unless runtime logic, UI, tests, and docs support that claim.
- Do not invent unsupported product behavior in the prompt, UI, or docs.
- Keep single-file and multi-file flows consistent.
- Keep single-batch and multi-batch normalization behavior consistent.
- Prefer deterministic behavior over vague heuristics.
- Be explicit about risks, tradeoffs, and anything not verified.

## Taxonomy Rules

This repo uses a code-defined taxonomy. Taxonomy work is never "prompt only".

If you change layers, detectors, or taxonomy behavior, update all affected surfaces:

1. Layer registry
- `src/lib/layers.js`

2. Detector metadata and helpers
- `src/lib/detectorMetadata.js`
- `src/lib/taxonomyCoverageHelper.js`

3. Prompt generation
- `src/lib/systemPrompt.js`
- any layer-aware prompt helpers

4. Validation and normalization
- `src/lib/jsonRepair.js`
- normalization or enrichment helpers

5. Runtime/UI wiring
- `src/App.jsx`
- relevant components such as `ProgressPanel.jsx`, `LayerFilterBar.jsx`, `SummaryDashboard.jsx`, `IssueList.jsx`

6. Tests and fixtures
- `src/lib/__tests__/taxonomy.test.js`
- `src/lib/__tests__/taxonomyBenchmark.test.js`
- `src/lib/__tests__/fixtures/*`

7. Documentation
- `README.md`
- `ARCHITECTURE.md`
- `ENHANCEMENTS.md`
- `CONTRIBUTING.md`
- release docs if user-facing claims changed

## Schema Change Rules

If you add or change an AI-returned field, propagate it through:
- prompt/schema examples
- parse / repair / validation
- merge / normalization
- UI rendering
- export logic
- session save/load if relevant
- tests
- docs

Do not leave partially wired schema fields.

## Prompt Rules

The runtime prompt must reflect actual implemented behavior.

Do not:
- promise checks the runtime does not support
- claim stricter enforcement than the code implements
- leave stale layer or detector counts in the prompt

Do:
- keep prompt wording aligned with the live taxonomy
- preserve rich, explicit instructions when they reflect real behavior
- prefer truthful detail over vague marketing language

## Validation And Benchmark Rules

Deterministic benchmark tests should be described honestly.

Acceptable:
- deterministic mocked pipeline benchmarks
- tests that run real local validation and normalization code

Do not claim:
- live-model end-to-end benchmarking
- full formal verification
- universal metadata richness

unless the code and tests make that literally true.

## UI Rules

- Do not add UI that makes unsupported claims.
- Keep the existing visual language unless there is a clear reason to improve it consistently.
- Any new control must connect to real runtime behavior.
- Keep desktop usability acceptable even as taxonomy depth grows.

## Caching, Sessions, And History

Be careful with:
- cache reuse
- session load/save
- history comparisons
- deduplication identity
- diffing logic

Do not introduce stale-state bugs or cross-file misclassification.

## Verification Requirements

Before concluding work, run the relevant verification steps.

Default:
- `npm test`
- `npm run build`

Run `npm run dist` only when:
- packaging-sensitive behavior changed
- Electron packaging config changed
- built artifacts need packaging verification for the task

If you do not run something, say so explicitly.

## Documentation Discipline

If the change affects behavior or capability, update the relevant docs in the same pass.

Do not leave:
- stale counts
- stale capability claims
- stale output paths
- stale benchmark descriptions

## Final Response Standard

When finishing work, return:
1. Summary
2. Files changed
3. Verification
4. Remaining risks or follow-ups

Keep the summary factual.
Do not overclaim.

@AGENTS.md

# CLAUDE.md

## Claude Code Project Instructions

This file adds Claude Code specific guidance on top of the shared agent rules in `AGENTS.md`.

Use this repository as a real implementation workspace, not a brainstorming sandbox.

## Scope

These instructions apply to the whole project.

If this file grows too large later:
- move topic-specific guidance into `.claude/rules/*.md`
- keep this root file as the project entrypoint

## Claude-Specific Working Rules

- Read the current code before editing.
- Prefer code-defined truth over repository prose when they disagree.
- If counts, layer inventories, or detector totals matter, verify them from source-of-truth files before making claims.
- Keep edits coherent across runtime, tests, and docs.
- Do not mark work complete when only the prompt or only the docs changed.

## Current Project Areas That Matter Most

High-sensitivity files:
- `src/lib/layers.js`
- `src/lib/detectorMetadata.js`
- `src/lib/systemPrompt.js`
- `src/lib/jsonRepair.js`
- `src/lib/__tests__/taxonomy.test.js`
- `src/lib/__tests__/taxonomyBenchmark.test.js`
- `src/App.jsx`
- `README.md`

If you touch taxonomy or counts, inspect those files first.

## Taxonomy Change Checklist

When making taxonomy changes, explicitly verify:

1. Taxonomy definition
- layers added/removed/renamed correctly
- subcategories valid for their layer
- detector IDs remain unique and well-formed

2. Runtime prompt
- counts are current
- examples are current
- wording matches actual capabilities

3. Validation and normalization
- detector/category/subcategory consistency still works
- severity normalization still behaves correctly
- benchmark fixtures still represent the real code path

4. UI and summaries
- visible counts are current
- status text is truthful
- layer-driven rendering still works

5. Tests
- taxonomy tests updated
- benchmark tests updated
- drift-prevention tests updated

6. Docs
- user-facing docs aligned
- architecture docs aligned
- contributor docs aligned

## Commands

Common verification commands:

```bash
npm test
npm run build
```

Packaging only when relevant:

```bash
npm run dist
```

Useful git checks:

```bash
git status --short --branch
git diff --stat
```

## What Claude Should Avoid

- Do not assume markdown docs are current without checking code.
- Do not compress or simplify instructions just to save tokens.
- Do not silently leave stale counts or stale examples behind.
- Do not describe deterministic coverage as live-model coverage.
- Do not create half-wired new layers or detectors.

## Response Expectations

When concluding a task:
- state what changed
- state what was verified
- state what was not verified
- state remaining limitations if any

If something is only partially implemented, say that directly.

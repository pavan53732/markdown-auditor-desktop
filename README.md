# Markdown Document Intelligence Auditor

A Windows desktop application that analyzes markdown documentation files across 32 analytical layers with 256 micro-detectors using AI, detecting contradictions, logical errors, structural issues, and more.

## Overview

This is a portable Windows desktop application built with Electron, React, and Tailwind CSS. It uses any OpenAI-compatible AI provider to analyze markdown documentation files and generate detailed audit reports with severity badges.

## Features

- **Drag-and-drop file upload** for `.md` and `.markdown` files
- **32-layer analysis with 256 micro-detectors** covering contradictions, logic, structure, semantics, facts, requirements, state machines, API contracts, dependencies, data flow, execution paths, configuration, error handling, security, performance, testability, maintainability, usability, interoperability, governance, resilience, observability, and evolution
- **Multi-phase reasoning flow** — scan → cross-layer correlation → severity escalation → final output
- **Deterministic escalation rules** — automatic severity escalation based on pattern detection
- **Severity-based reporting** (Critical, High, Medium, Low)
- **Custom AI provider support** (OpenAI, Anthropic, OpenRouter, Groq, Together AI, Mistral, etc.)
- **Enhanced issue fields** — confidence scores, impact ratings, fix difficulty, tags, references
- **Text search** — filter issues by description, evidence, tags, and files
- **Export** — JSON, Markdown, and CSV formats
- **Session save** — save and reload audit sessions
- **Dark theme UI** with modern design
- **Portable .exe** — zero install required

> **Intentionally Excluded:**
> - **Suggested Fixes** — The app focuses on identifying and reporting issues, not providing automated remediation suggestions. Users are expected to review findings and apply fixes based on their specific context and requirements.
> - **Offline/Local AI** — Cloud-only AI provider design (Ollama, LM Studio excluded). Requires internet connection.

## Quick Start

1. Double-click `dist-electron-v2\MarkdownAuditor-portable.exe`
2. Click the gear icon (⚙) to open Settings
3. Enter your AI provider details:
   - Base URL (e.g., `https://api.openai.com/v1`)
   - API Key (required for most cloud providers)
   - Model Name (e.g., `gpt-4o`)
4. Click "Validate Connection" to test
5. Drop `.md` files onto the upload zone
6. Click "Run Full Audit"

## Configuration

Settings are saved to `%APPDATA%\MarkdownAuditor\config.json`:

```json
{
  "baseURL": "https://api.openai.com/v1",
  "apiKey": "sk-...",
  "model": "gpt-4o"
}
```

## Supported AI Providers

> **Note:** This app is designed exclusively for cloud-based AI providers. Offline/local AI solutions (such as Ollama, LM Studio, or any locally hosted models) are intentionally excluded. The app requires an internet connection to communicate with the configured AI provider.

| Provider | Base URL | Example Model |
|----------|----------|---------------|
| OpenAI | `https://api.openai.com/v1` | `gpt-4o` |
| Anthropic (via proxy) | `https://api.anthropic.com/v1` | `claude-sonnet-4-5` |
| OpenRouter | `https://openrouter.ai/api/v1` | `mistralai/mixtral-8x7b` |
| Groq | `https://api.groq.com/openai/v1` | `llama3-70b-8192` |
| Together AI | `https://api.together.xyz/v1` | `mistralai/Mixtral-8x7B-Instruct-v0.1` |
| Mistral | `https://api.mistral.ai/v1` | `mistral-large-latest` |
| Any custom OpenAI-compatible endpoint | (user-provided) | (user-provided) |

## Analysis Layers (32 Total)

### Foundation Layers (1–14)
1. **Contradiction & Consistency** — Direct/indirect contradictions, terminology inconsistency
2. **Logical Integrity** — Logical fallacies, invalid assumptions, circular reasoning
3. **Structural & Organizational** — Broken hierarchy, missing sections, poor flow
4. **Semantic & Clarity** — Ambiguous statements, undefined terms, vague language
5. **Factual & Evidence** — Unsupported claims, missing citations, outdated info
6. **Functional & Practical** — Functional impossibilities, broken workflows
7. **Temporal & State** — Timeline contradictions, sequence errors
8. **Architectural & System Design** — Architecture conflicts, component misalignment
9. **Completeness & Coverage** — Missing edge cases, incomplete workflows
10. **Intent, Goal & Alignment** — Goal misalignment, scope creep
11. **Meta-Cognition** — Overconfident claims, shallow reasoning
12. **Adversarial Analysis** — Claims easily disproved, unaddressed failure modes
13. **Knowledge Graph** — Entity relationship conflicts, orphaned concepts
14. **Quantitative Reasoning** — Calculation errors, unit inconsistencies

### Advanced System Layers (15–24)
15. **Requirement Integrity** — Requirement ambiguity, missing acceptance criteria
16. **State Machine Consistency** — Undefined states, invalid transitions
17. **API Contract** — Undefined parameters, missing return schema
18. **Dependency Graph** — Circular dependency, missing dependency
19. **Data Flow Integrity** — Missing data producer/consumer, transformation ambiguity
20. **Execution Path** — Unreachable paths, dead-end workflows
21. **Configuration Consistency** — Missing config keys, conflicting config
22. **Error Handling** — Missing error paths, silent failure risks
23. **Security & Isolation** — API key exposure, injection risks
24. **Performance & Scalability** — O(N²) workflows, memory growth risks

### Extended Quality Layers (25–32)
25. **Testability & Verification** — Untestable claims, missing test cases
26. **Maintainability & Technical Debt** — Code duplication, tight coupling
27. **Usability & User Experience** — Confusing workflows, accessibility gaps
28. **Interoperability & Integration** — Protocol mismatches, format incompatibility
29. **Governance & Compliance** — Policy violations, regulatory gaps
30. **Resilience & Fault Tolerance** — Single points of failure, missing fallbacks
31. **Observability & Monitoring** — Missing logging, metrics, tracing
32. **Evolution & Future-Proofing** — Missing versioning, migration paths

## Multi-Phase Reasoning Flow

The AI follows a deterministic 4-phase execution flow:

1. **SCAN** — Evaluate all 256 detectors, document skipped detectors
2. **CROSS-LAYER CORRELATION** — Verify consistency across layers, group related findings
3. **SEVERITY ESCALATION** — Apply deterministic escalation rules
4. **FINAL OUTPUT** — Compile JSON with `detectors_evaluated` and `detectors_skipped` counts

## Deterministic Escalation Rules

- **Rule 1:** ≥3 medium issues in same section/component → escalate all to high
- **Rule 2:** Critical issue found → check if invalidates other findings
- **Rule 3:** Security (L23) + Performance (L24) same component → escalate to critical
- **Rule 4:** Completeness (L9) + Functional (L6) missing steps → escalate to high
- **Rule 5:** Contradiction (L1) + Intent (L10) same content → escalate to high

## Issue Fields

Each issue includes:
- `id` — Unique identifier
- `severity` — critical/high/medium/low
- `category` — Layer ID (e.g., contradiction, logical)
- `files` — Affected filenames
- `section` — Section heading
- `line_number` — Line number in file
- `description` — Issue description with detector ID [Lx-yy]
- `evidence` — Direct quote from documentation
- `confidence` — AI confidence score (0.40-1.00)
- `impact_score` — Impact severity (1-10)
- `fix_difficulty` — easy/moderate/hard
- `related_issues` — Correlated issue IDs
- `tags` — Categorization tags
- `references` — External reference URLs

## Building from Source

```bash
npm install
npm run build
npx electron-builder --win portable
```

Output: `dist-electron-v2\MarkdownAuditor-portable.exe`

## Technology Stack

- **Desktop Shell:** Electron
- **UI Framework:** React 18 + Vite
- **Styling:** Tailwind CSS
- **Language:** JavaScript (Node.js + Browser)
- **AI SDK:** openai npm package (v4+)
- **Packaging:** electron-builder (portable .exe)

## License

MIT
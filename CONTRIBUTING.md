# Contributing Guide

## Development Setup

### Prerequisites

- Node.js v20+
- npm v10+
- Windows 10/11 x64

### Installation

```bash
git clone <repository-url>
cd markdown-auditor
npm install
```

### Development Commands

```bash
# Start Vite dev server (browser preview)
npm run dev

# Build Vite output
npm run build

# Run Electron with built files
npm run electron:dev

# Build portable .exe
npm run dist
```

## Project Structure

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed structure documentation.

## Current Feature Set

### Analysis Capabilities
- 32 analysis layers with 256 micro-detectors (L1-01 through L32-08)
- Multi-phase reasoning flow (scan → cross-layer correlation → severity escalation → final output)
- Deterministic escalation rules (5 rules defined)
- Enhanced issue fields: line_number, confidence, impact_score, fix_difficulty, tags, references
- AI-powered analysis using OpenAI-compatible SDK

### UI Features
- Drag-and-drop file upload for .md files
- Text search across issue descriptions, evidence, tags, and files
- Layer filtering with 32 filter pills
- Export to JSON, Markdown, and CSV formats
- Session save functionality
- Dark theme UI

### Intentionally Excluded Features
- **Suggested Fixes:** The app focuses on identifying issues, not providing automated remediation
- **Offline/Local AI:** Cloud-only AI provider design (Ollama, LM Studio excluded)

## Adding New Features

### Adding a New Component

1. Create file in `src/components/YourComponent.jsx`
2. Import in `App.jsx`
3. Add to component tree
4. Follow existing component patterns

### Adding a New Analysis Layer

1. Add layer definition to `src/lib/layers.js`:
```javascript
{ 
  id: 'your_layer', 
  label: 'Your Layer Name', 
  icon: '🔍', 
  color: '#HEXCODE', 
  bg: '#HEXCODE', 
  border: '#HEXCODE' 
}
```

2. Add layer description and detectors to `src/lib/systemPrompt.js`:
```
LAYER XX [your_layer] — Your Layer Name
[LXX-01] detector 1
[LXX-02] detector 2
...
[LXX-08] detector 8
```

3. Update the layer count in README.md and ProgressPanel.jsx

### Modifying the AI System Prompt

Edit `src/lib/systemPrompt.js`. The prompt must:
- Instruct AI to return ONLY raw JSON
- Define the exact JSON structure with [Lx-yy] detector format
- Include all 32 layers with 256 detectors
- Define severity rules
- Include multi-phase reasoning flow
- Include deterministic escalation rules
- Include confidence, impact_score, fix_difficulty scoring guidelines
- Include detectors_evaluated and detectors_skipped in schema

### Adding Export Formats

1. Create export function in `src/App.jsx`
2. Add button to export dropdown menu
3. Format data according to target format

## Code Style

- JavaScript (ES6+)
- React functional components with hooks
- Tailwind CSS for styling
- No TypeScript

## Testing

Manual testing checklist:

1. App launches by double-clicking .exe
2. Settings modal opens/closes
3. API validation works
4. Config saves/loads
5. File drag-and-drop works
6. File click-to-browse works
7. .md files accepted, others rejected
8. Analyze button disabled/enabled correctly
9. Progress panel shows during analysis
10. Results render with correct formatting
11. Layer filters work (all 32 layers)
12. Issue cards expand/collapse
13. Text search filters issues
14. Export downloads correct file format
15. Session save generates correct JSON
16. Reset button clears state

## Build & Distribution

```bash
# Clean previous builds
Remove-Item -Recurse -Force dist-electron-v2 -ErrorAction SilentlyContinue

# Build fresh
npm run build
npx electron-builder --win portable

# Output location
dist-electron-v2\MarkdownAuditor-portable.exe
```

## Common Issues

### Build fails with "file in use" error

Kill Electron processes:
```powershell
Stop-Process -Name "electron" -Force -ErrorAction SilentlyContinue
```

### Module type warning

Add `"type": "module"` to package.json (optional, warning is non-blocking).

### Icon not showing

Ensure `build/icon.png` exists and is referenced in package.json under `build.win.icon`.

### JSON parse error in build

Check for corrupted import statements in source files (common issue: extra characters at beginning of file).

## Issue Field Reference

When modifying issue fields, ensure consistency across:
1. `src/lib/systemPrompt.js` — JSON schema definition
2. `src/components/IssueCard.jsx` — Display logic
3. `src/App.jsx` — Search and export logic

Current issue fields:
- `id` — Unique identifier
- `severity` — critical/high/medium/low
- `category` — Layer ID (contradiction, logical, etc.)
- `files` — Array of affected filenames
- `section` — Section heading where issue occurs
- `line_number` — Line number in file
- `description` — Issue description with detector ID [Lx-yy]
- `evidence` — Direct quote from documentation
- `confidence` — AI confidence score (0.40-1.00)
- `impact_score` — Impact severity (1-10)
- `fix_difficulty` — easy/moderate/hard
- `related_issues` — Array of related issue IDs
- `tags` — Categorization tags
- `references` — External reference URLs

## Multi-Phase Reasoning Flow

The AI system prompt enforces a deterministic 4-phase execution:

1. **SCAN** — Evaluate all 256 detectors, document skipped detectors
2. **CROSS-LAYER CORRELATION** — Verify consistency, group related findings
3. **SEVERITY ESCALATION** — Apply 5 deterministic escalation rules
4. **FINAL OUTPUT** — Compile JSON with detector counts

## Deterministic Escalation Rules

- Rule 1: ≥3 medium issues in same section/component → escalate all to high
- Rule 2: Critical issue found → check if invalidates other findings
- Rule 3: Security (L23) + Performance (L24) same component → escalate to critical
- Rule 4: Completeness (L9) + Functional (L6) missing steps → escalate to high
- Rule 5: Contradiction (L1) + Intent (L10) same content → escalate to high
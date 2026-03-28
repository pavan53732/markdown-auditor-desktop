export const LAYERS = [
  { id: 'contradiction', label: 'Contradiction & Consistency', icon: '⇄', color: '#E24B4A', bg: '#FCEBEB', border: '#F09595' },
  { id: 'logical', label: 'Logical Integrity', icon: '∴', color: '#A32D2D', bg: '#F7C1C1', border: '#F09595' },
  { id: 'structural', label: 'Structural & Organizational', icon: '§', color: '#BA7517', bg: '#FAEEDA', border: '#FAC775' },
  { id: 'semantic', label: 'Semantic & Clarity', icon: '≈', color: '#854F0B', bg: '#FAC775', border: '#EF9F27' },
  { id: 'factual', label: 'Factual & Evidence', icon: '?', color: '#185FA5', bg: '#E6F1FB', border: '#85B7EB' },
  { id: 'functional', label: 'Functional & Practical', icon: 'ƒ', color: '#0C447C', bg: '#B5D4F4', border: '#378ADD' },
  { id: 'temporal', label: 'Temporal & State', icon: '⏱', color: '#3B6D11', bg: '#EAF3DE', border: '#97C459' },
  { id: 'architectural', label: 'Architectural & System Design', icon: '⬡', color: '#085041', bg: '#9FE1CB', border: '#5DCAA5' },
  { id: 'completeness', label: 'Completeness & Coverage', icon: '◻', color: '#534AB7', bg: '#EEEDFE', border: '#AFA9EC' },
  { id: 'intent', label: 'Intent, Goal & Alignment', icon: '⊕', color: '#3C3489', bg: '#CECBF6', border: '#AFA9EC' },
  { id: 'metacognition', label: 'Meta-Cognition', icon: '⊗', color: '#5F5E5A', bg: '#F1EFE8', border: '#B4B2A9' },
  { id: 'adversarial', label: 'Adversarial Analysis', icon: '⚔', color: '#444441', bg: '#D3D1C7', border: '#B4B2A9' },
  { id: 'knowledge_graph', label: 'Knowledge Graph', icon: '◈', color: '#993C1D', bg: '#FAECE7', border: '#F0997B' },
  { id: 'quantitative', label: 'Quantitative Reasoning', icon: '∑', color: '#712B13', bg: '#F5C4B3', border: '#F0997B' },
  { id: 'requirement', label: 'Requirement Integrity', icon: 'R', color: '#E24B4A', bg: '#FCEBEB', border: '#F09595' },
  { id: 'state_machine', label: 'State Machine', icon: 'S', color: '#A32D2D', bg: '#F7C1C1', border: '#F09595' },
  { id: 'api_contract', label: 'API Contract', icon: 'API', color: '#BA7517', bg: '#FAEEDA', border: '#FAC775' },
  { id: 'dependency_graph', label: 'Dependency Graph', icon: 'D', color: '#854F0B', bg: '#FAC775', border: '#EF9F27' },
  { id: 'data_flow', label: 'Data Flow', icon: 'DF', color: '#185FA5', bg: '#E6F1FB', border: '#85B7EB' },
  { id: 'execution_path', label: 'Execution Path', icon: 'E', color: '#0C447C', bg: '#B5D4F4', border: '#378ADD' },
  { id: 'configuration', label: 'Configuration', icon: 'C', color: '#3B6D11', bg: '#EAF3DE', border: '#97C459' },
  { id: 'error_handling', label: 'Error Handling', icon: '!', color: '#085041', bg: '#9FE1CB', border: '#5DCAA5' },
  { id: 'security', label: 'Security', icon: '🔒', color: '#534AB7', bg: '#EEEDFE', border: '#AFA9EC' },
  { id: 'performance', label: 'Performance', icon: '⚡', color: '#3C3489', bg: '#CECBF6', border: '#AFA9EC' },
  { id: 'testability', label: 'Testability & Verification', icon: '✓', color: '#059669', bg: '#D1FAE5', border: '#6EE7B7' },
  { id: 'maintainability', label: 'Maintainability', icon: '🔧', color: '#7C3AED', bg: '#EDE9FE', border: '#A78BFA' },
  { id: 'usability', label: 'Usability & UX', icon: '👤', color: '#DC2626', bg: '#FEE2E2', border: '#FCA5A5' },
  { id: 'interoperability', label: 'Interoperability', icon: '🔗', color: '#0891B2', bg: '#CFFAFE', border: '#67E8F9' },
  { id: 'governance', label: 'Governance & Compliance', icon: '⚖', color: '#65A30D', bg: '#ECFCCB', border: '#BEF264' },
  { id: 'resilience', label: 'Resilience & Fault Tolerance', icon: '🛡', color: '#EA580C', bg: '#FFEDD5', border: '#FDBA74' },
  { id: 'observability', label: 'Observability & Monitoring', icon: '👁', color: '#993C1D', bg: '#FAECE7', border: '#F0997B' },
  { id: 'evolution', label: 'Evolution & Future-Proofing', icon: '🔄', color: '#712B13', bg: '#F5C4B3', border: '#F0997B' },
];

export const SEVERITY_STYLE = {
  critical: { color: '#A32D2D', bg: '#FCEBEB', border: '#F09595', order: 0 },
  high: { color: '#854F0B', bg: '#FAEEDA', border: '#FAC775', order: 1 },
  medium: { color: '#0C447C', bg: '#E6F1FB', border: '#85B7EB', order: 2 },
  low: { color: '#27500A', bg: '#EAF3DE', border: '#97C459', order: 3 },
};

export function getLayerById(id) {
  return LAYERS.find((l) => l.id === id) || { id, label: id, icon: '?', color: '#888', bg: '#333', border: '#555' };
}
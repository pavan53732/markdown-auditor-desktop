export const UNIVERSAL_AUDIT_MODE = {
  id: 'universal',
  label: 'Universal Audit Mode',
  description: 'Always run the full universal taxonomy without profile-specific weighting or alternate emphasis tracks.'
};

export function getUniversalAuditModePrompt() {
  return `AUDIT MODE: ${UNIVERSAL_AUDIT_MODE.label}
Description: ${UNIVERSAL_AUDIT_MODE.description}
Instruction: Apply the full universal taxonomy consistently. Do not bias severity, detector choice, or scrutiny depth based on document-type profiles.`;
}

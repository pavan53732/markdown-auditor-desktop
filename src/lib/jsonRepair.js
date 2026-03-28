/**
 * Attempts to repair common JSON malformations from LLM outputs
 */
export function repairJSON(raw) {
  let text = raw.trim();

  // Remove markdown code fences if present
  text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');

  // Find the first '{' and last '}'
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  
  if (start === -1 || end === -1) {
    throw new Error('No JSON object found in response');
  }

  text = text.substring(start, end + 1);

  // Common repair: trailing commas
  text = text.replace(/,\s*([}\]])/g, '$1');

  // Common repair: unescaped newlines in strings
  // This is risky, but often LLMs put raw newlines in evidence or description
  // We'll only do it if the JSON is otherwise invalid
  try {
    return JSON.parse(text);
  } catch (e) {
    // Try to replace raw newlines within quotes
    const fixedText = text.replace(/"([^"]*)"/g, (match, p1) => {
      return '"' + p1.replace(/\n/g, '\\n').replace(/\r/g, '\\r') + '"';
    });
    
    try {
      return JSON.parse(fixedText);
    } catch (e2) {
      console.error('JSON repair failed', text);
      throw new Error(`Invalid JSON: ${e.message}`);
    }
  }
}

export function validateResults(results) {
  if (!results || typeof results !== 'object') {
    throw new Error('Response is not a JSON object');
  }
  
  if (!results.summary || typeof results.summary !== 'object') {
    throw new Error('Results missing required "summary" object');
  }
  
  if (!Array.isArray(results.issues)) {
    throw new Error('Results missing required "issues" array');
  }

  // Validate individual issues
  results.issues.forEach((issue, index) => {
    if (typeof issue.severity !== 'string' || !['critical', 'high', 'medium', 'low'].includes(issue.severity)) {
      throw new Error(`Issue at index ${index} has invalid severity: ${issue.severity}`);
    }
    if (typeof issue.category !== 'string') {
      throw new Error(`Issue at index ${index} has invalid or missing category`);
    }
    if (typeof issue.description !== 'string') {
      throw new Error(`Issue at index ${index} has invalid or missing description`);
    }

    // Traceability & Remediation type checks
    if (issue.detector_id && typeof issue.detector_id !== 'string') {
      throw new Error(`Issue at index ${index} has invalid detector_id type`);
    }
    if (issue.why_triggered && typeof issue.why_triggered !== 'string') {
      throw new Error(`Issue at index ${index} has invalid why_triggered type`);
    }
    if (issue.escalation_reason && typeof issue.escalation_reason !== 'string') {
      throw new Error(`Issue at index ${index} has invalid escalation_reason type`);
    }
    if (issue.recommended_fix && typeof issue.recommended_fix !== 'string') {
      throw new Error(`Issue at index ${index} has invalid recommended_fix type`);
    }
    if (issue.fix_steps && !Array.isArray(issue.fix_steps)) {
      throw new Error(`Issue at index ${index} has invalid fix_steps (must be array)`);
    }
    if (issue.verification_steps && !Array.isArray(issue.verification_steps)) {
      throw new Error(`Issue at index ${index} has invalid verification_steps (must be array)`);
    }
    if (issue.estimated_effort && typeof issue.estimated_effort !== 'string') {
      throw new Error(`Issue at index ${index} has invalid estimated_effort type`);
    }
  });

  // Validate root causes if present
  if (results.root_causes) {
    if (!Array.isArray(results.root_causes)) {
      throw new Error('"root_causes" must be an array');
    }
    results.root_causes.forEach((rc, index) => {
      if (typeof rc.id !== 'string' || typeof rc.title !== 'string') {
        throw new Error(`Root cause at index ${index} missing required id or title`);
      }
      if (rc.child_issues && !Array.isArray(rc.child_issues)) {
        throw new Error(`Root cause at index ${index} has invalid child_issues (must be array)`);
      }
    });
  }

  return true;
}

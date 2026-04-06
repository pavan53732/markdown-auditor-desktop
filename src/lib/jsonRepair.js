import {
  isValidSubcategory,
  getDetectorMetadata,
  isValidDetectorForLayer,
  isValidDetectorForSubcategory,
  parseDetectorId,
  isKnownDetectorId
} from './detectorMetadata';

/**
 * Attempts to repair common JSON malformations from LLM outputs
 */
export function repairJSON(raw) {
  let text = String(raw || '').replace(/^\uFEFF/, '').trim();

  // Remove markdown code fences if present
  text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');

  // Find the first '{' and last '}'
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');

  if (start === -1 || end === -1) {
    throw new Error('No JSON object found in response');
  }

  text = text.substring(start, end + 1);

  const repairCandidates = [
    text,
    text
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/([{,]\s*)([A-Za-z0-9_]+)\s*:/g, '$1"$2":')
      .replace(/([{,]\s*)'([^']+?)'\s*:/g, '$1"$2":')
      .replace(/:\s*'([^'\\]*(?:\\.[^'\\]*)*)'/g, (_, value) => `:${JSON.stringify(value)}`)
      .replace(/\bTrue\b/g, 'true')
      .replace(/\bFalse\b/g, 'false')
      .replace(/\bNone\b/g, 'null')
      .replace(/,\s*([}\]])/g, '$1')
  ];

  for (const candidate of repairCandidates) {
    try {
      return JSON.parse(candidate);
    } catch {
      const fixedText = candidate.replace(/"([^"]*)"/g, (match, p1) => {
        return '"' + p1.replace(/\n/g, '\\n').replace(/\r/g, '\\r') + '"';
      });

      try {
        return JSON.parse(fixedText);
      } catch {
        // keep trying candidates
      }
    }
  }

  console.error('JSON repair failed', text);
  try {
    JSON.parse(text);
  } catch (e) {
    throw new Error(`Invalid JSON: ${e.message}`);
  }

  throw new Error('Invalid JSON: Unknown parsing failure');
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

    // 1. Detector ID Format & Existence
    const detectorId = issue.detector_id || parseDetectorId(issue.description);
    const isWellFormedDetector = detectorId && /L\d+-\d+/.test(detectorId);

    // If no well-formed detector ID is present, category and description are strictly required
    if (!isWellFormedDetector) {
      if (typeof issue.category !== 'string') {
        throw new Error(`Issue at index ${index} has invalid or missing category`);
      }
    }

    if (typeof issue.description !== 'string') {
      throw new Error(`Issue at index ${index} has invalid or missing description`);
    }

    if (detectorId) {
      // Validate format Lx-yy
      if (!/L\d+-\d+/.test(detectorId)) {
        throw new Error(`Issue at index ${index} has malformed detector_id: "${detectorId}" (expected Lx-yy)`);
      }

      if (isKnownDetectorId(detectorId)) {
        const meta = getDetectorMetadata(detectorId);

        // 2. Layer/Category consistency (only if category is already present)
        if (issue.category && !isValidDetectorForLayer(detectorId, issue.category)) {
          throw new Error(`Issue at index ${index} detector "${detectorId}" does not belong to layer "${issue.category}" (expected "${meta.layer}")`);
        }

        // 3. Subcategory consistency (only if subcategory is already present)
        if (issue.subcategory && !isValidDetectorForSubcategory(detectorId, issue.subcategory)) {
          throw new Error(`Issue at index ${index} detector "${detectorId}" does not belong to subcategory "${issue.subcategory}" (expected "${meta.subcategory}")`);
        }
      } else {
        throw new Error(`Issue at index ${index} has unknown detector_id: ${detectorId}`);
      }
    }

    // 4. Standalone Subcategory validation (if detector_id was missing)
    if (issue.category && issue.subcategory && !isValidSubcategory(issue.category, issue.subcategory)) {
      throw new Error(`Issue at index ${index} has subcategory "${issue.subcategory}" which is invalid for layer "${issue.category}"`);
    }

    // Traceability & Remediation type checks
    if (issue.detector_id && typeof issue.detector_id !== 'string') {
      throw new Error(`Issue at index ${index} has invalid detector_id type`);
    }
    if (issue.detector_name && typeof issue.detector_name !== 'string') {
      throw new Error(`Issue at index ${index} has invalid detector_name type`);
    }
    if (issue.subcategory && typeof issue.subcategory !== 'string') {
      throw new Error(`Issue at index ${index} has invalid subcategory type`);
    }
    if (issue.why_triggered && typeof issue.why_triggered !== 'string') {
      throw new Error(`Issue at index ${index} has invalid why_triggered type`);
    }
    if (issue.escalation_reason && typeof issue.escalation_reason !== 'string') {
      throw new Error(`Issue at index ${index} has invalid escalation_reason type`);
    }
    if (issue.failure_type && typeof issue.failure_type !== 'string') {
      throw new Error(`Issue at index ${index} has invalid failure_type type`);
    }
    if (issue.constraint_reference && typeof issue.constraint_reference !== 'string') {
      throw new Error(`Issue at index ${index} has invalid constraint_reference type`);
    }
    if (issue.violation_reference && typeof issue.violation_reference !== 'string') {
      throw new Error(`Issue at index ${index} has invalid violation_reference type`);
    }
    if (issue.contract_step && typeof issue.contract_step !== 'string') {
      throw new Error(`Issue at index ${index} has invalid contract_step type`);
    }
    if (issue.invariant_broken && typeof issue.invariant_broken !== 'string') {
      throw new Error(`Issue at index ${index} has invalid invariant_broken type`);
    }
    if (issue.authority_boundary && typeof issue.authority_boundary !== 'string') {
      throw new Error(`Issue at index ${index} has invalid authority_boundary type`);
    }
    if (issue.evidence_reference && typeof issue.evidence_reference !== 'string') {
      throw new Error(`Issue at index ${index} has invalid evidence_reference type`);
    }
    if (issue.section_slug && typeof issue.section_slug !== 'string') {
      throw new Error(`Issue at index ${index} has invalid section_slug type`);
    }
    if (issue.document_anchor && typeof issue.document_anchor !== 'string') {
      throw new Error(`Issue at index ${index} has invalid document_anchor type`);
    }
    if (issue.document_anchors) {
      if (!Array.isArray(issue.document_anchors) || issue.document_anchors.some((anchor) => typeof anchor !== 'string')) {
        throw new Error(`Issue at index ${index} has invalid document_anchors type`);
      }
    }
    if (issue.anchor_source && typeof issue.anchor_source !== 'string') {
      throw new Error(`Issue at index ${index} has invalid anchor_source type`);
    }
    if (issue.detection_source !== undefined) {
      if (typeof issue.detection_source !== 'string') {
        throw new Error(`Issue at index ${index} has invalid detection_source type`);
      }
      if (!['model', 'rule', 'hybrid', 'hybrid_anchor', 'hybrid_graph'].includes(issue.detection_source)) {
        throw new Error(`Issue at index ${index} has invalid detection_source value`);
      }
    }
    if (issue.evidence_spans !== undefined) {
      if (!Array.isArray(issue.evidence_spans)) {
        throw new Error(`Issue at index ${index} has invalid evidence_spans type`);
      }
      issue.evidence_spans.forEach((span, spanIndex) => {
        if (!span || typeof span !== 'object') {
          throw new Error(`Issue at index ${index} has invalid evidence_spans[${spanIndex}] entry`);
        }
        ['file', 'section', 'section_slug', 'anchor', 'role', 'source', 'excerpt'].forEach((field) => {
          if (span[field] !== undefined && typeof span[field] !== 'string') {
            throw new Error(`Issue at index ${index} has invalid evidence_spans[${spanIndex}].${field}`);
          }
        });
        ['line_start', 'line_end'].forEach((field) => {
          if (span[field] !== undefined && !Number.isFinite(Number(span[field]))) {
            throw new Error(`Issue at index ${index} has invalid evidence_spans[${spanIndex}].${field}`);
          }
        });
      });
    }
    if (issue.proof_chains !== undefined) {
      if (!Array.isArray(issue.proof_chains)) {
        throw new Error(`Issue at index ${index} has invalid proof_chains type`);
      }
      issue.proof_chains.forEach((chain, chainIndex) => {
        if (!chain || typeof chain !== 'object') {
          throw new Error(`Issue at index ${index} has invalid proof_chains[${chainIndex}] entry`);
        }
        ['id', 'relation', 'evidence_type', 'rationale'].forEach((field) => {
          if (chain[field] !== undefined && typeof chain[field] !== 'string') {
            throw new Error(`Issue at index ${index} has invalid proof_chains[${chainIndex}].${field}`);
          }
        });
        if (chain.relation && !['supports', 'contradicts', 'defines', 'depends_on', 'references', 'violates'].includes(chain.relation)) {
          throw new Error(`Issue at index ${index} has invalid proof_chains[${chainIndex}].relation`);
        }
        if (chain.related_keys !== undefined) {
          if (!Array.isArray(chain.related_keys) || chain.related_keys.some((value) => typeof value !== 'string')) {
            throw new Error(`Issue at index ${index} has invalid proof_chains[${chainIndex}].related_keys`);
          }
        }
        ['source_span', 'target_span'].forEach((field) => {
          const span = chain[field];
          if (!span || typeof span !== 'object') {
            throw new Error(`Issue at index ${index} has invalid proof_chains[${chainIndex}].${field}`);
          }
          ['file', 'section', 'section_slug', 'anchor', 'role', 'source', 'excerpt'].forEach((spanField) => {
            if (span[spanField] !== undefined && typeof span[spanField] !== 'string') {
              throw new Error(`Issue at index ${index} has invalid proof_chains[${chainIndex}].${field}.${spanField}`);
            }
          });
          ['line_start', 'line_end'].forEach((spanField) => {
            if (span[spanField] !== undefined && !Number.isFinite(Number(span[spanField]))) {
              throw new Error(`Issue at index ${index} has invalid proof_chains[${chainIndex}].${field}.${spanField}`);
            }
          });
        });
      });
    }
    if (issue.cross_file_links !== undefined) {
      if (!Array.isArray(issue.cross_file_links)) {
        throw new Error(`Issue at index ${index} has invalid cross_file_links type`);
      }
      issue.cross_file_links.forEach((link, linkIndex) => {
        if (!link || typeof link !== 'object') {
          throw new Error(`Issue at index ${index} has invalid cross_file_links[${linkIndex}] entry`);
        }
        if (typeof link.target !== 'string' || !link.target.trim()) {
          throw new Error(`Issue at index ${index} has invalid cross_file_links[${linkIndex}].target`);
        }
        ['type', 'label', 'file', 'section'].forEach((field) => {
          if (link[field] !== undefined && typeof link[field] !== 'string') {
            throw new Error(`Issue at index ${index} has invalid cross_file_links[${linkIndex}].${field}`);
          }
        });
        if (link.related_keys !== undefined) {
          if (!Array.isArray(link.related_keys) || link.related_keys.some((value) => typeof value !== 'string')) {
            throw new Error(`Issue at index ${index} has invalid cross_file_links[${linkIndex}].related_keys`);
          }
        }
      });
    }
    if (issue.closed_world_status && typeof issue.closed_world_status !== 'string') {
      throw new Error(`Issue at index ${index} has invalid closed_world_status type`);
    }
    if (issue.line_number !== undefined && !Number.isFinite(Number(issue.line_number))) {
      throw new Error(`Issue at index ${index} has invalid line_number type`);
    }
    if (issue.line_end !== undefined && !Number.isFinite(Number(issue.line_end))) {
      throw new Error(`Issue at index ${index} has invalid line_end type`);
    }
    if (issue.assumption_detected !== undefined && typeof issue.assumption_detected !== 'boolean') {
      throw new Error(`Issue at index ${index} has invalid assumption_detected type`);
    }
    if (issue.deterministic_fix && typeof issue.deterministic_fix !== 'string') {
      throw new Error(`Issue at index ${index} has invalid deterministic_fix type`);
    }
    if (issue.analysis_agent && typeof issue.analysis_agent !== 'string') {
      throw new Error(`Issue at index ${index} has invalid analysis_agent type`);
    }
    if (issue.analysis_agents && !Array.isArray(issue.analysis_agents)) {
      throw new Error(`Issue at index ${index} has invalid analysis_agents (must be array)`);
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

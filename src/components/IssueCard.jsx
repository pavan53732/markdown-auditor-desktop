import React, { useState } from 'react';
import { getLayerById, SEVERITY_STYLE } from '../lib/layers';

export default function IssueCard({ issue }) {
  const [expanded, setExpanded] = useState(false);

  const severityStyle = SEVERITY_STYLE[issue.severity] || SEVERITY_STYLE.medium;
  const layer = getLayerById(issue.category);

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.95) return '#22C55E';
    if (confidence >= 0.80) return '#84CC16';
    if (confidence >= 0.60) return '#EAB308';
    return '#F97316';
  };

  const getImpactLabel = (score) => {
    if (score >= 9) return 'Critical';
    if (score >= 7) return 'High';
    if (score >= 5) return 'Medium';
    if (score >= 3) return 'Low';
    return 'Trivial';
  };

  const getDifficultyColor = (difficulty) => {
    if (difficulty === 'easy') return '#22C55E';
    if (difficulty === 'moderate') return '#EAB308';
    return '#EF4444';
  };

  return (
    <div
      className="bg-[#1F2937] border border-[#374151] rounded-lg overflow-hidden transition-colors hover:border-[#4B5563]"
      style={{ borderLeftWidth: '3px', borderLeftColor: severityStyle.color }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-start gap-3 text-left"
      >
        <span className="mt-0.5 text-[#6B7280] transition-transform" style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </span>

        <div className="flex-1 min-w-0">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span
              className="px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide"
              style={{
                color: severityStyle.color,
                backgroundColor: severityStyle.bg
              }}
            >
              {issue.severity}
            </span>
            <span
              className="px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1"
              style={{
                color: layer.color,
                backgroundColor: layer.bg
              }}
            >
              <span>{layer.icon}</span>
              <span>{layer.label.split('&')[0].trim()}</span>
            </span>
            {issue.confidence !== undefined && (
              <span
                className="px-2 py-0.5 rounded-full text-xs font-medium"
                style={{
                  color: getConfidenceColor(issue.confidence),
                  backgroundColor: getConfidenceColor(issue.confidence) + '20'
                }}
              >
                {Math.round(issue.confidence * 100)}% confidence
              </span>
            )}
            {issue.diffStatus && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-widest ${
                  issue.diffStatus === 'new' ? 'bg-[#064E3B] text-[#34D399]' :
                  issue.diffStatus === 'resolved' ? 'bg-[#450A0A] text-[#F87171]' :
                  'bg-[#1E1B4B] text-[#818CF8]'
                }`}
              >
                {issue.diffStatus}
              </span>
            )}
          </div>

          {/* Title */}
          <p className="text-sm text-[#F9FAFB] font-medium leading-snug">
            {issue.description}
          </p>

          {/* Subtitle */}
          <p className="text-xs text-[#6B7280] mt-1">
            {(issue.files || []).join(', ')}
            {issue.section && ` · ${issue.section}`}
            {issue.line_number && ` · Line ${issue.line_number}${issue.line_end ? `-${issue.line_end}` : ''}`}
          </p>
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-[#374151]">
          <div className="pt-3">
            <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide mb-1">Analysis</p>
            <p className="text-sm text-[#D1D5DB] leading-relaxed">{issue.description}</p>
          </div>

          {issue.evidence && (
            <div>
              <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide mb-1">Evidence</p>
              <pre className="text-xs text-[#D1D5DB] bg-[#111827] border border-[#374151] rounded-lg p-3 whitespace-pre-wrap font-mono overflow-x-auto">
                {issue.evidence}
              </pre>
            </div>
          )}

          {/* Metrics Row */}
          <div className="flex flex-wrap gap-3 py-1">
            {issue.impact_score !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#9CA3AF]">Impact:</span>
                <span className="text-xs font-medium text-[#F9FAFB]">{issue.impact_score}/10</span>
                <span className="text-xs text-[#6B7280]">({getImpactLabel(issue.impact_score)})</span>
              </div>
            )}
            {issue.fix_difficulty && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#9CA3AF]">Difficulty:</span>
                <span
                  className="text-xs font-medium px-1.5 py-0.5 rounded"
                  style={{
                    color: getDifficultyColor(issue.fix_difficulty),
                    backgroundColor: getDifficultyColor(issue.fix_difficulty) + '20'
                  }}
                >
                  {issue.fix_difficulty}
                </span>
              </div>
            )}
            {issue.estimated_effort && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#9CA3AF]">Effort:</span>
                <span className="text-xs font-medium text-[#F9FAFB]">{issue.estimated_effort}</span>
              </div>
            )}
          </div>

          {/* Detector Traceability */}
          <div className="bg-[#111827] border border-[#374151] rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Detector Traceability</span>
              {issue.detector_id && (
                <span className="text-[10px] font-mono bg-[#374151] text-[#9CA3AF] px-1.5 py-0.5 rounded">{issue.detector_id}</span>
              )}
            </div>
            {(issue.subcategory || issue.detector_name || issue.failure_type || issue.contract_step) && (
              <div className="flex flex-wrap gap-2 pb-1">
                {issue.subcategory && (
                  <span className="px-2 py-0.5 bg-[#1F2937] border border-[#4B5563] rounded-full text-[10px] text-[#D1D5DB]">
                    Subcat: {issue.subcategory}
                  </span>
                )}
                {issue.detector_name && (
                  <span className="px-2 py-0.5 bg-[#1F2937] border border-[#4B5563] rounded-full text-[10px] text-[#D1D5DB]">
                    Detector: {issue.detector_name}
                  </span>
                )}
                {issue.failure_type && (
                  <span className="px-2 py-0.5 bg-[#1F2937] border border-[#4B5563] rounded-full text-[10px] text-[#D1D5DB]">
                    Failure: {issue.failure_type}
                  </span>
                )}
                {issue.contract_step && (
                  <span className="px-2 py-0.5 bg-[#1F2937] border border-[#4B5563] rounded-full text-[10px] text-[#D1D5DB]">
                    Step: {issue.contract_step}
                  </span>
                )}
              </div>
            )}
            {(issue.invariant_broken || issue.authority_boundary || issue.constraint_reference || issue.violation_reference || issue.closed_world_status || issue.analysis_agents?.length || issue.document_anchor || issue.anchor_source || issue.detection_source || issue.evidence_spans?.length || issue.cross_file_links?.length) && (
              <div className="grid gap-2 border-t border-[#374151] pt-2">
                {issue.document_anchor && (
                  <div>
                    <p className="text-xs font-semibold text-[#9CA3AF] mb-0.5">Document anchor:</p>
                    <p className="text-xs text-[#D1D5DB] break-all">{issue.document_anchor}</p>
                  </div>
                )}
                {issue.document_anchors?.length > 1 && (
                  <div>
                    <p className="text-xs font-semibold text-[#9CA3AF] mb-1">Additional anchors:</p>
                    <div className="space-y-1">
                      {issue.document_anchors.slice(1).map((anchor) => (
                        <p key={anchor} className="text-xs text-[#D1D5DB] break-all">{anchor}</p>
                      ))}
                    </div>
                  </div>
                )}
                {issue.anchor_source && (
                  <div>
                    <p className="text-xs font-semibold text-[#9CA3AF] mb-0.5">Anchor source:</p>
                    <p className="text-xs text-[#D1D5DB]">{issue.anchor_source}</p>
                  </div>
                )}
                {issue.detection_source && (
                  <div>
                    <p className="text-xs font-semibold text-[#9CA3AF] mb-0.5">Detection source:</p>
                    <p className="text-xs text-[#D1D5DB]">{issue.detection_source}</p>
                  </div>
                )}
                {issue.invariant_broken && (
                  <div>
                    <p className="text-xs font-semibold text-[#9CA3AF] mb-0.5">Invariant broken:</p>
                    <p className="text-xs text-[#D1D5DB] break-all">{issue.invariant_broken}</p>
                  </div>
                )}
                {issue.authority_boundary && (
                  <div>
                    <p className="text-xs font-semibold text-[#9CA3AF] mb-0.5">Authority boundary:</p>
                    <p className="text-xs text-[#D1D5DB] break-all">{issue.authority_boundary}</p>
                  </div>
                )}
                {issue.constraint_reference && (
                  <div>
                    <p className="text-xs font-semibold text-[#9CA3AF] mb-0.5">Constraint reference:</p>
                    <p className="text-xs text-[#D1D5DB] break-all">{issue.constraint_reference}</p>
                  </div>
                )}
                {issue.violation_reference && (
                  <div>
                    <p className="text-xs font-semibold text-[#9CA3AF] mb-0.5">Violation reference:</p>
                    <p className="text-xs text-[#D1D5DB] break-all">{issue.violation_reference}</p>
                  </div>
                )}
                {issue.closed_world_status && (
                  <div>
                    <p className="text-xs font-semibold text-[#9CA3AF] mb-0.5">Closed-world status:</p>
                    <p className="text-xs text-[#D1D5DB]">{issue.closed_world_status}</p>
                  </div>
                )}
                {issue.analysis_agents?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-[#9CA3AF] mb-1">Analysis agents:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {issue.analysis_agents.map((agentId) => (
                        <span key={agentId} className="px-2 py-0.5 bg-[#1F2937] border border-[#4B5563] rounded-full text-[10px] text-[#D1D5DB]">
                          {agentId}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {issue.evidence_spans?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-[#9CA3AF] mb-1">Evidence spans:</p>
                    <div className="space-y-2">
                      {issue.evidence_spans.map((span) => (
                        <div key={`${span.role}-${span.anchor || span.file}-${span.line_start || ''}`} className="rounded-lg border border-[#374151] bg-[#0B1220] px-2.5 py-2">
                          <p className="text-[11px] text-[#F9FAFB] break-all">
                            {[span.role, span.file, span.section, span.anchor].filter(Boolean).join(' · ')}
                          </p>
                          {span.excerpt && (
                            <p className="text-[11px] text-[#9CA3AF] mt-1 leading-relaxed">{span.excerpt}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {issue.cross_file_links?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-[#9CA3AF] mb-1">Cross-file links:</p>
                    <div className="space-y-2">
                      {issue.cross_file_links.map((link) => (
                        <div key={link.target} className="rounded-lg border border-[#374151] bg-[#0F172A] px-2.5 py-2">
                          <p className="text-xs text-[#F9FAFB] break-all">{link.label || link.target}</p>
                          <p className="text-[11px] text-[#9CA3AF] break-all">
                            {[link.type, link.file, link.section, link.target].filter(Boolean).join(' · ')}
                          </p>
                          {link.related_keys?.length > 0 && (
                            <p className="text-[11px] text-[#6B7280] break-all">
                              Keys: {link.related_keys.join(', ')}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {issue.why_triggered && (
              <div>
                <p className="text-xs font-semibold text-[#9CA3AF] mb-0.5">Why triggered:</p>
                <p className="text-xs text-[#D1D5DB] leading-relaxed">{issue.why_triggered}</p>
              </div>
            )}
            {issue.assumption_detected !== undefined && (
              <div className="border-t border-[#374151] pt-2">
                <p className="text-xs font-semibold text-[#9CA3AF] mb-0.5">Assumption detected:</p>
                <p className={`text-xs leading-relaxed ${issue.assumption_detected ? 'text-[#FCA5A5]' : 'text-[#D1D5DB]'}`}>
                  {issue.assumption_detected ? 'Yes - unsupported assumption materially affects this finding.' : 'No - finding is grounded in explicit document evidence.'}
                </p>
              </div>
            )}
            {issue.escalation_reason && (
              <div className="border-t border-[#374151] pt-2">
                <p className="text-xs font-semibold text-[#9CA3AF] mb-0.5">Escalation reason:</p>
                <p className="text-xs text-[#FCA5A5] leading-relaxed">{issue.escalation_reason}</p>
              </div>
            )}
          </div>

          {/* Remediation Guidance */}
          {(issue.deterministic_fix || issue.recommended_fix || issue.fix_steps) && (
            <div className="bg-[#064E3B] bg-opacity-20 border border-[#059669] border-opacity-30 rounded-lg p-3 space-y-3">
              <span className="text-[10px] font-bold text-[#10B981] uppercase tracking-widest">Remediation Guidance</span>
              {issue.deterministic_fix && (
                <div>
                  <p className="text-xs font-semibold text-[#D1D5DB] mb-1">Deterministic Fix:</p>
                  <p className="text-sm text-[#F9FAFB] leading-relaxed font-medium">{issue.deterministic_fix}</p>
                </div>
              )}
              {issue.recommended_fix && (
                <div>
                  <p className="text-xs font-semibold text-[#D1D5DB] mb-1">Recommended Fix:</p>
                  <p className="text-sm text-[#F9FAFB] leading-relaxed font-medium">{issue.recommended_fix}</p>
                </div>
              )}
              {issue.fix_steps && issue.fix_steps.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-[#D1D5DB] mb-1.5">Action Steps:</p>
                  <ul className="space-y-1.5">
                    {issue.fix_steps.map((step, i) => (
                      <li key={i} className="flex gap-2 text-xs text-[#D1D5DB]">
                        <span className="text-[#10B981] font-bold">{i + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {issue.verification_steps && issue.verification_steps.length > 0 && (
                <div className="pt-1">
                  <p className="text-xs font-semibold text-[#D1D5DB] mb-1.5">Verification:</p>
                  <ul className="space-y-1">
                    {issue.verification_steps.map((step, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-[#9CA3AF]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] bg-opacity-50"></span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {issue.tags && issue.tags.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide mb-1">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {issue.tags.map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 bg-[#374151] border border-[#4B5563] rounded text-xs text-[#9CA3AF]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {issue.files && issue.files.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide mb-1">Files</p>
              <div className="flex flex-wrap gap-1.5">
                {issue.files.map((file, i) => (
                  <span key={i} className="px-2 py-0.5 bg-[#111827] border border-[#374151] rounded text-xs text-[#9CA3AF]">
                    {file}
                  </span>
                ))}
              </div>
            </div>
          )}

          {issue.references && issue.references.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide mb-1">References</p>
              <div className="flex flex-wrap gap-1.5">
                {issue.references.map((ref, i) => (
                  <a key={i} href={ref} target="_blank" rel="noopener noreferrer" className="px-2 py-0.5 bg-[#111827] border border-[#374151] rounded text-xs text-[#60A5FA] hover:underline truncate max-w-[200px]">
                    {ref}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

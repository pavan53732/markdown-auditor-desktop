import React, { useMemo } from 'react';
import IssueCard from './IssueCard';
import { getLayerById } from '../lib/layers';

export default function IssueList({ issues, activeLayer, groupingMode = 'flat', rootCauses = [] }) {
  const filtered = useMemo(() => {
    if (!issues || issues.length === 0) return [];
    return activeLayer === 'all'
      ? issues
      : issues.filter((issue) => issue.category === activeLayer);
  }, [issues, activeLayer]);

  const groupedIssues = useMemo(() => {
    if (filtered.length === 0) return null;
    if (groupingMode === 'flat') return { 'All Issues': filtered };

    const groups = {};
    filtered.forEach(issue => {
      let key = 'Other';
      if (groupingMode === 'file') {
        key = issue.files?.[0] || 'Unknown File';
      } else if (groupingMode === 'severity') {
        key = issue.severity.toUpperCase();
      } else if (groupingMode === 'layer') {
        key = getLayerById(issue.category).label;
      } else if (groupingMode === 'root_cause') {
        const rc = rootCauses.find(r => r.id === issue.root_cause_id);
        key = rc ? rc.title : 'Uncategorized';
      }
      
      if (!groups[key]) groups[key] = [];
      groups[key].push(issue);
    });
    return groups;
  }, [filtered, groupingMode, rootCauses]);

  if (!issues || issues.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[#6B7280] text-sm">No issues found.</p>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[#6B7280] text-sm">No issues in this layer.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {groupedIssues && Object.entries(groupedIssues).map(([groupName, groupIssues]) => (
        <div key={groupName} className="space-y-3">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xs font-bold text-[#6B7280] uppercase tracking-widest">{groupName}</h3>
            <span className="h-px flex-1 bg-[#1F2937]"></span>
            <span className="text-[10px] font-medium text-[#4B5563] bg-[#1F2937] px-2 py-0.5 rounded-full">
              {groupIssues.length} {groupIssues.length === 1 ? 'issue' : 'issues'}
            </span>
          </div>
          
          {groupingMode === 'root_cause' && groupName !== 'Uncategorized' && (
            <div className="mb-4 p-3 bg-[#1F2937] border border-[#374151] rounded-lg">
              {rootCauses.find(r => r.title === groupName) && (
                <>
                  <p className="text-xs text-[#9CA3AF] leading-relaxed">
                    {rootCauses.find(r => r.title === groupName).description}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-[#6B7280]">ROOT CAUSE IMPACT:</span>
                    <span className="text-[10px] font-bold text-[#FCA5A5]">{rootCauses.find(r => r.title === groupName).impact}</span>
                  </div>
                </>
              )}
            </div>
          )}

          <div className="space-y-3">
            {groupIssues.map((issue, index) => (
              <IssueCard key={issue.id || index} issue={issue} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
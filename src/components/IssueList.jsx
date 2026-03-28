import React from 'react';
import IssueCard from './IssueCard';

export default function IssueList({ issues, activeLayer }) {
  if (!issues || issues.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[#6B7280] text-sm">No issues found.</p>
      </div>
    );
  }

  const filtered =
    activeLayer === 'all'
      ? issues
      : issues.filter((issue) => issue.category === activeLayer);

  if (filtered.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[#6B7280] text-sm">No issues in this layer.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filtered.map((issue, index) => (
        <IssueCard key={issue.id || index} issue={issue} />
      ))}
    </div>
  );
}
import React from 'react';

export default function DiffSummaryPanel({ diff, active, onToggle }) {
  if (!diff) return null;

  return (
    <div className={`mb-6 p-4 rounded-xl border transition-all ${
      active 
        ? 'bg-[#1E1B4B] border-[#4338CA] shadow-lg shadow-indigo-500/10' 
        : 'bg-[#111827] border-[#1F2937] hover:border-[#374151]'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#60A5FA] animate-pulse"></div>
          <h3 className="text-sm font-semibold text-[#F9FAFB]">Session Diff vs. Previous Audit</h3>
        </div>
        <button
          onClick={() => onToggle(!active)}
          className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider transition-colors ${
            active 
              ? 'bg-[#4338CA] text-white' 
              : 'bg-[#1F2937] text-[#9CA3AF] hover:bg-[#283548]'
          }`}
        >
          {active ? 'Hide Diff Mode' : 'Show Diff Mode'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="p-3 bg-[#064E3B] bg-opacity-20 border border-[#059669] border-opacity-30 rounded-lg">
          <p className="text-[10px] font-bold text-[#10B981] uppercase tracking-widest mb-1">New Issues</p>
          <p className="text-2xl font-bold text-[#34D399]">+{diff.totalNew}</p>
        </div>
        <div className="p-3 bg-[#450A0A] bg-opacity-20 border border-[#991B1B] border-opacity-30 rounded-lg">
          <p className="text-[10px] font-bold text-[#F87171] uppercase tracking-widest mb-1">Resolved</p>
          <p className="text-2xl font-bold text-[#F87171]">-{diff.totalResolved}</p>
        </div>
        <div className="p-3 bg-[#1E1B4B] bg-opacity-20 border border-[#4338CA] border-opacity-30 rounded-lg">
          <p className="text-[10px] font-bold text-[#818CF8] uppercase tracking-widest mb-1">Severity Changed</p>
          <p className="text-2xl font-bold text-[#818CF8]">{diff.totalChanged}</p>
        </div>
      </div>
      
      {active && (
        <p className="mt-3 text-xs text-[#9CA3AF] italic text-center">
          Showing new, resolved, and changed issues. Unchanged issues are hidden.
        </p>
      )}
    </div>
  );
}

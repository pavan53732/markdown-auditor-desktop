import React from 'react';

export default function HistoryModal({ open, history, onOpen, onDelete, onClear, onCancel }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-2xl mx-4 bg-[#1F2937] rounded-xl border border-[#374151] shadow-2xl flex flex-col max-h-[80vh]">
        <div className="px-6 py-4 border-b border-[#374151] flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#F9FAFB]">Audit History</h2>
          {history.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Clear all audit history? This cannot be undone.')) {
                  onClear();
                }
              }}
              className="text-xs text-[#F87171] hover:underline"
            >
              Clear All
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#6B7280] text-sm">No history entries found.</p>
            </div>
          ) : (
            history.map((entry) => (
              <div
                key={entry.id}
                className="p-4 bg-[#111827] border border-[#374151] rounded-lg hover:border-[#60A5FA] transition-all group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-semibold text-[#F9FAFB]">{entry.title}</h3>
                    <p className="text-[10px] text-[#6B7280]">{new Date(entry.timestamp).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpen(entry.id)}
                      className="px-3 py-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[10px] font-bold uppercase rounded transition-colors"
                    >
                      Open
                    </button>
                    <button
                      onClick={() => onDelete(entry.id)}
                      className="p-1.5 text-[#6B7280] hover:text-[#F87171] transition-colors"
                      title="Delete entry"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-[#9CA3AF]">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-[#6B7280]">FILES:</span>
                    <span>{entry.fileCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-[#6B7280]">MODEL:</span>
                    <span className="truncate max-w-[120px]">{entry.model}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#6B7280]">ISSUES:</span>
                    <span className="text-[#F87171]">{entry.issuesCount.critical}C</span>
                    <span className="text-[#FCA5A5]">{entry.issuesCount.high}H</span>
                    <span className="text-[#FCD34D]">{entry.issuesCount.medium}M</span>
                    <span className="text-[#34D399]">{entry.issuesCount.low}L</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-6 py-4 border-t border-[#374151] flex justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-[#9CA3AF] hover:text-[#F9FAFB] text-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useMemo } from 'react';

export default function HistoryModal({ 
  open, 
  history, 
  onOpen, 
  onDelete, 
  onClear, 
  onUpdate,
  onCompare,
  onSelectBaseline,
  baselineId,
  onCancel 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModel, setFilterModel] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, total_issues
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditingTitle] = useState('');
  const [editNote, setEditingNote] = useState('');

  const models = useMemo(() => ['all', ...new Set(history.map(e => e.model).filter(Boolean))], [history]);
  const sources = useMemo(() => ['all', ...new Set(history.map(e => e.sourceType).filter(Boolean))], [history]);

  const filteredAndSorted = useMemo(() => {
    let result = [...history];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(e => 
        e.title.toLowerCase().includes(q) || 
        e.note?.toLowerCase().includes(q) ||
        e.fileNames?.some(f => f.toLowerCase().includes(q))
      );
    }

    // Filters
    if (filterModel !== 'all') result = result.filter(e => e.model === filterModel);
    if (filterSource !== 'all') result = result.filter(e => e.sourceType === filterSource);

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.timestamp) - new Date(a.timestamp);
      if (sortBy === 'oldest') return new Date(a.timestamp) - new Date(b.timestamp);
      if (sortBy === 'total_issues') return (b.issuesCount?.total || 0) - (a.issuesCount?.total || 0);
      return 0;
    });

    return result;
  }, [history, searchQuery, filterModel, filterSource, sortBy]);

  const startEdit = (entry) => {
    setEditingId(entry.id);
    setEditingTitle(entry.title);
    setEditingNote(entry.note || '');
  };

  const saveEdit = () => {
    onUpdate(editingId, { title: editTitle, note: editNote });
    setEditingId(null);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
      <div className="relative w-full max-w-4xl mx-4 bg-[#1F2937] rounded-xl border border-[#374151] shadow-2xl flex flex-col h-[85vh]">
        <div className="px-6 py-4 border-b border-[#374151] flex items-center justify-between bg-[#111827] rounded-t-xl">
          <div>
            <h2 className="text-lg font-semibold text-[#F9FAFB]">Audit History Workbench</h2>
            <p className="text-xs text-[#6B7280]">Manage, label, and compare past documentation audits</p>
          </div>
          {history.length > 0 && (
            <button
              onClick={() => confirm('Clear all audit history?') && onClear()}
              className="text-xs text-[#F87171] hover:underline"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-[#374151] bg-[#111827]/50 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#1F2937] border border-[#374151] rounded-lg text-sm text-[#F9FAFB] focus:outline-none focus:border-[#60A5FA]"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>

          <select value={filterSource} onChange={(e) => setFilterSource(e.target.value)} className="bg-[#1F2937] border border-[#374151] rounded-lg text-xs text-[#9CA3AF] px-2 py-1.5">
            <option value="all">All Sources</option>
            {sources.filter(s => s !== 'all').map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>

          <select value={filterModel} onChange={(e) => setFilterModel(e.target.value)} className="bg-[#1F2937] border border-[#374151] rounded-lg text-xs text-[#9CA3AF] px-2 py-1.5">
            <option value="all">All Models</option>
            {models.filter(m => m !== 'all').map(m => <option key={m} value={m}>{m}</option>)}
          </select>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-[#1F2937] border border-[#374151] rounded-lg text-xs text-[#9CA3AF] px-2 py-1.5">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="total_issues">Most Issues</option>
          </select>
        </div>

        {baselineId && (
          <div className="px-6 py-2 bg-[#064E3B] bg-opacity-30 border-b border-[#059669] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#34D399] uppercase tracking-widest">Baseline:</span>
              <span className="text-xs text-[#F9FAFB] font-medium truncate max-w-md">
                {history.find(e => e.id === baselineId)?.title || 'Selected entry'}
              </span>
            </div>
            <button 
              onClick={() => onSelectBaseline(null)}
              className="text-[10px] text-[#34D399] hover:underline uppercase font-bold"
            >
              Clear Baseline
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#111827]/30">
          {filteredAndSorted.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#6B7280] text-sm">No matching history entries found.</p>
            </div>
          ) : (
            filteredAndSorted.map((entry) => (
              <div
                key={entry.id}
                className={`p-4 bg-[#111827] border rounded-lg transition-all ${
                  editingId === entry.id ? 'border-[#60A5FA] ring-1 ring-[#60A5FA]/20' : 
                  baselineId === entry.id ? 'border-[#059669] bg-[#064E3B]/10' : 'border-[#374151] hover:border-[#4B5563]'
                }`}
              >
                {editingId === entry.id ? (
                  <div className="space-y-3">
                    <input
                      autoFocus
                      value={editTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#1F2937] border border-[#4B5563] rounded text-sm text-[#F9FAFB] focus:outline-none focus:border-[#60A5FA]"
                      placeholder="Title"
                    />
                    <textarea
                      value={editNote}
                      onChange={(e) => setEditingNote(e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#1F2937] border border-[#4B5563] rounded text-xs text-[#D1D5DB] focus:outline-none focus:border-[#60A5FA] h-20 resize-none"
                      placeholder="Optional notes..."
                    />
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditingId(null)} className="px-3 py-1 text-xs text-[#9CA3AF] hover:text-[#F9FAFB]">Cancel</button>
                      <button onClick={saveEdit} className="px-3 py-1 bg-[#2563EB] text-white text-xs font-bold rounded">Save Changes</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-[#F9FAFB] truncate">{entry.title}</h3>
                          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            entry.sourceType === 'fresh_analysis' ? 'bg-[#064E3B] text-[#34D399]' : 'bg-[#1E1B4B] text-[#818CF8]'
                          }`}>
                            {entry.sourceType?.replace('_', ' ') || 'run'}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#6B7280]">{new Date(entry.timestamp).toLocaleString()}</p>
                        {entry.note && (
                          <p className="mt-2 text-xs text-[#9CA3AF] italic line-clamp-2">{entry.note}</p>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          onClick={() => onOpen(entry.id)}
                          className="px-3 py-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[10px] font-bold uppercase rounded transition-colors"
                        >
                          Open
                        </button>
                        
                        <button
                          onClick={() => onSelectBaseline(entry.id)}
                          className={`px-3 py-1 text-[10px] font-bold uppercase rounded transition-colors ${
                            baselineId === entry.id 
                              ? 'bg-[#059669] text-white' 
                              : 'bg-[#374151] hover:bg-[#4B5563] text-[#F9FAFB]'
                          }`}
                        >
                          {baselineId === entry.id ? 'Baseline Selected' : 'Set Baseline'}
                        </button>

                        <button
                          onClick={() => onCompare(entry.id)}
                          className="px-3 py-1 bg-[#374151] hover:bg-[#4B5563] text-[#F9FAFB] text-[10px] font-bold uppercase rounded transition-colors disabled:opacity-50"
                          title={baselineId ? "Compare against baseline" : "Compare against current run"}
                        >
                          Compare
                        </button>

                        <button
                          onClick={() => startEdit(entry)}
                          className="p-1.5 text-[#6B7280] hover:text-[#60A5FA] transition-colors"
                          title="Edit label/notes"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button
                          onClick={() => confirm('Delete this entry?') && onDelete(entry.id)}
                          className="p-1.5 text-[#6B7280] hover:text-[#F87171] transition-colors"
                          title="Delete entry"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-[#9CA3AF] border-t border-[#374151]/50 pt-2 mt-2">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-[#6B7280]">FILES:</span>
                        <span title={entry.fileNames?.join(', ')}>{entry.fileCount} files</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#6B7280]">ISSUES:</span>
                        <span className="text-[#F87171] font-bold">{entry.issuesCount?.critical}C</span>
                        <span className="text-[#FCA5A5] font-bold">{entry.issuesCount?.high}H</span>
                        <span className="text-[#FCD34D] font-bold">{entry.issuesCount?.medium}M</span>
                        <span className="text-[#34D399] font-bold">{entry.issuesCount?.low}L</span>
                        {entry.rootCauseCount > 0 && (
                          <span className="ml-1 text-[#818CF8]">· {entry.rootCauseCount} Root Causes</span>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        <div className="px-6 py-4 border-t border-[#374151] flex justify-end bg-[#111827] rounded-b-xl">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-[#374151] hover:bg-[#4B5563] rounded-lg text-[#F9FAFB] text-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

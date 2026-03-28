import React from 'react';

const CARDS = [
  { key: 'total', label: 'Total Issues', color: '#F9FAFB' },
  { key: 'critical', label: 'Critical', color: '#A32D2D' },
  { key: 'high', label: 'High', color: '#854F0B' },
  { key: 'medium', label: 'Medium', color: '#0C447C' },
  { key: 'low', label: 'Low', color: '#3B6D11' }
];

export default function SummaryDashboard({ summary }) {
  if (!summary) return null;

  return (
    <div className="grid grid-cols-5 gap-3 mb-6">
      {CARDS.map((card) => (
        <div
          key={card.key}
          className="bg-[#1F2937] border border-[#374151] rounded-lg px-4 py-3 text-center"
        >
          <p className="text-2xl font-bold" style={{ color: card.color }}>
            {summary[card.key] ?? 0}
          </p>
          <p className="text-xs text-[#9CA3AF] mt-0.5">{card.label}</p>
        </div>
      ))}
    </div>
  );
}
import React from 'react';

export default function AnalyzeButton({ fileCount, providerConfigured, analyzing, onClick }) {
  const disabled = fileCount === 0 || !providerConfigured || analyzing;

  let tooltip = '';
  if (!providerConfigured) {
    tooltip = 'Configure AI provider via ⚙';
  } else if (fileCount === 0) {
    tooltip = 'Drop .md files to analyze';
  } else if (analyzing) {
    tooltip = 'Analysis in progress...';
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      className={`px-6 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
        disabled
          ? 'bg-[#374151] text-[#6B7280] cursor-not-allowed'
          : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-lg shadow-blue-900/30'
      }`}
    >
      {analyzing && (
        <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      Run Full Audit · {fileCount} file{fileCount !== 1 ? 's' : ''}
    </button>
  );
}
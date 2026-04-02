import React from 'react';
import brandIcon from '../assets/brand-icon.png';

export default function TopBar({ providerReady, onOpenSettings, onOpenHistory }) {
  return (
    <header className="flex items-center justify-between px-6 py-3 bg-[#1F2937] border-b border-[#374151]">
      <div className="flex items-center gap-3">
        <img
          src={brandIcon}
          alt="Markdown Intelligence Auditor"
          className="w-10 h-10 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
        />
        <div>
          <h1 className="text-lg font-semibold text-[#F9FAFB] leading-tight">
            Markdown Intelligence Auditor
          </h1>
          <p className="text-xs text-[#93C5FD] leading-tight">
            Deterministic specification and document audit
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              providerReady ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          <span className="text-sm text-[#9CA3AF]">
            {providerReady ? 'Provider ready' : 'Setup needed'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onOpenHistory}
            className="p-2 rounded-lg hover:bg-[#374151] transition-colors text-[#9CA3AF] hover:text-[#F9FAFB]"
            title="Audit History"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="9"/></svg>
          </button>
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg hover:bg-[#374151] transition-colors text-[#9CA3AF] hover:text-[#F9FAFB]"
            title="Settings"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

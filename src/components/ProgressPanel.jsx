import React, { useState, useEffect } from 'react';

const MESSAGES = [
  'Parsing document structure…',
  'Scanning for contradictions…',
  'Running logical integrity checks…',
  'Checking architectural consistency…',
  'Validating temporal & state logic…',
  'Auditing functional workflows…',
  'Running adversarial analysis…',
  'Building knowledge graph…',
  'Checking semantic clarity…',
  'Scoring completeness & coverage…',
  'Checking intent & goal alignment…',
  'Running meta-cognition analysis…',
  'Checking quantitative reasoning…',
  'Validating requirement integrity…',
  'Analyzing state machine consistency…',
  'Checking API contract compliance…',
  'Mapping dependency graph…',
  'Tracing data flow paths…',
  'Verifying execution paths…',
  'Auditing configuration consistency…',
  'Checking error handling coverage…',
  'Running security analysis…',
  'Evaluating performance & scalability…',
  'Assessing testability & verification…',
  'Analyzing maintainability & tech debt…',
  'Evaluating usability & UX…',
  'Checking interoperability…',
  'Verifying governance & compliance…',
  'Testing resilience & fault tolerance…',
  'Checking observability & monitoring…',
  'Assessing evolution & future-proofing…',
  'Running cross-layer validation…',
  'Compiling final report…'
];

export default function ProgressPanel({ model, baseURL }) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const host = baseURL ? new URL(baseURL).host : 'unknown';

  return (
    <div className="flex flex-col items-center py-16">
      <div className="w-full max-w-md space-y-6">
        {/* Spinner */}
        <div className="flex justify-center">
          <div className="w-12 h-12 border-4 border-[#374151] border-t-[#60A5FA] rounded-full animate-spin" />
        </div>

        {/* Rotating message */}
        <p className="text-center text-[#F9FAFB] text-base font-medium transition-opacity duration-300">
          {MESSAGES[messageIndex]}
        </p>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-[#374151] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#60A5FA] rounded-full animate-pulse"
            style={{ width: '60%' }}
          />
        </div>

        {/* Subtext */}
        <p className="text-center text-[#6B7280] text-xs">
          All 45 layers running · 633 micro-detectors · single context window
        </p>

        {/* Provider info */}
        <p className="text-center text-[#4B5563] text-xs">
          Using {model} via {host}
        </p>
      </div>
    </div>
  );
}
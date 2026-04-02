import React, { useState, useEffect } from 'react';
import { TOTAL_DETECTOR_COUNT } from '../lib/detectorMetadata';
import { TOTAL_LAYER_COUNT } from '../lib/layers';
import { ANALYSIS_AGENT_COUNT } from '../lib/analysisAgents';
import brandIcon from '../assets/brand-icon.png';

const MESSAGES = [
  'Parsing document structure...',
  'Scanning for contradictions...',
  'Running logical integrity checks...',
  'Checking architectural consistency...',
  'Validating temporal and state logic...',
  'Auditing functional workflows...',
  'Running adversarial analysis...',
  'Building knowledge graph...',
  'Checking semantic clarity...',
  'Scoring completeness and coverage...',
  'Checking intent and goal alignment...',
  'Running metacognition analysis...',
  'Checking quantitative reasoning...',
  'Validating requirement integrity...',
  'Analyzing state machine consistency...',
  'Checking API contract compliance...',
  'Mapping dependency graph...',
  'Tracing data flow paths...',
  'Verifying execution paths...',
  'Auditing configuration consistency...',
  'Checking error handling coverage...',
  'Running security analysis...',
  'Evaluating performance and scalability...',
  'Assessing testability and verification...',
  'Analyzing maintainability and tech debt...',
  'Evaluating usability and UX...',
  'Checking interoperability...',
  'Verifying governance and compliance...',
  'Testing resilience and fault tolerance...',
  'Checking observability and monitoring...',
  'Assessing evolution and future-proofing...',
  'Reconciling multi-agent findings...',
  'Running cross-layer validation...',
  'Compiling final report...'
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
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-[#2563EB]/25 blur-2xl rounded-full scale-110" />
            <img
              src={brandIcon}
              alt="Markdown Intelligence Auditor"
              className="relative w-20 h-20 rounded-[1.4rem] shadow-[0_24px_48px_rgba(0,0,0,0.35)]"
            />
          </div>
          <div className="w-12 h-12 border-4 border-[#374151] border-t-[#60A5FA] rounded-full animate-spin" />
        </div>

        <p className="text-center text-[#F9FAFB] text-base font-medium transition-opacity duration-300">
          {MESSAGES[messageIndex]}
        </p>

        <div className="w-full h-1.5 bg-[#374151] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#60A5FA] rounded-full animate-pulse"
            style={{ width: '60%' }}
          />
        </div>

        <p className="text-center text-[#6B7280] text-xs">
          {TOTAL_LAYER_COUNT} layers - {TOTAL_DETECTOR_COUNT} micro-detectors - {ANALYSIS_AGENT_COUNT}-agent deterministic mesh - chunk-aware batching when needed
        </p>

        <p className="text-center text-[#93C5FD] text-xs uppercase tracking-[0.2em]">
          Markdown Intelligence Auditor
        </p>

        <p className="text-center text-[#4B5563] text-xs">
          Using {model} via {host}
        </p>
      </div>
    </div>
  );
}

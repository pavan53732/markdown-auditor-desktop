import React from 'react';

function formatPercent(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return '0.0%';
  return `${number.toFixed(1)}%`;
}

function buildBarStyle(percent, color) {
  const width = Math.max(0, Math.min(100, Number(percent) || 0));
  return {
    width: `${width}%`,
    background: color
  };
}

export default function LayerCoverageDashboard({ layerCoverage = [] }) {
  const rows = Array.isArray(layerCoverage) ? layerCoverage : [];
  if (rows.length === 0) return null;

  const activeRows = rows.filter((row) => (
    (row.detectors_runtime_touched || 0) > 0
    || (row.detectors_locally_checked || 0) > 0
    || (row.detectors_model_finding_backed || 0) > 0
  )).length;

  return (
    <details className="bg-[#111827] border border-[#374151] rounded-lg px-4 py-3">
      <summary className="cursor-pointer list-none flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#F9FAFB]">Layer-Level Coverage</p>
          <p className="text-xs text-[#9CA3AF] mt-1">
            {activeRows} active layers with runtime detector activity out of {rows.length} total layers.
          </p>
        </div>
        <div className="text-xs text-[#6B7280] uppercase tracking-[0.18em]">
          Expand
        </div>
      </summary>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-xs">
          <thead>
            <tr className="border-b border-[#374151] text-[#9CA3AF] uppercase tracking-[0.16em]">
              <th className="py-2 pr-4 font-medium">Layer</th>
              <th className="py-2 pr-4 font-medium">Touched / Defined</th>
              <th className="py-2 pr-4 font-medium">Local Checked / Deterministic</th>
              <th className="py-2 pr-4 font-medium">Model Backed / Model-Driven</th>
              <th className="py-2 pr-4 font-medium">Untouched</th>
              <th className="py-2 pr-4 font-medium">Deterministic %</th>
              <th className="py-2 font-medium">Model %</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.layer_id} className="border-b border-[#1F2937] align-top">
                <td className="py-3 pr-4">
                  <div className="font-medium text-[#F9FAFB]">
                    L{row.layer_number} {row.layer_label}
                  </div>
                  <div className="text-[#6B7280] mt-1">{row.layer_id}</div>
                </td>
                <td className="py-3 pr-4 text-[#F9FAFB]">
                  {row.detectors_runtime_touched}/{row.detectors_defined}
                </td>
                <td className="py-3 pr-4">
                  <div className="text-[#86EFAC] font-medium">
                    {row.detectors_locally_checked}/{row.deterministic_catalog_detectors}
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-[#1F2937] overflow-hidden">
                    <div className="h-full rounded-full" style={buildBarStyle(row.deterministic_catalog_coverage_percent, '#22C55E')} />
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <div className="text-[#FCD34D] font-medium">
                    {row.detectors_model_finding_backed}/{row.model_driven_catalog_detectors}
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-[#1F2937] overflow-hidden">
                    <div className="h-full rounded-full" style={buildBarStyle(row.model_driven_catalog_coverage_percent, '#F59E0B')} />
                  </div>
                </td>
                <td className="py-3 pr-4 text-[#E879F9]">{row.detectors_untouched}</td>
                <td className="py-3 pr-4 text-[#86EFAC]">{formatPercent(row.deterministic_catalog_coverage_percent)}</td>
                <td className="py-3 text-[#FCD34D]">{formatPercent(row.model_driven_catalog_coverage_percent)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

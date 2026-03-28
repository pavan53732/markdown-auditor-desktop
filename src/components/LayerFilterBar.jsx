import React, { useMemo } from 'react';
import { LAYERS } from '../lib/layers';

export default function LayerFilterBar({ issues, activeLayer, onLayerChange }) {
  const layerCounts = useMemo(() => {
    const counts = {};
    (issues || []).forEach((issue) => {
      const cat = issue.category || 'unknown';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [issues]);

  const total = (issues || []).length;

  const activeLayers = LAYERS.filter((l) => layerCounts[l.id] > 0);

  return (
    <div className="flex flex-wrap gap-2 mb-5">
      <button
        onClick={() => onLayerChange('all')}
        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
          activeLayer === 'all'
            ? 'bg-[#374151] text-[#F9FAFB]'
            : 'bg-transparent text-[#9CA3AF] border border-[#374151] hover:text-[#F9FAFB]'
        }`}
      >
        All ({total})
      </button>
      {activeLayers.map((layer) => (
        <button
          key={layer.id}
          onClick={() => onLayerChange(layer.id)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
            activeLayer === layer.id
              ? 'text-[#F9FAFB]'
              : 'bg-transparent text-[#9CA3AF] border border-[#374151] hover:text-[#F9FAFB]'
          }`}
          style={
            activeLayer === layer.id
              ? { backgroundColor: layer.color + '33', borderColor: layer.border }
              : {}
          }
        >
          <span>{layer.icon}</span>
          <span>{layer.label.split('&')[0].trim()}</span>
          <span>({layerCounts[layer.id]})</span>
        </button>
      ))}
    </div>
  );
}
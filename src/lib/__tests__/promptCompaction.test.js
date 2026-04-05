import { describe, it, expect } from 'vitest';

import { buildSystemPrompt } from '../systemPrompt';
import { ANALYSIS_AGENT_MESH } from '../analysisAgents';
import { DETECTOR_METADATA } from '../detectorMetadata';

describe('Scoped Prompt Compaction', () => {
  it('agent-specific prompts include the compact detector index and focus catalog', () => {
    const firstAgent = ANALYSIS_AGENT_MESH[0];
    const prompt = buildSystemPrompt(firstAgent.id);
    const detectorCount = Object.keys(DETECTOR_METADATA).length;

    expect(prompt).toContain(`--- DETECTOR INDEX (${detectorCount} DETECTORS) ---`);
    expect(prompt).toContain(`${firstAgent.label} FOCUS DETECTOR CATALOG`);
    expect(prompt).toContain('SCOPED PROMPT STRATEGY:');
  });

  it('agent-specific prompts remain materially smaller than the full unscoped prompt', () => {
    const fullPrompt = buildSystemPrompt();
    const scopedPrompt = buildSystemPrompt(ANALYSIS_AGENT_MESH[0].id);

    expect(scopedPrompt.length).toBeLessThan(fullPrompt.length * 0.75);
  });
});

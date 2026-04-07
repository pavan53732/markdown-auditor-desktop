import { describe, expect, it, vi } from 'vitest';

import { ANALYSIS_AGENT_MESH } from '../analysisAgents';
import { createInitialDiagnostics } from '../detectorMetadata';
import {
  CHARS_PER_TOKEN,
  createFileBatches,
  estimateAnalysisTokens,
  runAnalysisBatch
} from '../agentMeshRuntime';

describe('Agent Mesh Runtime', () => {
  it('estimates analysis tokens from files and agent count', () => {
    const estimate = estimateAnalysisTokens(
      [{ content: 'abcd'.repeat(10) }, { content: 'efgh'.repeat(5) }],
      100,
      8
    );

    expect(estimate.systemTokens).toBe(100);
    expect(estimate.userTokens).toBe(Math.ceil((40 + 20) / CHARS_PER_TOKEN));
    expect(estimate.total).toBe(estimate.perPassTotal * 8);
  });

  it('chunks oversized files into stable batches', () => {
    const content = Array.from({ length: 40 }, (_, index) => `Line ${index + 1}`).join('\n');
    const batches = createFileBatches(
      [{ name: 'big.md', content }],
      {
        recommendedBatchTargetTokens: 80,
        maxSystemTokens: 10,
        batchTokenBuffer: 5,
        minChunkChars: 40
      }
    );

    expect(batches.length).toBeGreaterThan(1);
    expect(batches.flat()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'big.md',
          isChunked: true
        })
      ])
    );
  });

  it('continues in degraded mode when an agent times out', async () => {
    const diagnostics = createInitialDiagnostics();
    const progressUpdates = vi.fn();
    const agent = {
      ...ANALYSIS_AGENT_MESH[0],
      systemPrompt: 'system prompt'
    };

    const result = await runAnalysisBatch({
      batch: [{ name: 'spec.md', content: '# Title\n\nBody' }],
      batchIndex: 0,
      totalBatches: 1,
      totalAgentPasses: 1,
      diagnostics,
      agentPromptEntries: [agent],
      config: { baseURL: 'https://example.com/v1', model: 'gpt-4o', timeout: 180, retries: 2 },
      callAPI: vi.fn().mockResolvedValue({
        success: false,
        error: 'Request timed out.',
        requestTimeoutSeconds: 180,
        timeoutAttempts: 2
      }),
      updateProgressState: progressUpdates
    });

    expect(result.summary.total).toBe(0);
    expect(result.summary.analysis_agent_passes).toBe(1);
    expect(diagnostics.timeout_agent_pass_count).toBe(1);
    expect(diagnostics.skipped_agent_pass_count).toBe(1);
    expect(progressUpdates).toHaveBeenCalled();
  });

  it('merges valid empty responses into a clean batch result', async () => {
    const diagnostics = createInitialDiagnostics();
    const agent = {
      ...ANALYSIS_AGENT_MESH[0],
      systemPrompt: 'system prompt'
    };
    const callAPI = vi.fn().mockResolvedValue({
      success: true,
      raw: JSON.stringify({
        summary: { total: 0, critical: 0, high: 0, medium: 0, low: 0 },
        issues: [],
        root_causes: []
      })
    });

    const result = await runAnalysisBatch({
      batch: [{ name: 'spec.md', content: '# Title\n\nBody' }],
      batchIndex: 0,
      totalBatches: 1,
      totalAgentPasses: 1,
      diagnostics,
      agentPromptEntries: [agent],
      config: { baseURL: 'https://example.com/v1', model: 'gpt-4o', timeout: 180, retries: 2 },
      callAPI,
      updateProgressState: vi.fn()
    });

    expect(result.summary.total).toBe(0);
    expect(result.summary.analysis_agents_run).toBe(1);
    expect(result._analysisMeshRuns).toHaveLength(1);
    expect(diagnostics.analysis_mesh_passes_completed).toBe(1);
    expect(callAPI).toHaveBeenCalledTimes(1);
  });
});

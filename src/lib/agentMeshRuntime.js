import { validateResults, repairJSON } from './jsonRepair';
import { validateAnalysisAgentResult } from './analysisAgents';
import {
  normalizeIssueFromDetector,
  recordAgentFailure,
  recordAgentRecovery,
  recordAgentSkip
} from './detectorMetadata';
import {
  buildRuntimeDetectorCoverage,
  applyRuntimeDetectorCoverageSummary,
  mergeBatchResults
} from './auditPipeline';
import {
  enrichIssueWithTrustSignals,
  summarizeIssueTrustSignals
} from './trustSignals';

export const CHARS_PER_TOKEN = 4;
export const MAX_AGENT_RESPONSE_ATTEMPTS = 2;
const CHUNK_SEPARATOR = `${'-'.repeat(60)}\n`;

function getAgentFailureStage(error) {
  const message = error?.message || '';
  if (message.toLowerCase().includes('timed out') || message.toLowerCase().includes('timeout')) {
    return 'provider_timeout';
  }
  if (message.includes('Invalid JSON') || message.includes('No JSON object found')) {
    return 'json_parse';
  }
  if (
    message.includes('missing required') ||
    message.includes('Response is not a JSON object') ||
    message.includes('invalid')
  ) {
    return 'schema_validation';
  }
  return 'response_validation';
}

function isTimeoutErrorMessage(message) {
  const normalized = typeof message === 'string' ? message.toLowerCase() : '';
  return normalized.includes('timed out') || normalized.includes('timeout');
}

export function buildAgentRetryMessage(baseUserMessage, agent, error, attempt) {
  return `${baseUserMessage}

=== FORMAT RETRY REQUIRED ===
The previous ${agent.label} response for this same batch was rejected on attempt ${attempt}.
Validator message: ${error.message}

Return exactly one raw JSON object matching the required schema.
- Use double quotes for every property name and string value
- Do not return markdown fences
- Do not return commentary before or after the JSON object
- Keep the same audit scope and evidence discipline as the original request`;
}

export function estimateAnalysisTokens(
  fileList = [],
  maxSystemTokens = 0,
  analysisAgentCount = 0,
  charsPerToken = CHARS_PER_TOKEN
) {
  const userTokens = (Array.isArray(fileList) ? fileList : []).reduce(
    (sum, file) => sum + Math.ceil((file?.content?.length || 0) / charsPerToken),
    0
  );
  const perPassTotal = maxSystemTokens + userTokens;

  return {
    systemTokens: maxSystemTokens,
    userTokens,
    perPassTotal,
    total: perPassTotal * analysisAgentCount
  };
}

export function getAvailableBatchTokens(
  maxSystemTokens,
  { recommendedBatchTargetTokens, batchTokenBuffer }
) {
  return Math.max(1, recommendedBatchTargetTokens - maxSystemTokens - batchTokenBuffer);
}

export function splitOversizedFile(
  file,
  { maxTokens, minChunkChars, charsPerToken = CHARS_PER_TOKEN }
) {
  const fileTokens = Math.ceil((file?.content?.length || 0) / charsPerToken);
  const baseFile = {
    name: file.name,
    path: file.path,
    size: file.size,
    lastModified: file.lastModified,
    sourceName: file.sourceName
  };

  if (fileTokens <= maxTokens) {
    return [{
      ...baseFile,
      content: file.content,
      chunkIndex: 1,
      chunkCount: 1,
      lineStart: 1,
      lineEnd: Math.max(1, file.content.split('\n').length),
      isChunked: false
    }];
  }

  const maxChars = Math.max(minChunkChars, maxTokens * charsPerToken);
  const overlapChars = Math.floor(maxChars * 0.1);
  const newlineOffsets = [];

  for (let index = 0; index < file.content.length; index += 1) {
    if (file.content[index] === '\n') {
      newlineOffsets.push(index);
    }
  }

  const getLineNumberAtOffset = (offset) => {
    let low = 0;
    let high = newlineOffsets.length;

    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      if (newlineOffsets[mid] < offset) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }

    return low + 1;
  };

  const rawChunks = [];
  let start = 0;

  while (start < file.content.length) {
    const maxEnd = Math.min(start + maxChars, file.content.length);
    let end = maxEnd;

    if (end < file.content.length) {
      const newlineBoundary = file.content.lastIndexOf('\n', maxEnd - 1);
      if (newlineBoundary >= start + Math.floor(maxChars * 0.5)) {
        end = newlineBoundary + 1;
      }
    }

    if (end <= start) {
      end = maxEnd;
    }

    const content = file.content.slice(start, end);
    const lineStart = getLineNumberAtOffset(start);
    const lineCount = Math.max(1, content.split('\n').length);
    const lineEnd = lineStart + lineCount - 1;

    rawChunks.push({
      ...baseFile,
      content,
      lineStart,
      lineEnd
    });

    const nextStart = end - overlapChars;
    start = nextStart <= start ? end : nextStart;
  }

  const chunkCount = rawChunks.length;
  return rawChunks.map((chunk, index) => ({
    ...chunk,
    chunkIndex: index + 1,
    chunkCount,
    isChunked: true
  }));
}

export function createFileBatches(
  fileList,
  {
    recommendedBatchTargetTokens,
    maxSystemTokens,
    batchTokenBuffer,
    minChunkChars,
    charsPerToken = CHARS_PER_TOKEN
  }
) {
  const availableTokens = getAvailableBatchTokens(maxSystemTokens, {
    recommendedBatchTargetTokens,
    batchTokenBuffer
  });
  const batches = [];
  let currentBatch = [];
  let currentTokens = 0;

  const flattenedFiles = (Array.isArray(fileList) ? fileList : []).flatMap((file) =>
    splitOversizedFile(file, {
      maxTokens: availableTokens,
      minChunkChars,
      charsPerToken
    })
  );

  flattenedFiles.forEach((file) => {
    const fileTokens = Math.ceil((file?.content?.length || 0) / charsPerToken);

    if (currentTokens + fileTokens > availableTokens && currentBatch.length > 0) {
      batches.push(currentBatch);
      currentBatch = [file];
      currentTokens = fileTokens;
      return;
    }

    currentBatch.push(file);
    currentTokens += fileTokens;
  });

  if (currentBatch.length > 0) {
    batches.push(currentBatch);
  }

  return batches;
}

export async function runAnalysisBatch({
  batch,
  batchIndex,
  totalBatches,
  totalAgentPasses,
  diagnostics,
  detectorExecutionReceipts = [],
  agentPromptEntries,
  config,
  callAPI,
  updateProgressState
}) {
  const safeUpdateProgressState = typeof updateProgressState === 'function'
    ? updateProgressState
    : () => {};

  const userMessage = batch
    .map((file) => `=== FILE: ${file.name}${file.isChunked ? ` (Chunk ${file.chunkIndex}/${file.chunkCount})` : ''} ===\n\n${file.content}\n\n${CHUNK_SEPARATOR}`)
    .join('');

  const agentResults = [];
  const agentRuns = [];
  let rawIssueCount = 0;

  for (const agent of agentPromptEntries) {
    let parsed = null;
    let lastValidationError = null;

    for (let attempt = 1; attempt <= MAX_AGENT_RESPONSE_ATTEMPTS; attempt += 1) {
      safeUpdateProgressState({
        stage: 'agent_mesh',
        currentBatch: batchIndex + 1,
        totalBatches,
        filesInCurrentBatch: batch.length,
        currentAgentId: agent.id,
        currentAgentLabel: agent.label,
        currentAgentOwnedLayers: agent.ownedLayers?.length || 0,
        currentAgentOwnedSubcategories: agent.ownedSubcategoryCount || 0,
        currentAgentOwnedDetectors: agent.ownedDetectorCount || 0,
        currentAttempt: attempt,
        maxAttempts: MAX_AGENT_RESPONSE_ATTEMPTS,
        totalAgentPasses,
        message: `Running ${agent.label} on batch ${batchIndex + 1}/${totalBatches}`
      });

      const response = await callAPI({
        baseURL: config.baseURL,
        apiKey: config.apiKey,
        model: config.model,
        systemPrompt: agent.systemPrompt,
        userMessage: attempt === 1
          ? userMessage
          : buildAgentRetryMessage(userMessage, agent, lastValidationError, attempt - 1),
        timeout: config.timeout,
        retries: config.retries
      });

      if (!response.success) {
        if (isTimeoutErrorMessage(response.error)) {
          recordAgentSkip(diagnostics, {
            agent_id: agent.id,
            agent_label: agent.label,
            batch_index: batchIndex + 1,
            batch_count: totalBatches,
            attempt: response.timeoutAttempts || 1,
            reason: 'timeout',
            timeout_seconds: response.requestTimeoutSeconds
          });
          safeUpdateProgressState({
            stage: 'agent_mesh',
            completedAgentPasses: diagnostics.analysis_mesh_passes_completed,
            totalAgentPasses,
            currentAgentId: agent.id,
            currentAgentLabel: agent.label,
            currentAgentOwnedLayers: agent.ownedLayers?.length || 0,
            currentAgentOwnedSubcategories: agent.ownedSubcategoryCount || 0,
            currentAgentOwnedDetectors: agent.ownedDetectorCount || 0,
            message: `${agent.label} timed out after ${response.requestTimeoutSeconds || config.timeout || 60}s; continuing in degraded mode`
          });
          parsed = {
            summary: { total: 0, critical: 0, high: 0, medium: 0, low: 0 },
            issues: [],
            root_causes: []
          };
          break;
        }

        throw new Error(`Batch ${batchIndex + 1}/${totalBatches} failed during ${agent.label}: ${response.error}`);
      }

      try {
        parsed = repairJSON(response.raw);
        validateResults(parsed);
        if (attempt > 1) {
          recordAgentRecovery(diagnostics, {
            agent_id: agent.id,
            agent_label: agent.label,
            batch_index: batchIndex + 1,
            batch_count: totalBatches,
            attempt
          });
        }
        break;
      } catch (error) {
        lastValidationError = error;
        recordAgentFailure(diagnostics, {
          batch_index: batchIndex + 1,
          batch_count: totalBatches,
          agent_id: agent.id,
          agent_label: agent.label,
          attempt,
          stage: getAgentFailureStage(error),
          message: error.message,
          raw_response: response.raw
        });

        if (attempt < MAX_AGENT_RESPONSE_ATTEMPTS) {
          diagnostics.malformed_agent_retry_count += 1;
          continue;
        }

        recordAgentSkip(diagnostics, {
          agent_id: agent.id,
          agent_label: agent.label,
          batch_index: batchIndex + 1,
          batch_count: totalBatches,
          attempt
        });
        parsed = {
          summary: { total: 0, critical: 0, high: 0, medium: 0, low: 0 },
          issues: [],
          root_causes: []
        };
        break;
      }
    }

    const normalizedIssues = (parsed.issues || []).map((issue) => normalizeIssueFromDetector({
      ...issue,
      analysis_agent: issue.analysis_agent || agent.id,
      analysis_agents: Array.isArray(issue.analysis_agents) && issue.analysis_agents.length > 0
        ? Array.from(new Set([...issue.analysis_agents, agent.id]))
        : [agent.id]
    }));

    const agentRun = validateAnalysisAgentResult(agent.id, normalizedIssues, parsed.summary, {
      detectorExecutionReceipts
    });
    agentRuns.push(agentRun);
    diagnostics.analysis_mesh_focus_layer_hit_count += agentRun.focus_layer_hits || 0;
    diagnostics.analysis_mesh_focus_subcategory_hit_count += agentRun.focus_subcategory_hits || 0;
    diagnostics.analysis_mesh_owned_layer_hit_count += agentRun.owned_layer_hits || 0;
    diagnostics.analysis_mesh_owned_subcategory_hit_count += agentRun.owned_subcategory_hits || 0;
    diagnostics.analysis_mesh_owned_detector_hit_count += agentRun.owned_detector_hits || 0;
    diagnostics.analysis_mesh_out_of_focus_issue_count += agentRun.out_of_focus_issue_count || 0;
    diagnostics.analysis_mesh_out_of_owned_scope_issue_count += agentRun.out_of_owned_scope_issue_count || 0;
    diagnostics.analysis_mesh_validation_warning_count += Array.isArray(agentRun.warnings) ? agentRun.warnings.length : 0;
    diagnostics.analysis_mesh_agent_runs = [
      ...(Array.isArray(diagnostics.analysis_mesh_agent_runs) ? diagnostics.analysis_mesh_agent_runs : []),
      agentRun
    ];
    if (Array.isArray(agentRun.warnings) && agentRun.warnings.length > 0) {
      diagnostics.warnings.push(...agentRun.warnings);
    }

    rawIssueCount += normalizedIssues.length;
    diagnostics.analysis_mesh_passes_completed += 1;
    safeUpdateProgressState({
      stage: 'agent_mesh',
      completedAgentPasses: diagnostics.analysis_mesh_passes_completed,
      totalAgentPasses,
      ownedDetectorHits: diagnostics.analysis_mesh_owned_detector_hit_count,
      checkedOwnedDetectors: agentRun.receipt_checked_owned_detector_count || 0,
      cleanOwnedDetectors: agentRun.receipt_clean_owned_detector_count || 0,
      untouchedOwnedDetectors: agentRun.untouched_owned_detector_count || 0,
      outOfOwnedScopeIssues: diagnostics.analysis_mesh_out_of_owned_scope_issue_count,
      currentAgentId: agent.id,
      currentAgentLabel: agent.label,
      currentAgentOwnedLayers: agent.ownedLayers?.length || 0,
      currentAgentOwnedSubcategories: agent.ownedSubcategoryCount || 0,
      currentAgentOwnedDetectors: agent.ownedDetectorCount || 0,
      message: `${agent.label} completed batch ${batchIndex + 1}/${totalBatches}`
    });

    agentResults.push({
      ...parsed,
      issues: normalizedIssues,
      _sourceFiles: Array.from(new Set(batch.map((file) => file.sourceName || file.name)))
    });
  }

  const mergedAgentResult = mergeBatchResults(agentResults);
  if (Array.isArray(mergedAgentResult.issues)) {
    mergedAgentResult.issues = mergedAgentResult.issues.map((issue) => enrichIssueWithTrustSignals(issue));
    const trustSummary = summarizeIssueTrustSignals(mergedAgentResult.issues);
    mergedAgentResult.summary.average_trust_score = trustSummary.averageTrustScore;
    mergedAgentResult.summary.high_trust_issue_count = trustSummary.highTrustIssueCount;
    mergedAgentResult.summary.strong_evidence_issue_count = trustSummary.strongEvidenceIssueCount;
    mergedAgentResult.summary.deterministic_proof_issue_count = trustSummary.deterministicProofIssueCount;
    mergedAgentResult.summary.receipt_backed_issue_count = trustSummary.receiptBackedIssueCount;
    mergedAgentResult.summary.hybrid_supported_issue_count = trustSummary.hybridSupportedIssueCount;
    mergedAgentResult.summary.rule_backed_issue_count = trustSummary.ruleBackedIssueCount;
    mergedAgentResult.summary.hybrid_backed_issue_count = trustSummary.hybridBackedIssueCount;
    mergedAgentResult.summary.model_only_issue_count = trustSummary.modelOnlyIssueCount;
  }

  const batchCoverage = buildRuntimeDetectorCoverage({
    issues: mergedAgentResult.issues,
    deterministicReceipts: detectorExecutionReceipts
  });
  applyRuntimeDetectorCoverageSummary(mergedAgentResult.summary, batchCoverage);
  mergedAgentResult.summary.analysis_agents_run = agentPromptEntries.length;
  mergedAgentResult.summary.analysis_agent_passes = agentResults.length;

  return {
    ...mergedAgentResult,
    _sourceFiles: Array.from(new Set(batch.map((file) => file.sourceName || file.name))),
    _rawIssueCount: rawIssueCount,
    _agentPasses: agentResults.length,
    _analysisMeshRuns: agentRuns
  };
}

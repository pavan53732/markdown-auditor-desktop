const CHARS_PER_TOKEN = 4;
const MIN_ANALYSIS_OUTPUT_TOKENS = 8000;
const DEFAULT_ANALYSIS_OUTPUT_TOKENS = 12000;
const MAX_ANALYSIS_OUTPUT_TOKENS = 24000;
const ANALYSIS_OUTPUT_GROWTH_STEP = 4000;
const MAX_ANALYSIS_OUTPUT_ATTEMPTS = 4;
const MIN_ANALYSIS_TIMEOUT_SECONDS = 60;
const MAX_ANALYSIS_TIMEOUT_SECONDS = 420;
const ANALYSIS_TIMEOUT_GROWTH_STEP_SECONDS = 60;

function estimateTextTokens(value) {
  return Math.ceil(String(value || '').length / CHARS_PER_TOKEN);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function computeAdaptiveAnalysisMaxTokens({ systemPrompt = '', userMessage = '' } = {}) {
  const inputTokens = estimateTextTokens(systemPrompt) + estimateTextTokens(userMessage);
  const adaptiveBudget = Math.ceil(inputTokens * 0.55);
  return clamp(
    Math.max(DEFAULT_ANALYSIS_OUTPUT_TOKENS, adaptiveBudget),
    MIN_ANALYSIS_OUTPUT_TOKENS,
    MAX_ANALYSIS_OUTPUT_TOKENS
  );
}

function computeAdaptiveAnalysisTimeoutSeconds({
  systemPrompt = '',
  userMessage = '',
  configuredTimeoutSeconds = MIN_ANALYSIS_TIMEOUT_SECONDS
} = {}) {
  const normalizedConfiguredTimeout = clamp(
    Number.isFinite(Number(configuredTimeoutSeconds))
      ? Math.floor(Number(configuredTimeoutSeconds))
      : MIN_ANALYSIS_TIMEOUT_SECONDS,
    MIN_ANALYSIS_TIMEOUT_SECONDS,
    MAX_ANALYSIS_TIMEOUT_SECONDS
  );

  const inputTokens = estimateTextTokens(systemPrompt) + estimateTextTokens(userMessage);
  const adaptiveBump = Math.floor(inputTokens / 40_000) * ANALYSIS_TIMEOUT_GROWTH_STEP_SECONDS;
  return clamp(
    normalizedConfiguredTimeout + adaptiveBump,
    MIN_ANALYSIS_TIMEOUT_SECONDS,
    MAX_ANALYSIS_TIMEOUT_SECONDS
  );
}

function expandAnalysisTokenBudget(currentBudget) {
  return clamp(
    currentBudget + ANALYSIS_OUTPUT_GROWTH_STEP,
    MIN_ANALYSIS_OUTPUT_TOKENS,
    MAX_ANALYSIS_OUTPUT_TOKENS
  );
}

function expandAnalysisTimeoutSeconds(currentTimeoutSeconds, configuredTimeoutSeconds = MIN_ANALYSIS_TIMEOUT_SECONDS) {
  const floor = clamp(
    Number.isFinite(Number(configuredTimeoutSeconds))
      ? Math.floor(Number(configuredTimeoutSeconds))
      : MIN_ANALYSIS_TIMEOUT_SECONDS,
    MIN_ANALYSIS_TIMEOUT_SECONDS,
    MAX_ANALYSIS_TIMEOUT_SECONDS
  );

  return clamp(
    Math.max(floor, Number(currentTimeoutSeconds) || floor) + ANALYSIS_TIMEOUT_GROWTH_STEP_SECONDS,
    floor,
    MAX_ANALYSIS_TIMEOUT_SECONDS
  );
}

function reduceAnalysisTokenBudget(currentBudget) {
  return clamp(
    currentBudget - ANALYSIS_OUTPUT_GROWTH_STEP,
    MIN_ANALYSIS_OUTPUT_TOKENS,
    MAX_ANALYSIS_OUTPUT_TOKENS
  );
}

function isOutputBudgetError(error) {
  const message = String(error?.message || '').toLowerCase();
  return [
    'max_tokens',
    'max completion tokens',
    'maximum context length',
    'context_length_exceeded',
    'requested too many tokens',
    'reduce your prompt',
    'token limit',
    'too many output tokens'
  ].some((fragment) => message.includes(fragment));
}

function isTimeoutError(error) {
  const message = String(error?.message || '').toLowerCase();
  return [
    'request timed out',
    'timed out',
    'timeout',
    'time out',
    'etimedout',
    'aborterror'
  ].some((fragment) => message.includes(fragment));
}

module.exports = {
  MIN_ANALYSIS_OUTPUT_TOKENS,
  DEFAULT_ANALYSIS_OUTPUT_TOKENS,
  MAX_ANALYSIS_OUTPUT_TOKENS,
  ANALYSIS_OUTPUT_GROWTH_STEP,
  MAX_ANALYSIS_OUTPUT_ATTEMPTS,
  MIN_ANALYSIS_TIMEOUT_SECONDS,
  MAX_ANALYSIS_TIMEOUT_SECONDS,
  ANALYSIS_TIMEOUT_GROWTH_STEP_SECONDS,
  computeAdaptiveAnalysisMaxTokens,
  computeAdaptiveAnalysisTimeoutSeconds,
  expandAnalysisTokenBudget,
  expandAnalysisTimeoutSeconds,
  reduceAnalysisTokenBudget,
  isOutputBudgetError,
  isTimeoutError
};

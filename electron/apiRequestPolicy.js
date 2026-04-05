const CHARS_PER_TOKEN = 4;
const MIN_ANALYSIS_OUTPUT_TOKENS = 8000;
const DEFAULT_ANALYSIS_OUTPUT_TOKENS = 12000;
const MAX_ANALYSIS_OUTPUT_TOKENS = 24000;
const ANALYSIS_OUTPUT_GROWTH_STEP = 4000;
const MAX_ANALYSIS_OUTPUT_ATTEMPTS = 4;

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

function expandAnalysisTokenBudget(currentBudget) {
  return clamp(
    currentBudget + ANALYSIS_OUTPUT_GROWTH_STEP,
    MIN_ANALYSIS_OUTPUT_TOKENS,
    MAX_ANALYSIS_OUTPUT_TOKENS
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

module.exports = {
  MIN_ANALYSIS_OUTPUT_TOKENS,
  DEFAULT_ANALYSIS_OUTPUT_TOKENS,
  MAX_ANALYSIS_OUTPUT_TOKENS,
  ANALYSIS_OUTPUT_GROWTH_STEP,
  MAX_ANALYSIS_OUTPUT_ATTEMPTS,
  computeAdaptiveAnalysisMaxTokens,
  expandAnalysisTokenBudget,
  reduceAnalysisTokenBudget,
  isOutputBudgetError
};

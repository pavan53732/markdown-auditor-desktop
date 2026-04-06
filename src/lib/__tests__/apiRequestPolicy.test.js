import { describe, it, expect } from 'vitest';

const {
  MIN_ANALYSIS_OUTPUT_TOKENS,
  DEFAULT_ANALYSIS_OUTPUT_TOKENS,
  MAX_ANALYSIS_OUTPUT_TOKENS,
  MIN_ANALYSIS_TIMEOUT_SECONDS,
  MAX_ANALYSIS_TIMEOUT_SECONDS,
  computeAdaptiveAnalysisMaxTokens,
  computeAdaptiveAnalysisTimeoutSeconds,
  expandAnalysisTokenBudget,
  expandAnalysisTimeoutSeconds,
  reduceAnalysisTokenBudget,
  isOutputBudgetError,
  isTimeoutError
} = require('../../../electron/apiRequestPolicy');

describe('API Request Policy', () => {
  it('should keep a sensible default floor for small prompts', () => {
    const budget = computeAdaptiveAnalysisMaxTokens({
      systemPrompt: 'short system prompt',
      userMessage: 'short user message'
    });

    expect(budget).toBe(DEFAULT_ANALYSIS_OUTPUT_TOKENS);
  });

  it('should grow for larger prompts without exceeding the configured maximum', () => {
    const largeText = 'x'.repeat(160000);
    const budget = computeAdaptiveAnalysisMaxTokens({
      systemPrompt: largeText,
      userMessage: largeText
    });

    expect(budget).toBe(MAX_ANALYSIS_OUTPUT_TOKENS);
  });

  it('should expand and reduce within configured bounds', () => {
    expect(expandAnalysisTokenBudget(DEFAULT_ANALYSIS_OUTPUT_TOKENS)).toBeGreaterThan(DEFAULT_ANALYSIS_OUTPUT_TOKENS);
    expect(expandAnalysisTokenBudget(MAX_ANALYSIS_OUTPUT_TOKENS)).toBe(MAX_ANALYSIS_OUTPUT_TOKENS);
    expect(reduceAnalysisTokenBudget(MIN_ANALYSIS_OUTPUT_TOKENS)).toBe(MIN_ANALYSIS_OUTPUT_TOKENS);
    expect(reduceAnalysisTokenBudget(DEFAULT_ANALYSIS_OUTPUT_TOKENS)).toBeLessThan(DEFAULT_ANALYSIS_OUTPUT_TOKENS);
  });

  it('should grow timeout budgets for larger prompts within bounds', () => {
    const smallTimeout = computeAdaptiveAnalysisTimeoutSeconds({
      systemPrompt: 'small prompt',
      userMessage: 'small payload',
      configuredTimeoutSeconds: 60
    });
    const largeTimeout = computeAdaptiveAnalysisTimeoutSeconds({
      systemPrompt: 'x'.repeat(200000),
      userMessage: 'x'.repeat(200000),
      configuredTimeoutSeconds: 60
    });

    expect(smallTimeout).toBe(MIN_ANALYSIS_TIMEOUT_SECONDS);
    expect(largeTimeout).toBeGreaterThanOrEqual(smallTimeout);
    expect(largeTimeout).toBeLessThanOrEqual(MAX_ANALYSIS_TIMEOUT_SECONDS);
    expect(expandAnalysisTimeoutSeconds(largeTimeout, 60)).toBeLessThanOrEqual(MAX_ANALYSIS_TIMEOUT_SECONDS);
  });

  it('should classify provider output-budget errors', () => {
    expect(isOutputBudgetError(new Error('maximum context length exceeded'))).toBe(true);
    expect(isOutputBudgetError(new Error('Requested too many tokens'))).toBe(true);
    expect(isOutputBudgetError(new Error('connection reset by peer'))).toBe(false);
  });

  it('should classify provider timeout errors', () => {
    expect(isTimeoutError(new Error('Request timed out.'))).toBe(true);
    expect(isTimeoutError(new Error('ETIMEDOUT while connecting'))).toBe(true);
    expect(isTimeoutError(new Error('maximum context length exceeded'))).toBe(false);
  });
});

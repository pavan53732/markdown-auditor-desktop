import { describe, it, expect } from 'vitest';

import {
  DEFAULT_TIMEOUT_SECONDS,
  DEFAULT_SESSION_TOKEN_BUDGET,
  MIN_TIMEOUT_SECONDS,
  MIN_SESSION_TOKEN_BUDGET,
  normalizeTimeoutSeconds,
  normalizeTokenBudget
} from '../runtimeConfig';

describe('runtimeConfig', () => {
  it('normalizes non-numeric budgets to the default session budget', () => {
    expect(normalizeTokenBudget(undefined)).toBe(DEFAULT_SESSION_TOKEN_BUDGET);
    expect(normalizeTokenBudget('not-a-number')).toBe(DEFAULT_SESSION_TOKEN_BUDGET);
  });

  it('enforces the minimum session token budget floor', () => {
    expect(normalizeTokenBudget(100000)).toBe(MIN_SESSION_TOKEN_BUDGET);
    expect(normalizeTokenBudget(MIN_SESSION_TOKEN_BUDGET - 1)).toBe(MIN_SESSION_TOKEN_BUDGET);
  });

  it('keeps valid large budgets and floors decimals', () => {
    expect(normalizeTokenBudget(7500000)).toBe(7500000);
    expect(normalizeTokenBudget(5000001.9)).toBe(5000001);
  });

  it('normalizes timeout values to the hardened minimum/default', () => {
    expect(normalizeTimeoutSeconds(undefined)).toBe(DEFAULT_TIMEOUT_SECONDS);
    expect(normalizeTimeoutSeconds('not-a-number')).toBe(DEFAULT_TIMEOUT_SECONDS);
    expect(normalizeTimeoutSeconds(60)).toBe(MIN_TIMEOUT_SECONDS);
    expect(normalizeTimeoutSeconds(179.9)).toBe(179);
    expect(normalizeTimeoutSeconds(240)).toBe(240);
  });
});

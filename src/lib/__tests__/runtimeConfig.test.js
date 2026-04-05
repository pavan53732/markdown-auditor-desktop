import { describe, it, expect } from 'vitest';

import {
  DEFAULT_SESSION_TOKEN_BUDGET,
  MIN_SESSION_TOKEN_BUDGET,
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
});

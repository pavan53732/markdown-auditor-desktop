export const DEFAULT_TIMEOUT_SECONDS = 60;
export const DEFAULT_RETRIES = 2;

export const MIN_SESSION_TOKEN_BUDGET = 5_000_001;
export const DEFAULT_SESSION_TOKEN_BUDGET = 10_000_000;

// This is a batching target, not a provider hard cap.
// It should be high enough to support the expanded 8-agent taxonomy prompt
// while still encouraging chunked reads for very large markdown specs.
export const RECOMMENDED_BATCH_TARGET_TOKENS = 120_000;
export const BATCH_TOKEN_BUFFER = 4_000;
export const MIN_CHUNK_CHARS = 1_200;

export function normalizeTokenBudget(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_SESSION_TOKEN_BUDGET;
  }

  return Math.max(MIN_SESSION_TOKEN_BUDGET, Math.floor(parsed));
}

const MAX_KEYS = 2_000;

type Window = { start: number; count: number };

/**
 * Fixed-window counter held in memory. On Workers every isolate counts for
 * itself, so this is a best-effort brake against bursts and guessing; a
 * Cloudflare rate limiting rule in front of `/api/mcp/` is the hard limit.
 */
export const createRateLimiter = ({
  limit,
  windowMs,
  now = Date.now,
}: {
  limit: number;
  windowMs: number;
  now?: () => number;
}) => {
  const windows = new Map<string, Window>();

  const prune = (at: number) => {
    for (const [key, w] of windows)
      if (at - w.start >= windowMs) windows.delete(key);
    // Still full of live keys (a flood of distinct ones): drop the oldest.
    for (const key of windows.keys()) {
      if (windows.size < MAX_KEYS) break;
      windows.delete(key);
    }
  };

  const verdict = (w: Window, at: number) => ({
    allowed: w.count <= limit,
    retryAfterSeconds: Math.max(1, Math.ceil((w.start + windowMs - at) / 1000)),
  });

  return {
    /** Whether another hit would still be welcome; counts nothing. */
    peek: (key: string): { allowed: boolean; retryAfterSeconds: number } => {
      const at = now();
      const current = windows.get(key);
      const w =
        current && at - current.start < windowMs
          ? current
          : { start: at, count: 0 };
      return { ...verdict(w, at), allowed: w.count < limit };
    },

    /** Counts one hit; `retryAfterSeconds` is set once the key is over its limit. */
    hit: (key: string): { allowed: boolean; retryAfterSeconds: number } => {
      const at = now();
      if (windows.size >= MAX_KEYS) prune(at);

      const current = windows.get(key);
      const w =
        current && at - current.start < windowMs
          ? current
          : { start: at, count: 0 };
      w.count += 1;
      windows.set(key, w);

      return verdict(w, at);
    },
  };
};

export type RateLimiter = ReturnType<typeof createRateLimiter>;

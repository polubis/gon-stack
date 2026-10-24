const TTL_MS = 30_000;

type Entry = { at: number; promise: Promise<unknown> };

/**
 * Remembers reads by key for a short time and shares the one in flight, so
 * a prefetch and the view that later needs it make a single request.
 * `clear` drops everything, also reads still running (they are not stored).
 */
export const createRequestCache = () => {
  const entries = new Map<string, Entry>();
  let generation = 0;

  const read = <T>(key: string, fetcher: () => Promise<T>): Promise<T> => {
    const hit = entries.get(key);
    if (hit && Date.now() - hit.at < TTL_MS) return hit.promise as Promise<T>;

    const stored = generation;
    const promise = fetcher();
    entries.set(key, { at: Date.now(), promise });
    const forget = () => {
      if (entries.get(key)?.promise === promise && stored === generation)
        entries.delete(key);
    };
    promise.catch(forget);
    return promise;
  };

  return {
    read,
    /** Warms the cache; a failure is left for the real read to report. */
    prefetch: (key: string, fetcher: () => Promise<unknown>) => {
      read(key, fetcher).catch(() => undefined);
    },
    clear: () => {
      generation += 1;
      entries.clear();
    },
  };
};

import { describe, expect, it, vi } from 'vitest';
import { createRequestCache } from '../request-cache';

describe('request cache', () => {
  it('reads once for the same key', async () => {
    const cache = createRequestCache();
    const fetcher = vi.fn(() => Promise.resolve('a'));

    await Promise.all([cache.read('k', fetcher), cache.read('k', fetcher)]);
    await cache.read('k', fetcher);

    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('shares a prefetch with the read that follows', async () => {
    const cache = createRequestCache();
    const fetcher = vi.fn(() => Promise.resolve('a'));

    cache.prefetch('k', fetcher);

    expect(await cache.read('k', fetcher)).toBe('a');
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('reads again after clear', async () => {
    const cache = createRequestCache();
    const fetcher = vi.fn(() => Promise.resolve('a'));
    await cache.read('k', fetcher);

    cache.clear();
    await cache.read('k', fetcher);

    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('reads again after a failed prefetch, which stays quiet', async () => {
    const cache = createRequestCache();
    const fetcher = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValue('a');

    cache.prefetch('k', fetcher);
    await Promise.resolve();
    await Promise.resolve();

    expect(await cache.read('k', fetcher)).toBe('a');
  });

  it('reads again after the time to live', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    const cache = createRequestCache();
    const fetcher = vi.fn(() => Promise.resolve('a'));
    await cache.read('k', fetcher);

    vi.setSystemTime(Date.now() + 60_000);
    await cache.read('k', fetcher);
    vi.useRealTimers();

    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});

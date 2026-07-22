import { act, renderHook, waitFor } from '@testing-library/react';
import { useApi, APIError, Cache } from '../use-api.js';
import type { Fetcher, Result } from '../use-api.js';

type Todo = { id: number; title: string };

const TODO: Todo = { id: 1, title: 'Buy milk' };

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

const okFetcher =
  (data: Todo = TODO): Fetcher<Todo> =>
  async () =>
    data;

const failFetcher =
  (message = 'Network down'): Fetcher<Todo> =>
  async () => {
    throw new Error(message);
  };

describe('Api fetch utility', () => {
  it('works when enabled by default, fetching automatically and resolving to an ok state', async () => {
    const { result } = renderHook(() => useApi(okFetcher()));

    await waitFor(() => {
      expect(result.current.state).toEqual({ is: 'ok', data: TODO });
    });
  });

  it('works when a request is pending, exposing a busy state', async () => {
    const { promise, resolve } = deferred<Todo>();
    const fn: Fetcher<Todo> = async () => promise;

    const { result } = renderHook(() => useApi(fn));

    expect(result.current.state).toEqual({ is: 'busy' });

    await act(async () => {
      resolve(TODO);
      await promise;
    });

    await waitFor(() => {
      expect(result.current.state).toEqual({ is: 'ok', data: TODO });
    });
  });

  it('works when enabled is false, skipping the automatic fetch while call() still works', async () => {
    let calls = 0;
    const fn: Fetcher<Todo> = async () => {
      calls += 1;
      return TODO;
    };

    const { result } = renderHook(() => useApi(fn, { enabled: false }));

    expect(result.current.state).toEqual({ is: 'idle' });
    expect(calls).toBe(0);

    await act(async () => {
      await result.current.call();
    });

    expect(result.current.state).toEqual({ is: 'ok', data: TODO });
    expect(calls).toBe(1);
  });

  it('works when the request fails, exposing a fail state with a normalized error', async () => {
    const { result } = renderHook(() =>
      useApi(failFetcher('Network down'), { enabled: false }),
    );

    await act(async () => {
      await result.current.call();
    });

    expect(result.current.state.is).toBe('fail');
    if (result.current.state.is === 'fail') {
      expect(result.current.state.error).toBeInstanceOf(APIError);
      expect(result.current.state.error.message).toBe('Network down');
    }
  });

  it('works when multiple calls overlap, keeping only the result of the most recently invoked one', async () => {
    const first = deferred<Todo>();
    const second = deferred<Todo>();
    let calls = 0;
    const fn: Fetcher<Todo> = async () => {
      calls += 1;
      return calls === 1 ? first.promise : second.promise;
    };

    const { result } = renderHook(() => useApi(fn, { enabled: false }));

    const secondData: Todo = { id: 2, title: 'Second' };

    await act(async () => {
      const firstCall = result.current.call();
      const secondCall = result.current.call();

      second.resolve(secondData);
      await secondCall;

      first.resolve({ id: 1, title: 'First' });
      await firstCall;
    });

    expect(result.current.state).toEqual({ is: 'ok', data: secondData });
  });

  it('works when an earlier overlapping call fails, ignoring its error and keeping the latest result', async () => {
    const first = deferred<Todo>();
    const second = deferred<Todo>();
    let calls = 0;
    const fn: Fetcher<Todo> = async () => {
      calls += 1;
      return calls === 1 ? first.promise : second.promise;
    };

    const { result } = renderHook(() => useApi(fn, { enabled: false }));

    const secondData: Todo = { id: 2, title: 'Second' };

    await act(async () => {
      const firstCall = result.current.call();
      const secondCall = result.current.call();

      second.resolve(secondData);
      await secondCall;

      first.reject(new Error('First failed'));
      await firstCall;
    });

    expect(result.current.state).toEqual({ is: 'ok', data: secondData });
  });

  it('works when the browser regains connectivity, refetching automatically', async () => {
    let calls = 0;
    const fn: Fetcher<Todo> = async () => {
      calls += 1;
      return TODO;
    };

    renderHook(() => useApi(fn));

    await waitFor(() => expect(calls).toBe(1));

    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    await waitFor(() => expect(calls).toBe(2));
  });

  it('works when unmounted while a request is in flight, aborting the underlying request', async () => {
    const { promise } = deferred<Todo>();
    let capturedSignal: AbortSignal | undefined;
    const fn: Fetcher<Todo> = async (signal) => {
      capturedSignal = signal;
      return promise;
    };

    const { unmount } = renderHook(() => useApi(fn));

    await waitFor(() => expect(capturedSignal).toBeDefined());
    expect(capturedSignal?.aborted).toBe(false);

    unmount();

    expect(capturedSignal?.aborted).toBe(true);
  });

  it('works when abort() is called during an in-flight request, settling to a fail state with an aborted APIError', async () => {
    const fn: Fetcher<Todo> = (signal) =>
      new Promise((_, reject) => {
        signal.addEventListener('abort', () =>
          reject(new DOMException('Aborted', 'AbortError')),
        );
      });

    const { result } = renderHook(() => useApi(fn, { enabled: false }));

    let callResult!: Promise<Result<Todo>>;
    act(() => {
      callResult = result.current.call();
    });

    expect(result.current.state).toEqual({ is: 'busy' });

    act(() => {
      result.current.abort();
    });

    await act(async () => {
      await callResult;
    });

    expect(result.current.state.is).toBe('fail');
    if (result.current.state.is === 'fail') {
      expect(result.current.state.error).toBeInstanceOf(APIError);
      expect(result.current.state.error.isAborted).toBe(true);
    }
  });

  it('works when abort() is called with no request in flight, doing nothing', () => {
    const { result } = renderHook(() =>
      useApi(okFetcher(), { enabled: false }),
    );

    expect(result.current.state).toEqual({ is: 'idle' });

    act(() => {
      result.current.abort();
    });

    expect(result.current.state).toEqual({ is: 'idle' });
  });

  it('works when unmounted, no longer refetching once the browser regains connectivity', async () => {
    let calls = 0;
    const fn: Fetcher<Todo> = async () => {
      calls += 1;
      return TODO;
    };

    const { unmount } = renderHook(() => useApi(fn));

    await waitFor(() => expect(calls).toBe(1));

    unmount();

    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    expect(calls).toBe(1);
  });

  it('works when unmounted while a request is in flight, not updating state once it later settles', async () => {
    const { promise, resolve } = deferred<Todo>();
    const fn: Fetcher<Todo> = async () => promise;

    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const { result, unmount } = renderHook(() => useApi(fn));

    expect(result.current.state).toEqual({ is: 'busy' });

    unmount();

    await act(async () => {
      resolve(TODO);
      await promise;
    });

    expect(result.current.state).toEqual({ is: 'busy' });
    expect(consoleError).not.toHaveBeenCalled();

    consoleError.mockRestore();
  });

  it('works when no key is set, ignoring any default cache and always fetching fresh', async () => {
    let calls = 0;
    const fn: Fetcher<Todo> = async () => {
      calls += 1;
      return TODO;
    };

    const { result } = renderHook(() => useApi(fn, { enabled: false }));

    await act(async () => {
      await result.current.call();
    });

    await act(async () => {
      await result.current.call();
    });

    expect(calls).toBe(2);
  });

  it('works when no cache is passed but a key is, defaulting to a private cache scoped to this hook call', async () => {
    let calls = 0;
    const fn: Fetcher<Todo> = async () => {
      calls += 1;
      return TODO;
    };

    const { result } = renderHook(() =>
      useApi(fn, { key: 'todo', enabled: false }),
    );

    await act(async () => {
      await result.current.call();
    });

    await act(async () => {
      await result.current.call();
    });

    expect(calls).toBe(1);
    expect(result.current.state).toEqual({ is: 'ok', data: TODO });
  });

  it('works when two hook instances default their own cache, keeping entries isolated between them', async () => {
    let calls = 0;
    const fn: Fetcher<Todo> = async () => {
      calls += 1;
      return TODO;
    };

    const { result: first } = renderHook(() =>
      useApi(fn, { key: 'todo', enabled: false }),
    );
    const { result: second } = renderHook(() =>
      useApi(fn, { key: 'todo', enabled: false }),
    );

    await act(async () => {
      await first.current.call();
    });
    await act(async () => {
      await second.current.call();
    });

    expect(calls).toBe(2);
  });

  it('works with cache-first strategy and an empty cache, fetching and populating it', async () => {
    const cache = new Cache();
    let calls = 0;
    const fn: Fetcher<Todo> = async () => {
      calls += 1;
      return TODO;
    };

    const { result } = renderHook(() =>
      useApi(fn, { cache, key: 'todo', enabled: false }),
    );

    await act(async () => {
      await result.current.call();
    });

    expect(calls).toBe(1);
    expect(result.current.state).toEqual({ is: 'ok', data: TODO });
    expect(cache.get('todo')).toEqual(TODO);
  });

  it('works with cache-first strategy and a populated cache, skipping the network call entirely', async () => {
    const cache = new Cache();
    cache.set('todo', TODO);

    let calls = 0;
    const fn: Fetcher<Todo> = async () => {
      calls += 1;
      return TODO;
    };

    const { result } = renderHook(() =>
      useApi(fn, { cache, key: 'todo', enabled: false }),
    );

    let callResult!: Result<Todo>;
    await act(async () => {
      callResult = await result.current.call();
    });

    expect(calls).toBe(0);
    expect(callResult).toEqual({ is: 'ok', data: TODO });
    expect(result.current.state).toEqual({ is: 'ok', data: TODO });
  });

  it('works with stale-while-revalidate strategy and a populated cache, returning the cached value immediately and still revalidating in the background', async () => {
    const cache = new Cache({ strategy: 'stale-while-revalidate' });
    const cached: Todo = { id: 1, title: 'Stale title' };
    cache.set('todo', cached);

    const { promise, resolve } = deferred<Todo>();
    let calls = 0;
    const fn: Fetcher<Todo> = async () => {
      calls += 1;
      return promise;
    };

    const { result } = renderHook(() =>
      useApi(fn, {
        cache,
        key: 'todo',
        enabled: false,
      }),
    );

    let callResult!: Promise<Result<Todo>>;
    act(() => {
      callResult = result.current.call();
    });

    expect(result.current.state).toEqual({ is: 'ok', data: cached });
    expect(calls).toBe(1);

    await act(async () => {
      resolve(TODO);
      await callResult;
    });

    expect(result.current.state).toEqual({ is: 'ok', data: TODO });
    expect(cache.get('todo')).toEqual(TODO);
  });

  it('works with stale-while-revalidate strategy when the background refetch fails, dropping the stale cached data from view', async () => {
    const cache = new Cache({ strategy: 'stale-while-revalidate' });
    cache.set('todo', TODO);

    const { result } = renderHook(() =>
      useApi(failFetcher('Network down'), {
        cache,
        key: 'todo',
        enabled: false,
      }),
    );

    await act(async () => {
      await result.current.call();
    });

    expect(result.current.state.is).toBe('fail');
    if (result.current.state.is === 'fail') {
      expect(result.current.state.error.message).toBe('Network down');
    }
  });

  it('works when a call fails with caching enabled, never writing the failed result to the cache', async () => {
    const cache = new Cache();

    const { result } = renderHook(() =>
      useApi(failFetcher('Network down'), {
        cache,
        key: 'todo',
        enabled: false,
      }),
    );

    await act(async () => {
      await result.current.call();
    });

    expect(cache.has('todo')).toBe(false);
  });
});

describe('Cache', () => {
  it('works when a key was never set, reporting it as absent', () => {
    const cache = new Cache();

    expect(cache.has('todos')).toBe(false);
    expect(cache.get('todos')).toBeUndefined();
  });

  it('works when a value is set, making it readable under the same key', () => {
    const cache = new Cache();

    cache.set('todos', ['Buy milk']);

    expect(cache.has('todos')).toBe(true);
    expect(cache.get('todos')).toEqual(['Buy milk']);
  });

  it('works when a key is set twice, overwriting the previous value', () => {
    const cache = new Cache();

    cache.set('todos', ['Buy milk']);
    cache.set('todos', ['Buy bread']);

    expect(cache.get('todos')).toEqual(['Buy bread']);
  });

  it('works when two instances are created, keeping their entries isolated', () => {
    const first = new Cache();
    const second = new Cache();

    first.set('todos', ['Buy milk']);

    expect(second.has('todos')).toBe(false);
  });

  it('works when no strategy is given, defaulting to cache-first', () => {
    const cache = new Cache();

    expect(cache.strategy).toBe('cache-first');
  });

  it('works when a strategy is given, exposing it as-is', () => {
    const cache = new Cache({ strategy: 'stale-while-revalidate' });

    expect(cache.strategy).toBe('stale-while-revalidate');
  });
});

describe('Real-world usage scenarios', () => {
  it('works through a full mount-to-unmount cycle without an explicit cache, reusing the default per-hook cache for every trigger and never refetching once warm', async () => {
    let calls = 0;
    const fn: Fetcher<Todo> = async () => {
      calls += 1;
      return TODO;
    };

    const { result, unmount } = renderHook(() => useApi(fn, { key: 'todo' }));

    // Cold cache on mount: fetches once and warms the hook's own cache.
    await waitFor(() => {
      expect(result.current.state).toEqual({ is: 'ok', data: TODO });
    });
    expect(calls).toBe(1);

    // Reconnect trigger hits the now-warm cache: no extra network call.
    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(result.current.state).toEqual({ is: 'ok', data: TODO });
    expect(calls).toBe(1);

    // A consumer-triggered manual refresh still prefers the cache.
    await act(async () => {
      await result.current.call();
    });
    expect(result.current.state).toEqual({ is: 'ok', data: TODO });
    expect(calls).toBe(1);

    // Unmount aborts cleanly even though nothing is in flight.
    expect(() => unmount()).not.toThrow();
  });

  it('works through a full lifecycle with a stale-while-revalidate cache shared across two mounted components, warming it from a cold first mount and revalidating it in the background for a second', async () => {
    const cache = new Cache({ strategy: 'stale-while-revalidate' });
    let calls = 0;
    const fn: Fetcher<Todo> = async () => {
      calls += 1;
      return { id: calls, title: `Version ${calls}` };
    };

    // First component: cache is cold, so the strategy doesn't matter yet —
    // it just fetches and populates the shared cache.
    const first = renderHook(() => useApi(fn, { cache, key: 'todo' }));

    await waitFor(() => {
      expect(first.result.current.state).toEqual({
        is: 'ok',
        data: { id: 1, title: 'Version 1' },
      });
    });
    expect(calls).toBe(1);

    first.unmount();

    // Second component: same shared cache is already warm, and its
    // stale-while-revalidate strategy renders the cached value immediately,
    // then revalidates in the background.
    const second = renderHook(() => useApi(fn, { cache, key: 'todo' }));

    expect(second.result.current.state).toEqual({
      is: 'ok',
      data: { id: 1, title: 'Version 1' },
    });

    await waitFor(() => {
      expect(second.result.current.state).toEqual({
        is: 'ok',
        data: { id: 2, title: 'Version 2' },
      });
    });
    expect(cache.get('todo')).toEqual({ id: 2, title: 'Version 2' });

    // A manual "refresh" still serves the cache instantly, then revalidates again.
    let refreshResult!: Promise<Result<Todo>>;
    act(() => {
      refreshResult = second.result.current.call();
    });
    expect(second.result.current.state).toEqual({
      is: 'ok',
      data: { id: 2, title: 'Version 2' },
    });

    await act(async () => {
      await refreshResult;
    });
    expect(second.result.current.state).toEqual({
      is: 'ok',
      data: { id: 3, title: 'Version 3' },
    });
    expect(cache.get('todo')).toEqual({ id: 3, title: 'Version 3' });
    expect(calls).toBe(3);

    expect(() => second.unmount()).not.toThrow();
  });

  it('works through a full lifecycle where the background revalidation fails, dropping the stale cache view without corrupting the shared cache entry', async () => {
    const cache = new Cache({ strategy: 'stale-while-revalidate' });
    cache.set('todo', TODO);

    const { result, unmount } = renderHook(() =>
      useApi(failFetcher('Network down'), { cache, key: 'todo' }),
    );

    // Immediately serves the stale cached value...
    expect(result.current.state).toEqual({ is: 'ok', data: TODO });

    // ...then the background revalidation fails and replaces it with a fail state.
    await waitFor(() => {
      expect(result.current.state.is).toBe('fail');
    });
    if (result.current.state.is === 'fail') {
      expect(result.current.state.error).toBeInstanceOf(APIError);
      expect(result.current.state.error.message).toBe('Network down');
    }

    // The last known-good value survives in the cache untouched.
    expect(cache.get('todo')).toEqual(TODO);

    expect(() => unmount()).not.toThrow();
  });
});

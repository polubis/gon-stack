import { act, renderHook, waitFor } from '@testing-library/react';
import { APIError } from '../use-api.js';
import { usePagination, FieldCursorStrategy } from '../use-pagination.js';
import type { PageFetcher, Result } from '../use-pagination.js';

type Todo = { id: number; title: string };

const TODOS: Todo[] = Array.from({ length: 25 }, (_, index) => ({
  id: index + 1,
  title: `Todo ${index + 1}`,
}));

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

const offsetFetcher =
  (items: Todo[] = TODOS): PageFetcher<Todo, number> =>
  async (request) => {
    if (request.method !== 'offset') throw new Error('Expected offset request');
    return items.slice(request.offset, request.offset + request.limit);
  };

const cursorFetcher =
  (items: Todo[] = TODOS, pageSize = 10): PageFetcher<Todo, number> =>
  async (request) => {
    if (request.method !== 'cursor') throw new Error('Expected cursor request');
    const startIndex =
      request.cursor === undefined
        ? 0
        : items.findIndex((todo) => todo.id === request.cursor) + 1;
    return items.slice(startIndex, startIndex + pageSize);
  };

const failFetcher =
  (message = 'Network down'): PageFetcher<Todo, number> =>
  async () => {
    throw new Error(message);
  };

const strategy = () => new FieldCursorStrategy<Todo, number>((todo) => todo.id);

describe('Offset pagination', () => {
  it('works when enabled by default, fetching the first page automatically', async () => {
    const { result } = renderHook(() =>
      usePagination(offsetFetcher(), { method: 'offset', limit: 10 }),
    );

    await waitFor(() => {
      expect(result.current.state).toEqual({
        is: 'ok',
        items: TODOS.slice(0, 10),
        hasMore: true,
      });
    });
  });

  it('works when a request is pending, exposing a busy state with the items accumulated so far', async () => {
    const { promise, resolve } = deferred<Todo[]>();
    const fn: PageFetcher<Todo, number> = async () => promise;

    const { result } = renderHook(() =>
      usePagination(fn, { method: 'offset', limit: 10 }),
    );

    expect(result.current.state).toEqual({ is: 'busy', items: [] });

    await act(async () => {
      resolve(TODOS.slice(0, 10));
      await promise;
    });

    await waitFor(() => {
      expect(result.current.state).toEqual({
        is: 'ok',
        items: TODOS.slice(0, 10),
        hasMore: true,
      });
    });
  });

  it('works when enabled is false, skipping the automatic fetch while loadMore() still works', async () => {
    let calls = 0;
    const fn: PageFetcher<Todo, number> = async (request) => {
      calls += 1;
      return offsetFetcher()(request, new AbortController().signal);
    };

    const { result } = renderHook(() =>
      usePagination(fn, { method: 'offset', limit: 10, enabled: false }),
    );

    expect(result.current.state).toEqual({ is: 'idle' });
    expect(calls).toBe(0);

    await act(async () => {
      await result.current.loadMore();
    });

    expect(calls).toBe(1);
    expect(result.current.state).toEqual({
      is: 'ok',
      items: TODOS.slice(0, 10),
      hasMore: true,
    });
  });

  it('works when the request fails, exposing a fail state with a normalized error and no items yet', async () => {
    const { result } = renderHook(() =>
      usePagination(failFetcher('Network down'), {
        method: 'offset',
        limit: 10,
        enabled: false,
      }),
    );

    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.state.is).toBe('fail');
    if (result.current.state.is === 'fail') {
      expect(result.current.state.items).toEqual([]);
      expect(result.current.state.error).toBeInstanceOf(APIError);
      expect(result.current.state.error.message).toBe('Network down');
    }
  });

  it('works when loadMore() is called across several pages, appending items from each page', async () => {
    const requests: Array<{ offset: number; limit: number }> = [];
    const fn: PageFetcher<Todo, number> = async (request) => {
      if (request.method === 'offset') {
        requests.push({ offset: request.offset, limit: request.limit });
      }
      return offsetFetcher()(request, new AbortController().signal);
    };

    const { result } = renderHook(() =>
      usePagination(fn, { method: 'offset', limit: 10 }),
    );

    await waitFor(() => {
      expect(result.current.state).toEqual({
        is: 'ok',
        items: TODOS.slice(0, 10),
        hasMore: true,
      });
    });

    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.state).toEqual({
      is: 'ok',
      items: TODOS.slice(0, 20),
      hasMore: true,
    });

    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.state).toEqual({
      is: 'ok',
      items: TODOS.slice(0, 25),
      hasMore: false,
    });

    expect(requests).toEqual([
      { offset: 0, limit: 10 },
      { offset: 10, limit: 10 },
      { offset: 20, limit: 10 },
    ]);
  });

  it('works when the last page exactly fills the limit, only settling hasMore to false once an empty page follows', async () => {
    const items = TODOS.slice(0, 20);
    let calls = 0;
    const fn: PageFetcher<Todo, number> = async (request) => {
      calls += 1;
      return offsetFetcher(items)(request, new AbortController().signal);
    };

    const { result } = renderHook(() =>
      usePagination(fn, { method: 'offset', limit: 10 }),
    );

    await waitFor(() => {
      expect(result.current.state).toEqual({
        is: 'ok',
        items: items.slice(0, 10),
        hasMore: true,
      });
    });

    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.state).toEqual({
      is: 'ok',
      items,
      hasMore: true,
    });

    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.state).toEqual({ is: 'ok', items, hasMore: false });
    expect(calls).toBe(3);
  });

  it('works when loadMore() is called after hasMore is false, doing nothing', async () => {
    const items = TODOS.slice(0, 5);
    let calls = 0;
    const fn: PageFetcher<Todo, number> = async (request) => {
      calls += 1;
      return offsetFetcher(items)(request, new AbortController().signal);
    };

    const { result } = renderHook(() =>
      usePagination(fn, { method: 'offset', limit: 10 }),
    );

    await waitFor(() => {
      expect(result.current.state).toEqual({ is: 'ok', items, hasMore: false });
    });
    expect(calls).toBe(1);

    let loadMoreResult!: Result<Todo>;
    await act(async () => {
      loadMoreResult = await result.current.loadMore();
    });

    expect(calls).toBe(1);
    expect(loadMoreResult).toEqual({ is: 'ok', items, hasMore: false });
  });

  it('works when a later page fails, keeping the previously loaded items visible in the fail state', async () => {
    let calls = 0;
    const fn: PageFetcher<Todo, number> = async (request) => {
      calls += 1;
      if (calls === 2) throw new Error('Network down');
      return offsetFetcher()(request, new AbortController().signal);
    };

    const { result } = renderHook(() =>
      usePagination(fn, { method: 'offset', limit: 10 }),
    );

    await waitFor(() => {
      expect(result.current.state).toEqual({
        is: 'ok',
        items: TODOS.slice(0, 10),
        hasMore: true,
      });
    });

    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.state.is).toBe('fail');
    if (result.current.state.is === 'fail') {
      expect(result.current.state.items).toEqual(TODOS.slice(0, 10));
      expect(result.current.state.error.message).toBe('Network down');
    }
  });

  it('works when a page fails and loadMore() is retried, reloading the same page instead of skipping ahead', async () => {
    const requests: number[] = [];
    let calls = 0;
    const fn: PageFetcher<Todo, number> = async (request) => {
      calls += 1;
      if (request.method === 'offset') requests.push(request.offset);
      if (calls === 2) throw new Error('Network down');
      return offsetFetcher()(request, new AbortController().signal);
    };

    const { result } = renderHook(() =>
      usePagination(fn, { method: 'offset', limit: 10 }),
    );

    await waitFor(() => expect(result.current.state.is).toBe('ok'));

    await act(async () => {
      await result.current.loadMore();
    });
    expect(result.current.state.is).toBe('fail');

    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.state).toEqual({
      is: 'ok',
      items: TODOS.slice(0, 20),
      hasMore: true,
    });
    expect(requests).toEqual([0, 10, 10]);
  });

  it('works when reset() is called, clearing accumulated items and re-fetching from the first page', async () => {
    const { result } = renderHook(() =>
      usePagination(offsetFetcher(), { method: 'offset', limit: 10 }),
    );

    await waitFor(() => expect(result.current.state.is).toBe('ok'));

    await act(async () => {
      await result.current.loadMore();
    });
    expect(result.current.state).toEqual({
      is: 'ok',
      items: TODOS.slice(0, 20),
      hasMore: true,
    });

    await act(async () => {
      await result.current.reset();
    });

    expect(result.current.state).toEqual({
      is: 'ok',
      items: TODOS.slice(0, 10),
      hasMore: true,
    });
  });

  it('works when multiple loadMore() calls overlap, keeping only the result of the most recently invoked one', async () => {
    const first = deferred<Todo[]>();
    const second = deferred<Todo[]>();
    let calls = 0;
    const fn: PageFetcher<Todo, number> = async () => {
      calls += 1;
      return calls === 1 ? first.promise : second.promise;
    };

    const { result } = renderHook(() =>
      usePagination(fn, { method: 'offset', limit: 10, enabled: false }),
    );

    await act(async () => {
      const firstCall = result.current.loadMore();
      const secondCall = result.current.loadMore();

      second.resolve(TODOS.slice(0, 10));
      await secondCall;

      first.resolve(TODOS.slice(10, 20));
      await firstCall;
    });

    expect(result.current.state).toEqual({
      is: 'ok',
      items: TODOS.slice(0, 10),
      hasMore: true,
    });
  });

  it('works when unmounted while a request is in flight, aborting the underlying request', async () => {
    const { promise } = deferred<Todo[]>();
    let capturedSignal: AbortSignal | undefined;
    const fn: PageFetcher<Todo, number> = async (_request, signal) => {
      capturedSignal = signal;
      return promise;
    };

    const { unmount } = renderHook(() =>
      usePagination(fn, { method: 'offset', limit: 10 }),
    );

    await waitFor(() => expect(capturedSignal).toBeDefined());
    expect(capturedSignal?.aborted).toBe(false);

    unmount();

    expect(capturedSignal?.aborted).toBe(true);
  });

  it('works when unmounted while a request is in flight, not updating state once it later settles', async () => {
    const { promise, resolve } = deferred<Todo[]>();
    const fn: PageFetcher<Todo, number> = async () => promise;

    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const { result, unmount } = renderHook(() =>
      usePagination(fn, { method: 'offset', limit: 10 }),
    );

    expect(result.current.state).toEqual({ is: 'busy', items: [] });

    unmount();

    await act(async () => {
      resolve(TODOS.slice(0, 10));
      await promise;
    });

    expect(result.current.state).toEqual({ is: 'busy', items: [] });
    expect(consoleError).not.toHaveBeenCalled();

    consoleError.mockRestore();
  });

  it('works when abort() is called during an in-flight request, settling to a fail state with an aborted APIError', async () => {
    const fn: PageFetcher<Todo, number> = (_request, signal) =>
      new Promise((_, reject) => {
        signal.addEventListener('abort', () =>
          reject(new DOMException('Aborted', 'AbortError')),
        );
      });

    const { result } = renderHook(() =>
      usePagination(fn, { method: 'offset', limit: 10, enabled: false }),
    );

    let callResult!: Promise<Result<Todo>>;
    act(() => {
      callResult = result.current.loadMore();
    });

    expect(result.current.state).toEqual({ is: 'busy', items: [] });

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
      usePagination(offsetFetcher(), {
        method: 'offset',
        limit: 10,
        enabled: false,
      }),
    );

    expect(result.current.state).toEqual({ is: 'idle' });

    act(() => {
      result.current.abort();
    });

    expect(result.current.state).toEqual({ is: 'idle' });
  });

  it('works when the browser regains connectivity, resetting to and re-fetching the first page', async () => {
    const requests: number[] = [];
    const fn: PageFetcher<Todo, number> = async (request) => {
      if (request.method === 'offset') requests.push(request.offset);
      return offsetFetcher()(request, new AbortController().signal);
    };

    const { result } = renderHook(() =>
      usePagination(fn, { method: 'offset', limit: 10 }),
    );

    await waitFor(() => expect(result.current.state.is).toBe('ok'));

    await act(async () => {
      await result.current.loadMore();
    });
    expect(result.current.state).toEqual({
      is: 'ok',
      items: TODOS.slice(0, 20),
      hasMore: true,
    });

    await act(async () => {
      window.dispatchEvent(new Event('online'));
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(result.current.state).toEqual({
        is: 'ok',
        items: TODOS.slice(0, 10),
        hasMore: true,
      });
    });
    expect(requests).toEqual([0, 10, 0]);
  });

  it('works when unmounted, no longer refetching once the browser regains connectivity', async () => {
    let calls = 0;
    const fn: PageFetcher<Todo, number> = async (request) => {
      calls += 1;
      return offsetFetcher()(request, new AbortController().signal);
    };

    const { unmount } = renderHook(() =>
      usePagination(fn, { method: 'offset', limit: 10 }),
    );

    await waitFor(() => expect(calls).toBe(1));

    unmount();

    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    expect(calls).toBe(1);
  });
});

describe('Cursor pagination', () => {
  it('works when enabled by default, fetching the first page automatically', async () => {
    const { result } = renderHook(() =>
      usePagination(cursorFetcher(), {
        method: 'cursor',
        strategy: strategy(),
      }),
    );

    await waitFor(() => {
      expect(result.current.state).toEqual({
        is: 'ok',
        items: TODOS.slice(0, 10),
        hasMore: true,
      });
    });
  });

  it('works when loadMore() is called across several pages, appending items from each page', async () => {
    const requests: Array<number | undefined> = [];
    const fn: PageFetcher<Todo, number> = async (request) => {
      if (request.method === 'cursor') requests.push(request.cursor);
      return cursorFetcher()(request, new AbortController().signal);
    };

    const { result } = renderHook(() =>
      usePagination(fn, { method: 'cursor', strategy: strategy() }),
    );

    await waitFor(() => expect(result.current.state.is).toBe('ok'));

    await act(async () => {
      await result.current.loadMore();
    });
    expect(result.current.state).toEqual({
      is: 'ok',
      items: TODOS.slice(0, 20),
      hasMore: true,
    });

    await act(async () => {
      await result.current.loadMore();
    });
    expect(result.current.state).toEqual({
      is: 'ok',
      items: TODOS.slice(0, 25),
      hasMore: true,
    });

    expect(requests).toEqual([undefined, 10, 20]);
  });

  it('works when the last page is reached, only settling hasMore to false once an empty page follows', async () => {
    let calls = 0;
    const fn: PageFetcher<Todo, number> = async (request) => {
      calls += 1;
      return cursorFetcher()(request, new AbortController().signal);
    };

    const { result } = renderHook(() =>
      usePagination(fn, { method: 'cursor', strategy: strategy() }),
    );

    await waitFor(() => expect(result.current.state.is).toBe('ok'));

    await act(async () => {
      await result.current.loadMore();
    });
    await act(async () => {
      await result.current.loadMore();
    });
    expect(result.current.state).toEqual({
      is: 'ok',
      items: TODOS,
      hasMore: true,
    });

    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.state).toEqual({
      is: 'ok',
      items: TODOS,
      hasMore: false,
    });
    expect(calls).toBe(4);

    await act(async () => {
      await result.current.loadMore();
    });
    expect(calls).toBe(4);
  });

  it('works when the request fails, exposing a fail state with a normalized error', async () => {
    const { result } = renderHook(() =>
      usePagination(failFetcher('Network down'), {
        method: 'cursor',
        strategy: strategy(),
        enabled: false,
      }),
    );

    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.state.is).toBe('fail');
    if (result.current.state.is === 'fail') {
      expect(result.current.state.items).toEqual([]);
      expect(result.current.state.error).toBeInstanceOf(APIError);
      expect(result.current.state.error.message).toBe('Network down');
    }
  });

  it('works when reset() is called, clearing accumulated items and re-fetching from the first page', async () => {
    const requests: Array<number | undefined> = [];
    const fn: PageFetcher<Todo, number> = async (request) => {
      if (request.method === 'cursor') requests.push(request.cursor);
      return cursorFetcher()(request, new AbortController().signal);
    };

    const { result } = renderHook(() =>
      usePagination(fn, { method: 'cursor', strategy: strategy() }),
    );

    await waitFor(() => expect(result.current.state.is).toBe('ok'));

    await act(async () => {
      await result.current.loadMore();
    });

    await act(async () => {
      await result.current.reset();
    });

    expect(result.current.state).toEqual({
      is: 'ok',
      items: TODOS.slice(0, 10),
      hasMore: true,
    });
    expect(requests).toEqual([undefined, 10, undefined]);
  });

  it('works when the browser regains connectivity, resetting to and re-fetching the first page', async () => {
    const requests: Array<number | undefined> = [];
    const fn: PageFetcher<Todo, number> = async (request) => {
      if (request.method === 'cursor') requests.push(request.cursor);
      return cursorFetcher()(request, new AbortController().signal);
    };

    const { result } = renderHook(() =>
      usePagination(fn, { method: 'cursor', strategy: strategy() }),
    );

    await waitFor(() => expect(result.current.state.is).toBe('ok'));

    await act(async () => {
      await result.current.loadMore();
    });

    await act(async () => {
      window.dispatchEvent(new Event('online'));
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(result.current.state).toEqual({
        is: 'ok',
        items: TODOS.slice(0, 10),
        hasMore: true,
      });
    });
    expect(requests).toEqual([undefined, 10, undefined]);
  });

  it('works with a custom CursorStrategy implementation, deriving cursors through arbitrary logic', async () => {
    let pagesSeen = 0;
    const customStrategy = {
      getNextCursor: (items: Todo[]) => {
        pagesSeen += 1;
        return items.length > 0 && pagesSeen < 2
          ? items[items.length - 1]!.id
          : undefined;
      },
    };

    const { result } = renderHook(() =>
      usePagination(cursorFetcher(), {
        method: 'cursor',
        strategy: customStrategy,
      }),
    );

    await waitFor(() => {
      expect(result.current.state).toEqual({
        is: 'ok',
        items: TODOS.slice(0, 10),
        hasMore: true,
      });
    });

    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.state).toEqual({
      is: 'ok',
      items: TODOS.slice(0, 20),
      hasMore: false,
    });
  });
});

describe('FieldCursorStrategy', () => {
  it('works when items are given, deriving the cursor from the last item', () => {
    const cursorStrategy = strategy();

    expect(cursorStrategy.getNextCursor(TODOS.slice(0, 3))).toBe(3);
  });

  it('works when no items are given, reporting there is no next page', () => {
    const cursorStrategy = strategy();

    expect(cursorStrategy.getNextCursor([])).toBeUndefined();
  });

  it('works when there is no cursor to derive from the last item, reporting there is no next page', () => {
    const cursorStrategy = new FieldCursorStrategy<Todo, number>(
      () => undefined,
    );

    expect(cursorStrategy.getNextCursor(TODOS.slice(0, 3))).toBeUndefined();
  });
});

describe('Real-world usage scenarios', () => {
  it('works through an infinite-scroll offset flow from mount to reaching the end', async () => {
    const items = TODOS.slice(0, 22);
    const { result, unmount } = renderHook(() =>
      usePagination(offsetFetcher(items), { method: 'offset', limit: 10 }),
    );

    // Cold mount: fetches page 1.
    await waitFor(() => {
      expect(result.current.state).toEqual({
        is: 'ok',
        items: items.slice(0, 10),
        hasMore: true,
      });
    });

    // Consumer scrolls to the bottom twice more.
    await act(async () => {
      await result.current.loadMore();
    });
    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.state).toEqual({ is: 'ok', items, hasMore: false });

    // Further scroll requests are harmless no-ops at the end of the list.
    await act(async () => {
      await result.current.loadMore();
    });
    expect(result.current.state).toEqual({ is: 'ok', items, hasMore: false });

    expect(() => unmount()).not.toThrow();
  });

  it('works through a cursor-based flow with a transient failure that the consumer retries', async () => {
    let attempt = 0;
    const fn: PageFetcher<Todo, number> = async (request) => {
      if (request.method === 'cursor' && request.cursor === 10) {
        attempt += 1;
        if (attempt === 1) throw new Error('Network down');
      }
      return cursorFetcher()(request, new AbortController().signal);
    };

    const { result, unmount } = renderHook(() =>
      usePagination(fn, { method: 'cursor', strategy: strategy() }),
    );

    await waitFor(() => expect(result.current.state.is).toBe('ok'));

    // Second page fails transiently...
    await act(async () => {
      await result.current.loadMore();
    });
    expect(result.current.state.is).toBe('fail');
    if (result.current.state.is === 'fail') {
      expect(result.current.state.items).toEqual(TODOS.slice(0, 10));
    }

    // ...the consumer retries and it succeeds this time.
    await act(async () => {
      await result.current.loadMore();
    });
    expect(result.current.state).toEqual({
      is: 'ok',
      items: TODOS.slice(0, 20),
      hasMore: true,
    });

    expect(() => unmount()).not.toThrow();
  });
});

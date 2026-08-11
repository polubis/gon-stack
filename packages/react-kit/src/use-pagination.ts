import {
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from 'react';
import { APIError } from './use-api.js';
import { useOnInternetReconnect } from './use-on-internet-reconnect.js';

/* =============================================================================
 * Internal Types
 * ============================================================================= */

type UsePagination = <TItem, TCursor = string>(
  fn: PageFetcher<TItem, TCursor>,
  config: UsePaginationConfig<TItem, TCursor>,
) => UsePaginationReturn<TItem>;

/* =============================================================================
 * Public Types
 * ============================================================================= */

/** A single page request, shaped by the pagination `method` in play. */
export type PageRequest<TCursor> =
  | { method: 'offset'; offset: number; limit: number }
  | { method: 'cursor'; cursor: TCursor | undefined };

/** A page-fetching function `usePagination` calls for each page, aborted via `signal` on a new call or unmount. */
export type PageFetcher<TItem, TCursor> = (
  request: PageRequest<TCursor>,
  signal: AbortSignal,
) => Promise<TItem[]>;

/** Options for the `'offset'` pagination method. */
export type OffsetPaginationConfig = {
  method: 'offset';
  /** Number of items requested per page. */
  limit: number;
  /** Skips the automatic fetch of the first page on mount. Defaults to `true`. */
  enabled?: boolean;
};

/** Options for the `'cursor'` pagination method. */
export type CursorPaginationConfig<TItem, TCursor> = {
  method: 'cursor';
  /** Derives the next page's cursor from the items of the page just fetched. */
  strategy: CursorStrategy<TItem, TCursor>;
  /** Skips the automatic fetch of the first page on mount. Defaults to `true`. */
  enabled?: boolean;
};

/** Options accepted by `usePagination`. The `method` picks the pagination scheme. */
export type UsePaginationConfig<TItem, TCursor> =
  OffsetPaginationConfig | CursorPaginationConfig<TItem, TCursor>;

/** The current lifecycle state of a `usePagination` call. Every state but `idle` carries the items accumulated so far. */
export type PaginationState<TItem> =
  | { is: 'idle' }
  | { is: 'busy'; items: TItem[] }
  | { is: 'ok'; items: TItem[]; hasMore: boolean }
  | { is: 'fail'; items: TItem[]; error: APIError };

/** The outcome of a single `loadMore()` or `reset()` invocation. */
export type Result<TItem> =
  | { is: 'ok'; items: TItem[]; hasMore: boolean }
  | { is: 'fail'; items: TItem[]; error: APIError };

/** The value returned by `usePagination`. */
export type UsePaginationReturn<TItem> = {
  /** Fetches the next page and appends it to the accumulated items. Aborts any in-flight call from a previous invocation. A no-op once `hasMore` is `false`. */
  loadMore: () => Promise<Result<TItem>>;
  /** Aborts the current in-flight call, if any; otherwise a no-op. */
  abort: () => void;
  /** Clears the accumulated items and re-fetches from the first page. */
  reset: () => Promise<Result<TItem>>;
  /** The latest lifecycle state. */
  state: PaginationState<TItem>;
};

/* =============================================================================
 * Cursor Strategy
 * ============================================================================= */

/**
 * Derives the cursor for the next page from the items of the page just
 * fetched. Implement this to plug in a custom cursor scheme instead of the
 * default `FieldCursorStrategy`.
 */
export interface CursorStrategy<TItem, TCursor> {
  /** Returns the cursor for the next page, or `undefined` when there is no next page. */
  getNextCursor(items: TItem[]): TCursor | undefined;
}

/**
 * Default `CursorStrategy` that derives the next cursor from the last item
 * of each fetched page via `selectCursor`.
 *
 * @example
 * ```ts
 * const strategy = new FieldCursorStrategy<Todo, string>((todo) => todo.id);
 *
 * const useTodos = () =>
 *   usePagination(fetchTodos, { method: 'cursor', strategy });
 * ```
 */
export class FieldCursorStrategy<TItem, TCursor> implements CursorStrategy<
  TItem,
  TCursor
> {
  /**
   * @param selectCursor Reads the next cursor off the last item of a page. Return `undefined` to signal there is no next page.
   */
  constructor(
    private readonly selectCursor: (lastItem: TItem) => TCursor | undefined,
  ) {}

  getNextCursor(items: TItem[]): TCursor | undefined {
    const lastItem = items[items.length - 1];
    return lastItem === undefined ? undefined : this.selectCursor(lastItem);
  }
}

/* =============================================================================
 * Hook
 * ============================================================================= */

/**
 * Runs `fn` page by page and exposes the accumulated items as `state`,
 * fetching the first page automatically on mount (unless `enabled` is
 * `false`) and re-fetching from the first page whenever the browser regains
 * connectivity. Calling `loadMore()` aborts any call still in flight so only
 * the most recently invoked one can ever update `state`; once `hasMore` is
 * `false` it becomes a no-op. The consumer can also abort the current
 * in-flight call directly via `abort()`, which resolves `state` to `fail`
 * with an `APIError` whose `isAborted` is `true`. `reset()` clears the
 * accumulated items and re-fetches from the first page.
 *
 * Pick a pagination scheme via `config.method`:
 * - `'offset'` requests pages as `{ offset, limit }`, advancing `offset` by
 *   the size of every fetched page; `hasMore` is `true` while a page comes
 *   back full.
 * - `'cursor'` requests pages as `{ cursor }`, deriving the next cursor from
 *   the fetched items via `config.strategy`; see {@link CursorStrategy}.
 *
 * @param fn The page fetcher to run.
 * @param config Options; see {@link UsePaginationConfig}.
 */
export const usePagination: UsePagination = <TItem, TCursor = string>(
  fn: PageFetcher<TItem, TCursor>,
  config: UsePaginationConfig<TItem, TCursor>,
) => {
  const { enabled = true, method } = config;
  const limit = config.method === 'offset' ? config.limit : undefined;
  const strategy = config.method === 'cursor' ? config.strategy : undefined;

  const [state, setState] = useState<PaginationState<TItem>>({ is: 'idle' });
  const abortController = useRef<AbortController>(null);
  const items = useRef<TItem[]>([]);
  const offset = useRef(0);
  const cursor = useRef<TCursor | undefined>(undefined);
  const hasMore = useRef(true);

  const fetchPage = useCallback(
    async (replace: boolean): Promise<Result<TItem>> => {
      abortController.current?.abort();

      if (replace) {
        items.current = [];
        offset.current = 0;
        cursor.current = undefined;
        hasMore.current = true;
      }

      const previousItems = items.current;
      setState({ is: 'busy', items: previousItems });

      const ctrl = new AbortController();
      abortController.current = ctrl;

      const request: PageRequest<TCursor> =
        method === 'offset'
          ? { method: 'offset', offset: offset.current, limit: limit! }
          : { method: 'cursor', cursor: cursor.current };

      const result = await fn(request, ctrl.signal).then(
        (page): Result<TItem> => {
          const nextItems = [...previousItems, ...page];

          if (method === 'offset') {
            offset.current += page.length;
            hasMore.current = page.length === limit!;
          } else {
            cursor.current = strategy!.getNextCursor(page);
            hasMore.current = cursor.current !== undefined;
          }

          return { is: 'ok', items: nextItems, hasMore: hasMore.current };
        },
        (error): Result<TItem> => ({
          is: 'fail',
          items: previousItems,
          error: APIError.from(error),
        }),
      );
      // A newer call already replaced this controller; let its result win
      // instead of clobbering fresher state with this stale one.
      if (abortController.current === ctrl) {
        setState(result);
      }

      if (result.is === 'ok') {
        items.current = result.items;
      }

      return result;
    },
    [fn, method, limit, strategy],
  );

  const loadMore = useCallback((): Promise<Result<TItem>> => {
    if (!hasMore.current) {
      return Promise.resolve({
        is: 'ok',
        items: items.current,
        hasMore: false,
      });
    }

    return fetchPage(false);
  }, [fetchPage]);

  const reset = useCallback((): Promise<Result<TItem>> => {
    return fetchPage(true);
  }, [fetchPage]);

  const abort = useCallback((): void => {
    abortController.current?.abort();
  }, []);

  const fetchFirstPage = useEffectEvent(async () => {
    await fetchPage(true);
  });

  useOnInternetReconnect(() => fetchPage(true));

  useEffect(() => {
    if (!enabled) return;

    fetchFirstPage();

    return () => {
      abortController.current?.abort();
    };
  }, [enabled]);

  return { loadMore, abort, reset, state };
};

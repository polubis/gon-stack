import {
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from 'react';

/* =============================================================================
 * Internal Types
 * ============================================================================= */

type UseApi = <TData>(
  fn: Fetcher<TData>,
  config?: UseApiConfig,
) => UseApiReturn<TData>;

/* =============================================================================
 * Helpers
 * ============================================================================= */

/**
 * Runs `onReconnect` whenever the browser regains connectivity
 * (the `online` event), always calling the latest closure.
 */
const useOnInternetReconnect = (onReconnect: () => void): void => {
  const handleReconnect = useEffectEvent(() => {
    onReconnect();
  });

  useEffect(() => {
    window.addEventListener('online', handleReconnect);

    return () => {
      window.removeEventListener('online', handleReconnect);
    };
  }, []);
};

/* =============================================================================
 * Public Types
 * ============================================================================= */

/** A request function `useApi` calls, aborted via `signal` on unmount or re-call. */
export type Fetcher<TData> = (signal: AbortSignal) => Promise<TData>;

/** How a `Cacheable` is used by `useApi` when a `key` is set. */
export type CacheStrategy =
  /** Return the cached value and skip the network call entirely. */
  | 'cache-first'
  /** Return the cached value immediately, then still fetch in the background. */
  | 'stale-while-revalidate';

/** Options accepted by `useApi`. */
export type UseApiConfig = {
  /** Skips the automatic call on mount. Defaults to `true`. */
  enabled?: boolean;
  /**
   * Cache used to read/write results by `key`. Defaults to a `Cache`
   * instance private to this hook call. Pass your own instance — created
   * and stored outside the hook (module scope, context, ...) — to share it
   * across every `useApi` call that should see the same entries, and to
   * control its {@link CacheStrategy} via its constructor.
   */
  cache?: Cacheable;
  /** Cache key. Omit to skip caching entirely and always fetch fresh. */
  key?: string;
};

/** The current lifecycle state of a `useApi` call. */
export type State<TData> =
  | { is: 'idle' }
  | { is: 'busy' }
  | { is: 'ok'; data: TData }
  | { is: 'fail'; error: APIError };

/** The outcome of a single `call()` invocation. */
export type Result<TData> =
  { is: 'ok'; data: TData } | { is: 'fail'; error: APIError };

/** The value returned by `useApi`. */
export type UseApiReturn<TData> = {
  /** Invokes the fetcher, aborting any in-flight call from a previous invocation. */
  call: () => Promise<Result<TData>>;
  /** Aborts the current in-flight call, if any; otherwise a no-op. */
  abort: () => void;
  /** The latest lifecycle state. */
  state: State<TData>;
};

/* =============================================================================
 * Cache
 * ============================================================================= */

/**
 * Minimal synchronous key-value store contract consumed by `useApi` for
 * result caching. Implement this to plug in a custom storage backend
 * (e.g. `localStorage`, an LRU cache, ...) instead of the default `Cache`.
 */
export interface Cacheable<TValue = unknown> {
  /** Returns the cached value for `key`, or `undefined` if not present. */
  get(key: string): TValue | undefined;
  /** Stores `value` under `key`, overwriting any existing entry. */
  set(key: string, value: TValue): void;
  /** True when `key` has a cached entry. */
  has(key: string): boolean;
  /** How `useApi` should use this cache when a `key` is set. */
  readonly strategy: CacheStrategy;
}

/** Options accepted by the `Cache` constructor. */
export type CacheOptions = {
  /** How `useApi` should use this cache when a `key` is set. Defaults to `'cache-first'`. */
  strategy?: CacheStrategy;
};

/**
 * Default `Cacheable` implementation backed by an in-memory `Map`.
 *
 * Create one instance and store it outside the component tree (module
 * scope, a context, ...) to share it across every `useApi` call that should
 * read/write the same entries. Each `useApi` call that gets its own `Cache`
 * instance keeps its own isolated cache instead.
 *
 * @example
 * ```ts
 * // module scope, shared by every useApi() call using it
 * const apiCache = new Cache({ strategy: 'stale-while-revalidate' });
 *
 * const useTodos = () =>
 *   useApi(fetchTodos, { cache: apiCache, key: 'todos' });
 * ```
 */
export class Cache implements Cacheable {
  private readonly store = new Map<string, unknown>();
  readonly strategy: CacheStrategy;

  constructor({ strategy = 'cache-first' }: CacheOptions = {}) {
    this.strategy = strategy;
  }

  get(key: string): unknown {
    return this.store.get(key);
  }

  set(key: string, value: unknown): void {
    this.store.set(key, value);
  }

  has(key: string): boolean {
    return this.store.has(key);
  }
}

/* =============================================================================
 * Error
 * ============================================================================= */

/**
 * Normalized error shape returned by `useApi`. Wraps any thrown value
 * (network failure, non-Error throw, DOMException from an aborted fetch, ...)
 * behind a single, consistent type.
 */
export class APIError extends Error {
  readonly cause: unknown;

  private constructor(message: string, cause: unknown) {
    super(message);
    this.name = 'APIError';
    this.cause = cause;
  }

  /** Normalizes any thrown value into an `APIError`, passing existing ones through as-is. */
  static from = (error: unknown): APIError => {
    if (error instanceof APIError) {
      return error;
    }

    if (error instanceof Error) {
      return new APIError(error.message, error);
    }

    return new APIError('Unknown error', error);
  };

  /** True when this error originates from an aborted request. */
  get isAborted(): boolean {
    return (
      this.cause instanceof DOMException && this.cause.name === 'AbortError'
    );
  }
}

/* =============================================================================
 * Hook
 * ============================================================================= */

/**
 * Runs `fn` and exposes its lifecycle as `state`, calling it automatically on
 * mount (unless `enabled` is `false`) and again whenever the browser regains
 * connectivity. Calling `call()` aborts any call still in flight so only the
 * most recently invoked one can ever update `state`. The consumer can also
 * abort the current in-flight call directly via `abort()`, which resolves
 * `state` to `fail` with an `APIError` whose `isAborted` is `true`.
 *
 * Setting `key` reads/writes results through a cache instead of always
 * hitting the network; see {@link UseApiConfig}. By default that cache is a
 * private `Cache` instance scoped to this hook call — pass `cache` to share
 * one across multiple `useApi` calls instead, and to control its
 * {@link CacheStrategy} via the `Cache` constructor. Only successful results
 * are ever written, so a failed call never poisons the cache with a stale
 * error.
 *
 * @param fn The fetcher to run.
 * @param config Options; see {@link UseApiConfig}.
 */
export const useApi: UseApi = <TData>(
  fn: Fetcher<TData>,
  config: UseApiConfig = {},
) => {
  const { enabled = true, key } = config;

  const [state, setState] = useState<State<TData>>({ is: 'idle' });
  const abortController = useRef<AbortController>(null);
  const [cache] = useState<Cacheable>(() => config.cache ?? new Cache());

  const call = useCallback(async (): Promise<Result<TData>> => {
    abortController.current?.abort();

    if (key && cache.has(key)) {
      const data = cache.get(key) as TData;
      setState({ is: 'ok', data });

      if (cache.strategy === 'cache-first') {
        // No new AbortController: a subsequent abort() is a harmless no-op.
        abortController.current = null;
        return { is: 'ok', data };
      }
    } else {
      setState({ is: 'busy' });
    }

    const ctrl = new AbortController();
    abortController.current = ctrl;

    const result = await fn(ctrl.signal).then(
      (data): Result<TData> => ({ is: 'ok', data }),
      (error): Result<TData> => ({ is: 'fail', error: APIError.from(error) }),
    );

    // A newer call already replaced this controller; let its result win
    // instead of clobbering fresher state with this stale one.
    if (abortController.current === ctrl) {
      setState(result);
    }

    if (result.is === 'ok' && key) {
      cache.set(key, result.data);
    }

    return result;
  }, [fn, cache, key]);

  const abort = useCallback((): void => {
    abortController.current?.abort();
  }, []);

  const callHandler = useEffectEvent(async () => {
    await call();
  });

  useOnInternetReconnect(call);

  useEffect(() => {
    if (!enabled) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    callHandler();

    return () => {
      abortController.current?.abort();
    };
  }, [enabled]);

  return { call, abort, state };
};

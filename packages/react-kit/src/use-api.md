# use-api — future direction: caching

Not implemented yet. This documents an agreed design for adding an optional,
key-based cache to `useApi`, to pick up later.

## Config

```ts
export type CacheStrategy =
  | 'cache-first' // return the cached value and skip the network call entirely
  | 'stale-while-revalidate'; // return the cached value immediately, then still fetch in the background

export type UseApiConfig = {
  enabled?: boolean;
  /** Cache key. Omit to skip caching entirely and always fetch fresh. */
  key?: string;
  /** How to use the cache when `key` is set. Defaults to `'cache-first'`. Ignored without a key. */
  cacheStrategy?: CacheStrategy;
};
```

- No `key` → caching is skipped entirely; behavior is unchanged from today.
- `key` set → results are shared across every `useApi` instance using that key.

## Cache store

A single module-level `Map<string, unknown>`, private to `use-api.ts`, shared
by every `useApi` instance in the app.

- Not reactive: other mounted instances only see an entry once _they_ hit one
  of their own trigger points (mount, `call()`, reconnect) — no cross-instance
  re-render when one instance's fetch populates the cache.
- Only successful results are ever written. A failed call never touches the
  cache, so a later `cache-first` hit still fetches fresh instead of
  replaying a stale error.

## `call()` behavior

All three triggers (mount effect, reconnect, manual `call()`) go through the
same `call()` function, so cache behavior is identical everywhere — no
special-casing per trigger.

1. Abort whatever was previously in flight (unchanged from today).
2. If `key` is set and a cache entry exists:
   - Set `state` directly to `{ is: 'ok', data: cached }` — no `'busy'`
     flight, since the data is already there.
   - `cache-first`: stop here. No network call, no new `AbortController`
     (so a subsequent `abort()` is a harmless no-op).
   - `both`: also kick off `fn(signal)` in the background (new
     `AbortController`, so `abort()` can cancel it). On success: update
     cache + `state` to the fresh `ok`. On failure (including a manual
     `abort()`): `state` becomes `fail` with the `APIError` — the stale
     cached data is dropped from view.
3. Otherwise (no key, or key present but no cache entry yet): behaves exactly
   like today — `'busy'` → `fn(signal)` → `'ok'`/`'fail'`. On success, if
   `key` is set, write the result to the cache.

A manual `call()` respects `cache-first`/`both` the same way the automatic
triggers do — there's no separate "force refetch" path.

## Explicit non-goals

- No TTL/expiration — entries live until overwritten or the module reloads.
- No manual cache invalidation/clear API.
- No cross-instance reactivity.
- `key` is read once per instance; changing it on a live instance does
  nothing automatically (no auto re-trigger on key change).

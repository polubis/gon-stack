import { dataChangeSchema, type DataDomain } from '@schemas/data-changes';
import { API_ROUTER } from '@/shared/router/routes';

const NAME = 'parka-data-sync';
const LEADER_LOCK = 'parka-data-sync-leader';

const listeners = new Map<DataDomain, Set<() => void>>();
let leave: (() => void) | undefined;

const dispatch = (domain: DataDomain) =>
  listeners.get(domain)?.forEach((listener) => listener());

/** Opens the one stream of this browser; returns the function closing it. */
const lead = (relay: (domain: DataDomain) => void): (() => void) => {
  const source = new EventSource(API_ROUTER.dataChangeEvents());
  let connected = false;
  source.onopen = () => {
    // Notices sent while the stream was down are gone: reload everything.
    if (connected) listeners.forEach((_, domain) => relay(domain));
    connected = true;
  };
  source.onmessage = ({ data }) => {
    const notice = dataChangeSchema.safeParse(JSON.parse(data));
    if (notice.success) relay(notice.data.domain);
  };
  return () => source.close();
};

const join = (): (() => void) => {
  if (typeof BroadcastChannel === 'undefined') return () => {};
  const channel = new BroadcastChannel(NAME);
  channel.onmessage = ({ data }) => {
    const notice = dataChangeSchema.safeParse({ domain: data });
    if (notice.success) dispatch(notice.data.domain);
  };
  const relay = (domain: DataDomain) => {
    dispatch(domain);
    channel.postMessage(domain);
  };

  if (typeof EventSource === 'undefined') return () => channel.close();
  if (typeof navigator === 'undefined' || !('locks' in navigator)) {
    const close = lead(relay);
    return () => {
      close();
      channel.close();
    };
  }

  // Only the tab holding the lock streams; when it closes, the next waiting
  // tab gets the lock and takes over.
  const abort = new AbortController();
  void navigator.locks
    .request(LEADER_LOCK, { signal: abort.signal }, () => {
      const close = lead(relay);
      return new Promise<void>((release) => {
        abort.signal.addEventListener('abort', () => {
          close();
          release();
        });
      });
    })
    .catch(() => {});
  return () => {
    abort.abort();
    channel.close();
  };
};

/**
 * Calls `listener` whenever MCP changed this user's `domain` data, in every
 * open tab, over a single server stream per browser. Returns the unsubscribe.
 */
export const watchDataChanges = (
  domain: DataDomain,
  listener: () => void,
): (() => void) => {
  const set = listeners.get(domain) ?? new Set();
  listeners.set(domain, set.add(listener));
  leave ??= join();

  return () => {
    set.delete(listener);
    if (set.size === 0) listeners.delete(domain);
    if (listeners.size === 0) {
      leave?.();
      leave = undefined;
    }
  };
};

import { dataChangeSchema, type DataDomain } from '@schemas/data-changes';
import { API_ROUTER } from '@/shared/router/routes';

const RETRY_MS = 3000;

const listeners = new Map<DataDomain, Set<() => void>>();
let leave: (() => void) | undefined;

const dispatch = (domain: DataDomain) =>
  listeners.get(domain)?.forEach((listener) => listener());

const reloadAll = () => listeners.forEach((_, domain) => dispatch(domain));

/** Opens this tab's own stream; returns the function closing it. */
const connect = (): (() => void) => {
  if (typeof EventSource === 'undefined') return () => {};
  let source: EventSource | undefined;
  let retry: ReturnType<typeof setTimeout> | undefined;
  let connected = false;

  const open = () => {
    source?.close();
    const next = new EventSource(API_ROUTER.dataChangeEvents());
    source = next;
    next.onopen = () => {
      // Notices sent while the stream was down are gone: reload everything.
      if (connected) reloadAll();
      connected = true;
    };
    next.onmessage = ({ data }) => {
      const notice = dataChangeSchema.safeParse(JSON.parse(data));
      if (notice.success) dispatch(notice.data.domain);
    };
    next.onerror = () => {
      // Browser gives up (CLOSED) on some failures: reopen ourselves.
      if (next.readyState !== EventSource.CLOSED) return;
      clearTimeout(retry);
      retry = setTimeout(open, RETRY_MS);
    };
  };

  // Phone locked / tab frozen: stream may be dead without any event, and
  // notices are lost. On return reopen it and reload through REST.
  const resume = () => {
    if (document.visibilityState === 'hidden') return;
    open();
    if (connected) reloadAll();
  };
  const onPageShow = ({ persisted }: PageTransitionEvent) => {
    if (persisted) resume();
  };

  open();
  document.addEventListener('visibilitychange', resume);
  window.addEventListener('pageshow', onPageShow);
  window.addEventListener('online', resume);
  return () => {
    clearTimeout(retry);
    source?.close();
    document.removeEventListener('visibilitychange', resume);
    window.removeEventListener('pageshow', onPageShow);
    window.removeEventListener('online', resume);
  };
};

/**
 * Calls `listener` whenever MCP changed this user's `domain` data. Each tab
 * owns its server stream (no cross-tab sharing). The notice carries only the
 * domain: listeners refetch over REST. Returns the unsubscribe.
 */
export const watchDataChanges = (
  domain: DataDomain,
  listener: () => void,
): (() => void) => {
  const set = listeners.get(domain) ?? new Set();
  listeners.set(domain, set.add(listener));
  leave ??= connect();

  return () => {
    set.delete(listener);
    if (set.size === 0) listeners.delete(domain);
    if (listeners.size === 0) {
      leave?.();
      leave = undefined;
    }
  };
};

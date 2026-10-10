import { useEffect, useSyncExternalStore } from 'react';
import { pushUrl, replaceUrl } from './navigation';

/**
 * Open modals live in the URL as repeated `modal` params, bottom first:
 * `?modal=expenses&modal=expense:e-1`. Opening pushes a history entry, so
 * Back closes only the topmost modal; loading the URL restores the stack.
 */
const PARAM = 'modal';
const CHANGE_EVENT = 'modal-stack:change';
const EMPTY: readonly string[] = [];

let cachedSearch = '';
let cachedStack: readonly string[] = EMPTY;
/** Leading modals that already finished mounting (see `view`). */
let settled: readonly string[] = EMPTY;
let cachedView: readonly string[] = EMPTY;
/** Modal whose Back is in flight: closing it twice must not step back twice. */
let closing: string | null = null;

const sharedPrefix = (a: readonly string[], b: readonly string[]): number => {
  let length = 0;
  while (length < a.length && a[length] === b[length]) length++;
  return length;
};

const read = (): readonly string[] => {
  const search = window.location.search;
  if (search !== cachedSearch) {
    cachedSearch = search;
    const ids = new URLSearchParams(search).getAll(PARAM);
    cachedStack = ids.length > 0 ? ids : EMPTY;
    settled = settled.slice(0, sharedPrefix(cachedStack, settled));
    closing = null;
  }
  return cachedStack;
};

/**
 * What the UI renders: the settled modals plus the next one. A URL that
 * opens several at once mounts them bottom-up, one commit apart, so each
 * Radix dialog hides (aria-hidden) only the ones beneath it, never itself.
 */
const view = (): readonly string[] => {
  const stack = read();
  const length = Math.min(stack.length, sharedPrefix(stack, settled) + 1);
  if (
    cachedView.length !== length ||
    cachedView.some((id, i) => id !== stack[i])
  )
    cachedView = length === 0 ? EMPTY : stack.slice(0, length);
  return cachedView;
};

let subscribers = 0;

const subscribe = (notify: () => void) => {
  subscribers++;
  window.addEventListener('popstate', notify);
  window.addEventListener(CHANGE_EVENT, notify);
  return () => {
    window.removeEventListener('popstate', notify);
    window.removeEventListener(CHANGE_EVENT, notify);
    // Nothing on screen any more: the next stack mounts from scratch.
    if (--subscribers === 0) {
      cachedSearch = '';
      cachedStack = EMPTY;
      cachedView = EMPTY;
      settled = EMPTY;
    }
  };
};

const hrefWith = (stack: readonly string[]): string => {
  const url = new URL(window.location.href);
  url.searchParams.delete(PARAM);
  stack.forEach((id) => url.searchParams.append(PARAM, id));
  return url.pathname + url.search + url.hash;
};

const notify = () => window.dispatchEvent(new Event(CHANGE_EVENT));

/** History entries pushed by `openModal` remember the stack size they made. */
const pushedDepth = (): number | null => {
  const state = window.history.state as { modalDepth?: number } | null;
  return state?.modalDepth ?? null;
};

/** Pushes `id` on top of the open modals. Opening an open modal is a no-op. */
export const openModal = (id: string): void => {
  if (typeof window === 'undefined') return;
  const stack = read();
  if (stack.includes(id)) return;
  const next = [...stack, id];
  pushUrl(hrefWith(next), { modalDepth: next.length });
  notify();
};

/**
 * Closes a modal. The topmost one opened by a push steps Back (same as the
 * browser button); a deep-linked or buried one just leaves the URL.
 */
export const closeModal = (id: string): void => {
  if (typeof window === 'undefined') return;
  const stack = read();
  const index = stack.lastIndexOf(id);
  if (index === -1) return;
  if (index === stack.length - 1 && pushedDepth() === stack.length) {
    if (closing === id) return;
    closing = id;
    window.history.back();
    return;
  }
  replaceUrl(hrefWith(stack.filter((_, i) => i !== index)));
  notify();
};

export const useModalStack = (): readonly string[] =>
  useSyncExternalStore(subscribe, view, () => EMPTY);

/**
 * Call from the component that renders a modal, once it is on screen:
 * lets the modal above it mount (see `view`).
 */
export const useModalMounted = (id: string, active = true): void => {
  useEffect(() => {
    if (!active) return;
    const stack = read();
    const index = stack.indexOf(id);
    if (index === -1 || settled.length > index) return;
    settled = stack.slice(0, index + 1);
    notify();
  }, [id, active]);
};

/** One modal's visibility, driven by the URL. */
export const useModal = (id: string) => {
  const stack = useModalStack();
  return {
    isOpen: stack.includes(id),
    open: () => openModal(id),
    close: () => closeModal(id),
  };
};

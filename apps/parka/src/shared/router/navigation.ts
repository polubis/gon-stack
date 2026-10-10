/**
 * Client-only navigation helpers. Thin wrappers over `window` so React
 * views never hardcode `window.location.href = '...'` strings directly.
 * Guarded for SSR — no-ops outside the browser.
 */
type Navigator = {
  push: (path: string, state?: Record<string, unknown>) => void;
  replace: (path: string, state?: Record<string, unknown>) => void;
};

let navigator: Navigator | null = null;

/** The `/app/*` client router registers itself here for in-app navigation. */
export const registerNavigator = (next: Navigator | null): void => {
  navigator = next;
};

export const navigateTo = (path: string): void => {
  if (typeof window === 'undefined') return;
  if (navigator && path.startsWith('/app/')) {
    navigator.push(path);
    return;
  }
  window.location.href = path;
};

/**
 * Click handler for "back" anchors: steps back in history when the user
 * came from somewhere in this app, otherwise lets the anchor go to its
 * fallback `href` (deep link, new tab).
 */
export const onBackClick = (event: {
  preventDefault: () => void;
  button: number;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
}): void => {
  if (typeof window === 'undefined') return;
  if (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  )
    return;
  const state = window.history.state as { __TSR_index?: number } | null;
  const inApp = (state?.__TSR_index ?? 0) > 0;
  const fromApp = document.referrer.startsWith(window.location.origin);
  if (!inApp && !fromApp) return;
  event.preventDefault();
  window.history.back();
};

/** Adds a history entry, so Back returns to the previous URL. */
export const pushUrl = (
  path: string,
  state: Record<string, unknown> = {},
): void => {
  if (typeof window === 'undefined') return;
  if (navigator) {
    navigator.push(path, state);
    return;
  }
  window.history.pushState({ ...window.history.state, ...state }, '', path);
};

export const replaceUrl = (path: string): void => {
  if (typeof window === 'undefined') return;
  if (navigator) {
    navigator.replace(path);
    return;
  }
  window.history.replaceState(window.history.state, '', path);
};

export const readQueryParam = (name: string): string | null => {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get(name);
};

export const writeQueryParam = (name: string, value: string): void => {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  url.searchParams.set(name, value);
  replaceUrl(url.pathname + url.search + url.hash);
};

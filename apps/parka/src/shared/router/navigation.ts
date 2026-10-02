/**
 * Client-only navigation helpers. Thin wrappers over `window` so React
 * views never hardcode `window.location.href = '...'` strings directly.
 * Guarded for SSR — no-ops outside the browser.
 */
type Navigator = {
  push: (path: string) => void;
  replace: (path: string) => void;
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

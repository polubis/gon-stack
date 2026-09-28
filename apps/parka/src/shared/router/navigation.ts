/**
 * Client-only navigation helpers. Thin wrappers over `window` so React
 * views never hardcode `window.location.href = '...'` strings directly.
 * Guarded for SSR — no-ops outside the browser.
 */
export const navigateTo = (path: string): void => {
  if (typeof window === 'undefined') return;
  window.location.href = path;
};

export const replaceUrl = (path: string): void => {
  if (typeof window === 'undefined') return;
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
  replaceUrl(url.toString());
};

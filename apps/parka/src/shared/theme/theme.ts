const STORAGE_KEY = 'parka:theme';

export type ThemeMode = 'light' | 'dark' | 'auto';

/** Auto dark window in local time: from 19:00 until 07:00. */
const NIGHT_FROM_HOUR = 19;
const NIGHT_TO_HOUR = 7;

/** Applies the theme to the document root; light is the default (no attribute). */
const apply = (dark: boolean): void => {
  if (dark) document.documentElement.dataset.theme = 'dark';
  else delete document.documentElement.dataset.theme;
};

/** Whether the saved mode is dark right now; `auto` follows the local hour. */
export const resolveDark = (
  mode: ThemeMode,
  hour = new Date().getHours(),
): boolean =>
  mode === 'auto'
    ? hour >= NIGHT_FROM_HOUR || hour < NIGHT_TO_HOUR
    : mode === 'dark';

/** Saved mode; `light` when none chosen or storage is broken. */
export const readMode = (): ThemeMode => {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved === 'dark' || saved === 'auto' ? saved : 'light';
  } catch {
    return 'light';
  }
};

/** Switches the theme now and remembers the mode. Never throws. */
export const writeMode = (mode: ThemeMode): void => {
  apply(resolveDark(mode));
  try {
    window.localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // Storage unavailable: theme still applies for this visit.
  }
};

/** Re-applies `auto` after the hour changes; no-op for fixed modes. */
export const refreshAuto = (): void => {
  if (readMode() === 'auto') apply(resolveDark('auto'));
};

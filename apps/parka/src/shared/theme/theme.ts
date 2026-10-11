const STORAGE_KEY = 'parka:theme';

/** Applies the theme to the document root; light is the default (no attribute). */
const apply = (dark: boolean): void => {
  if (dark) document.documentElement.dataset.theme = 'dark';
  else delete document.documentElement.dataset.theme;
};

/** Whether dark theme is on; `false` when none chosen or storage is broken. */
export const readDark = (): boolean => {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'dark';
  } catch {
    return false;
  }
};

/** Switches the theme now and remembers it. Never throws. */
export const writeDark = (dark: boolean): void => {
  apply(dark);
  try {
    window.localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light');
  } catch {
    // Storage unavailable: theme still applies for this visit.
  }
};

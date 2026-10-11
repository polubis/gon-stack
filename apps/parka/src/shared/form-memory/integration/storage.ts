const STORAGE_KEY = 'parka:form-memory';

type Memory = Record<string, string>;

const readAll = (): Memory => {
  try {
    const parsed: unknown = JSON.parse(
      window.localStorage.getItem(STORAGE_KEY) ?? 'null',
    );
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed))
      return {};
    return Object.fromEntries(
      Object.entries(parsed).filter(
        (entry): entry is [string, string] => typeof entry[1] === 'string',
      ),
    );
  } catch {
    return {};
  }
};

/** Last remembered value of a field; `null` when none or storage is broken. */
export const readRemembered = (key: string): string | null =>
  readAll()[key]?.trim() || null;

/** Remembers a trimmed value, an empty/blank one forgets the field. Never throws. */
export const writeRemembered = (key: string, value: string): void => {
  try {
    const next = readAll();
    const trimmed = value.trim();
    if (trimmed) next[key] = trimmed;
    else delete next[key];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable: remembering is a convenience, never an error.
  }
};

const PREFIX = 'parka:filters:';

/** Module names whose filters are remembered on the device. */
export type FilterScope = 'time' | 'knowledge';

const SCOPES: readonly FilterScope[] = ['time', 'knowledge'];

/** Last filters of a module as query params (`q=...`); empty when none or storage is broken. */
export const readFilterMemory = (scope: FilterScope): URLSearchParams => {
  try {
    return new URLSearchParams(
      window.localStorage.getItem(PREFIX + scope) ?? '',
    );
  } catch {
    return new URLSearchParams();
  }
};

/** Remembers the filters (`null` values are dropped). Never throws. */
export const writeFilterMemory = (
  scope: FilterScope,
  params: Record<string, string | null>,
): void => {
  try {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([name, value]) => {
      if (value) query.set(name, value);
    });
    window.localStorage.setItem(PREFIX + scope, query.toString());
  } catch {
    // Storage unavailable: remembering is a convenience, never an error.
  }
};

/** Forgets the remembered filters of every module. */
export const clearFilterMemory = (): void => {
  SCOPES.forEach((scope) => window.localStorage.removeItem(PREFIX + scope));
};

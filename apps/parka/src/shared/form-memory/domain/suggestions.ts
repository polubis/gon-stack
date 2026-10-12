export type SuggestionField = 'merchant' | 'paymentMethod';

export type Suggestion = {
  field: SuggestionField;
  value: string;
  useCount: number;
  lastUsed: string | null;
};

/** Uses after which a value counts as frequently used. */
const FREQUENT_USES = 3;

const normalize = (value: string): string => value.trim().toLowerCase();

const byRank = (a: Suggestion, b: Suggestion): number =>
  b.useCount - a.useCount ||
  (b.lastUsed ?? '').localeCompare(a.lastUsed ?? '') ||
  a.value.localeCompare(b.value);

/** Values of one field matching what is typed, most used first, then most recent. */
export const rankSuggestions = (
  items: Suggestion[],
  field: SuggestionField,
  query: string,
): Suggestion[] => {
  const needle = normalize(query);
  return items
    .filter(
      (item) => item.field === field && normalize(item.value).includes(needle),
    )
    .sort(
      (a, b) =>
        Number(normalize(b.value).startsWith(needle)) -
          Number(normalize(a.value).startsWith(needle)) || byRank(a, b),
    );
};

/** The value a blank field is filled with: the best ranked one, if any. */
export const topSuggestion = (
  items: Suggestion[],
  field: SuggestionField,
): string | null => rankSuggestions(items, field, '')[0]?.value ?? null;

/** Whether `value` is a known, frequently used value of the field. */
export const isFrequent = (
  items: Suggestion[],
  field: SuggestionField,
  value: string,
): boolean =>
  items.some(
    (item) =>
      item.field === field &&
      item.useCount >= FREQUENT_USES &&
      normalize(item.value) === normalize(value),
  );

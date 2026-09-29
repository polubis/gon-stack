import type { Category, CategoryId, Filter } from '../domain/models';

export const FEATURE_NAME = 'Expenses';

/** Shown for expenses when the user has no matching category. */
export const UNCATEGORIZED: Category = {
  id: '' as CategoryId,
  name: 'Bez kategorii',
  icon: 'sparkles',
  color: '#4b5a52',
};

export const FILTER_OPTIONS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Wszystkie' },
  { value: 'category', label: 'Kategorie' },
  { value: 'bills', label: 'Rachunki' },
];

export const ERROR_CODES = {
  load: 'EXPENSES_LOAD',
  render: 'EXPENSES_RENDER',
} as const;

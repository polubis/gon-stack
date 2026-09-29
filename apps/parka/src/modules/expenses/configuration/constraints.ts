import type { Filter } from '../domain/models';

export const FEATURE_NAME = 'Expenses';

export const FILTER_OPTIONS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Wszystkie' },
  { value: 'category', label: 'Kategorie' },
  { value: 'bills', label: 'Rachunki' },
];

export const ERROR_CODES = {
  load: 'EXPENSES_LOAD',
  render: 'EXPENSES_RENDER',
} as const;

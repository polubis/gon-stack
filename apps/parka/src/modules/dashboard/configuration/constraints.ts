import type {
  Category,
  CategoryId,
  ExpenseFilter,
  Range,
} from '../domain/models';

export const FEATURE_NAME = 'Dashboard';

export const DEFAULT_RANGE: Range = '6';

export const RANGES: Range[] = ['1', '3', '6', '12'];

export const RANGE_LABEL: Record<Range, string> = {
  '1': 'Miesiąc',
  '3': '3 miesiące',
  '6': '6 miesięcy',
  '12': 'Rok',
};

/** Shown for expenses when the user has no matching category. */
export const UNCATEGORIZED: Category = {
  id: '' as CategoryId,
  name: 'Bez kategorii',
  icon: 'sparkles',
  color: '#4b5a52',
};

export const FILTER_OPTIONS: { value: ExpenseFilter; label: string }[] = [
  { value: 'all', label: 'Wszystkie' },
  { value: 'category', label: 'Kategorie' },
  { value: 'bills', label: 'Rachunki' },
];

export const ERROR_CODES = {
  load: 'DASHBOARD_LOAD',
  loadExpenses: 'DASHBOARD_EXPENSES_LOAD',
  render: 'DASHBOARD_RENDER',
} as const;

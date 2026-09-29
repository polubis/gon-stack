import type { Category, CategoryId, Tab } from '../domain/models';

export const FEATURE_NAME = 'Limits';

export const DEFAULT_CATEGORY_LIMIT = 300;
export const DEFAULT_GOAL_TARGET = 2000;
export const DEFAULT_GOAL_MONTHS = 6;
export const DEFAULT_GOAL_NAME = 'Nowy cel';

/** Progress at which a limit turns from brand to warning. */
export const WARN_PCT = 80;

/** Shown for limits whose category is gone. */
export const UNCATEGORIZED: Category = {
  id: '' as CategoryId,
  name: 'Bez kategorii',
  icon: 'sparkles',
  color: '#4b5a52',
};

export const TAB_OPTIONS: { value: Tab; label: string }[] = [
  { value: 'total', label: 'Ogólne' },
  { value: 'category', label: 'Kategorie' },
  { value: 'goals', label: 'Cele' },
];

export const ERROR_CODES = {
  load: 'LIMITS_LOAD',
  render: 'LIMITS_RENDER',
} as const;

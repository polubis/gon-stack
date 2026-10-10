import type { Category, CategoryId } from '../domain/models';

export const FEATURE_NAME = 'Dashboard';

/** Months offered by the month picker, newest first. */
export const MONTH_OPTIONS_COUNT = 12;

/** Largest category slices shown; the rest collapses into "Inne". */
export const MAX_CATEGORY_SLICES = 5;

/** Y-axis rows of the spending chart. */
export const CHART_TICKS = 4;

/** Day numbers labelled on the spending chart's X axis. */
export const CHART_LABEL_DAYS = [1, 7, 14, 21, 28];

/** Name of the default "other" category; the donut folds into it. */
export const OTHER_CATEGORY_NAME = 'category.other';

export const OTHER_CATEGORY_LABEL = 'Inne';

/** Anchor of the limits widget; the KPI link scrolls to it. */
export const LIMITS_SECTION_ID = 'limits';

export const DEFAULT_CATEGORY_LIMIT = 300;
export const DEFAULT_TOTAL_LIMIT = 3000;

/** Progress at which a limit turns from brand to warning. */
export const WARN_PCT = 80;

/** Shown for expenses when the user has no matching category. */
export const UNCATEGORIZED: Category = {
  id: '' as CategoryId,
  name: 'Bez kategorii',
  icon: 'sparkles',
  color: 'var(--track-strong)',
};

/** Shown for an expense whose products span several categories. */
export const MIXED_CATEGORY: Category = {
  id: '' as CategoryId,
  name: 'Wiele kategorii',
  icon: 'receipt',
  color: 'var(--track-strong)',
};

export const ERROR_CODES = {
  load: 'DASHBOARD_LOAD',
  render: 'DASHBOARD_RENDER',
} as const;

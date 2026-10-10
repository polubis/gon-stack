import { MIXED_CATEGORY_LABEL } from '@/shared/i18n/category-label';
import type { Category, CategoryId } from '../domain/models';

export const FEATURE_NAME = 'Dashboard';

/** Months offered by the month picker, newest first. */
export const MONTH_OPTIONS_COUNT = 12;

/** Category legend rows shown before "Pokaż wszystkie". */
export const MAX_VISIBLE_CATEGORIES = 6;

/** Y-axis rows of the spending chart. */
export const CHART_TICKS = 4;

/** Day numbers labelled on the spending chart's X axis. */
export const CHART_LABEL_DAYS = [1, 7, 14, 21, 28];

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
  name: MIXED_CATEGORY_LABEL,
  icon: 'receipt',
  color: 'var(--track-strong)',
};

export const ERROR_CODES = {
  load: 'DASHBOARD_LOAD',
  render: 'DASHBOARD_RENDER',
} as const;

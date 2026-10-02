import { APP_ROUTER } from '@/shared/router/routes';
import type { Category, CategoryId, QuickAction } from '../domain/models';

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

/** Anchor of the limits widget; the quick action and KPI link scroll to it. */
export const LIMITS_SECTION_ID = 'limits';

export const DEFAULT_CATEGORY_LIMIT = 300;
export const DEFAULT_GOAL_TARGET = 2000;
export const DEFAULT_GOAL_MONTHS = 6;
export const DEFAULT_GOAL_NAME = 'Nowy cel';

/** Progress at which a limit turns from brand to warning. */
export const WARN_PCT = 80;

export const GOALS_SECTION_ID = 'goals';

export const QUICK_ACTIONS: QuickAction[] = [
  { label: 'Dodaj paragon', href: APP_ROUTER.receiptScan(), iconId: 'add' },
  { label: 'Zrób zdjęcie', href: APP_ROUTER.receiptScan(), iconId: 'camera' },
  { label: 'Limity', href: `#${LIMITS_SECTION_ID}`, iconId: 'target' },
  { label: 'Cykliczne', href: APP_ROUTER.recurring(), iconId: 'repeat' },
];

/** Shown for expenses when the user has no matching category. */
export const UNCATEGORIZED: Category = {
  id: '' as CategoryId,
  name: 'Bez kategorii',
  icon: 'sparkles',
  color: 'var(--track-strong)',
};

export const ERROR_CODES = {
  load: 'DASHBOARD_LOAD',
  loadExpenses: 'DASHBOARD_EXPENSES_LOAD',
  loadLimits: 'DASHBOARD_LIMITS_LOAD',
  loadGoals: 'DASHBOARD_GOALS_LOAD',
  render: 'DASHBOARD_RENDER',
} as const;

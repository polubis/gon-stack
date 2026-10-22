import { APP_ROUTER } from '@/shared/router/routes';
import type { RecurringInterval } from '@/shared/recurring/occurrences';
import type { TimeKind } from '../domain/models';

export const FEATURE_NAME = 'Time';

export const TIME_KINDS: readonly {
  kind: TimeKind;
  label: string;
  href: (date: string) => string;
}[] = [
  { kind: 'day', label: 'Dzień', href: (date) => APP_ROUTER.time({ date }) },
  {
    kind: 'week',
    label: 'Tydzień',
    href: (date) => APP_ROUTER.timeWeek({ date }),
  },
  {
    kind: 'month',
    label: 'Miesiąc',
    href: (date) => APP_ROUTER.timeMonth({ date }),
  },
  { kind: 'year', label: 'Rok', href: (date) => APP_ROUTER.timeYear({ date }) },
];

/** Query param holding the viewed day. */
export const DATE_PARAM = 'date';

export const NAME_MAX_LENGTH = 40;

/** Longer than a name: a task title may be a whole sentence. */
export const TASK_TITLE_MAX_LENGTH = 160;

export const TASK_DESCRIPTION_MAX_LENGTH = 5000;

/** Lines of the description shown in the details before "show more". */
export const DESCRIPTION_CLAMP_LINES = 3;

/** Colour presets of a category (same palette as the finance categories). */
export const CATEGORY_COLORS = [
  '#0f7a4f',
  '#2563eb',
  '#7c3aed',
  '#c2410c',
  '#be123c',
  '#0891b2',
  '#a16207',
  '#4b5a52',
  '#dc2626',
  '#ea580c',
  '#ca8a04',
  '#65a30d',
  '#0d9488',
  '#0284c7',
  '#4f46e5',
  '#c026d3',
  '#db2777',
  '#57534e',
  '#0f172a',
] as const;

export const PRIORITY_VALUES: readonly number[] = Array.from(
  { length: 10 },
  (_, i) => i + 1,
);

/** Id of the built-in medium priority, preselected for a new task. */
export const DEFAULT_PRIORITY_ID = 'medium';

export const INTERVALS: { value: RecurringInterval; label: string }[] = [
  { value: 'weekly', label: 'Co tydzień' },
  { value: 'monthly', label: 'Co miesiąc' },
  { value: 'yearly', label: 'Co rok' },
];

export const DEFAULT_TIME = '12:00';

export const ALL_DAY_LABEL = 'Cały dzień';

export const WEEKDAY_SHORT = [
  'Pn',
  'Wt',
  'Śr',
  'Cz',
  'Pt',
  'So',
  'Nd',
] as const;

/** Skeleton rows shown while the first load runs. */
export const SKELETON_ROWS = 5;

export const ERROR_CODES = {
  load: 'TIME_LOAD',
  render: 'TIME_RENDER',
} as const;

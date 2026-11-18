import type { PeriodKind } from '../domain/models';

export const FEATURE_NAME = 'Knowledge';

export const NAME_MAX_LENGTH = 40;
export const CATALOG_NAME_MAX_LENGTH = 80;
export const TAG_MAX_LENGTH = 30;
export const TITLE_MAX_LENGTH = 120;
export const DESCRIPTION_MAX_LENGTH = 500;
export const REEL_MAX_LENGTH = 8000;
export const QUERY_MAX_LENGTH = 100;

/** Query params holding the viewed period. */
export const DATE_PARAM = 'date';
export const KIND_PARAM = 'view';

export const PERIOD_KINDS: readonly PeriodKind[] = [
  'day',
  'week',
  'month',
  'year',
];

/** Topics a list shows before "Pokaż więcej". */
export const TOPICS_PREVIEW = 6;

/** Colour presets of a category (same palette as the other modules). */
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

export const SKELETON_ROWS = 5;

export const ERROR_CODES = {
  load: 'KNOWLEDGE_LOAD',
  render: 'KNOWLEDGE_RENDER',
} as const;

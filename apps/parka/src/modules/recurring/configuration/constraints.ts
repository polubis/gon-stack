import type { Tab } from '../domain/models';

export const FEATURE_NAME = 'Recurring';

export const TAB_OPTIONS: { value: Tab; label: string }[] = [
  { value: 'active', label: 'Aktywne' },
  { value: 'all', label: 'Wszystkie' },
];

export const ERROR_CODES = {
  load: 'RECURRING_LOAD',
  render: 'RECURRING_RENDER',
} as const;

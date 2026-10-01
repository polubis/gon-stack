import type { Range } from '../domain/models';

export const FEATURE_NAME = 'Dashboard';

export const DEFAULT_RANGE: Range = '6';

export const RANGES: Range[] = ['1', '3', '6', '12'];

export const RANGE_LABEL: Record<Range, string> = {
  '1': 'Miesiąc',
  '3': '3 miesiące',
  '6': '6 miesięcy',
  '12': 'Rok',
};

export const ERROR_CODES = {
  load: 'DASHBOARD_LOAD',
  render: 'DASHBOARD_RENDER',
} as const;

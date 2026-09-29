import type { Range, Tab } from '../domain/models';

export const FEATURE_NAME = 'Statistics';

export const DEFAULT_RANGE: Range = '3';

export const DEFAULT_TAB: Tab = 'spending';

export const RANGES: Range[] = ['1', '3', '6', '12'];

export const RANGE_LABEL: Record<Range, string> = {
  '1': 'Miesiąc',
  '3': '3 miesiące',
  '6': '6 miesięcy',
  '12': 'Rok',
};

export const ERROR_CODES = {
  load: 'STATISTICS_LOAD',
  render: 'STATISTICS_RENDER',
} as const;

import type { Format } from '../domain/models';

export const FEATURE_NAME = 'DataExport';

export const ERROR_CODES = {
  load: 'DATA_EXPORT_LOAD',
  render: 'DATA_EXPORT_RENDER',
} as const;

export const FORMATS: readonly Format[] = ['csv', 'pdf'];

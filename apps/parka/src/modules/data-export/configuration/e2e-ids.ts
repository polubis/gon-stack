export const DATA_EXPORT_E2E_IDS = [
  'data-export:main',
  'data-export:format',
  'data-export:run',
  'data-export:done',
  'data-export:load-error',
] as const;

export type DataExportE2eId = (typeof DATA_EXPORT_E2E_IDS)[number];

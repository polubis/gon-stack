export const REPORTS_E2E_IDS = [
  'reports:main',
  'reports:total',
  'reports:categories',
  'reports:recurring',
  'reports:download-csv',
  'reports:download-full',
] as const;

export type ReportsE2eId = (typeof REPORTS_E2E_IDS)[number];

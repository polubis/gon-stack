export const DASHBOARD_E2E_IDS = [
  'dashboard:main',
  'dashboard:prev-month',
  'dashboard:month-label',
  'dashboard:next-month',
  'dashboard:total',
] as const;

export type DashboardE2eId = (typeof DASHBOARD_E2E_IDS)[number];

export const DASHBOARD_E2E_IDS = [
  'dashboard:main',
  'dashboard:prev-month',
  'dashboard:month-label',
  'dashboard:next-month',
  'dashboard:total',
  'dashboard:range-total',
  'dashboard:previous-total',
  'dashboard:changes',
  'dashboard:summary-error',
] as const;

export type DashboardDynamicE2eId = `dashboard:range:${string | number}`;

export type DashboardE2eId =
  (typeof DASHBOARD_E2E_IDS)[number] | DashboardDynamicE2eId;

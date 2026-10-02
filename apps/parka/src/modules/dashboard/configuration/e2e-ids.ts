export const DASHBOARD_E2E_IDS = [
  'dashboard:main',
  'dashboard:month-select',
  'dashboard:total',
  'dashboard:transactions',
  'dashboard:daily-average',
  'dashboard:limit-left',
  'dashboard:previous-total',
  'dashboard:expenses',
  'dashboard:summary-error',
  'dashboard:expenses-error',
  'dashboard:toast',
  'dashboard:detail',
  'dashboard:edit-merchant',
  'dashboard:edit-amount',
  'dashboard:edit-category',
  'dashboard:save',
  'dashboard:edit',
  'dashboard:delete',
] as const;

export type DashboardDynamicE2eId =
  | `dashboard:expense:${string | number}`
  | `dashboard:filter:${string | number}`;

export type DashboardE2eId =
  (typeof DASHBOARD_E2E_IDS)[number] | DashboardDynamicE2eId;

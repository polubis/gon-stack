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
  'dashboard:limits',
  'dashboard:limits-error',
  'dashboard:goals',
  'dashboard:goals-error',
  'dashboard:limit-total',
  'dashboard:limit-total-amount',
  'dashboard:limit-total-save',
  'dashboard:limit-total-edit',
  'dashboard:limit-list',
  'dashboard:limit-new',
  'dashboard:limit-new-hint',
  'dashboard:limit-form',
  'dashboard:limit-form-category',
  'dashboard:limit-form-amount',
  'dashboard:limit-form-save',
  'dashboard:limit-delete',
  'dashboard:goal-list',
  'dashboard:goal-new',
  'dashboard:goal-form',
  'dashboard:goal-form-name',
  'dashboard:goal-form-target',
  'dashboard:goal-form-months',
  'dashboard:goal-form-save',
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
  | `dashboard:limit-edit:${string | number}`
  | `dashboard:filter:${string | number}`;

export type DashboardE2eId =
  (typeof DASHBOARD_E2E_IDS)[number] | DashboardDynamicE2eId;

export const EXPENSES_MANAGEMENT_E2E_IDS = [
  'expenses-management:main',
  'expenses-management:load-error',
  'expenses-management:kind-nav',
  'expenses-management:upload',
  'expenses-management:camera',
  'expenses-management:upload-input',
  'expenses-management:camera-input',
  'expenses-management:scanning',
  'expenses-management:scan-error',
  'expenses-management:no-categories',
  'expenses-management:expense-form',
  'expenses-management:merchant',
  'expenses-management:amount',
  'expenses-management:date',
  'expenses-management:category',
  'expenses-management:method',
  'expenses-management:add-product',
  'expenses-management:total',
  'expenses-management:save',
  'expenses-management:recurring-form',
  'expenses-management:recurring-name',
  'expenses-management:recurring-cost',
  'expenses-management:recurring-date',
  'expenses-management:recurring-category',
  'expenses-management:recurring-method',
  'expenses-management:recurring-save',
  'expenses-management:toast',
] as const;

export type ExpensesManagementDynamicE2eId =
  | `expenses-management:product-name:${string | number}`
  | `expenses-management:product-price:${string | number}`
  | `expenses-management:product-qty:${string | number}`
  | `expenses-management:product-discount:${string | number}`
  | `expenses-management:product-category:${string | number}`
  | `expenses-management:product-remove:${string | number}`;

export type ExpensesManagementE2eId =
  (typeof EXPENSES_MANAGEMENT_E2E_IDS)[number] | ExpensesManagementDynamicE2eId;

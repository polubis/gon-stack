export const EXPENSES_MANAGEMENT_E2E_IDS = [
  'expenses-management:main',
  'expenses-management:load-error',
  'expenses-management:not-found',
  'expenses-management:kind-nav',
  'expenses-management:upload',
  'expenses-management:camera',
  'expenses-management:upload-input',
  'expenses-management:camera-input',
  'expenses-management:scanning',
  'expenses-management:scan-error',
  'expenses-management:recurring-form',
  'expenses-management:recurring-name',
  'expenses-management:recurring-cost',
  'expenses-management:recurring-date',
  'expenses-management:recurring-category',
  'expenses-management:recurring-method',
  'expenses-management:recurring-save',
  'expenses-management:toast',
] as const;

export type ExpensesManagementE2eId =
  (typeof EXPENSES_MANAGEMENT_E2E_IDS)[number];

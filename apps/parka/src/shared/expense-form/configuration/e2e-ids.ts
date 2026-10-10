export const EXPENSE_FORM_E2E_IDS = [
  'expense-form:form',
  'expense-form:no-categories',
  'expense-form:merchant',
  'expense-form:amount',
  'expense-form:date',
  'expense-form:category',
  'expense-form:method',
  'expense-form:add-product',
  'expense-form:total',
  'expense-form:save',
] as const;

export type ExpenseFormDynamicE2eId =
  | `expense-form:product-name:${string | number}`
  | `expense-form:product-price:${string | number}`
  | `expense-form:product-qty:${string | number}`
  | `expense-form:product-discount:${string | number}`
  | `expense-form:product-category:${string | number}`
  | `expense-form:product-remove:${string | number}`;

export type ExpenseFormE2eId =
  (typeof EXPENSE_FORM_E2E_IDS)[number] | ExpenseFormDynamicE2eId;

export const EXPENSES_E2E_IDS = [
  'expenses:main',
  'expenses:detail',
  'expenses:edit-merchant',
  'expenses:edit-amount',
  'expenses:edit-category',
  'expenses:save',
  'expenses:edit',
  'expenses:delete',
] as const;

export type ExpensesE2eDynamicId = `expenses:row:${string | number}`;

export type ExpensesE2eId =
  (typeof EXPENSES_E2E_IDS)[number] | ExpensesE2eDynamicId;

export const RECURRING_E2E_IDS = [
  'recurring:main',
  'recurring:list',
  'recurring:detail',
] as const;

export type RecurringE2eDynamicId = `recurring:row:${string | number}`;

export type RecurringE2eId =
  (typeof RECURRING_E2E_IDS)[number] | RecurringE2eDynamicId;

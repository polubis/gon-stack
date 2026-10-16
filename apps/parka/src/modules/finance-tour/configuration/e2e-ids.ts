// Exact `data-e2e` ids this module renders. Root-combined in
// `src/__e2e__/selectors.d.ts`.
export const FINANCE_TOUR_E2E_IDS = [
  'finance-tour:dialog',
  'finance-tour:close',
  'finance-tour:toast',
] as const;

export type FinanceTourE2eId = (typeof FINANCE_TOUR_E2E_IDS)[number];

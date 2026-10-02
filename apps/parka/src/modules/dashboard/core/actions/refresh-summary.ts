import type { Bus } from '../bus';
import type { Store } from '../store';

/** Recurring changes move the totals: ask the server for the summary again. */
export const refreshSummary = (store: Store, trigger: Bus['trigger']): void => {
  const month = store.$month.get();
  if (month) trigger('[TRIGGER]_LOAD', { month });
};

import type { Store } from '../store';
import type { Bus } from '../bus';

/** Recurring changes move the totals: load the dashboard again. */
export const reloadOnRecurringChange = (
  _store: Store,
  { ofType, forwardAs }: Bus,
) => ofType('[FACT]_RECURRING_CHANGED').pipe(forwardAs('[TASK]_LOAD'));

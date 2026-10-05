import type { Store } from '../store';
import type { Bus } from '../bus';

/** Expense changes move the totals: load the dashboard again. */
export const reloadOnExpenseChange = (
  _store: Store,
  { ofType, forwardAs }: Bus,
) => ofType('[FACT]_EXPENSE_CHANGED').pipe(forwardAs('[TASK]_LOAD'));

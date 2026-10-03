import type { Store } from '../store';
import type { Bus } from '../bus';

/** Expense changes move the totals: the summary is read again. */
export const requestSummaryRefresh = (
  _store: Store,
  { ofType, forwardAs }: Bus,
) => ofType('[FACT]_EXPENSE_CHANGED').pipe(forwardAs('[TASK]_REFRESH_SUMMARY'));

import { tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';

/** Expense changes move the totals: read everything again. */
export const reloadOnExpenseChange = (
  store: Store,
  { ofType, forwardAs }: Bus,
) =>
  ofType('[FACT]_EXPENSE_CHANGED').pipe(
    tap(() => store.$ready.reset()),
    forwardAs('[TASK]_LOAD'),
  );

import { catchError, EMPTY, exhaustMap, finalize, from, map, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { errorMessage } from '@/shared/errors/error-message';
import { notify } from '../actions/notify';
import { NOTICES } from '../../configuration/constraints';
import { monthOfDateInput, toDateInput } from '../../domain/format';
import { putExpense } from '../../integration/repository';

/** Ignores extra saves while one is in flight; the page leaves once it is stored. */
export const updateExpense = (store: Store, { ofType, emit }: Bus) =>
  ofType('[TRIGGER]_UPDATE_EXPENSE').pipe(
    map(({ expense }) => expense),
    exhaustMap((expense) => {
      store.$saving.set(true);

      return from(putExpense(expense)).pipe(
        tap(() =>
          store.$saved.set(monthOfDateInput(toDateInput(expense.date))),
        ),
        catchError((error: unknown) => {
          notify(store, {
            ...NOTICES.expenseUpdateFailed,
            description: errorMessage(error),
            tone: 'error',
            retry: () => emit('[TRIGGER]_UPDATE_EXPENSE', { expense }),
          });
          return EMPTY;
        }),
        finalize(() => store.$saving.reset()),
      );
    }),
  );

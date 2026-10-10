import { catchError, EMPTY, exhaustMap, finalize, from, map, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { errorMessage } from '@/shared/errors/error-message';
import { notify } from '../actions/notify';
import { NOTICES } from '../../configuration/constraints';
import { monthOfDateInput, toDateInput } from '../../domain/format';
import { postExpense } from '../../integration/repository';

/** Ignores extra saves while one is in flight (no duplicate expenses). */
export const createExpense = (store: Store, { ofType, emit }: Bus) =>
  ofType('[TRIGGER]_CREATE_EXPENSE').pipe(
    map(({ expense }) => expense),
    exhaustMap((expense) => {
      store.$saving.set(true);

      return from(postExpense(expense)).pipe(
        tap(() =>
          store.$saved.set(monthOfDateInput(toDateInput(expense.date))),
        ),
        catchError((error: unknown) => {
          notify(store, {
            ...NOTICES.expenseFailed,
            description: errorMessage(error),
            tone: 'error',
            retry: () => emit('[TRIGGER]_CREATE_EXPENSE', { expense }),
          });
          return EMPTY;
        }),
        finalize(() => store.$saving.reset()),
      );
    }),
  );

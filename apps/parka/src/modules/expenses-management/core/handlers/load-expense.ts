import { catchError, EMPTY, finalize, from, map, switchMap, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { errorMessage } from '@/shared/errors/error-message';
import { fetchExpense } from '../../integration/repository';

export const loadExpense = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_LOAD_EXPENSE').pipe(
    tap(() => {
      store.$expenseLoading.set(true);
      store.$expense.reset();
    }),
    map(({ id }) => ({ id, ctrl: new AbortController() })),
    switchMap(({ id, ctrl }) =>
      from(fetchExpense(id, ctrl.signal)).pipe(
        tap((expense) => store.$expense.set(expense)),
        catchError((error: unknown) => {
          if (!(error instanceof DOMException && error.name === 'AbortError'))
            store.$error.set(errorMessage(error));
          return EMPTY;
        }),
        finalize(() => {
          store.$expenseLoading.set(false);
          ctrl.abort();
        }),
      ),
    ),
  );

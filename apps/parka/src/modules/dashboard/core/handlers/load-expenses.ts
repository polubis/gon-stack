import { catchError, EMPTY, finalize, from, map, switchMap, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { fetchCategories, fetchExpenses } from '../../integration/repository';

export const loadExpenses = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_LOAD_EXPENSES').pipe(
    tap(() => {
      store.$expensesLoading.set(true);
      store.$expensesError.reset();
    }),
    map(() => new AbortController()),
    switchMap((ctrl) =>
      from(
        Promise.all([fetchExpenses(ctrl.signal), fetchCategories(ctrl.signal)]),
      ).pipe(
        tap(([expenses, categories]) => {
          store.$expenses.set(expenses);
          store.$categories.set(categories);
        }),
        catchError((error) => {
          const isAbort =
            error instanceof DOMException && error.name === 'AbortError';

          if (!isAbort) {
            store.$expensesError.set(
              error instanceof Error
                ? error.message
                : 'Failed to load expenses.',
            );
          }

          return EMPTY;
        }),
        finalize(() => {
          store.$expensesInitializing.set(false);
          store.$expensesLoading.reset();
          ctrl.abort();
        }),
      ),
    ),
  );

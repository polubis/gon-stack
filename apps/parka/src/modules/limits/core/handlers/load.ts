import { catchError, EMPTY, finalize, from, map, switchMap, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import {
  fetchCategories,
  fetchExpenses,
  fetchGoals,
  fetchLimits,
} from '../../integration/repository';

export const load = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_LOAD').pipe(
    tap(() => {
      store.$isLoading.set(true);
      store.$error.reset();
    }),
    map(() => new AbortController()),
    switchMap((ctrl) =>
      from(
        Promise.all([
          fetchLimits(ctrl.signal),
          fetchGoals(ctrl.signal),
          fetchCategories(ctrl.signal),
          fetchExpenses(ctrl.signal),
        ]),
      ).pipe(
        tap(([limits, goals, categories, expenses]) => {
          store.$limits.set(limits);
          store.$goals.set(goals);
          store.$categories.set(categories);
          store.$expenses.set(expenses);
        }),
        catchError((error) => {
          const isAbort =
            error instanceof DOMException && error.name === 'AbortError';

          if (!isAbort) {
            store.$error.set(
              error instanceof Error ? error.message : 'Failed to load limits.',
            );
          }

          return EMPTY;
        }),
        finalize(() => {
          store.$initializing.set(false);
          store.$isLoading.reset();
          ctrl.abort();
        }),
      ),
    ),
  );

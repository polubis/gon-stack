import { catchError, concatMap, EMPTY, from, map, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { notify } from '../actions/notify';
import { putExpense } from '../../integration/repository';

export const updateExpense = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_UPDATE_EXPENSE').pipe(
    map(({ expense }) => ({ expense, previous: store.$expenses.get() })),
    tap(({ expense }) => {
      store.$expenses.set(
        store.$expenses.get().map((e) => (e.id === expense.id ? expense : e)),
      );
    }),
    concatMap(({ expense, previous }) =>
      from(putExpense(expense)).pipe(
        tap(() => notify(store, 'success', 'Zapisano zmiany.')),
        catchError(() => {
          store.$expenses.set(previous);
          notify(store, 'error', 'Nie udało się zapisać zmian.');
          return EMPTY;
        }),
      ),
    ),
  );

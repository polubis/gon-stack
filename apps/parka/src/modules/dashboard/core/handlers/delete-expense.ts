import { catchError, concatMap, EMPTY, from, map, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { notify } from '../actions/notify';
import { deleteExpense } from '../../integration/repository';

export const removeExpense = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_DELETE_EXPENSE').pipe(
    map(({ id }) => ({ id, previous: store.$expenses.get() })),
    tap(({ id }) => {
      store.$expenses.set(store.$expenses.get().filter((e) => e.id !== id));
    }),
    concatMap(({ id, previous }) =>
      from(deleteExpense(id)).pipe(
        tap(() => notify(store, 'success', 'Usunięto wydatek.')),
        catchError(() => {
          store.$expenses.set(previous);
          notify(store, 'error', 'Nie udało się usunąć wydatku.');
          return EMPTY;
        }),
      ),
    ),
  );

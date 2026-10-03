import { catchError, concatMap, EMPTY, from, map, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { notify } from '../actions/notify';
import { deleteRecurring } from '../../integration/repository';

export const removeRecurring = (store: Store, { ofType, emit }: Bus) =>
  ofType('[TRIGGER]_DELETE_RECURRING').pipe(
    map(({ id, month }) => ({ id, month, previous: store.$recurring.get() })),
    tap(({ id }) => {
      store.$recurring.set(store.$recurring.get().filter((r) => r.id !== id));
    }),
    concatMap(({ id, month, previous }) =>
      from(deleteRecurring(id)).pipe(
        tap(() => {
          notify(store, 'success', 'Usunięto wydatek cykliczny.');
          emit('[FACT]_RECURRING_CHANGED', { month });
        }),
        catchError(() => {
          store.$recurring.set(previous);
          notify(store, 'error', 'Nie udało się usunąć wydatku cyklicznego.');
          return EMPTY;
        }),
      ),
    ),
  );

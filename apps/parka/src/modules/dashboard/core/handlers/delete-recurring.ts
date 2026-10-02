import { catchError, concatMap, EMPTY, from, map, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { notify } from '../actions/notify';
import { refreshSummary } from '../actions/refresh-summary';
import { deleteRecurring } from '../../integration/repository';

export const removeRecurring = (store: Store, { ofType, trigger }: Bus) =>
  ofType('[TRIGGER]_DELETE_RECURRING').pipe(
    map(({ id }) => ({ id, previous: store.$recurring.get() })),
    tap(({ id }) => {
      store.$recurring.set(store.$recurring.get().filter((r) => r.id !== id));
    }),
    concatMap(({ id, previous }) =>
      from(deleteRecurring(id)).pipe(
        tap(() => {
          notify(store, 'success', 'Usunięto wydatek cykliczny.');
          refreshSummary(store, trigger);
        }),
        catchError(() => {
          store.$recurring.set(previous);
          notify(store, 'error', 'Nie udało się usunąć wydatku cyklicznego.');
          return EMPTY;
        }),
      ),
    ),
  );

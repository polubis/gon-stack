import { catchError, concatMap, EMPTY, from, map, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { notify } from '../actions/notify';
import { deleteGoal } from '../../integration/repository';

export const removeGoal = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_DELETE_GOAL').pipe(
    map(({ id }) => ({ id, previous: store.$goals.get() })),
    tap(({ id }) => {
      store.$goals.set(store.$goals.get().filter((g) => g.id !== id));
    }),
    concatMap(({ id, previous }) =>
      from(deleteGoal(id)).pipe(
        tap(() => notify(store, 'success', 'Usunięto cel.')),
        catchError(() => {
          store.$goals.set(previous);
          notify(store, 'error', 'Nie udało się usunąć celu.');
          return EMPTY;
        }),
      ),
    ),
  );

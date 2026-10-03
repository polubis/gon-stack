import { catchError, concatMap, EMPTY, from, map, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { notify } from '../actions/notify';
import { putGoal } from '../../integration/repository';

export const updateGoal = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_UPDATE_GOAL').pipe(
    map(({ goal }) => ({ goal, previous: store.$goals.get() })),
    tap(({ goal }) => {
      store.$goals.set(
        store.$goals.get().map((g) => (g.id === goal.id ? goal : g)),
      );
    }),
    concatMap(({ goal, previous }) =>
      from(putGoal(goal)).pipe(
        tap(() => notify(store, 'success', 'Zapisano cel.')),
        catchError(() => {
          store.$goals.set(previous);
          notify(store, 'error', 'Nie udało się zapisać celu.');
          return EMPTY;
        }),
      ),
    ),
  );

import { catchError, concatMap, EMPTY, from, map, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { notify } from '../actions/notify';
import { postGoal } from '../../integration/repository';

export const createGoal = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_CREATE_GOAL').pipe(
    map(({ goal }) => ({ goal, previous: store.$goals.get() })),
    tap(({ goal }) => {
      store.$goals.set([...store.$goals.get(), goal]);
    }),
    concatMap(({ goal, previous }) =>
      from(postGoal(goal)).pipe(
        tap(() => notify(store, 'success', 'Dodano cel.')),
        catchError(() => {
          store.$goals.set(previous);
          notify(store, 'error', 'Nie udało się dodać celu.');
          return EMPTY;
        }),
      ),
    ),
  );

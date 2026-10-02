import { catchError, concatMap, EMPTY, from, map, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { notify } from '../actions/notify';
import { postLimit } from '../../integration/repository';

export const createLimit = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_CREATE_LIMIT').pipe(
    map(({ limit }) => ({ limit, previous: store.$limits.get() })),
    tap(({ limit }) => {
      store.$limits.set([...store.$limits.get(), limit]);
    }),
    concatMap(({ limit, previous }) =>
      from(postLimit(limit)).pipe(
        tap(() => notify(store, 'success', 'Dodano limit.')),
        catchError(() => {
          store.$limits.set(previous);
          notify(store, 'error', 'Nie udało się dodać limitu.');
          return EMPTY;
        }),
      ),
    ),
  );

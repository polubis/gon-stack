import { catchError, concatMap, EMPTY, from, map, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { notify } from '../actions/notify';
import { putLimit } from '../../integration/repository';

export const updateLimit = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_UPDATE_LIMIT').pipe(
    map(({ limit }) => ({ limit, previous: store.$limits.get() })),
    tap(({ limit }) => {
      store.$limits.set(
        store.$limits.get().map((l) => (l.id === limit.id ? limit : l)),
      );
    }),
    concatMap(({ limit, previous }) =>
      from(putLimit(limit)).pipe(
        tap(() => notify(store, 'success', 'Zapisano limit.')),
        catchError(() => {
          store.$limits.set(previous);
          notify(store, 'error', 'Nie udało się zapisać limitu.');
          return EMPTY;
        }),
      ),
    ),
  );

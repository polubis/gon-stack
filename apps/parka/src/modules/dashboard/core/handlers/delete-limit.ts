import { catchError, concatMap, EMPTY, from, map, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { notify } from '../actions/notify';
import { deleteLimit } from '../../integration/repository';

export const removeLimit = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_DELETE_LIMIT').pipe(
    map(({ id }) => ({ id, previous: store.$limits.get() })),
    tap(({ id }) => {
      store.$limits.set(store.$limits.get().filter((l) => l.id !== id));
    }),
    concatMap(({ id, previous }) =>
      from(deleteLimit(id)).pipe(
        tap(() => notify(store, 'success', 'Usunięto limit.')),
        catchError(() => {
          store.$limits.set(previous);
          notify(store, 'error', 'Nie udało się usunąć limitu.');
          return EMPTY;
        }),
      ),
    ),
  );

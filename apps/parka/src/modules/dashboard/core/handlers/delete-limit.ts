import { catchError, concatMap, EMPTY, from, map, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { errorMessage } from '@/shared/errors/error-message';
import { notify } from '../actions/notify';
import { deleteLimit } from '../../integration/repository';

export const removeLimit = (store: Store, { ofType, emit }: Bus) =>
  ofType('[TRIGGER]_DELETE_LIMIT').pipe(
    map(({ id }) => ({ id, previous: store.$limits.get() })),
    tap(({ id }) => {
      store.$limits.set(store.$limits.get().filter((l) => l.id !== id));
    }),
    concatMap(({ id, previous }) =>
      from(deleteLimit(id)).pipe(
        tap(() =>
          notify(store, { tone: 'success', message: 'Usunięto limit.' }),
        ),
        catchError((error: unknown) => {
          store.$limits.set(previous);
          notify(store, {
            tone: 'error',
            title: 'Nie udało się usunąć limitu',
            code: 'LIMIT_DELETE_FAILED',
            description: errorMessage(error),
            retry: () => emit('[TRIGGER]_DELETE_LIMIT', { id }),
          });
          return EMPTY;
        }),
      ),
    ),
  );

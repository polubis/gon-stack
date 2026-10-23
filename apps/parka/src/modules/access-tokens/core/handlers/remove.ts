import { catchError, concatMap, EMPTY, from, map, tap } from 'rxjs';
import { errorMessage } from '@/shared/errors/error-message';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { notify } from '../actions/notify';
import { deleteToken } from '../../integration/repository';

export const remove = (store: Store, { ofType, emit }: Bus) =>
  ofType('[TRIGGER]_REMOVE').pipe(
    map(({ id }) => ({ id, previous: store.$tokens.get() })),
    tap(({ id, previous }) => {
      store.$tokens.set(previous.filter((t) => t.id !== id));
    }),
    concatMap(({ id, previous }) =>
      from(deleteToken(id)).pipe(
        tap(() =>
          notify(store, { tone: 'success', message: 'Usunięto token.' }),
        ),
        catchError((error: unknown) => {
          store.$tokens.set(previous);
          notify(store, {
            tone: 'error',
            title: 'Nie udało się usunąć tokenu',
            code: 'ACCESS_TOKEN_DELETE_FAILED',
            description: errorMessage(error),
            retry: () => emit('[TRIGGER]_REMOVE', { id }),
          });
          return EMPTY;
        }),
      ),
    ),
  );

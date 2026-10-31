import { catchError, concatMap, EMPTY, from, map, tap } from 'rxjs';
import { errorMessage } from '@/shared/errors/error-message';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { notify } from '../actions/notify';
import { patchTokenName } from '../../integration/repository';

export const rename = (store: Store, { ofType, emit }: Bus) =>
  ofType('[TRIGGER]_RENAME').pipe(
    map(({ id, name }) => ({ id, name, previous: store.$tokens.get() })),
    tap(({ id, name, previous }) => {
      store.$tokens.set(
        previous.map((t) => (t.id === id ? { ...t, name } : t)),
      );
    }),
    concatMap(({ id, name, previous }) =>
      from(patchTokenName(id, name)).pipe(
        tap((item) => {
          store.$tokens.set(
            store.$tokens.get().map((t) => (t.id === id ? item : t)),
          );
          notify(store, {
            tone: 'success',
            message: 'Zmieniono nazwę tokenu.',
          });
        }),
        catchError((error: unknown) => {
          store.$tokens.set(previous);
          notify(store, {
            tone: 'error',
            title: 'Nie udało się zmienić nazwy tokenu',
            code: 'ACCESS_TOKEN_RENAME_FAILED',
            description: errorMessage(error),
            retry: () => emit('[TRIGGER]_RENAME', { id, name }),
          });
          return EMPTY;
        }),
      ),
    ),
  );

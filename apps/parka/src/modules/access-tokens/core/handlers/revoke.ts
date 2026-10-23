import { catchError, concatMap, EMPTY, from, map, tap } from 'rxjs';
import { errorMessage } from '@/shared/errors/error-message';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { notify } from '../actions/notify';
import { postRevocation } from '../../integration/repository';

export const revoke = (store: Store, { ofType, emit }: Bus) =>
  ofType('[TRIGGER]_REVOKE').pipe(
    map(({ id }) => ({ id, previous: store.$tokens.get() })),
    tap(({ id, previous }) => {
      store.$tokens.set(
        previous.map((t) => (t.id === id ? { ...t, status: 'revoked' } : t)),
      );
    }),
    concatMap(({ id, previous }) =>
      from(postRevocation(id)).pipe(
        tap((item) => {
          store.$tokens.set(
            store.$tokens.get().map((t) => (t.id === id ? item : t)),
          );
          notify(store, { tone: 'success', message: 'Wyłączono token.' });
        }),
        catchError((error: unknown) => {
          store.$tokens.set(previous);
          notify(store, {
            tone: 'error',
            title: 'Nie udało się wyłączyć tokenu',
            code: 'ACCESS_TOKEN_REVOKE_FAILED',
            description: errorMessage(error),
            retry: () => emit('[TRIGGER]_REVOKE', { id }),
          });
          return EMPTY;
        }),
      ),
    ),
  );

import { catchError, concatMap, EMPTY, finalize, from, tap } from 'rxjs';
import { errorMessage } from '@/shared/errors/error-message';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { notify } from '../actions/notify';
import { postToken } from '../../integration/repository';

/** Not optimistic: the secret exists only once the server has made it. */
export const create = (store: Store, { ofType, emit }: Bus) =>
  ofType('[TRIGGER]_CREATE').pipe(
    tap(() => store.$isCreating.set(true)),
    concatMap(({ name, ttlDays }) =>
      from(postToken(name, ttlDays)).pipe(
        tap(({ token, item }) => {
          store.$tokens.set([item, ...store.$tokens.get()]);
          store.$secret.set({ token, name: item.name, kind: 'created' });
          notify(store, { tone: 'success', message: 'Utworzono token.' });
        }),
        catchError((error: unknown) => {
          notify(store, {
            tone: 'error',
            title: 'Nie udało się utworzyć tokenu',
            code: 'ACCESS_TOKEN_CREATE_FAILED',
            description: errorMessage(error),
            retry: () => emit('[TRIGGER]_CREATE', { name, ttlDays }),
          });
          return EMPTY;
        }),
        finalize(() => store.$isCreating.set(false)),
      ),
    ),
  );

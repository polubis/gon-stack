import { catchError, concatMap, EMPTY, finalize, from, tap } from 'rxjs';
import { errorMessage } from '@/shared/errors/error-message';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { clearBusy, markBusy } from '../actions/busy';
import { notify } from '../actions/notify';
import { postRotation } from '../../integration/repository';

/** Not optimistic: the new secret is only known once the server has made it. */
export const rotate = (store: Store, { ofType, emit }: Bus) =>
  ofType('[TRIGGER]_ROTATE').pipe(
    tap(({ id }) => markBusy(store, id)),
    concatMap(({ id }) =>
      from(postRotation(id)).pipe(
        tap(({ token, item }) => {
          store.$tokens.set(
            store.$tokens.get().map((t) => (t.id === id ? item : t)),
          );
          store.$secret.set({ token, name: item.name, kind: 'rotated' });
          notify(store, { tone: 'success', message: 'Zmieniono token.' });
        }),
        catchError((error: unknown) => {
          notify(store, {
            tone: 'error',
            title: 'Nie udało się zmienić tokenu',
            code: 'ACCESS_TOKEN_ROTATE_FAILED',
            description: errorMessage(error),
            retry: () => emit('[TRIGGER]_ROTATE', { id }),
          });
          return EMPTY;
        }),
        finalize(() => clearBusy(store, id)),
      ),
    ),
  );

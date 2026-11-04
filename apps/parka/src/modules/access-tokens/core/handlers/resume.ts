import { catchError, concatMap, EMPTY, from, map, tap } from 'rxjs';
import { errorMessage } from '@/shared/errors/error-message';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { notify } from '../actions/notify';
import { postResume } from '../../integration/repository';

export const resume = (store: Store, { ofType, emit }: Bus) =>
  ofType('[TRIGGER]_RESUME').pipe(
    map(({ id }) => ({ id, previous: store.$tokens.get() })),
    tap(({ id, previous }) => {
      store.$tokens.set(
        previous.map((t) => (t.id === id ? { ...t, status: 'active' } : t)),
      );
    }),
    concatMap(({ id, previous }) =>
      from(postResume(id)).pipe(
        tap((item) => {
          store.$tokens.set(
            store.$tokens.get().map((t) => (t.id === id ? item : t)),
          );
          notify(store, { tone: 'success', message: 'Wznowiono token.' });
        }),
        catchError((error: unknown) => {
          store.$tokens.set(previous);
          notify(store, {
            tone: 'error',
            title: 'Nie udało się wznowić tokenu',
            code: 'ACCESS_TOKEN_RESUME_FAILED',
            description: errorMessage(error),
            retry: () => emit('[TRIGGER]_RESUME', { id }),
          });
          return EMPTY;
        }),
      ),
    ),
  );

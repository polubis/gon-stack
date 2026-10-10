import { catchError, concatMap, EMPTY, from, map, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { errorMessage } from '@/shared/errors/error-message';
import { notify } from '../actions/notify';
import { postLimit } from '../../integration/repository';

export const createLimit = (store: Store, { ofType, emit }: Bus) =>
  ofType('[TRIGGER]_CREATE_LIMIT').pipe(
    map(({ limit }) => ({ limit, previous: store.$limits.get() })),
    tap(({ limit }) => {
      store.$limits.set([...store.$limits.get(), limit]);
    }),
    concatMap(({ limit, previous }) =>
      from(postLimit(limit)).pipe(
        tap(() => notify(store, { tone: 'success', message: 'Dodano limit.' })),
        catchError((error: unknown) => {
          store.$limits.set(previous);
          notify(store, {
            tone: 'error',
            title: 'Nie udało się dodać limitu',
            code: 'LIMIT_CREATE_FAILED',
            description: errorMessage(error),
            retry: () => emit('[TRIGGER]_CREATE_LIMIT', { limit }),
          });
          return EMPTY;
        }),
      ),
    ),
  );

import { catchError, concatMap, EMPTY, from, map, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { errorMessage } from '@/shared/errors/error-message';
import { notify } from '../actions/notify';
import { putLimit } from '../../integration/repository';

export const updateLimit = (store: Store, { ofType, emit }: Bus) =>
  ofType('[TRIGGER]_UPDATE_LIMIT').pipe(
    map(({ limit }) => ({ limit, previous: store.$limits.get() })),
    tap(({ limit }) => {
      store.$limits.set(
        store.$limits.get().map((l) => (l.id === limit.id ? limit : l)),
      );
    }),
    concatMap(({ limit, previous }) =>
      from(putLimit(limit)).pipe(
        tap(() =>
          notify(store, { tone: 'success', message: 'Zapisano limit.' }),
        ),
        catchError((error: unknown) => {
          store.$limits.set(previous);
          notify(store, {
            tone: 'error',
            title: 'Nie udało się zapisać limitu',
            code: 'LIMIT_UPDATE_FAILED',
            description: errorMessage(error),
            retry: () => emit('[TRIGGER]_UPDATE_LIMIT', { limit }),
          });
          return EMPTY;
        }),
      ),
    ),
  );

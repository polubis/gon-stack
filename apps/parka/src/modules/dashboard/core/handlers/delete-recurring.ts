import { catchError, concatMap, EMPTY, from, map, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { errorMessage } from '@/shared/errors/error-message';
import { notify } from '../actions/notify';
import { deleteRecurring } from '../../integration/repository';

export const removeRecurring = (store: Store, { ofType, emit }: Bus) =>
  ofType('[TRIGGER]_DELETE_RECURRING').pipe(
    map(({ id, month }) => ({ id, month, previous: store.$recurring.get() })),
    tap(({ id }) => {
      store.$recurring.set(store.$recurring.get().filter((r) => r.id !== id));
    }),
    concatMap(({ id, month, previous }) =>
      from(deleteRecurring(id)).pipe(
        tap(() => {
          notify(store, {
            tone: 'success',
            message: 'Usunięto wydatek cykliczny.',
          });
          emit('[FACT]_RECURRING_CHANGED', { month });
        }),
        catchError((error: unknown) => {
          store.$recurring.set(previous);
          notify(store, {
            tone: 'error',
            title: 'Nie udało się usunąć wydatku cyklicznego',
            code: 'RECURRING_DELETE_FAILED',
            description: errorMessage(error),
            retry: () => emit('[TRIGGER]_DELETE_RECURRING', { id, month }),
          });
          return EMPTY;
        }),
      ),
    ),
  );

import { catchError, concatMap, EMPTY, from, map, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { errorMessage } from '@/shared/errors/error-message';
import { notify } from '../actions/notify';
import { putRecurring } from '../../integration/repository';

export const updateRecurring = (store: Store, { ofType, emit }: Bus) =>
  ofType('[TRIGGER]_UPDATE_RECURRING').pipe(
    map(({ recurring, month }) => ({
      recurring,
      month,
      previous: store.$recurring.get(),
    })),
    tap(({ recurring }) => {
      store.$recurring.set(
        store.$recurring
          .get()
          .map((r) => (r.id === recurring.id ? recurring : r)),
      );
    }),
    concatMap(({ recurring, month, previous }) =>
      from(putRecurring(recurring)).pipe(
        tap(() => {
          notify(store, { tone: 'success', message: 'Zapisano zmiany.' });
          emit('[FACT]_RECURRING_CHANGED', { month });
        }),
        catchError((error: unknown) => {
          store.$recurring.set(previous);
          notify(store, {
            tone: 'error',
            title: 'Nie udało się zapisać zmian',
            code: 'RECURRING_UPDATE_FAILED',
            description: errorMessage(error),
            retry: () =>
              emit('[TRIGGER]_UPDATE_RECURRING', { recurring, month }),
          });
          return EMPTY;
        }),
      ),
    ),
  );

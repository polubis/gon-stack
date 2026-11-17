import { catchError, concatMap, EMPTY, from, map, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { errorMessage } from '@/shared/errors/error-message';
import { notify } from '../actions/notify';
import { deleteRecurring } from '../../integration/repository';

export const removeRecurring = (store: Store, { ofType, emit }: Bus) =>
  ofType('[TRIGGER]_DELETE_RECURRING').pipe(
    map(({ id, period, scope, occurrenceDate }) => ({
      id,
      period,
      scope,
      occurrenceDate,
      previous: store.$recurring.get(),
    })),
    tap(({ id, scope }) => {
      // Other scopes only trim or split the series: the reload shows the result.
      if (scope === 'all')
        store.$recurring.set(store.$recurring.get().filter((r) => r.id !== id));
    }),
    concatMap(({ id, period, scope, occurrenceDate, previous }) =>
      from(deleteRecurring(id, { scope, occurrenceDate })).pipe(
        tap(() => {
          notify(store, {
            tone: 'success',
            message: 'Usunięto wydatek cykliczny.',
          });
          emit('[FACT]_RECURRING_CHANGED', { period });
        }),
        catchError((error: unknown) => {
          store.$recurring.set(previous);
          notify(store, {
            tone: 'error',
            title: 'Nie udało się usunąć wydatku cyklicznego',
            code: 'RECURRING_DELETE_FAILED',
            description: errorMessage(error),
            retry: () =>
              emit('[TRIGGER]_DELETE_RECURRING', {
                id,
                period,
                scope,
                occurrenceDate,
              }),
          });
          return EMPTY;
        }),
      ),
    ),
  );

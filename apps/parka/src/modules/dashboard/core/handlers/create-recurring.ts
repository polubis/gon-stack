import { catchError, concatMap, EMPTY, from, map, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { notify } from '../actions/notify';
import { postRecurring } from '../../integration/repository';

export const createRecurring = (store: Store, { ofType, emit }: Bus) =>
  ofType('[TRIGGER]_CREATE_RECURRING').pipe(
    map(({ recurring, month }) => ({
      recurring,
      month,
      previous: store.$recurring.get(),
    })),
    tap(({ recurring }) => {
      store.$recurring.set([...store.$recurring.get(), recurring]);
    }),
    concatMap(({ recurring, month, previous }) =>
      from(postRecurring(recurring)).pipe(
        tap(() => {
          notify(store, 'success', 'Dodano wydatek cykliczny.');
          emit('[FACT]_RECURRING_CHANGED', { month });
        }),
        catchError(() => {
          store.$recurring.set(previous);
          notify(store, 'error', 'Nie udało się dodać wydatku cyklicznego.');
          return EMPTY;
        }),
      ),
    ),
  );

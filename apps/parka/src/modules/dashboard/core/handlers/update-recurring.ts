import { catchError, concatMap, EMPTY, from, map, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { notify } from '../actions/notify';
import { refreshSummary } from '../actions/refresh-summary';
import { putRecurring } from '../../integration/repository';

export const updateRecurring = (store: Store, { ofType, trigger }: Bus) =>
  ofType('[TRIGGER]_UPDATE_RECURRING').pipe(
    map(({ recurring }) => ({ recurring, previous: store.$recurring.get() })),
    tap(({ recurring }) => {
      store.$recurring.set(
        store.$recurring
          .get()
          .map((r) => (r.id === recurring.id ? recurring : r)),
      );
    }),
    concatMap(({ recurring, previous }) =>
      from(putRecurring(recurring)).pipe(
        tap(() => {
          notify(store, 'success', 'Zapisano zmiany.');
          refreshSummary(store, trigger);
        }),
        catchError(() => {
          store.$recurring.set(previous);
          notify(store, 'error', 'Nie udało się zapisać zmian.');
          return EMPTY;
        }),
      ),
    ),
  );

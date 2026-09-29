import { catchError, concatMap, EMPTY, from, map, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { notify } from '../actions/notify';
import { putRecurring } from '../../integration/repository';

export const update = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_UPDATE').pipe(
    map(({ recurring }) => ({
      recurring,
      previous: store.$recurring.get().find((r) => r.id === recurring.id),
    })),
    tap(({ recurring }) => {
      store.$recurring.set(
        store.$recurring
          .get()
          .map((r) => (r.id === recurring.id ? recurring : r)),
      );
    }),
    concatMap(({ recurring, previous }) =>
      from(putRecurring(recurring)).pipe(
        tap(() => notify(store, 'success', 'Zapisano zmiany.')),
        catchError(() => {
          if (previous) {
            store.$recurring.set(
              store.$recurring
                .get()
                .map((r) => (r.id === previous.id ? previous : r)),
            );
          }
          notify(store, 'error', 'Nie udało się zapisać zmian.');
          return EMPTY;
        }),
      ),
    ),
  );

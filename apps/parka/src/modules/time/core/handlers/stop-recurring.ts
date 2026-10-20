import { catchError, concatMap, EMPTY, from, map, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { errorMessage } from '@/shared/errors/error-message';
import { notify } from '../actions/notify';
import { write } from '../actions/pending';
import { removeRecurring } from '../../integration/repository';

/** Ends the series; tasks it already made stay as ordinary ones. */
export const stopRecurring = (store: Store, bus: Bus) => {
  const { ofType, emit } = bus;
  return ofType('[TRIGGER]_STOP_RECURRING').pipe(
    map(({ id }) => ({
      id,
      previous: store.$tasks.get().filter((t) => t.recurringId === id),
    })),
    tap(({ id }) => {
      store.$tasks.set(
        store.$tasks
          .get()
          .map((t) => (t.recurringId === id ? { ...t, recurringId: null } : t)),
      );
    }),
    concatMap(({ id, previous }) =>
      from(write(store, bus, () => removeRecurring(id))).pipe(
        tap(() =>
          notify(store, { tone: 'success', message: 'Zakończono cykl.' }),
        ),
        catchError((error: unknown) => {
          store.$tasks.set(
            store.$tasks
              .get()
              .map((t) => previous.find((p) => p.id === t.id) ?? t),
          );
          notify(store, {
            tone: 'error',
            title: 'Nie udało się zakończyć cyklu',
            code: 'RECURRING_STOP_FAILED',
            description: errorMessage(error),
            retry: () => emit('[TRIGGER]_STOP_RECURRING', { id }),
          });
          return EMPTY;
        }),
      ),
    ),
  );
};

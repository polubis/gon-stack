import { catchError, concatMap, EMPTY, from, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { errorMessage } from '@/shared/errors/error-message';
import { notify } from '../actions/notify';
import { write } from '../actions/pending';
import { putStatuses } from '../../integration/repository';

export const saveStatuses = (store: Store, bus: Bus) => {
  const { ofType, emit } = bus;
  return ofType('[TRIGGER]_SAVE_STATUSES').pipe(
    concatMap(({ statuses }) => {
      const previous = store.$statuses.get();
      const kept = new Set(statuses.map((status) => status.id));
      store.$statuses.set(statuses);
      // A removed step sends its tasks back to the built-in one, as the server does.
      store.$tasks.set(
        store.$tasks
          .get()
          .map((task) =>
            task.statusId && !kept.has(task.statusId)
              ? { ...task, statusId: null }
              : task,
          ),
      );
      return from(write(store, bus, () => putStatuses(statuses))).pipe(
        tap(() =>
          notify(store, { tone: 'success', message: 'Zapisano statusy.' }),
        ),
        catchError((error: unknown) => {
          store.$statuses.set(previous);
          notify(store, {
            tone: 'error',
            title: 'Nie udało się zapisać statusów',
            code: 'TASK_STATUSES_SAVE_FAILED',
            description: errorMessage(error),
            retry: () => emit('[TRIGGER]_SAVE_STATUSES', { statuses }),
          });
          return EMPTY;
        }),
      );
    }),
  );
};

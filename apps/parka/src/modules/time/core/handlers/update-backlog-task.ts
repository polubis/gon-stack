import { catchError, concatMap, EMPTY, from, map, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { errorMessage } from '@/shared/errors/error-message';
import { notify } from '../actions/notify';
import { write } from '../actions/pending';
import { putBacklogTask } from '../../integration/repository';

export const updateBacklogTask = (store: Store, bus: Bus) => {
  const { ofType, emit } = bus;
  return ofType('[TRIGGER]_UPDATE_BACKLOG_TASK').pipe(
    map(({ task }) => ({
      task,
      previous: store.$backlog.get().find((t) => t.id === task.id),
    })),
    tap(({ task }) => {
      store.$backlog.set(
        store.$backlog.get().map((t) => (t.id === task.id ? task : t)),
      );
    }),
    concatMap(({ task, previous }) =>
      from(write(store, bus, () => putBacklogTask(task))).pipe(
        tap(() =>
          notify(store, { tone: 'success', message: 'Zapisano zmiany.' }),
        ),
        catchError((error: unknown) => {
          const current = store.$backlog.get().find((t) => t.id === task.id);
          // Only undo our own change, not a newer one.
          if (previous && current === task)
            store.$backlog.set(
              store.$backlog
                .get()
                .map((t) => (t.id === previous.id ? previous : t)),
            );
          notify(store, {
            tone: 'error',
            title: 'Nie udało się zapisać zadania',
            code: 'BACKLOG_UPDATE_FAILED',
            description: errorMessage(error),
            retry: () => emit('[TRIGGER]_UPDATE_BACKLOG_TASK', { task }),
          });
          return EMPTY;
        }),
      ),
    ),
  );
};

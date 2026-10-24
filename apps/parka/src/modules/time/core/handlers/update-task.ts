import { catchError, concatMap, EMPTY, from, map, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { errorMessage } from '@/shared/errors/error-message';
import { notify } from '../actions/notify';
import { write } from '../actions/pending';
import { sortTasks } from '../../domain/schedule';
import { putTask } from '../../integration/repository';

export const updateTask = (store: Store, bus: Bus) => {
  const { ofType, emit } = bus;
  return ofType('[TRIGGER]_UPDATE_TASK').pipe(
    map(({ task, message }) => ({
      task,
      message,
      previous: store.$tasks.get().find((t) => t.id === task.id),
    })),
    tap(({ task }) => {
      store.$tasks.set(
        sortTasks(store.$tasks.get().map((t) => (t.id === task.id ? task : t))),
      );
    }),
    concatMap(({ task, previous, message }) =>
      from(write(store, bus, () => putTask(task))).pipe(
        tap(() =>
          notify(store, {
            tone: 'success',
            message: message ?? 'Zapisano zmiany.',
          }),
        ),
        catchError((error: unknown) => {
          const current = store.$tasks.get().find((t) => t.id === task.id);
          // Only undo our own change, not a newer one.
          if (previous && current === task) {
            store.$tasks.set(
              sortTasks(
                store.$tasks
                  .get()
                  .map((t) => (t.id === previous.id ? previous : t)),
              ),
            );
          }
          notify(store, {
            tone: 'error',
            title: 'Nie udało się zapisać zadania',
            code: 'TASK_UPDATE_FAILED',
            description: errorMessage(error),
            retry: () => emit('[TRIGGER]_UPDATE_TASK', { task, message }),
          });
          return EMPTY;
        }),
      ),
    ),
  );
};

import { catchError, concatMap, EMPTY, from, mergeMap, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { errorMessage } from '@/shared/errors/error-message';
import { notify } from '../actions/notify';
import { write } from '../actions/pending';
import type { Task } from '../../domain/models';
import { sortTasks } from '../../domain/schedule';
import { putTask } from '../../integration/repository';

/** Gives a backlog task a day: it leaves the backlog and joins the board. */
export const moveBacklogTask = (store: Store, bus: Bus) => {
  const { ofType, emit } = bus;
  return ofType('[TRIGGER]_MOVE_BACKLOG_TASK').pipe(
    mergeMap(({ id, day, label }) => {
      const item = store.$backlog.get().find((t) => t.id === id);
      if (!item) return EMPTY;
      const task: Task = {
        ...item,
        day,
        at: null,
        done: false,
        recurringId: null,
      };
      return [{ id, day, label, item, task }];
    }),
    tap(({ id, task }) => {
      store.$backlog.set(store.$backlog.get().filter((t) => t.id !== id));
      const range = store.$range.get();
      if (range && task.day >= range.from && task.day <= range.to)
        store.$tasks.set(sortTasks([...store.$tasks.get(), task]));
    }),
    concatMap(({ id, day, label, item, task }) =>
      from(write(store, bus, () => putTask(task))).pipe(
        tap(() =>
          notify(store, {
            tone: 'success',
            message: `Przeniesiono „${task.title}” na ${label}.`,
          }),
        ),
        catchError((error: unknown) => {
          store.$tasks.set(store.$tasks.get().filter((t) => t.id !== id));
          store.$backlog.set([...store.$backlog.get(), item]);
          notify(store, {
            tone: 'error',
            title: 'Nie udało się przenieść zadania',
            code: 'BACKLOG_MOVE_FAILED',
            description: errorMessage(error),
            retry: () =>
              emit('[TRIGGER]_MOVE_BACKLOG_TASK', { id, day, label }),
          });
          return EMPTY;
        }),
      ),
    ),
  );
};

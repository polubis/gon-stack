import { catchError, concatMap, EMPTY, from, map, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { errorMessage } from '@/shared/errors/error-message';
import { notify } from '../actions/notify';
import { write } from '../actions/pending';
import { sortTasks } from '../../domain/schedule';
import { removeTask } from '../../integration/repository';

export const deleteTask = (store: Store, bus: Bus) => {
  const { ofType, emit } = bus;
  return ofType('[TRIGGER]_DELETE_TASK').pipe(
    map(({ id }) => ({
      id,
      previous: store.$tasks.get().find((t) => t.id === id),
      previousBacklog: store.$backlog.get().find((t) => t.id === id),
    })),
    tap(({ id }) => {
      store.$tasks.set(store.$tasks.get().filter((t) => t.id !== id));
      store.$backlog.set(store.$backlog.get().filter((t) => t.id !== id));
    }),
    concatMap(({ id, previous, previousBacklog }) =>
      from(write(store, bus, () => removeTask(id))).pipe(
        tap(() =>
          notify(store, { tone: 'success', message: 'Usunięto zadanie.' }),
        ),
        catchError((error: unknown) => {
          if (previous)
            store.$tasks.set(sortTasks([...store.$tasks.get(), previous]));
          if (previousBacklog)
            store.$backlog.set([...store.$backlog.get(), previousBacklog]);
          notify(store, {
            tone: 'error',
            title: 'Nie udało się usunąć zadania',
            code: 'TASK_DELETE_FAILED',
            description: errorMessage(error),
            retry: () => emit('[TRIGGER]_DELETE_TASK', { id }),
          });
          return EMPTY;
        }),
      ),
    ),
  );
};

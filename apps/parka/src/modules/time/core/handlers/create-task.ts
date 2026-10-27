import { catchError, concatMap, EMPTY, from, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { errorMessage } from '@/shared/errors/error-message';
import { notify } from '../actions/notify';
import { write } from '../actions/pending';
import { sortTasks } from '../../domain/schedule';
import { postTask } from '../../integration/repository';

export const createTask = (store: Store, bus: Bus) => {
  const { ofType, emit } = bus;
  return ofType('[TRIGGER]_CREATE_TASK').pipe(
    tap(({ task }) => {
      store.$tasks.set(sortTasks([...store.$tasks.get(), task]));
    }),
    concatMap(({ task }) =>
      from(write(store, bus, () => postTask(task))).pipe(
        tap((saved) => {
          // The server knows the device's picture and name; the draft did not.
          store.$tasks.set(
            store.$tasks
              .get()
              .map((t) =>
                t.id === task.id
                  ? { ...t, key: saved.key, device: saved.device }
                  : t,
              ),
          );
          notify(store, { tone: 'success', message: 'Dodano zadanie.' });
        }),
        catchError((error: unknown) => {
          store.$tasks.set(store.$tasks.get().filter((t) => t.id !== task.id));
          notify(store, {
            tone: 'error',
            title: 'Nie udało się dodać zadania',
            code: 'TASK_CREATE_FAILED',
            description: errorMessage(error),
            retry: () => emit('[TRIGGER]_CREATE_TASK', { task }),
          });
          return EMPTY;
        }),
      ),
    ),
  );
};

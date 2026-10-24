import { catchError, concatMap, EMPTY, from, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { errorMessage } from '@/shared/errors/error-message';
import { notify } from '../actions/notify';
import { write } from '../actions/pending';
import { postBacklogTask } from '../../integration/repository';

export const createBacklogTask = (store: Store, bus: Bus) => {
  const { ofType, emit } = bus;
  return ofType('[TRIGGER]_CREATE_BACKLOG_TASK').pipe(
    tap(({ task }) => {
      store.$backlog.set([...store.$backlog.get(), task]);
    }),
    concatMap(({ task }) =>
      from(write(store, bus, () => postBacklogTask(task))).pipe(
        tap((saved) => {
          // The server knows the device's picture and name; the draft did not.
          store.$backlog.set(
            store.$backlog
              .get()
              .map((t) =>
                t.id === task.id ? { ...t, device: saved.device } : t,
              ),
          );
          notify(store, { tone: 'success', message: 'Dodano do backlogu.' });
        }),
        catchError((error: unknown) => {
          store.$backlog.set(
            store.$backlog.get().filter((t) => t.id !== task.id),
          );
          notify(store, {
            tone: 'error',
            title: 'Nie udało się dodać do backlogu',
            code: 'BACKLOG_CREATE_FAILED',
            description: errorMessage(error),
            retry: () => emit('[TRIGGER]_CREATE_BACKLOG_TASK', { task }),
          });
          return EMPTY;
        }),
      ),
    ),
  );
};

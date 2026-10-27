import { catchError, concatMap, EMPTY, from, mergeMap, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { errorMessage } from '@/shared/errors/error-message';
import { notify } from '../actions/notify';
import { write } from '../actions/pending';
import { sortTasks } from '../../domain/schedule';
import { postTaskToBacklog } from '../../integration/repository';

/** Takes a task off the board and puts it in the backlog. */
export const sendTaskToBacklog = (store: Store, bus: Bus) => {
  const { ofType, emit } = bus;
  return ofType('[TRIGGER]_SEND_TASK_TO_BACKLOG').pipe(
    mergeMap(({ id }) => {
      const previous = store.$tasks.get().find((t) => t.id === id);
      return previous ? [{ id, previous }] : EMPTY;
    }),
    tap(({ id, previous }) => {
      store.$tasks.set(store.$tasks.get().filter((t) => t.id !== id));
      store.$backlog.set([
        ...store.$backlog.get(),
        {
          id,
          key: previous.key,
          title: previous.title,
          description: previous.description,
          categoryId: previous.categoryId,
          priorityId: previous.priorityId,
          device: previous.device,
        },
      ]);
    }),
    concatMap(({ id, previous }) =>
      from(write(store, bus, () => postTaskToBacklog(id))).pipe(
        tap(() =>
          notify(store, {
            tone: 'success',
            message: `Wrzucono „${previous.title}” do backlogu.`,
          }),
        ),
        catchError((error: unknown) => {
          store.$backlog.set(store.$backlog.get().filter((t) => t.id !== id));
          store.$tasks.set(sortTasks([...store.$tasks.get(), previous]));
          notify(store, {
            tone: 'error',
            title: 'Nie udało się wrzucić do backlogu',
            code: 'TASK_BACKLOG_FAILED',
            description: errorMessage(error),
            retry: () => emit('[TRIGGER]_SEND_TASK_TO_BACKLOG', { id }),
          });
          return EMPTY;
        }),
      ),
    ),
  );
};

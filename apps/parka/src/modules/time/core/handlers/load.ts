import { catchError, EMPTY, finalize, from, map, switchMap, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { sortPriorities } from '../../domain/priority';
import { sortTasks } from '../../domain/schedule';
import { fetchTime } from '../../integration/repository';

export const load = (store: Store, { ofType }: Bus) => {
  let latest = 0;
  return ofType('[TRIGGER]_LOAD').pipe(
    tap(({ from, to }) => {
      store.$isLoading.set(true);
      store.$error.reset();
      store.$range.set({ from, to });
      store.$stale.set(false);
    }),
    map((event) => ({
      event,
      seq: store.$writeSeq.get(),
      id: ++latest,
      ctrl: new AbortController(),
    })),
    switchMap(({ event, id, seq, ctrl }) =>
      from(fetchTime(event.from, event.to, ctrl.signal)).pipe(
        tap((data) => {
          // Writes in flight would be overwritten by older data: ask again.
          if (store.$pending.get() > 0 || store.$writeSeq.get() !== seq) {
            store.$stale.set(true);
            return;
          }
          store.$categories.set(data.categories);
          store.$priorities.set(sortPriorities(data.priorities));
          store.$tasks.set(sortTasks(data.tasks));
          store.$backlog.set(data.backlog);
          store.$loaded.set({ from: event.from, to: event.to });
        }),
        catchError((error: unknown) => {
          const isAbort =
            error instanceof DOMException && error.name === 'AbortError';

          if (!isAbort) {
            store.$error.set(
              error instanceof Error ? error.message : 'Failed to load tasks.',
            );
          }

          return EMPTY;
        }),
        finalize(() => {
          ctrl.abort();
          // A cancelled request must not end the loading of its successor.
          if (id !== latest) return;
          store.$initializing.set(false);
          if (!store.$stale.get()) store.$isLoading.reset();
        }),
      ),
    ),
  );
};

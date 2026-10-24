import { catchError, EMPTY, finalize, from, map, switchMap, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { sortPriorities } from '../../domain/priority';
import { sortTasks } from '../../domain/schedule';
import { neighbourPeriods, periodContaining } from '@/shared/period/period';
import { fetchTime, prefetchTime } from '../../integration/repository';

export const load = (store: Store, { ofType }: Bus) => {
  let latest = 0;
  return ofType('[TRIGGER]_LOAD').pipe(
    tap(({ kind, from, to }) => {
      store.$isLoading.set(true);
      store.$error.reset();
      store.$range.set({ kind, from, to });
      store.$stale.set(false);
    }),
    map((event) => ({
      event,
      seq: store.$writeSeq.get(),
      id: ++latest,
    })),
    switchMap(({ event, id, seq }) =>
      from(fetchTime(event.from, event.to)).pipe(
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
          // Idle time warms the ranges a swipe or arrow reaches next.
          neighbourPeriods(
            periodContaining(event.kind, event.from),
            event.to,
            true,
          ).forEach(({ from, to }) => prefetchTime(from, to));
        }),
        catchError((error: unknown) => {
          store.$error.set(
            error instanceof Error ? error.message : 'Failed to load tasks.',
          );

          return EMPTY;
        }),
        finalize(() => {
          // A cancelled request must not end the loading of its successor.
          if (id !== latest) return;
          store.$initializing.set(false);
          if (!store.$stale.get()) store.$isLoading.reset();
        }),
      ),
    ),
  );
};

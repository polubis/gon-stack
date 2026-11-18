import { catchError, EMPTY, finalize, from, map, switchMap, tap } from 'rxjs';
import { toListQuery } from '../../domain/filters';
import type { View } from '../../domain/events';
import { fetchKnowledge } from '../../integration/repository';
import type { Bus } from '../bus';
import type { Store } from '../store';

/** Lists of a view: everything (brain, structure), the period and the backlog. */
const fetchView = async ({ from, to, filters }: View) => {
  const query = toListQuery(filters);
  const [everything, ranged, backlog] = await Promise.all([
    fetchKnowledge({}),
    fetchKnowledge({ ...query, from, to }),
    fetchKnowledge({ ...query, scope: 'undated' }),
  ]);
  return { everything, ranged: ranged.topics, backlog: backlog.topics };
};

/** Reads the view; the previous data stays on screen meanwhile. */
export const load = (store: Store, { ofType }: Bus) => {
  let latest = 0;
  return ofType('[TRIGGER]_LOAD').pipe(
    tap(({ view }) => {
      store.$error.reset();
      store.$view.set(view);
      store.$isLoading.set(true);
      store.$stale.set(false);
    }),
    map(({ view }) => ({
      view,
      seq: store.$writeSeq.get(),
      id: ++latest,
    })),
    switchMap(({ view, id, seq }) =>
      from(fetchView(view)).pipe(
        tap(({ everything, ranged, backlog }) => {
          // Writes in flight would be overwritten by older data: ask again.
          if (store.$pending.get() > 0 || store.$writeSeq.get() !== seq) {
            store.$stale.set(true);
            return;
          }
          store.$categories.set(everything.categories);
          store.$catalogs.set(everything.catalogs);
          store.$tags.set(everything.tags);
          store.$all.set(everything.topics);
          store.$ranged.set(ranged);
          store.$backlog.set(backlog);
          store.$loaded.set(true);
        }),
        catchError((error: unknown) => {
          store.$error.set(
            error instanceof Error
              ? error.message
              : 'Failed to load knowledge.',
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

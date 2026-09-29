import { catchError, concatMap, EMPTY, from, map, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { notify } from '../actions/notify';
import { putCategory } from '../../integration/repository';

export const update = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_UPDATE').pipe(
    map(({ category }) => ({
      category,
      previous: store.$categories.get().find((c) => c.id === category.id),
    })),
    tap(({ category }) => {
      store.$categories.set(
        store.$categories
          .get()
          .map((c) => (c.id === category.id ? category : c)),
      );
    }),
    concatMap(({ category, previous }) =>
      from(putCategory(category)).pipe(
        tap(() => notify(store, 'success', 'Zapisano zmiany.')),
        catchError(() => {
          if (previous) {
            store.$categories.set(
              store.$categories
                .get()
                .map((c) => (c.id === previous.id ? previous : c)),
            );
          }
          notify(store, 'error', 'Nie udało się zapisać zmian.');
          return EMPTY;
        }),
      ),
    ),
  );

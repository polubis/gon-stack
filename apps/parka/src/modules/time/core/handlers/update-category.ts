import { catchError, concatMap, EMPTY, from, map, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { errorMessage } from '@/shared/errors/error-message';
import { notify } from '../actions/notify';
import { write } from '../actions/pending';
import { putCategory } from '../../integration/repository';

export const updateCategory = (store: Store, bus: Bus) => {
  const { ofType, emit } = bus;
  return ofType('[TRIGGER]_UPDATE_CATEGORY').pipe(
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
      from(write(store, bus, () => putCategory(category))).pipe(
        tap(() =>
          notify(store, { tone: 'success', message: 'Zapisano zmiany.' }),
        ),
        catchError((error: unknown) => {
          if (previous)
            store.$categories.set(
              store.$categories
                .get()
                .map((c) => (c.id === previous.id ? previous : c)),
            );
          notify(store, {
            tone: 'error',
            title: 'Nie udało się zapisać zmian',
            code: 'TASK_CATEGORY_UPDATE_FAILED',
            description: errorMessage(error),
            retry: () => emit('[TRIGGER]_UPDATE_CATEGORY', { category }),
          });
          return EMPTY;
        }),
      ),
    ),
  );
};

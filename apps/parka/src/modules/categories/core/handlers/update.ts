import { catchError, concatMap, EMPTY, from, map, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { errorMessage } from '@/shared/errors/error-message';
import { notify } from '../actions/notify';
import { putCategory } from '../../integration/repository';

export const update = (store: Store, { ofType, emit }: Bus) =>
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
        tap(() =>
          notify(store, { tone: 'success', message: 'Zapisano zmiany.' }),
        ),
        catchError((error: unknown) => {
          if (previous) {
            store.$categories.set(
              store.$categories
                .get()
                .map((c) => (c.id === previous.id ? previous : c)),
            );
          }
          notify(store, {
            tone: 'error',
            title: 'Nie udało się zapisać zmian',
            code: 'CATEGORY_UPDATE_FAILED',
            description: errorMessage(error),
            retry: () => emit('[TRIGGER]_UPDATE', { category }),
          });
          return EMPTY;
        }),
      ),
    ),
  );

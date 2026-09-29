import { catchError, concatMap, EMPTY, from, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { notify } from '../actions/notify';
import { postCategory } from '../../integration/repository';

export const create = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_CREATE').pipe(
    tap(({ category }) => {
      store.$categories.set([...store.$categories.get(), category]);
    }),
    concatMap(({ category }) =>
      from(postCategory(category)).pipe(
        tap(() => notify(store, 'success', 'Dodano kategorię.')),
        catchError(() => {
          store.$categories.set(
            store.$categories.get().filter((c) => c.id !== category.id),
          );
          notify(store, 'error', 'Nie udało się dodać kategorii.');
          return EMPTY;
        }),
      ),
    ),
  );

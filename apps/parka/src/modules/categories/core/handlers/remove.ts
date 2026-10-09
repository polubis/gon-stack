import { catchError, concatMap, EMPTY, from, map, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { notify } from '../actions/notify';
import {
  CategoryInUseError,
  removeCategory,
} from '../../integration/repository';

export const remove = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_REMOVE').pipe(
    map(({ id }) => ({ id, previous: store.$categories.get() })),
    tap(({ id, previous }) => {
      store.$categories.set(previous.filter((c) => c.id !== id));
    }),
    concatMap(({ id, previous }) =>
      from(removeCategory(id)).pipe(
        tap(() => notify(store, 'success', 'Usunięto kategorię.')),
        catchError((error: unknown) => {
          store.$categories.set(previous);
          notify(
            store,
            'error',
            error instanceof CategoryInUseError
              ? 'Kategoria jest używana. Najpierw przepnij jej wydatki na inne kategorie (lub usuń jej limity), potem usuń kategorię.'
              : 'Nie udało się usunąć kategorii.',
          );
          return EMPTY;
        }),
      ),
    ),
  );

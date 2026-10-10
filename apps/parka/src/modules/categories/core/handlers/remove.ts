import { catchError, concatMap, EMPTY, from, map, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { errorMessage } from '@/shared/errors/error-message';
import { notify } from '../actions/notify';
import {
  CategoryInUseError,
  removeCategory,
} from '../../integration/repository';

export const remove = (store: Store, { ofType, emit }: Bus) =>
  ofType('[TRIGGER]_REMOVE').pipe(
    map(({ id }) => ({ id, previous: store.$categories.get() })),
    tap(({ id, previous }) => {
      store.$categories.set(previous.filter((c) => c.id !== id));
    }),
    concatMap(({ id, previous }) =>
      from(removeCategory(id)).pipe(
        tap(() =>
          notify(store, { tone: 'success', message: 'Usunięto kategorię.' }),
        ),
        catchError((error: unknown) => {
          store.$categories.set(previous);
          notify(
            store,
            error instanceof CategoryInUseError
              ? {
                  tone: 'error',
                  title: 'Kategoria jest używana',
                  code: 'CATEGORY_IN_USE',
                  description: errorMessage(error),
                }
              : {
                  tone: 'error',
                  title: 'Nie udało się usunąć kategorii',
                  code: 'CATEGORY_DELETE_FAILED',
                  description: errorMessage(error),
                  retry: () => emit('[TRIGGER]_REMOVE', { id }),
                },
          );
          return EMPTY;
        }),
      ),
    ),
  );

import { catchError, concatMap, EMPTY, from, map, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { errorMessage } from '@/shared/errors/error-message';
import { notify } from '../actions/notify';
import { write } from '../actions/pending';
import {
  CategoryInUseError,
  removeCategory,
} from '../../integration/repository';

export const deleteCategory = (store: Store, bus: Bus) => {
  const { ofType, emit } = bus;
  return ofType('[TRIGGER]_DELETE_CATEGORY').pipe(
    map(({ id }) => ({ id, previous: store.$categories.get() })),
    tap(({ id, previous }) => {
      store.$categories.set(previous.filter((c) => c.id !== id));
    }),
    concatMap(({ id, previous }) =>
      from(write(store, bus, () => removeCategory(id))).pipe(
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
                  code: 'TASK_CATEGORY_IN_USE',
                  description:
                    'Zadania lub cykle nadal używają tej kategorii. Najpierw przepnij je na inną.',
                }
              : {
                  tone: 'error',
                  title: 'Nie udało się usunąć kategorii',
                  code: 'TASK_CATEGORY_DELETE_FAILED',
                  description: errorMessage(error),
                  retry: () => emit('[TRIGGER]_DELETE_CATEGORY', { id }),
                },
          );
          return EMPTY;
        }),
      ),
    ),
  );
};

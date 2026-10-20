import { catchError, concatMap, EMPTY, from, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { errorMessage } from '@/shared/errors/error-message';
import { notify } from '../actions/notify';
import { write } from '../actions/pending';
import { postCategory } from '../../integration/repository';

export const createCategory = (store: Store, bus: Bus) => {
  const { ofType, emit } = bus;
  return ofType('[TRIGGER]_CREATE_CATEGORY').pipe(
    tap(({ category }) => {
      store.$categories.set([...store.$categories.get(), category]);
    }),
    concatMap(({ category }) =>
      from(write(store, bus, () => postCategory(category))).pipe(
        tap(() =>
          notify(store, { tone: 'success', message: 'Dodano kategorię.' }),
        ),
        catchError((error: unknown) => {
          store.$categories.set(
            store.$categories.get().filter((c) => c.id !== category.id),
          );
          notify(store, {
            tone: 'error',
            title: 'Nie udało się dodać kategorii',
            code: 'TASK_CATEGORY_CREATE_FAILED',
            description: errorMessage(error),
            retry: () => emit('[TRIGGER]_CREATE_CATEGORY', { category }),
          });
          return EMPTY;
        }),
      ),
    ),
  );
};

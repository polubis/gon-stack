import { catchError, concatMap, EMPTY, from, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { errorMessage } from '@/shared/errors/error-message';
import { notify } from '../actions/notify';
import { postCategory } from '../../integration/repository';

export const create = (store: Store, { ofType, emit }: Bus) =>
  ofType('[TRIGGER]_CREATE').pipe(
    tap(({ category }) => {
      store.$categories.set([...store.$categories.get(), category]);
    }),
    concatMap(({ category }) =>
      from(postCategory(category)).pipe(
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
            code: 'CATEGORY_CREATE_FAILED',
            description: errorMessage(error),
            retry: () => emit('[TRIGGER]_CREATE', { category }),
          });
          return EMPTY;
        }),
      ),
    ),
  );

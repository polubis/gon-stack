import { catchError, EMPTY, from, switchMap, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { removeExpense } from '../../integration/repository';

export const remove = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_DELETE').pipe(
    tap(({ id }) => {
      store.$expenses.set(store.$expenses.get().filter((e) => e.id !== id));
    }),
    switchMap(({ id }) =>
      from(removeExpense(id)).pipe(
        catchError((error) => {
          store.$error.set(
            error instanceof Error
              ? error.message
              : 'Failed to delete expense.',
          );
          return EMPTY;
        }),
      ),
    ),
  );

import { catchError, EMPTY, from, switchMap, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { putExpense } from '../../integration/repository';

export const update = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_UPDATE').pipe(
    tap(({ expense }) => {
      store.$expenses.set(
        store.$expenses.get().map((e) => (e.id === expense.id ? expense : e)),
      );
    }),
    switchMap(({ expense }) =>
      from(putExpense(expense)).pipe(
        catchError((error) => {
          store.$error.set(
            error instanceof Error ? error.message : 'Failed to save expense.',
          );
          return EMPTY;
        }),
      ),
    ),
  );

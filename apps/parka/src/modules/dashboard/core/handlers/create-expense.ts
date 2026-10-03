import { catchError, concatMap, EMPTY, from, map, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { notify } from '../actions/notify';
import { postExpense } from '../../integration/repository';

export const createExpense = (store: Store, { ofType, emit }: Bus) =>
  ofType('[TRIGGER]_CREATE_EXPENSE').pipe(
    map(({ expense, month }) => ({
      expense,
      month,
      previous: store.$expenses.get(),
    })),
    tap(({ expense }) => {
      store.$expenses.set([...store.$expenses.get(), expense]);
    }),
    concatMap(({ expense, month, previous }) =>
      from(postExpense(expense)).pipe(
        tap(() => {
          notify(store, 'success', 'Dodano wydatek.');
          emit('[FACT]_EXPENSE_CHANGED', { month });
        }),
        catchError(() => {
          store.$expenses.set(previous);
          notify(store, 'error', 'Nie udało się dodać wydatku.');
          return EMPTY;
        }),
      ),
    ),
  );

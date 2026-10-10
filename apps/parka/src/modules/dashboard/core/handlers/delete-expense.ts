import { catchError, concatMap, EMPTY, from, map, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { errorMessage } from '@/shared/errors/error-message';
import { notify } from '../actions/notify';
import { deleteExpense } from '../../integration/repository';

export const removeExpense = (store: Store, { ofType, emit }: Bus) =>
  ofType('[TRIGGER]_DELETE_EXPENSE').pipe(
    map(({ id, month }) => ({ id, month, previous: store.$expenses.get() })),
    tap(({ id }) => {
      store.$expenses.set(store.$expenses.get().filter((e) => e.id !== id));
    }),
    concatMap(({ id, month, previous }) =>
      from(deleteExpense(id)).pipe(
        tap(() => {
          notify(store, { tone: 'success', message: 'Usunięto wydatek.' });
          emit('[FACT]_EXPENSE_CHANGED', { month });
        }),
        catchError((error: unknown) => {
          store.$expenses.set(previous);
          notify(store, {
            tone: 'error',
            title: 'Nie udało się usunąć wydatku',
            code: 'EXPENSE_DELETE_FAILED',
            description: errorMessage(error),
            retry: () => emit('[TRIGGER]_DELETE_EXPENSE', { id, month }),
          });
          return EMPTY;
        }),
      ),
    ),
  );

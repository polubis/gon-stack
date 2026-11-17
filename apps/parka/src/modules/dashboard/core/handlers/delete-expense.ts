import { catchError, concatMap, EMPTY, from, map, tap } from 'rxjs';
import { inScope } from '@/shared/recurring/occurrences';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { errorMessage } from '@/shared/errors/error-message';
import { notify } from '../actions/notify';
import { deleteExpense } from '../../integration/repository';

export const removeExpense = (store: Store, { ofType, emit }: Bus) =>
  ofType('[TRIGGER]_DELETE_EXPENSE').pipe(
    map(({ id, period, scope }) => ({
      id,
      period,
      scope,
      previous: store.$expenses.get(),
    })),
    tap(({ id, scope, previous }) => {
      const opened = previous.find((e) => e.id === id);
      // Which other occurrences of the series go too is decided from the opened one.
      const reached = (e: (typeof previous)[number]): boolean => {
        if (e.id === id) return scope !== 'following';
        return (
          scope !== 'this' &&
          opened?.recurringId != null &&
          opened.occurrenceDate != null &&
          e.recurringId === opened.recurringId &&
          e.occurrenceDate != null &&
          inScope(scope, e.occurrenceDate, opened.occurrenceDate)
        );
      };
      store.$expenses.set(previous.filter((e) => !reached(e)));
    }),
    concatMap(({ id, period, scope, previous }) =>
      from(deleteExpense(id, scope)).pipe(
        tap(() => {
          notify(store, { tone: 'success', message: 'Usunięto wydatek.' });
          emit('[FACT]_EXPENSE_CHANGED', { period });
        }),
        catchError((error: unknown) => {
          store.$expenses.set(previous);
          notify(store, {
            tone: 'error',
            title: 'Nie udało się usunąć wydatku',
            code: 'EXPENSE_DELETE_FAILED',
            description: errorMessage(error),
            retry: () =>
              emit('[TRIGGER]_DELETE_EXPENSE', { id, period, scope }),
          });
          return EMPTY;
        }),
      ),
    ),
  );

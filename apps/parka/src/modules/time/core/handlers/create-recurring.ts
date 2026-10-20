import { catchError, concatMap, EMPTY, from, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { errorMessage } from '@/shared/errors/error-message';
import { notify } from '../actions/notify';
import { write } from '../actions/pending';
import { postRecurring } from '../../integration/repository';

/** The server makes the tasks of a rule; the view reloads to show them. */
export const createRecurring = (store: Store, bus: Bus) => {
  const { ofType, emit } = bus;
  return ofType('[TRIGGER]_CREATE_RECURRING').pipe(
    concatMap(({ recurring }) =>
      from(write(store, bus, () => postRecurring(recurring))).pipe(
        tap(() => {
          notify(store, {
            tone: 'success',
            message: 'Dodano zadanie cykliczne.',
          });
          const range = store.$range.get();
          if (range) emit('[TRIGGER]_LOAD', range);
        }),
        catchError((error: unknown) => {
          notify(store, {
            tone: 'error',
            title: 'Nie udało się dodać zadania cyklicznego',
            code: 'RECURRING_CREATE_FAILED',
            description: errorMessage(error),
            retry: () => emit('[TRIGGER]_CREATE_RECURRING', { recurring }),
          });
          return EMPTY;
        }),
      ),
    ),
  );
};

import { catchError, EMPTY, exhaustMap, finalize, from, map, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { errorMessage } from '@/shared/errors/error-message';
import { notify } from '../actions/notify';
import { NOTICES } from '../../configuration/constraints';
import { monthOfDateInput, toDateInput } from '../../domain/format';
import { postRecurring } from '../../integration/repository';

/** Ignores extra saves while one is in flight (no duplicate charges). */
export const createRecurring = (store: Store, { ofType, emit }: Bus) =>
  ofType('[TRIGGER]_CREATE_RECURRING').pipe(
    map(({ recurring }) => recurring),
    exhaustMap((recurring) => {
      store.$saving.set(true);

      return from(postRecurring(recurring)).pipe(
        tap(() =>
          store.$saved.set(
            monthOfDateInput(toDateInput(recurring.nextPaymentDate)),
          ),
        ),
        catchError((error: unknown) => {
          notify(store, {
            ...NOTICES.recurringFailed,
            description: errorMessage(error),
            tone: 'error',
            retry: () => emit('[TRIGGER]_CREATE_RECURRING', { recurring }),
          });
          return EMPTY;
        }),
        finalize(() => store.$saving.reset()),
      );
    }),
  );

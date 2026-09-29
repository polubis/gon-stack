import { catchError, EMPTY, exhaustMap, finalize, from, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { signUp } from '../../integration/repository';
import { MESSAGES } from '../../configuration/constraints';

export const submit = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_SUBMIT').pipe(
    exhaustMap(({ credentials }) => {
      store.$pending.set(true);
      store.$error.reset();
      store.$awaitingConfirmation.reset();

      return from(signUp(credentials)).pipe(
        tap((result) => {
          switch (result.status) {
            case 'redirected':
              store.$redirected.set(true);
              return;
            case 'pending-confirmation':
              store.$awaitingConfirmation.set(true);
              return;
            case 'rejected':
              store.$error.set(result.message);
              return;
            default: {
              const exhaustive: never = result;
              return exhaustive;
            }
          }
        }),
        catchError(() => {
          store.$error.set(MESSAGES.unreachable);
          return EMPTY;
        }),
        finalize(() => store.$pending.reset()),
      );
    }),
  );

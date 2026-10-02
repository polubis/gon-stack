import { catchError, EMPTY, finalize, from, map, switchMap, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { fetchRecurring } from '../../integration/repository';

export const loadRecurring = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_LOAD_RECURRING').pipe(
    tap(() => {
      store.$recurringError.reset();
    }),
    map(() => new AbortController()),
    switchMap((ctrl) =>
      from(fetchRecurring(ctrl.signal)).pipe(
        tap((recurring) => {
          store.$recurring.set(recurring);
        }),
        catchError((error) => {
          const isAbort =
            error instanceof DOMException && error.name === 'AbortError';

          if (!isAbort) {
            store.$recurringError.set(
              error instanceof Error
                ? error.message
                : 'Failed to load recurring expenses.',
            );
          }

          return EMPTY;
        }),
        finalize(() => {
          store.$recurringInitializing.set(false);
          ctrl.abort();
        }),
      ),
    ),
  );

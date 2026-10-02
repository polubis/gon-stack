import { catchError, EMPTY, finalize, from, map, switchMap, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { fetchGoals, fetchLimits } from '../../integration/repository';

export const loadLimits = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_LOAD_LIMITS').pipe(
    tap(() => {
      store.$limitsLoading.set(true);
      store.$limitsError.reset();
    }),
    map(() => new AbortController()),
    switchMap((ctrl) =>
      from(
        Promise.all([fetchLimits(ctrl.signal), fetchGoals(ctrl.signal)]),
      ).pipe(
        tap(([limits, goals]) => {
          store.$limits.set(limits);
          store.$goals.set(goals);
        }),
        catchError((error) => {
          const isAbort =
            error instanceof DOMException && error.name === 'AbortError';

          if (!isAbort) {
            store.$limitsError.set(
              error instanceof Error ? error.message : 'Failed to load limits.',
            );
          }

          return EMPTY;
        }),
        finalize(() => {
          store.$limitsInitializing.set(false);
          store.$limitsLoading.reset();
          ctrl.abort();
        }),
      ),
    ),
  );

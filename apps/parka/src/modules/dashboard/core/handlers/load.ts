import {
  catchError,
  defer,
  EMPTY,
  finalize,
  from,
  map,
  switchMap,
  tap,
} from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { fetchDashboard } from '../../integration/repository';

export const load = (store: Store, { ofType }: Bus) =>
  ofType('[TASK]_LOAD').pipe(
    tap(() => {
      store.$initialized.set(true);
      store.$error.reset();
    }),
    map(({ month }) => ({ month, ctrl: new AbortController() })),
    switchMap(({ month, ctrl }) =>
      // Deferred: runs after switchMap dropped the previous load, whose
      // `finalize` resets the flag, so the flag is never reset under a live load.
      defer(() => {
        store.$loading.set(true);
        return from(fetchDashboard(month, ctrl.signal));
      }).pipe(
        tap((data) => {
          store.$data.set(data.summary);
          store.$expenses.set(data.expenses);
          store.$categories.set(data.categories);
          store.$limits.set(data.limits);
          store.$goals.set(data.goals);
          store.$recurring.set(data.recurring);
        }),
        catchError((error) => {
          const isAbort =
            error instanceof DOMException && error.name === 'AbortError';

          if (!isAbort) {
            store.$error.set(
              error instanceof Error
                ? error.message
                : 'Failed to load dashboard.',
            );
          }

          return EMPTY;
        }),
        finalize(() => {
          store.$loading.reset();
          ctrl.abort();
        }),
      ),
    ),
  );

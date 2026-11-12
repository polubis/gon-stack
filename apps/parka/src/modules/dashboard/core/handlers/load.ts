import {
  catchError,
  defer,
  EMPTY,
  filter,
  finalize,
  from,
  switchMap,
  tap,
} from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { fetchDashboard } from '../../integration/repository';

/** The first load reads everything; later ones only move the shown period. */
export const load = (store: Store, { ofType }: Bus) =>
  ofType('[TASK]_LOAD').pipe(
    tap(() => {
      store.$initialized.set(true);
      store.$error.reset();
    }),
    tap(({ period }) => store.$period.set(period)),
    filter(() => !store.$ready.get()),
    switchMap(() =>
      // Deferred: runs after switchMap dropped the previous load, whose
      // `finalize` resets the flag, so the flag is never reset under a live load.
      defer(() => {
        store.$loading.set(true);
        return from(fetchDashboard());
      }).pipe(
        tap((data) => {
          store.$expenses.set(data.expenses);
          store.$categories.set(data.categories);
          store.$limits.set(data.limits);
          store.$recurring.set(data.recurring);
          store.$ready.set(true);
        }),
        catchError((error) => {
          store.$error.set(
            error instanceof Error
              ? error.message
              : 'Failed to load dashboard.',
          );

          return EMPTY;
        }),
        finalize(() => {
          store.$loading.reset();
        }),
      ),
    ),
  );

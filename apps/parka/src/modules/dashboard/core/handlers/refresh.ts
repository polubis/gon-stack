import { catchError, defer, EMPTY, from, switchMap, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import {
  fetchDashboard,
  resetDashboardReads,
} from '../../integration/repository';

/** Reloads everything after an outside change: no loading state, no error. */
export const refresh = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_REFRESH').pipe(
    switchMap(() =>
      defer(() => {
        resetDashboardReads();
        return from(fetchDashboard());
      }).pipe(
        tap((data) => {
          store.$expenses.set(data.expenses);
          store.$categories.set(data.categories);
          store.$limits.set(data.limits);
          store.$recurring.set(data.recurring);
          store.$ready.set(true);
        }),
        catchError(() => EMPTY),
      ),
    ),
  );

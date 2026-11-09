import { catchError, defer, EMPTY, from, map, switchMap, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import {
  fetchDashboard,
  resetDashboardReads,
} from '../../integration/repository';

/** Reloads the shown period after an outside change: no loading state, no error. */
export const refresh = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_REFRESH').pipe(
    map(() => store.$period.get()),
    switchMap((period) => {
      if (!period) return EMPTY;
      return defer(() => {
        resetDashboardReads();
        return from(fetchDashboard(period));
      }).pipe(
        tap((data) => {
          if (store.$period.get() !== period) return;
          store.$data.set(data.summary);
          store.$expenses.set(data.expenses);
          store.$categories.set(data.categories);
          store.$limits.set(data.limits);
          store.$recurring.set(data.recurring);
        }),
        catchError(() => EMPTY),
      );
    }),
  );

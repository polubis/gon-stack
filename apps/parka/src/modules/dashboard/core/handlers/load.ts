import { catchError, defer, EMPTY, finalize, from, switchMap, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { neighbourPeriods, todayDay } from '@/shared/period/period';
import { fetchDashboard, prefetchSummary } from '../../integration/repository';

export const load = (store: Store, { ofType }: Bus) =>
  ofType('[TASK]_LOAD').pipe(
    tap(() => {
      store.$initialized.set(true);
      store.$error.reset();
    }),
    switchMap(({ period }) =>
      // Deferred: runs after switchMap dropped the previous load, whose
      // `finalize` resets the flag, so the flag is never reset under a live load.
      defer(() => {
        store.$loading.set(true);
        return from(fetchDashboard(period));
      }).pipe(
        tap((data) => {
          store.$data.set(data.summary);
          store.$expenses.set(data.expenses);
          store.$categories.set(data.categories);
          store.$limits.set(data.limits);
          store.$recurring.set(data.recurring);
          // Idle time warms the periods a swipe or arrow reaches next.
          neighbourPeriods(period, todayDay(), false).forEach(prefetchSummary);
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

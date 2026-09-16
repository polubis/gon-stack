import { catchError, EMPTY, from, switchMap, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { fetchDashboardSummary } from '../../integration/repository';

export const loadSummary = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_LOAD_SUMMARY').pipe(
    switchMap(({ month }) =>
      from(fetchDashboardSummary(month)).pipe(
        tap((summary) => {
          if (summary) store.$fetchedSummary.set({ month, summary });
        }),
        catchError(() => EMPTY),
      ),
    ),
  );

import {
  catchError,
  EMPTY,
  finalize,
  from,
  map,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { fetchSummary } from '../../integration/repository';

/**
 * Revalidates the summary alone, in the background: the rest of the data is
 * already right (optimistic), so no loading state and no skeleton. A full load
 * supersedes it, so a stale summary never lands over a newer month.
 */
export const refreshSummary = (store: Store, { ofType }: Bus) =>
  ofType('[TASK]_REFRESH_SUMMARY').pipe(
    map(({ month }) => ({ month, ctrl: new AbortController() })),
    switchMap(({ month, ctrl }) =>
      from(fetchSummary(month, ctrl.signal)).pipe(
        tap((summary) => store.$data.set(summary)),
        takeUntil(ofType('[TASK]_LOAD')),
        // The summary stays as it was; the next full load corrects it.
        catchError(() => EMPTY),
        finalize(() => ctrl.abort()),
      ),
    ),
  );

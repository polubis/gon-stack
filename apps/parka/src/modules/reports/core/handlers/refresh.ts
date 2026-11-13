import { catchError, EMPTY, from, switchMap, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { setReportData } from '../actions/set-report-data';
import {
  fetchCategories,
  fetchExpenses,
  fetchRecurring,
} from '../../integration/repository';

/** Reloads the report data after an outside change: no loading state, no error. */
export const refresh = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_REFRESH').pipe(
    switchMap(() => {
      const ctrl = new AbortController();
      return from(
        Promise.all([
          fetchExpenses(ctrl.signal),
          fetchCategories(ctrl.signal),
          fetchRecurring(ctrl.signal),
        ]),
      ).pipe(
        tap((data) => setReportData(store, data)),
        catchError(() => EMPTY),
      );
    }),
  );

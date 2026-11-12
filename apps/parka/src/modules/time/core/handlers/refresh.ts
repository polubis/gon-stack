import { catchError, EMPTY, from, map, switchMap, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { fetchTime, resetTimeReads } from '../../integration/repository';
import { applyData } from '../actions/apply-data';

/** Reads everything again after an outside change: no loading state, no error. */
export const refresh = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_REFRESH').pipe(
    map(() => store.$horizon.get()),
    switchMap((horizon) => {
      if (!horizon) return EMPTY;
      const seq = store.$writeSeq.get();
      resetTimeReads();
      return from(fetchTime(horizon)).pipe(
        tap((data) => {
          // A write in flight: let its end repeat the load.
          if (!applyData(store, horizon, data, seq)) store.$stale.set(true);
        }),
        catchError(() => EMPTY),
      );
    }),
  );

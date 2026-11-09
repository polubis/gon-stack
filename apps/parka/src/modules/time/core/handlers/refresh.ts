import { catchError, EMPTY, from, map, switchMap, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { fetchTime, resetTimeReads } from '../../integration/repository';
import { applyData } from '../actions/apply-data';

/** Reloads the current range after an outside change: no loading state, no error. */
export const refresh = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_REFRESH').pipe(
    map(() => store.$range.get()),
    switchMap((range) => {
      if (!range) return EMPTY;
      const seq = store.$writeSeq.get();
      resetTimeReads();
      return from(fetchTime(range.from, range.to)).pipe(
        tap((data) => {
          const current = store.$range.get();
          if (current?.from === range.from && current.to === range.to)
            // A write in flight: let its end repeat the load.
            if (!applyData(store, range, data, seq)) store.$stale.set(true);
        }),
        catchError(() => EMPTY),
      );
    }),
  );

import {
  catchError,
  EMPTY,
  filter,
  finalize,
  from,
  map,
  switchMap,
  tap,
} from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { fetchTime } from '../../integration/repository';
import { applyData } from '../actions/apply-data';
import { horizonFor } from '../actions/horizon';

/**
 * Reads every task once; moving between ranges reads nothing again. Only a
 * range past the horizon (recurring rules not yet turned into tasks) reads.
 */
export const load = (store: Store, { ofType }: Bus) => {
  let latest = 0;
  return ofType('[TRIGGER]_LOAD').pipe(
    tap(({ kind, from, to }) => {
      store.$error.reset();
      store.$range.set({ kind, from, to });
    }),
    filter(({ to }) => {
      const horizon = store.$horizon.get();
      return horizon === null || to > horizon || store.$stale.get();
    }),
    tap(() => {
      store.$isLoading.set(true);
      store.$stale.set(false);
    }),
    map(({ to }) => ({
      horizon: horizonFor(to),
      seq: store.$writeSeq.get(),
      id: ++latest,
    })),
    switchMap(({ horizon, id, seq }) =>
      from(fetchTime(horizon)).pipe(
        tap((data) => {
          if (!applyData(store, horizon, data, seq)) store.$stale.set(true);
        }),
        catchError((error: unknown) => {
          store.$error.set(
            error instanceof Error ? error.message : 'Failed to load tasks.',
          );

          return EMPTY;
        }),
        finalize(() => {
          // A cancelled request must not end the loading of its successor.
          if (id !== latest) return;
          store.$initializing.set(false);
          if (!store.$stale.get()) store.$isLoading.reset();
        }),
      ),
    ),
  );
};

import { EMPTY, interval, switchMap, tap } from 'rxjs';
import type { Bus } from '../bus';
import type { Store } from '../store';
import { resolveCurrentRound } from '../round';

export const tickTimer = (store: Store, bus: Bus) =>
  bus.ofType('[TASK]_RUN_TIMER').pipe(
    switchMap(({ seconds }) => {
      if (seconds <= 0) {
        return EMPTY;
      }

      store.$secondsLeft.set(seconds);
      return interval(1000).pipe(
        tap(() => {
          if (store.$status.get() === 'paused') {
            return;
          }

          if (store.$status.get() !== 'answering') {
            return;
          }

          const next = store.$secondsLeft.get() - 1;
          store.$secondsLeft.set(Math.max(next, 0));

          if (next <= 0) {
            resolveCurrentRound(store, bus);
          }
        }),
      );
    }),
  );

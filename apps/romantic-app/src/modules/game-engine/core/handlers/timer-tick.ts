import { tap } from 'rxjs';
import type { OfType } from '../registry';
import type { Store } from '../store';

export const timerTick = (store: Store, ofType: OfType) =>
  ofType('[FACT]_TIMER_TICK').pipe(
    tap((remaining) => {
      store.$timerRemaining.set(Math.max(0, remaining));
    }),
  );

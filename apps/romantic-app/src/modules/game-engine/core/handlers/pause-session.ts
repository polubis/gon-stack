import { tap } from 'rxjs';
import type { OfType } from '../registry';
import type { Store } from '../store';

// TODO: simple pause only changes phase and lets `takeUntil(PAUSE)` stop the
// countdown and partner simulation. Future improvement: actually freeze the
// timer, persist remaining time, and resume from exactly where we paused.
export const pauseSession = (store: Store, ofType: OfType) =>
  ofType('[TRIGGER]_PAUSE_SESSION').pipe(
    tap(() => {
      if (store.$isPaused.get()) return;
      store.$phasePrePause.set(store.$phase.get());
      store.$isPaused.set(true);
      store.$phase.set('session_paused');
    }),
  );

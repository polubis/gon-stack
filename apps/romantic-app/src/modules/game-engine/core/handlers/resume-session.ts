import { tap } from 'rxjs';
import type { OfType } from '../registry';
import type { Store } from '../store';

// TODO: the current simple pause stops the timer (via takeUntil). On resume we
// restore the previous phase, but the countdown does not restart. Future
// improvement: restart the timer with `$timerRemaining` and re-dispatch the
// partner simulation if it was still pending.
export const resumeSession = (store: Store, ofType: OfType) =>
  ofType('[TRIGGER]_RESUME_SESSION').pipe(
    tap(() => {
      if (!store.$isPaused.get()) return;
      const previous = store.$phasePrePause.get() ?? 'category_selection';
      store.$phase.set(previous);
      store.$phasePrePause.reset();
      store.$isPaused.set(false);
    }),
  );

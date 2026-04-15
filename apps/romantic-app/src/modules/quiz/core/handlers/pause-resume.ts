import { merge, tap } from 'rxjs';
import type { Bus } from '../bus';
import type { Store } from '../store';

export const pauseResume = (store: Store, bus: Bus) => {
  const pause$ = bus.ofType('[TRIGGER]_PAUSE').pipe(
    tap(() => {
      if (store.$status.get() === 'answering') {
        store.$status.set('paused');
      }
    }),
  );

  const resume$ = bus.ofType('[TRIGGER]_RESUME').pipe(
    tap(() => {
      if (store.$status.get() === 'paused') {
        store.$status.set('answering');
      }
    }),
  );

  const end$ = bus.ofType('[TRIGGER]_END_SESSION').pipe(
    tap(() => {
      store.$status.set('finished');
      const localPlayerId = store.$localPlayerId.get();
      if (localPlayerId) {
        store.$winnerId.set(localPlayerId);
      }
    }),
  );

  return merge(pause$, resume$, end$);
};

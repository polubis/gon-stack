import { tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';

export const wsGameEnded = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_WS_GAME_ENDED').pipe(
    tap((payload) => {
      store.$gameSummary.set(payload);

      const current = store.$gamePlayState.get();

      if (current) {
        store.$gamePlayState.set({ ...current, status: 'game_finished' });
      }

      store.$ws.get()?.close();
      store.$ws.set(null);
    }),
  );

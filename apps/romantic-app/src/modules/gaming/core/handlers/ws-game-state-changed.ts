import { tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';

export const wsGameStateChanged = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_WS_GAME_STATE_CHANGED').pipe(
    tap((payload) => {
      store.$gamePlayState.set(payload);
    }),
  );

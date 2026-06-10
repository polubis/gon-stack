import { tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import type { IRepository } from '../ports/repository';

// Navigation to GamePlay is handled by the router reacting to $activeGameId in state,
// which is derived from $gamePlayState. The WebSocket connection and game play state
// are set up separately by the game play handlers once the user joins.
export const joinGameSuccess = (store: Store, { ofType }: Bus, _repository: IRepository) =>
  ofType('[TRIGGER]_JOIN_GAME_SUCCESS').pipe(
    tap(() => {
      store.$isLoading.set(false);
    }),
  );

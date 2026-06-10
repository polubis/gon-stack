import { catchError, EMPTY, finalize, from, switchMap, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import type { IRepository } from '../ports/repository';

export const startGame = (store: Store, bus: Bus, repository: IRepository) =>
  bus.ofType('[TRIGGER]_START_GAME').pipe(
    tap(() => {
      store.$error.set(null);
      store.$isLoading.set(true);
    }),
    switchMap(({ gameId }) => {
      const ctrl = new AbortController();

      return from(repository.updateGameStatus(gameId, 'game_pending', ctrl.signal)).pipe(
        tap((updatedGame) => {
          store.$games.set(
            store.$games.get().map((game) => (game.id === gameId ? updatedGame : game)),
          );
        }),
        catchError((error) => {
          store.$error.set(error instanceof Error ? error.message : 'Unknown error');
          return EMPTY;
        }),
        finalize(() => {
          store.$isLoading.set(false);
          ctrl.abort();
        }),
      );
    }),
  );

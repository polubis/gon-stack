import { catchError, EMPTY, finalize, from, switchMap, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import type { IRepository } from '../ports/repository';

export const joinGame = (store: Store, bus: Bus, repository: IRepository) =>
  bus.ofType('[TRIGGER]_JOIN_GAME').pipe(
    tap(() => {
      store.$error.set(null);
      store.$isLoading.set(true);
    }),
    switchMap(({ gameId }) => {
      const ctrl = new AbortController();

      return from(repository.joinGame(gameId, ctrl.signal)).pipe(
        tap(() => {
          bus.trigger('[TRIGGER]_JOIN_GAME_SUCCESS', { gameId });
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

import { catchError, EMPTY, finalize, forkJoin, from, switchMap, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import type { IRepository } from '../ports/repository';

export const gamesWallInit = (store: Store, { ofType }: Bus, repository: IRepository) =>
  ofType('[TRIGGER]_GAMES_WALL_INIT').pipe(
    tap(({ roomId }) => {
      store.$activeRoomId.set(roomId);
      store.$error.set(null);
      store.$games.set([]);
      store.$gamesTotal.set(0);
      store.$participants.set([]);
      store.$participantsTotal.set(0);
      store.$isLoading.set(true);
    }),
    switchMap(({ roomId }) => {
      const ctrl = new AbortController();

      return forkJoin([
        from(repository.getGames(roomId, store.$gameFilters.get(), ctrl.signal)),
        from(repository.getParticipants(roomId, store.$participantFilters.get(), ctrl.signal)),
      ]).pipe(
        tap(([gamesResult, participantsResult]) => {
          store.$games.set(gamesResult.items);
          store.$gamesTotal.set(gamesResult.total);
          store.$participants.set(participantsResult.items);
          store.$participantsTotal.set(participantsResult.total);
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

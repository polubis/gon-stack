import { catchError, EMPTY, finalize, from, switchMap, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import type { IRepository } from '../ports/repository';
import type { RoomId } from '../../domain/models';

export const createGameSubmit = (store: Store, bus: Bus, repository: IRepository) =>
  bus.ofType('[TRIGGER]_CREATE_GAME_SUBMIT').pipe(
    tap(() => {
      store.$error.set(null);
      store.$isLoading.set(true);
    }),
    switchMap((payload) => {
      const ctrl = new AbortController();
      const roomId = store.$activeRoomId.get() as RoomId;

      return from(repository.createGame(roomId, payload, ctrl.signal)).pipe(
        tap((game) => {
          bus.trigger('[TRIGGER]_CREATE_GAME_SUCCESS', game);
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

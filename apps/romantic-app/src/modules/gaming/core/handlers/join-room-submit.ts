import { catchError, EMPTY, finalize, from, switchMap, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import type { IRepository } from '../ports/repository';

export const joinRoomSubmit = (store: Store, { ofType, trigger }: Bus, repository: IRepository) =>
  ofType('[TRIGGER]_JOIN_ROOM_SUBMIT').pipe(
    tap(() => {
      store.$error.reset();
      store.$isLoading.set(true);
    }),
    switchMap((payload) => {
      const ctrl = new AbortController();
      const { roomId, roomCode, roomPassword } = payload;

      return from(repository.joinRoom(roomId, { roomCode, roomPassword }, ctrl.signal)).pipe(
        tap((participant) => {
          trigger('[TRIGGER]_JOIN_ROOM_SUCCESS', participant);
        }),
        catchError((error) => {
          store.$error.set(error instanceof Error ? error.message : 'Unknown error');
          return EMPTY;
        }),
        finalize(() => {
          store.$isLoading.reset();
          ctrl.abort();
        }),
      );
    }),
  );

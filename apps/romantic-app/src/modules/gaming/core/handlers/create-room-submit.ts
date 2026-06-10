import { catchError, EMPTY, finalize, from, switchMap, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import type { IRepository } from '../ports/repository';

export const createRoomSubmit = (store: Store, { ofType, trigger }: Bus, repository: IRepository) =>
  ofType('[TRIGGER]_CREATE_ROOM_SUBMIT').pipe(
    tap(() => {
      store.$error.reset();
      store.$isLoading.set(true);
    }),
    switchMap((payload) => {
      const ctrl = new AbortController();

      return from(repository.createRoom(payload, ctrl.signal)).pipe(
        tap((room) => {
          trigger('[TRIGGER]_CREATE_ROOM_SUCCESS', room);
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

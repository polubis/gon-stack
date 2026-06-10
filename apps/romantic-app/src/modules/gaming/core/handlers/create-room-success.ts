import { tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import type { IRepository } from '../ports/repository';

export const createRoomSuccess = (store: Store, { ofType }: Bus, _repository: IRepository) =>
  ofType('[TRIGGER]_CREATE_ROOM_SUCCESS').pipe(
    tap((room) => {
      store.$rooms.set([room, ...store.$rooms.get()]);
      store.$roomsTotal.set(store.$roomsTotal.get() + 1);
      store.$isCreateRoomOpen.set(false);
    }),
  );

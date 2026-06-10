import { tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import type { IRepository } from '../ports/repository';

export const createRoomOpen = (store: Store, { ofType }: Bus, _repository: IRepository) =>
  ofType('[TRIGGER]_CREATE_ROOM_OPEN').pipe(
    tap(() => {
      store.$isCreateRoomOpen.set(true);
    }),
  );

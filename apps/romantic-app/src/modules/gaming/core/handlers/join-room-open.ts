import { tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import type { IRepository } from '../ports/repository';

export const joinRoomOpen = (store: Store, { ofType }: Bus, _repository: IRepository) =>
  ofType('[TRIGGER]_JOIN_ROOM_OPEN').pipe(
    tap(() => {
      store.$isJoinRoomOpen.set(true);
    }),
  );

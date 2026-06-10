import { tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import type { IRepository } from '../ports/repository';

export const joinRoomSuccess = (store: Store, { ofType }: Bus, _repository: IRepository) =>
  ofType('[TRIGGER]_JOIN_ROOM_SUCCESS').pipe(
    tap(() => {
      store.$isJoinRoomOpen.set(false);
      // Navigation to the games wall is handled reactively — the router
      // observes $activeRoomId changes; set it from the triggering context
      // (roomId is carried by the preceding JOIN_ROOM_SUBMIT payload, not by
      // the Participant model, so navigation is deferred to the router layer).
    }),
  );

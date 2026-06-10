import { tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';

export const leaveGameRequest = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_LEAVE_GAME_REQUEST').pipe(
    tap(() => {
      store.$isLeaveGameConfirmVisible.set(true);
    }),
  );

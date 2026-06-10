import { tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';

export const leaveGameCancel = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_LEAVE_GAME_CANCEL').pipe(
    tap(() => {
      store.$isLeaveGameConfirmVisible.set(false);
    }),
  );

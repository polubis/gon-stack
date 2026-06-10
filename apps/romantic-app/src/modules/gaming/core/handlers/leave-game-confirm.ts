import { catchError, EMPTY, finalize, from, switchMap, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import type { IRepository } from '../ports/repository';

export const leaveGameConfirm = (store: Store, { ofType }: Bus, repository: IRepository) =>
  ofType('[TRIGGER]_LEAVE_GAME_CONFIRM').pipe(
    tap(() => {
      store.$error.reset();
      store.$isLoading.set(true);
    }),
    switchMap(({ gameId, userId }) => {
      const ctrl = new AbortController();

      return from(repository.leaveGame(gameId, userId, ctrl.signal)).pipe(
        tap(() => {
          store.$ws.get()?.close();
          store.$ws.set(null);
          store.$gamePlayState.reset();
          store.$isLeaveGameConfirmVisible.set(false);
        }),
        catchError((error) => {
          store.$error.set(error instanceof Error ? error.message : 'Failed to leave game.');
          return EMPTY;
        }),
        finalize(() => {
          store.$isLoading.reset();
          ctrl.abort();
        }),
      );
    }),
  );

import { catchError, EMPTY, finalize, from, switchMap, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import type { IRepository } from '../ports/repository';

export const removeParticipant = (store: Store, { ofType }: Bus, repository: IRepository) =>
  ofType('[TRIGGER]_REMOVE_PARTICIPANT').pipe(
    tap(() => {
      store.$error.set(null);
      store.$isLoading.set(true);
    }),
    switchMap(({ roomId, userId }) => {
      const ctrl = new AbortController();

      return from(repository.removeParticipant(roomId, userId, ctrl.signal)).pipe(
        tap(() => {
          store.$participants.set(
            store.$participants.get().filter((p) => p.userId !== userId),
          );
          store.$participantsTotal.set(store.$participantsTotal.get() - 1);
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

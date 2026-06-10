import { catchError, EMPTY, finalize, from, switchMap, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import type { IRepository } from '../ports/repository';

export const roomsWallInit = (store: Store, { ofType }: Bus, repository: IRepository) =>
  ofType('[TRIGGER]_ROOMS_WALL_INIT').pipe(
    tap(() => {
      store.$error.reset();
      store.$rooms.reset();
      store.$roomsTotal.reset();
      store.$isLoading.set(true);
    }),
    switchMap(() => {
      const ctrl = new AbortController();

      return from(repository.getRooms(store.$gameFilters.get(), ctrl.signal)).pipe(
        tap((result) => {
          store.$rooms.set(result.items);
          store.$roomsTotal.set(result.total);
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

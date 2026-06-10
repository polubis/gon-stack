import { catchError, EMPTY, finalize, from, switchMap, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import type { IRepository } from '../ports/repository';

export const gameSummaryInit = (store: Store, { ofType }: Bus, repository: IRepository) =>
  ofType('[TRIGGER]_GAME_SUMMARY_INIT').pipe(
    tap(() => {
      store.$error.reset();
      store.$gameSummary.reset();
      store.$isLoading.set(true);
    }),
    switchMap(({ gameId }) => {
      const ctrl = new AbortController();

      return from(repository.getGameSummary(gameId, ctrl.signal)).pipe(
        tap((result) => {
          store.$gameSummary.set(result);
        }),
        catchError((error) => {
          store.$error.set(error instanceof Error ? error.message : 'Failed to load game summary.');
          return EMPTY;
        }),
        finalize(() => {
          store.$isLoading.reset();
          ctrl.abort();
        }),
      );
    }),
  );

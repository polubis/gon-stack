import { tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import type { IRepository } from '../ports/repository';

export const createGameSuccess = (store: Store, { ofType }: Bus, _repository: IRepository) =>
  ofType('[TRIGGER]_CREATE_GAME_SUCCESS').pipe(
    tap((game) => {
      store.$games.set([...store.$games.get(), game]);
      store.$gamesTotal.set(store.$gamesTotal.get() + 1);
      store.$isCreateGameOpen.set(false);
    }),
  );

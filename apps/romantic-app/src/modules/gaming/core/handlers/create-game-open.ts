import { tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import type { IRepository } from '../ports/repository';

export const createGameOpen = (store: Store, { ofType }: Bus, _repository: IRepository) =>
  ofType('[TRIGGER]_CREATE_GAME_OPEN').pipe(
    tap(() => {
      store.$isCreateGameOpen.set(true);
    }),
  );

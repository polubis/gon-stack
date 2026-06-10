import { tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';

export const wsScoresUpdated = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_WS_SCORES_UPDATED').pipe(
    tap(({ scores }) => {
      const current = store.$gamePlayState.get();

      if (!current) return;

      store.$gamePlayState.set({ ...current, scores });
    }),
  );

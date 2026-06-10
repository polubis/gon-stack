import { tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';

export const wsQuestionStarted = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_WS_QUESTION_STARTED').pipe(
    tap((payload) => {
      const current = store.$gamePlayState.get();

      if (!current) return;

      store.$gamePlayState.set({
        ...current,
        activeQuestion: payload
          ? { ...payload, hasAnswered: false }
          : null,
      });
    }),
  );

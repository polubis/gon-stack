import { tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';

export const wsTimerTicked = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_WS_TIMER_TICKED').pipe(
    tap(({ questionId, remaining }) => {
      const current = store.$gamePlayState.get();

      if (!current?.activeQuestion) return;

      if ((current.activeQuestion.question.id as string) !== questionId) return;

      store.$gamePlayState.set({
        ...current,
        activeQuestion: { ...current.activeQuestion, remainingSeconds: remaining },
      });
    }),
  );

import { tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';

export const submitAnswer = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_SUBMIT_ANSWER').pipe(
    tap(({ questionId, answer }) => {
      const ws = store.$ws.get();

      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'submit_answer', questionId, answer }));

        const current = store.$gamePlayState.get();

        if (current?.activeQuestion) {
          store.$gamePlayState.set({
            ...current,
            activeQuestion: { ...current.activeQuestion, hasAnswered: true },
          });
        }
      }
    }),
  );

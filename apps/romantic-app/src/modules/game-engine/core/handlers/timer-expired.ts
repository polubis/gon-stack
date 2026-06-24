import { tap } from 'rxjs';
import type { PlayerAnswer } from '../../contracts/models';
import type { Emit, OfType } from '../registry';
import type { Store } from '../store';

export const timerExpired = (store: Store, ofType: OfType, emit: Emit) =>
  ofType('[FACT]_TIMER_EXPIRED').pipe(
    tap(() => {
      store.$timerRemaining.set(0);
      const question = store.$currentQuestion.get();
      if (!question) return;

      const now = Date.now();
      if (!store.$player1Answer.get()) {
        const a: PlayerAnswer = {
          playerId: store.$player1.get().id,
          questionId: question.id,
          value: null,
          answeredAt: now,
        };
        store.$player1Answer.set(a);
        emit('[FACT]_PLAYER_ANSWERED', a);
      }
      if (!store.$player2Answer.get()) {
        const a: PlayerAnswer = {
          playerId: store.$player2.get().id,
          questionId: question.id,
          value: null,
          answeredAt: now,
        };
        store.$player2Answer.set(a);
        emit('[FACT]_PLAYER_ANSWERED', a);
      }
      emit('[FACT]_BOTH_ANSWERED');
    }),
  );

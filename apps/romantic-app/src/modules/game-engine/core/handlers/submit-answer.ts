import { tap } from 'rxjs';
import type { PlayerAnswer } from '../../contracts/models';
import type { Emit, OfType } from '../registry';
import type { Store } from '../store';

export const submitAnswer = (store: Store, ofType: OfType, emit: Emit) =>
  ofType('[TRIGGER]_SUBMIT_ANSWER').pipe(
    tap((value) => {
      const question = store.$currentQuestion.get();
      if (!question) return;
      if (store.$player1Answer.get()) return;
      const answer: PlayerAnswer = {
        playerId: store.$player1.get().id,
        questionId: question.id,
        value,
        answeredAt: Date.now(),
      };
      store.$player1Answer.set(answer);
      emit('[FACT]_PLAYER_ANSWERED', answer);
      store.$phase.set('waiting_for_partner');
      if (store.$player2Answer.get()) {
        emit('[FACT]_BOTH_ANSWERED');
      }
    }),
  );

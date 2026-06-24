import { switchMap, takeUntil, tap, timer } from 'rxjs';
import {
  generateMockPartnerAnswer,
  randomPartnerDelayMs,
} from '../../integration/repository';
import type { PlayerAnswer } from '../../contracts/models';
import type { Emit, OfType } from '../registry';
import type { Store } from '../store';

export const simulatePartnerAnswer = (
  store: Store,
  ofType: OfType,
  emit: Emit,
) =>
  ofType('[TASK]_SIMULATE_PARTNER_ANSWER').pipe(
    switchMap(() =>
      timer(randomPartnerDelayMs()).pipe(
        tap(() => {
          const question = store.$currentQuestion.get();
          if (!question) return;
          if (store.$player2Answer.get()) return;
          const value = generateMockPartnerAnswer(question);
          const answer: PlayerAnswer = {
            playerId: store.$player2.get().id,
            questionId: question.id,
            value,
            answeredAt: Date.now(),
          };
          store.$player2Answer.set(answer);
          emit('[FACT]_PLAYER_ANSWERED', answer);
          if (store.$player1Answer.get()) {
            emit('[FACT]_BOTH_ANSWERED');
          }
        }),
        takeUntil(ofType('[FACT]_BOTH_ANSWERED')),
        takeUntil(ofType('[FACT]_TIMER_EXPIRED')),
        takeUntil(ofType('[TRIGGER]_PAUSE_SESSION')),
      ),
    ),
  );

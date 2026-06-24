import { tap } from 'rxjs';
import { evaluateAnswers as evaluate } from '../../integration/repository';
import type { RoundResult } from '../../contracts/models';
import type { Emit, OfType } from '../registry';
import type { Store } from '../store';

export const evaluateAnswers = (store: Store, ofType: OfType, emit: Emit) =>
  ofType('[FACT]_BOTH_ANSWERED').pipe(
    tap(() => {
      const question = store.$currentQuestion.get();
      const a1 = store.$player1Answer.get();
      const a2 = store.$player2Answer.get();
      if (!question || !a1 || !a2) return;

      // Idempotency: BOTH_ANSWERED can be emitted in the same tick by both
      // timer-expired and simulate-partner-answer handlers. Skip if this
      // question was already scored.
      const already = store.$roundResults
        .get()
        .some((r) => r.questionId === question.id);
      if (already) return;

      const result = evaluate(a1.value, a2.value, question.type);
      const pointsDelta = result === 'match' ? 1 : 0;

      const p1 = store.$player1.get();
      const p2 = store.$player2.get();
      if (pointsDelta > 0) {
        store.$player1.set({ ...p1, score: p1.score + pointsDelta });
        store.$player2.set({ ...p2, score: p2.score + pointsDelta });
      }

      const round: RoundResult = {
        questionId: question.id,
        categoryId: question.categoryId,
        player1Answer: a1,
        player2Answer: a2,
        result,
        pointsDelta,
        educationalTip: question.educationalTip,
      };
      store.$roundResults.set([...store.$roundResults.get(), round]);
      emit('[FACT]_ROUND_EVALUATED', round);

      const threshold = store.$winThreshold.get();
      const p1After = store.$player1.get();
      const p2After = store.$player2.get();

      // TODO: win-threshold tie — if both reach threshold on the same round,
      // current logic picks the player with the higher score, falling back to
      // player1. Revisit: should a tie trigger a tiebreaker round instead?
      if (p1After.score >= threshold || p2After.score >= threshold) {
        const winnerId =
          p1After.score >= p2After.score ? p1After.id : p2After.id;
        store.$winnerId.set(winnerId);
        store.$phase.set('win_celebration');
        emit('[FACT]_WIN_DETECTED', winnerId);
        return;
      }

      store.$phase.set('results_reveal');
    }),
  );

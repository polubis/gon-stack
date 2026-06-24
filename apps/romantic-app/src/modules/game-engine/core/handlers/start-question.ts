import { filter, switchMap, take, takeUntil, tap, timer } from 'rxjs';
import type { Emit, OfType } from '../registry';
import type { Store } from '../store';

export const startQuestion = (store: Store, ofType: OfType, emit: Emit) =>
  ofType('[TRIGGER]_START_QUESTION').pipe(
    tap(() => {
      const question = store.$currentQuestion.get();
      if (!question) return;
      store.$player1Answer.reset();
      store.$player2Answer.reset();
      store.$timerTotal.set(question.timeLimitSeconds);
      store.$timerRemaining.set(question.timeLimitSeconds);
      store.$phase.set('answering');
      emit('[TASK]_SIMULATE_PARTNER_ANSWER');
    }),
    switchMap(() => {
      const total = store.$timerTotal.get();
      return timer(1000, 1000).pipe(
        take(total),
        tap((tick) => {
          const remaining = total - (tick + 1);
          emit('[FACT]_TIMER_TICK', remaining);
        }),
        // Cancel BEFORE the final-tick emission so pause/both-answered
        // reliably prevent a late TIMER_EXPIRED fact.
        takeUntil(ofType('[FACT]_BOTH_ANSWERED')),
        takeUntil(ofType('[TRIGGER]_PAUSE_SESSION')),
        filter((tick) => tick === total - 1),
        tap(() => emit('[FACT]_TIMER_EXPIRED')),
      );
    }),
  );

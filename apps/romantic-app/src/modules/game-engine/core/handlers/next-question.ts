import { tap } from 'rxjs';
import type { Emit, OfType } from '../registry';
import type { Store } from '../store';

export const nextQuestion = (store: Store, ofType: OfType, emit: Emit) =>
  ofType('[TRIGGER]_NEXT_QUESTION').pipe(
    tap(() => {
      if (store.$winnerId.get()) return;

      if (store.$hasMoreQuestions.get()) {
        store.$currentQuestionIndex.set(store.$currentQuestionIndex.get() + 1);
        emit('[TRIGGER]_START_QUESTION');
        return;
      }

      const stats = store.$categoryStats.get();
      store.$phase.set('category_summary');
      if (stats) emit('[FACT]_CATEGORY_COMPLETED', stats);
    }),
  );

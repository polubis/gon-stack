import { catchError, EMPTY, finalize, from, switchMap, tap } from 'rxjs';
import { getCategories } from '../../integration/repository';
import type { Emit, OfType } from '../registry';
import type { Store } from '../store';

export const init = (store: Store, ofType: OfType, emit: Emit) =>
  ofType('[TRIGGER]_INIT').pipe(
    tap(() => {
      store.$phase.reset();
      store.$phasePrePause.reset();
      store.$player1.reset();
      store.$player2.reset();
      store.$winThreshold.reset();
      store.$isPaused.reset();
      store.$categories.reset();
      store.$selectedCategoryId.reset();
      store.$questions.reset();
      store.$currentQuestionIndex.reset();
      store.$isLoadingQuestions.reset();
      store.$error.reset();
      store.$player1Answer.reset();
      store.$player2Answer.reset();
      store.$timerRemaining.reset();
      store.$timerTotal.reset();
      store.$roundResults.reset();
      store.$winnerId.reset();
    }),
    switchMap(() => {
      const ctrl = new AbortController();
      return from(getCategories(ctrl.signal)).pipe(
        tap((categories) => {
          store.$categories.set(categories);
          emit('[FACT]_CATEGORIES_LOADED', categories);
        }),
        catchError((error: unknown) => {
          if (error instanceof DOMException && error.name === 'AbortError') {
            return EMPTY;
          }
          // TODO: when backend becomes real, surface a retry affordance in
          // category-selection — currently the UI stays on the loader until
          // error is set, which is fine for the mock repository.
          store.$error.set(
            error instanceof Error
              ? error.message
              : 'Failed to load categories.',
          );
          return EMPTY;
        }),
        finalize(() => ctrl.abort()),
      );
    }),
  );

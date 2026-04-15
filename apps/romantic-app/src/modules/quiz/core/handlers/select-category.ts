import { EMPTY, catchError, from, switchMap, tap } from 'rxjs';
import type { Bus } from '../bus';
import type { QuizRepository } from '../../integration/contracts';
import type { Store } from '../store';

export const selectCategory = (
  store: Store,
  bus: Bus,
  deps: { repository: QuizRepository },
) =>
  bus.ofType('[TRIGGER]_SELECT_CATEGORY').pipe(
    tap(({ categoryId }) => {
      store.$activeCategoryId.set(categoryId);
      store.$askedQuestionIds.set([]);
      store.$questionQueue.set([]);
      store.$currentQuestionIndex.set(0);
      store.$localAnswer.reset();
      store.$partnerAnswer.reset();
      store.$isRoundLocked.reset();
      store.$isReveal.reset();
      store.$scoreDeltas.set([]);
      store.$lastSummary.reset();
      store.$isLoading.set(true);
      store.$error.reset();
    }),
    switchMap(({ categoryId }) => {
      const sessionId = store.$sessionId.get();
      if (!sessionId) {
        store.$isLoading.reset();
        return EMPTY;
      }

      return from(
        deps.repository.nextQuestion({
          sessionId,
          categoryId,
          askedQuestionIds: [],
        }),
      ).pipe(
        tap((response) => {
          if (!response.question) {
            store.$status.set('category-summary');
            store.$lastSummary.set(
              response.categorySummary ?? {
                categoryId,
                roundsPlayed: 0,
                matches: 0,
                compatibility: 0,
              },
            );
            return;
          }

          store.$questionQueue.set([response.question]);
          store.$askedQuestionIds.set([response.question.id]);
          store.$status.set('answering');
          store.$secondsLeft.set(response.question.timeLimitSec);
          bus.emit('[FACT]_QUESTION_READY', {
            question: response.question,
            questionIndex: 0,
          });
          bus.emit('[TASK]_RUN_TIMER', {
            seconds: response.question.timeLimitSec,
          });
        }),
        tap({
          finalize: () => store.$isLoading.reset(),
        }),
        catchError((error: unknown) => {
          store.$isLoading.reset();
          store.$error.set(
            error instanceof Error ? error.message : 'Failed to load category.',
          );
          return EMPTY;
        }),
      );
    }),
  );

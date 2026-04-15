import { EMPTY, catchError, from, switchMap, tap } from 'rxjs';
import type { Bus } from '../bus';
import { buildCategorySummary } from '../engine';
import type { QuizRepository } from '../../integration/contracts';
import type { Store } from '../store';

export const nextQuestion = (
  store: Store,
  bus: Bus,
  deps: { repository: QuizRepository },
) =>
  bus.ofType('[TRIGGER]_NEXT_QUESTION').pipe(
    switchMap(() => {
      if (store.$status.get() === 'finished') {
        return EMPTY;
      }

      const sessionId = store.$sessionId.get();
      const categoryId = store.$activeCategoryId.get();
      if (!sessionId || !categoryId) {
        return EMPTY;
      }

      store.$isLoading.set(true);
      store.$error.reset();

      return from(
        deps.repository.nextQuestion({
          sessionId,
          categoryId,
          askedQuestionIds: store.$askedQuestionIds.get(),
        }),
      ).pipe(
        tap((response) => {
          if (!response.question) {
            const summary =
              response.categorySummary ??
              buildCategorySummary({
                categoryId,
                askedQuestionIds: store.$askedQuestionIds.get(),
                scoreDeltas: store.$scoreDeltas.get(),
              });
            store.$lastSummary.set(summary);
            store.$status.set('category-summary');
            bus.emit('[FACT]_CATEGORY_COMPLETED', { summary });
            return;
          }

          store.$questionQueue.set([...store.$questionQueue.get(), response.question]);
          store.$askedQuestionIds.set([...store.$askedQuestionIds.get(), response.question.id]);
          store.$currentQuestionIndex.set(store.$questionQueue.get().length - 1);
          store.$localAnswer.reset();
          store.$partnerAnswer.reset();
          store.$isReveal.reset();
          store.$isRoundLocked.reset();
          store.$status.set('answering');
          store.$secondsLeft.set(response.question.timeLimitSec);

          bus.emit('[FACT]_QUESTION_READY', {
            question: response.question,
            questionIndex: store.$currentQuestionIndex.get(),
          });
          bus.emit('[TASK]_RUN_TIMER', { seconds: response.question.timeLimitSec });
        }),
        tap({
          finalize: () => store.$isLoading.reset(),
        }),
        catchError((error: unknown) => {
          store.$isLoading.reset();
          store.$error.set(
            error instanceof Error ? error.message : 'Failed to fetch next question.',
          );
          return EMPTY;
        }),
      );
    }),
  );

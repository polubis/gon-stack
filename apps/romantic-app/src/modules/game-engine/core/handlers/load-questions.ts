import { catchError, EMPTY, exhaustMap, finalize, from, tap } from 'rxjs';
import { getQuestionsByCategory } from '../../integration/repository';
import type { Emit, OfType } from '../registry';
import type { Store } from '../store';

export const loadQuestions = (store: Store, ofType: OfType, emit: Emit) =>
  ofType('[TRIGGER]_LOAD_QUESTIONS').pipe(
    tap(() => {
      store.$isLoadingQuestions.set(true);
      store.$error.reset();
      store.$questions.set([]);
    }),
    exhaustMap(() => {
      const categoryId = store.$selectedCategoryId.get();
      if (!categoryId) return EMPTY;
      const ctrl = new AbortController();
      return from(getQuestionsByCategory(categoryId, ctrl.signal)).pipe(
        tap((questions) => {
          store.$questions.set(questions);
          emit('[FACT]_QUESTIONS_LOADED', questions);
          emit('[TRIGGER]_START_QUESTION');
        }),
        catchError((error: unknown) => {
          if (error instanceof DOMException && error.name === 'AbortError') {
            return EMPTY;
          }
          const message =
            error instanceof Error
              ? error.message
              : 'Failed to load questions.';
          store.$error.set(message);
          emit('[FACT]_QUESTIONS_LOAD_FAILED', message);
          return EMPTY;
        }),
        finalize(() => {
          store.$isLoadingQuestions.set(false);
          ctrl.abort();
        }),
      );
    }),
  );

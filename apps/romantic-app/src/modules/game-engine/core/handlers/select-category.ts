import { tap } from 'rxjs';
import type { Emit, OfType } from '../registry';
import type { Store } from '../store';

export const selectCategory = (store: Store, ofType: OfType, emit: Emit) =>
  ofType('[TRIGGER]_SELECT_CATEGORY').pipe(
    tap((categoryId) => {
      store.$selectedCategoryId.set(categoryId);
      store.$currentQuestionIndex.reset();
      store.$roundResults.set([]);
      store.$error.reset();
      store.$phase.set('question_loading');
      emit('[TRIGGER]_LOAD_QUESTIONS');
    }),
  );

import { catchError, EMPTY, exhaustMap, finalize, from, map, tap } from 'rxjs';
import { saveUserProfileAnswers } from '../../integration/repository';
import type { Store } from '../store';
import type { Bus } from '../bus';

export const saveAnswers = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_SAVE_ANSWERS').pipe(
    map(() => new AbortController()),
    tap(() => {
      store.$isSaved.reset();
      store.$isSaving.set(true);
      store.$error.reset();
    }),
    exhaustMap((ctrl) =>
      from(saveUserProfileAnswers(store.$allAnswers.get(), ctrl.signal)).pipe(
        tap(() => {
          store.$isSaved.set(true);
        }),
        catchError((error) => {
          store.$error.set(
            error instanceof Error
              ? error.message
              : 'Failed to save profile answers.',
          );
          return EMPTY;
        }),
        finalize(() => {
          store.$isSaving.reset();
          ctrl.abort();
        }),
      ),
    ),
  );

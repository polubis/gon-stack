import { catchError, EMPTY, exhaustMap, finalize, from, tap } from 'rxjs';
import { suggestKeywords } from '../../integration/repository';
import type { OfType } from '../registry';
import type { Store } from '../store';

export const suggestKeywordsHandler = (store: Store, ofType: OfType) =>
  ofType('[TRIGGER]_SUGGEST_KEYWORDS').pipe(
    tap(() => store.$isSuggesting.set(true)),
    exhaustMap(({ name, description, category }) => {
      const ctrl = new AbortController();

      return from(
        suggestKeywords({ name, description, category }, ctrl.signal),
      ).pipe(
        tap((result) => {
          if (result.code === 200 && 'keywords' in result) {
            const existing = store.$keywords.get();
            store.$aiSuggestions.set(
              result.keywords.filter((k) => !existing.includes(k)),
            );
          }
        }),
        catchError((error) => {
          if (error instanceof DOMException && error.name === 'AbortError')
            return EMPTY;
          return EMPTY;
        }),
        finalize(() => {
          store.$isSuggesting.set(false);
          ctrl.abort();
        }),
      );
    }),
  );

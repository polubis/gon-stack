import { tap } from 'rxjs';
import type { OfType } from '../registry';
import type { Store } from '../store';

export const addKeywordHandler = (store: Store, ofType: OfType) =>
  ofType('[TRIGGER]_ADD_KEYWORD').pipe(
    tap(({ keyword }) => {
      const trimmed = keyword.trim();
      const existing = store.$keywords.get();
      if (trimmed && !existing.includes(trimmed)) {
        store.$keywords.set([...existing, trimmed]);
      }
      store.$keywordInput.reset();
    }),
  );

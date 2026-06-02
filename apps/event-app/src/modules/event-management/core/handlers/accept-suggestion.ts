import { tap } from 'rxjs';
import type { OfType } from '../registry';
import type { Store } from '../store';

export const acceptSuggestionHandler = (store: Store, ofType: OfType) =>
  ofType('[TRIGGER]_ACCEPT_SUGGESTION').pipe(
    tap(({ keyword }) => {
      const trimmed = keyword.trim();
      const existing = store.$keywords.get();
      if (trimmed && !existing.includes(trimmed)) {
        store.$keywords.set([...existing, trimmed]);
      }
      store.$aiSuggestions.set(
        store.$aiSuggestions.get().filter((s) => s !== keyword),
      );
    }),
  );

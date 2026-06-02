import { tap } from 'rxjs';
import type { OfType } from '../registry';
import type { Store } from '../store';

export const dismissSuggestionHandler = (store: Store, ofType: OfType) =>
  ofType('[TRIGGER]_DISMISS_SUGGESTION').pipe(
    tap(({ keyword }) => {
      store.$aiSuggestions.set(
        store.$aiSuggestions.get().filter((s) => s !== keyword),
      );
    }),
  );

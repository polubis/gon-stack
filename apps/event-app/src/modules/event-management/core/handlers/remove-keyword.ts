import { tap } from 'rxjs';
import type { OfType } from '../registry';
import type { Store } from '../store';

export const removeKeywordHandler = (store: Store, ofType: OfType) =>
  ofType('[TRIGGER]_REMOVE_KEYWORD').pipe(
    tap(({ keyword }) => {
      store.$keywords.set(store.$keywords.get().filter((k) => k !== keyword));
    }),
  );

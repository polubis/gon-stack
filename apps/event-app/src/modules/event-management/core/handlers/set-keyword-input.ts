import { tap } from 'rxjs';
import type { OfType } from '../registry';
import type { Store } from '../store';

export const setKeywordInputHandler = (store: Store, ofType: OfType) =>
  ofType('[TRIGGER]_SET_KEYWORD_INPUT').pipe(
    tap(({ value }) => store.$keywordInput.set(value)),
  );

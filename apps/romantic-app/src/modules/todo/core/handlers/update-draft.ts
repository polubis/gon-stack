import { tap } from 'rxjs';
import type { Bus } from '../bus';
import type { Store } from '../store';

export const updateDraft = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_UPDATE_DRAFT').pipe(
    tap(({ body }) => {
      store.$draft.set(body);
    }),
  );

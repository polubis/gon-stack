import { tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';

/** Selects every loaded notification; a second call clears the selection. */
export const selectAll = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_SELECT_ALL').pipe(
    tap(() => {
      const all = store.$notifications.get().map((n) => n.id);
      store.$selected.set(
        store.$selected.get().length === all.length ? [] : all,
      );
    }),
  );

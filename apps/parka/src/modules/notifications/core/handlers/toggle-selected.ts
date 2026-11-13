import { tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';

export const toggleSelected = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_TOGGLE_SELECTED').pipe(
    tap(({ id }) => {
      const selected = store.$selected.get();
      store.$selected.set(
        selected.includes(id)
          ? selected.filter((item) => item !== id)
          : [...selected, id],
      );
    }),
  );

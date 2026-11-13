import { tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';

/** Entering or leaving select mode always starts from an empty selection. */
export const toggleSelecting = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_TOGGLE_SELECTING').pipe(
    tap(() => {
      store.$selecting.set(!store.$selecting.get());
      store.$selected.set([]);
    }),
  );

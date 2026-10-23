import { tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';

/** Forgets the secret for good: nothing else keeps a copy. */
export const dismissSecret = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_DISMISS_SECRET').pipe(
    tap(() => {
      store.$secret.reset();
    }),
  );

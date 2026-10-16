import { tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';

export const skip = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_SKIP').pipe(
    tap(() => {
      store.$outcome.set('skipped');
    }),
  );

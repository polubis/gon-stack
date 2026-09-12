import { tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';

export const prev = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_PREV').pipe(
    tap(() => {
      store.$activeStepIndex.set(Math.max(0, store.$activeStepIndex.get() - 1));
    }),
  );

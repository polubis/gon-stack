import { tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';

export const init = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_INIT').pipe(
    tap(({ steps }) => {
      store.$activeStepIndex.reset();
      store.$steps.set(steps);
      store.$outcome.set(null);
    }),
  );

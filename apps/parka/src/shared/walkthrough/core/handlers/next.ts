import { tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';

export const next = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_NEXT').pipe(
    tap(() => {
      if (store.$isLastStep.get()) {
        store.$outcome.set('completed');
        return;
      }

      store.$activeStepIndex.set(store.$activeStepIndex.get() + 1);
    }),
  );

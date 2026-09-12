import { tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { getOutcome } from '../../integration/repository';

export const init = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_INIT').pipe(
    tap(({ steps, persistenceKey, resumePersistedOutcome }) => {
      store.$activeStepIndex.reset();
      store.$persistenceKey.set(persistenceKey);
      store.$steps.set(steps);
      store.$outcome.set(
        resumePersistedOutcome ? getOutcome(persistenceKey) : null,
      );
    }),
  );

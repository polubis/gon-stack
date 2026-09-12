import { tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { saveOutcome } from '../../integration/repository';

export const skip = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_SKIP').pipe(
    tap(() => {
      store.$outcome.set('skipped');
      saveOutcome(store.$persistenceKey.get(), 'skipped');
    }),
  );

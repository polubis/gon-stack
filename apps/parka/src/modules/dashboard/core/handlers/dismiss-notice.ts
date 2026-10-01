import { tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';

export const dismissNotice = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_DISMISS_NOTICE').pipe(
    tap(() => {
      store.$notice.reset();
    }),
  );

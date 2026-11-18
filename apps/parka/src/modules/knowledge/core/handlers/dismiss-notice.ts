import { tap } from 'rxjs';
import type { Bus } from '../bus';
import type { Store } from '../store';

export const dismissNotice = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_DISMISS_NOTICE').pipe(tap(() => store.$notice.reset()));

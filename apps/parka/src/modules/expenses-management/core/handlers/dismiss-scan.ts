import { tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';

export const dismissScan = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_DISMISS_SCAN').pipe(tap(() => store.$scan.reset()));

import { catchError, from, of, switchMap, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { readPushState } from '../../integration/push';

/** Push support is browser-specific, so it is read next to the settings. */
export const loadPush = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_LOAD').pipe(
    switchMap(() =>
      from(readPushState()).pipe(
        tap((state) => store.$push.set(state)),
        catchError(() => of(store.$push.set('unsupported'))),
      ),
    ),
  );

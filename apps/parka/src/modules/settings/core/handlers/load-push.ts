import { catchError, from, of, switchMap, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { readPushState } from '../../integration/push';

/** Push support is browser-specific, so it is read next to the settings. */
export const loadPush = (store: Store, { ofType, emit }: Bus) =>
  ofType('[TRIGGER]_LOAD').pipe(
    switchMap(() =>
      from(readPushState()).pipe(
        tap((state) => {
          store.$push.set(state);
          emit('[TRIGGER]_SYNC_PUSH');
        }),
        catchError(() => of(store.$push.set('unsupported'))),
      ),
    ),
  );

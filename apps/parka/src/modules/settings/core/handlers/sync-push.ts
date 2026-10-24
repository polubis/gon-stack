import { catchError, EMPTY, exhaustMap, filter, from, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { resubscribePush } from '../../integration/push';
import { putPushSubscription } from '../../integration/repository';

/**
 * The saved "push on" choice outlives the device subscription: the browser
 * expires it, the push service drops it (server deletes 404/410), another
 * account on this device removes it. When the choice is on and permission is
 * still granted, quietly restore the subscription and re-register it, so the
 * toggle never silently flips off.
 */
export const syncPush = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_SYNC_PUSH').pipe(
    filter(() => {
      const state = store.$push.get();
      return (
        store.$settings.get()?.notifications.push === true &&
        (state === 'on' || state === 'off') &&
        Notification.permission === 'granted'
      );
    }),
    exhaustMap(() =>
      from(resubscribePush().then(putPushSubscription)).pipe(
        tap(() => store.$push.set('on')),
        // Stays as is: the user can toggle it again by hand.
        catchError(() => EMPTY),
      ),
    ),
  );

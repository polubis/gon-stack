import { catchError, exhaustMap, finalize, from, of, tap } from 'rxjs';
import { APP_ROUTER, navigateTo } from '@/shared/router';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { logout } from '../../integration/repository';

export const signOut = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_SIGN_OUT').pipe(
    tap(() => {
      store.$isSigningOut.set(true);
    }),
    exhaustMap(() =>
      from(logout()).pipe(
        // Leave the app either way: the session is gone or unusable.
        catchError(() => of(undefined)),
        tap(() => navigateTo(APP_ROUTER.signIn())),
        finalize(() => store.$isSigningOut.reset()),
      ),
    ),
  );

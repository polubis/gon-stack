import { catchError, EMPTY, finalize, from, switchMap, tap } from 'rxjs';
import { logoutUser } from '../../integration/repository';
import type { Store } from '../store';
import type { OfType } from '../registry';

export const onLogout = (store: Store, ofType: OfType) =>
  ofType('[TRIGGER]_LOGOUT').pipe(
    tap(() => {
      store.$logoutLoading.set(true);
      store.$logoutError.reset();
    }),
    switchMap(() =>
      from(logoutUser()).pipe(
        catchError((error) => {
          store.$logoutError.set(
            error instanceof Error ? error.message : 'Failed to logout.',
          );
          return EMPTY;
        }),
        finalize(() => {
          store.$logoutLoading.reset();
        }),
      ),
    ),
  );

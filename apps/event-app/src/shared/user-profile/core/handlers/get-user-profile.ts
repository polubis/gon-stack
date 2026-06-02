import { catchError, EMPTY, finalize, from, switchMap, tap, map } from 'rxjs';
import { getUserProfile } from '../../integration/repository';
import type { Store } from '../store';
import type { OfType } from '../registry';

export const onGetUserProfile = (store: Store, ofType: OfType) =>
  ofType('[TRIGGER]_GET_USER_PROFILE').pipe(
    tap(() => {
      store.$profileLoading.set(true);
      store.$profileError.reset();
      store.$userProfile.reset();
    }),
    map(() => new AbortController()),
    switchMap((ctrl) =>
      from(getUserProfile(ctrl.signal)).pipe(
        tap((profile) => {
          store.$userProfile.set(profile);
        }),
        catchError((error) => {
          store.$profileError.set(
            error instanceof Error ? error.message : 'Failed to load profile.',
          );
          return EMPTY;
        }),
        finalize(() => {
          store.$profileLoading.reset();
          ctrl.abort();
        }),
      ),
    ),
  );

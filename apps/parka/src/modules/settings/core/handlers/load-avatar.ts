import { catchError, EMPTY, from, switchMap, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { fetchAvatar } from '@/shared/avatar/integration/fetch-avatar';

/** The picture only decorates settings, so a failed load keeps the default icon. */
export const loadAvatar = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_LOAD').pipe(
    switchMap(() =>
      from(fetchAvatar(new AbortController().signal)).pipe(
        tap((avatar) => store.$avatar.set(avatar)),
        catchError(() => EMPTY),
      ),
    ),
  );

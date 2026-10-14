import { catchError, EMPTY, from, switchMap, take, tap } from 'rxjs';
import { fetchAvatar } from '@/shared/avatar/integration/fetch-avatar';
import type { Store } from '../store';
import type { Bus } from '../bus';

/** The picture only decorates the header, so a failed load keeps the default icon. */
export const loadAvatar = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_LOAD').pipe(
    take(1),
    switchMap(() =>
      from(fetchAvatar(new AbortController().signal)).pipe(
        tap((avatar) => store.$avatar.set(avatar)),
        catchError(() => EMPTY),
      ),
    ),
  );

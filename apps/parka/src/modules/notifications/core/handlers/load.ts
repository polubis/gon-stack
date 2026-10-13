import { catchError, EMPTY, finalize, from, map, switchMap, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { PAGE_SIZE } from '../../configuration/constraints';
import { fetchNotifications } from '../../integration/repository';

/** First page; also what a reload or a retry runs. Replaces whatever was loaded. */
export const load = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_LOAD').pipe(
    tap(() => {
      store.$isLoading.set(true);
      store.$error.reset();
      store.$moreError.reset();
    }),
    map(() => new AbortController()),
    switchMap((ctrl) =>
      from(fetchNotifications(null, PAGE_SIZE, ctrl.signal)).pipe(
        tap((page) => {
          store.$notifications.set(page.items);
          store.$nextCursor.set(page.nextCursor);
          store.$unread.set(page.unread);
        }),
        catchError((error) => {
          const isAbort =
            error instanceof DOMException && error.name === 'AbortError';

          if (!isAbort) {
            store.$error.set(
              error instanceof Error
                ? error.message
                : 'Failed to load notifications.',
            );
          }

          return EMPTY;
        }),
        finalize(() => {
          store.$initializing.set(false);
          store.$isLoading.reset();
          ctrl.abort();
        }),
      ),
    ),
  );

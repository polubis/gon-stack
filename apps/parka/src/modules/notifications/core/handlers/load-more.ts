import {
  catchError,
  EMPTY,
  exhaustMap,
  filter,
  finalize,
  from,
  tap,
} from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { PAGE_SIZE } from '../../configuration/constraints';
import { fetchNotifications } from '../../integration/repository';

/** Next page, appended without duplicates. Ignored while one is in flight. */
export const loadMore = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_LOAD_MORE').pipe(
    filter(
      () =>
        store.$nextCursor.get() !== null &&
        !store.$loadingMore.get() &&
        !store.$initializing.get(),
    ),
    tap(() => {
      store.$loadingMore.set(true);
      store.$moreError.reset();
    }),
    exhaustMap(() =>
      from(
        fetchNotifications(
          store.$nextCursor.get(),
          PAGE_SIZE,
          new AbortController().signal,
        ),
      ).pipe(
        tap((page) => {
          const known = new Set(store.$notifications.get().map((n) => n.id));
          // Everything was marked read while this page was in flight: the server has it read too.
          const allRead = store.$unread.get() === 0;
          store.$notifications.set([
            ...store.$notifications.get(),
            ...page.items
              .filter((n) => !known.has(n.id))
              .map((n) => (allRead ? { ...n, read: true } : n)),
          ]);
          store.$nextCursor.set(page.nextCursor);
          if (!allRead) store.$unread.set(page.unread);
        }),
        catchError((error: unknown) => {
          store.$moreError.set(
            error instanceof Error
              ? error.message
              : 'Failed to load more notifications.',
          );
          return EMPTY;
        }),
        finalize(() => store.$loadingMore.reset()),
      ),
    ),
  );

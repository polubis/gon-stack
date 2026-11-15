import { catchError, concatMap, EMPTY, from, map, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { errorMessage } from '@/shared/errors/error-message';
import { notify } from '../actions/notify';
import { putRead } from '../../integration/repository';

const doneMessage = (count: number): string =>
  count === 1
    ? 'Oznaczono jako przeczytane.'
    : `Oznaczono jako przeczytane: ${count}.`;

/** Optimistic: selected unread rows flip to read and select mode ends at once; a failure restores them. */
export const markSelectedRead = (store: Store, { ofType, emit }: Bus) =>
  ofType('[TRIGGER]_MARK_SELECTED_READ').pipe(
    map(() => {
      const items = store.$notifications.get();
      const chosen = new Set(store.$selected.get());
      return {
        items,
        unread: store.$unread.get(),
        ids: store.$selected.get(),
        unreadIds: items
          .filter((n) => chosen.has(n.id) && !n.read)
          .map((n) => n.id),
      };
    }),
    tap(({ items, unread, unreadIds }) => {
      const flip = new Set(unreadIds);
      store.$notifications.set(
        items.map((n) => (flip.has(n.id) ? { ...n, read: true } : n)),
      );
      store.$unread.set(Math.max(0, unread - unreadIds.length));
      store.$selected.set([]);
      store.$selecting.set(false);
    }),
    concatMap((previous) =>
      previous.unreadIds.length === 0
        ? EMPTY
        : from(Promise.all(previous.unreadIds.map(putRead))).pipe(
            tap(() =>
              notify(store, {
                tone: 'success',
                message: doneMessage(previous.unreadIds.length),
              }),
            ),
            catchError((error: unknown) => {
              store.$notifications.set(previous.items);
              store.$unread.set(previous.unread);
              notify(store, {
                tone: 'error',
                title: 'Nie udało się oznaczyć jako przeczytane',
                code: 'NOTIFICATION_MARK_READ_FAILED',
                description: errorMessage(error),
                retry: () => {
                  store.$selecting.set(true);
                  store.$selected.set(previous.ids);
                  emit('[TRIGGER]_MARK_SELECTED_READ');
                },
              });
              return EMPTY;
            }),
          ),
    ),
  );

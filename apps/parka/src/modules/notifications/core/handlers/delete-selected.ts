import { catchError, concatMap, EMPTY, from, map, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { errorMessage } from '@/shared/errors/error-message';
import { notify } from '../actions/notify';
import { deleteMany } from '../../integration/repository';

const doneMessage = (count: number): string =>
  count === 1 ? 'Usunięto powiadomienie.' : `Usunięto powiadomienia: ${count}.`;

/** Optimistic: rows vanish and select mode ends at once; a failure puts them back. */
export const deleteSelected = (store: Store, { ofType, emit }: Bus) =>
  ofType('[TRIGGER]_DELETE_SELECTED').pipe(
    map(() => ({
      items: store.$notifications.get(),
      unread: store.$unread.get(),
      ids: store.$selected.get(),
    })),
    tap(({ items, ids }) => {
      const gone = new Set(ids);
      const removedUnread = items.filter(
        (n) => gone.has(n.id) && !n.read,
      ).length;
      store.$notifications.set(items.filter((n) => !gone.has(n.id)));
      store.$unread.set(Math.max(0, store.$unread.get() - removedUnread));
      store.$selected.set([]);
      store.$selecting.set(false);
    }),
    concatMap((previous) =>
      previous.ids.length === 0
        ? EMPTY
        : from(deleteMany(previous.ids)).pipe(
            tap(() =>
              notify(store, {
                tone: 'success',
                message: doneMessage(previous.ids.length),
              }),
            ),
            catchError((error: unknown) => {
              store.$notifications.set(previous.items);
              store.$unread.set(previous.unread);
              notify(store, {
                tone: 'error',
                title: 'Nie udało się usunąć powiadomień',
                code: 'NOTIFICATION_DELETE_FAILED',
                description: errorMessage(error),
                retry: () => {
                  store.$selecting.set(true);
                  store.$selected.set(previous.ids);
                  emit('[TRIGGER]_DELETE_SELECTED');
                },
              });
              return EMPTY;
            }),
          ),
    ),
  );

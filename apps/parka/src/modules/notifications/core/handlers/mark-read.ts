import { catchError, concatMap, EMPTY, from, map, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { errorMessage } from '@/shared/errors/error-message';
import { notify } from '../actions/notify';
import { putRead } from '../../integration/repository';
import type { NotificationId } from '../../domain/models';

/** Flips only the read flag: the notification stays in the list. */
const setRead = (store: Store, id: NotificationId, read: boolean): void => {
  const current = store.$notifications.get().find((n) => n.id === id);
  if (!current || current.read === read) return;
  store.$notifications.set(
    store.$notifications.get().map((n) => (n.id === id ? { ...n, read } : n)),
  );
  store.$unread.set(Math.max(0, store.$unread.get() + (read ? -1 : 1)));
};

export const markRead = (store: Store, { ofType, emit }: Bus) =>
  ofType('[TRIGGER]_MARK_READ').pipe(
    map(({ id }) => id),
    tap((id) => setRead(store, id, true)),
    concatMap((id) =>
      from(putRead(id)).pipe(
        tap(() =>
          notify(store, {
            tone: 'success',
            message: 'Oznaczono jako przeczytane.',
          }),
        ),
        catchError((error: unknown) => {
          setRead(store, id, false);
          notify(store, {
            tone: 'error',
            title: 'Nie udało się oznaczyć jako przeczytane',
            code: 'NOTIFICATION_MARK_READ_FAILED',
            description: errorMessage(error),
            retry: () => emit('[TRIGGER]_MARK_READ', { id }),
          });
          return EMPTY;
        }),
      ),
    ),
  );

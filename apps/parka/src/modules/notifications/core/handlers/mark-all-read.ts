import { catchError, concatMap, EMPTY, from, map, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { errorMessage } from '@/shared/errors/error-message';
import { notify } from '../actions/notify';
import { putReadAll } from '../../integration/repository';

/** Server marks every unread one, loaded or not; locally all loaded items stay and flip to read. */
export const markAllRead = (store: Store, { ofType, emit }: Bus) =>
  ofType('[TRIGGER]_MARK_ALL_READ').pipe(
    map(() => ({
      items: store.$notifications.get(),
      unread: store.$unread.get(),
    })),
    tap(({ items }) => {
      store.$notifications.set(items.map((n) => ({ ...n, read: true })));
      store.$unread.set(0);
    }),
    concatMap((previous) =>
      from(putReadAll()).pipe(
        tap(() =>
          notify(store, {
            tone: 'success',
            message: 'Oznaczono wszystkie jako przeczytane.',
          }),
        ),
        catchError((error: unknown) => {
          store.$notifications.set(previous.items);
          store.$unread.set(previous.unread);
          notify(store, {
            tone: 'error',
            title: 'Nie udało się oznaczyć wszystkich jako przeczytane',
            code: 'NOTIFICATION_MARK_ALL_READ_FAILED',
            description: errorMessage(error),
            retry: () => emit('[TRIGGER]_MARK_ALL_READ'),
          });
          return EMPTY;
        }),
      ),
    ),
  );

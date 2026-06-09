import { catchError, EMPTY, finalize, from, switchMap, tap } from 'rxjs';
import { getConnectionStatus } from '../../integration/repository';
import type { Bus } from '../bus';
import type { Store } from '../store';

export const retryConnection = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_RETRY_CONNECTION').pipe(
    tap(() => {
      store.$connection.set('reconnecting');
      store.$errorMessage.reset();
    }),
    switchMap(() => {
      const ctrl = new AbortController();

      return from(getConnectionStatus(ctrl.signal)).pipe(
        tap((status) => {
          store.$connection.set(status);
          if (status === 'connected') {
            store.$errorMessage.reset();
            store.$threads.set(
              store.$threads.get().map((t) => ({
                ...t,
                state:
                  t.id === store.$selectedThreadId.get() ? 'active' : 'idle',
              })),
            );
          }
        }),
        catchError((error) => {
          if (error instanceof DOMException && error.name === 'AbortError')
            return EMPTY;
          store.$connection.set('disconnected');
          store.$errorMessage.set(
            error instanceof Error ? error.message : 'Connection failed.',
          );
          return EMPTY;
        }),
        finalize(() => {
          ctrl.abort();
        }),
      );
    }),
  );

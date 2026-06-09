import { catchError, EMPTY, finalize, from, switchMap, tap } from 'rxjs';
import { getThreadMessages, getThreads } from '../../integration/repository';
import type { Bus } from '../bus';
import type { Store } from '../store';
import type { ThreadId } from '../../domain/models';

export const bootstrap = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_BOOTSTRAP').pipe(
    tap(() => {
      store.$isBootstrapping.set(true);
      store.$bootstrapError.reset();
      store.$threads.reset();
      store.$messagesByThread.reset();
      store.$selectedThreadId.reset();
    }),
    switchMap(() => {
      const ctrl = new AbortController();

      return from(
        (async () => {
          const threads = await getThreads(ctrl.signal);
          const selected = threads.find((t) => t.active) ?? threads[0];
          const selectedThreadId = selected?.id ?? '';

          const messagesEntries = await Promise.all(
            threads.map(
              async (t) =>
                [t.id, await getThreadMessages(t.id, ctrl.signal)] as const,
            ),
          );

          return {
            threads,
            selectedThreadId,
            messagesByThread: Object.fromEntries(messagesEntries),
          };
        })(),
      ).pipe(
        tap(({ threads, selectedThreadId, messagesByThread }) => {
          store.$threads.set(threads);
          store.$selectedThreadId.set(selectedThreadId as ThreadId);
          store.$messagesByThread.set(messagesByThread);
          store.$connection.set('connected');
        }),
        catchError((error) => {
          if (error instanceof DOMException && error.name === 'AbortError')
            return EMPTY;
          store.$bootstrapError.set(
            error instanceof Error ? error.message : 'Failed to load chat.',
          );
          return EMPTY;
        }),
        finalize(() => {
          store.$isBootstrapping.reset();
          ctrl.abort();
        }),
      );
    }),
  );

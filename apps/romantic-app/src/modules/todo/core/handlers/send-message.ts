import { catchError, EMPTY, exhaustMap, finalize, from, tap } from 'rxjs';
import { postAssistantReply } from '../../integration/repository';
import type { Message } from '../../domain/models';
import type { Bus } from '../bus';
import type { Store } from '../store';
import type { MessageId } from '../../domain/models';

export const sendMessage = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_SEND_MESSAGE').pipe(
    exhaustMap(() => {
      const draft = store.$draft.get().trim();
      const threadId = store.$selectedThreadId.get();

      if (!draft || !threadId) return EMPTY;

      const userMessage: Message = {
        id: crypto.randomUUID() as MessageId,
        role: 'user',
        body: draft,
      };

      store.$draft.set('');
      store.$isSending.set(true);
      store.$assistantTyping.set(true);
      store.$errorMessage.reset();
      store.$messagesByThread.set({
        ...store.$messagesByThread.get(),
        [threadId]: [
          ...(store.$messagesByThread.get()[threadId] ?? []),
          userMessage,
        ],
      });
      store.$threads.set(
        store.$threads
          .get()
          .map((t) =>
            t.id === threadId
              ? { ...t, preview: draft, time: 'now', state: 'active' }
              : t,
          ),
      );

      const ctrl = new AbortController();

      return from(
        postAssistantReply({ threadId, body: draft }, ctrl.signal),
      ).pipe(
        tap((reply) => {
          const modelMessage: Message = {
            id: crypto.randomUUID() as MessageId,
            role: 'model',
            body: reply,
          };
          store.$messagesByThread.set({
            ...store.$messagesByThread.get(),
            [threadId]: [
              ...(store.$messagesByThread.get()[threadId] ?? []),
              modelMessage,
            ],
          });
          store.$threads.set(
            store.$threads
              .get()
              .map((t) =>
                t.id === threadId
                  ? { ...t, preview: reply, time: 'now', state: 'active' }
                  : t,
              ),
          );
        }),
        catchError((error) => {
          if (error instanceof DOMException && error.name === 'AbortError')
            return EMPTY;
          store.$errorMessage.set(
            error instanceof Error ? error.message : 'Failed to send message.',
          );
          store.$connection.set('disconnected');
          store.$threads.set(
            store.$threads
              .get()
              .map((t) => (t.id === threadId ? { ...t, state: 'error' } : t)),
          );
          return EMPTY;
        }),
        finalize(() => {
          store.$isSending.reset();
          store.$assistantTyping.reset();
          ctrl.abort();
        }),
      );
    }),
  );

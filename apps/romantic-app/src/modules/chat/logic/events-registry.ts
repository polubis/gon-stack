import { useEffect, useSyncExternalStore } from 'react';
import { EMPTY, catchError, filter, from, switchMap, tap } from 'rxjs';

import { eda, type TriggerEvent } from '../../../libs/eda';
import {
  getActiveThreadHeader,
  getConnectionStatus,
  getThreadMessages,
  getThreads,
  getThreadsSummary,
  postAssistantReply,
} from '../integration/backend';
import type {
  ActiveThreadHeader,
  ConnectionStatus,
  Message,
  Thread,
  ThreadState,
  ThreadsSummary,
} from '../models';
import {
  $assistantTyping,
  $chatState,
  $connection,
  $draft,
  $errorMessage,
  $header,
  $isSending,
  $messagesByThread,
  $selectedThreadId,
  $summary,
  $threads,
  type ChatStoreState,
  fallbackHeader,
  getChatState,
} from './store';

type ChatEvents =
  | TriggerEvent<'[TRIGGER]_CHAT_BOOTSTRAP'>
  | TriggerEvent<'[TRIGGER]_CHAT_THREAD_SELECTED', { threadId: string }>
  | TriggerEvent<'[TRIGGER]_CHAT_DRAFT_UPDATED', { body: string }>
  | TriggerEvent<'[TRIGGER]_CHAT_SEND_CLICKED'>
  | TriggerEvent<'[TRIGGER]_CHAT_RETRY_CONNECTION'>;

const { ofType, trigger, createRegistry } = eda<ChatEvents>();

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }
  return 'Unknown chat error';
};

const createBootstrap = async () => {
  const threads = await getThreads();
  const selectedThread = threads.find((thread) => thread.active) ?? threads[0];
  const selectedThreadId = selectedThread?.id ?? '';
  const summary = await getThreadsSummary();
  const header =
    selectedThreadId.length > 0
      ? await getActiveThreadHeader(selectedThreadId)
      : fallbackHeader;
  const messagesEntries = await Promise.all(
    threads.map(
      async (thread) =>
        [thread.id, await getThreadMessages(thread.id)] as const,
    ),
  );

  return {
    threads,
    messagesByThread: Object.fromEntries(messagesEntries),
    selectedThreadId,
    summary,
    header,
  };
};

const subscribe = (listener: () => void) => {
  return $chatState.listen(() => listener());
};

const getSnapshot = () => $chatState.get();

const appendMessage = (
  currentMessagesByThread: Record<string, Message[]>,
  threadId: string,
  message: Message,
): Record<string, Message[]> => {
  return {
    ...currentMessagesByThread,
    [threadId]: [...(currentMessagesByThread[threadId] ?? []), message],
  };
};

const updateThreadState = (
  threads: Thread[],
  threadId: string,
  updater: (thread: Thread) => Thread,
): Thread[] =>
  threads.map((thread) => (thread.id === threadId ? updater(thread) : thread));

const toThreadState = (
  connection: ConnectionStatus,
  isSelected: boolean,
): ThreadState => {
  if (connection === 'disconnected') {
    return 'error';
  }
  if (connection === 'reconnecting') {
    return 'loading';
  }
  return isSelected ? 'active' : 'idle';
};

const applySendFailed = (message: string) => {
  const previous = getChatState();
  $isSending.set(false);
  $assistantTyping.set(false);
  $connection.set('disconnected');
  $errorMessage.set(message);
  $threads.set(
    previous.threads.map((thread) => ({
      ...thread,
      state: thread.id === previous.selectedThreadId ? 'error' : thread.state,
    })),
  );
};

const applyConnectionStatus = (status: ConnectionStatus) => {
  const previous = getChatState();
  $connection.set(status);
  if (status === 'connected') {
    $errorMessage.set(null);
  }
  $threads.set(
    previous.threads.map((thread) => {
      const isSelected = thread.id === previous.selectedThreadId;
      return {
        ...thread,
        state: toThreadState(status, isSelected),
      };
    }),
  );
};

const register = () =>
  createRegistry(
    ofType('[TRIGGER]_CHAT_BOOTSTRAP').pipe(
      switchMap(() =>
        from(createBootstrap()).pipe(
          tap(
            ({
              threads,
              messagesByThread,
              selectedThreadId,
              summary,
              header,
            }) => {
              $threads.set(threads);
              $messagesByThread.set(messagesByThread);
              $selectedThreadId.set(selectedThreadId);
              $summary.set(summary);
              $header.set(header);
            },
          ),
          catchError((error) => {
            applySendFailed(getErrorMessage(error));
            return EMPTY;
          }),
        ),
      ),
    ),

    ofType('[TRIGGER]_CHAT_THREAD_SELECTED').pipe(
      tap(({ threadId }) => {
        const currentConnection = $connection.get();
        const nextThreads = $threads.get().map((thread) => ({
          ...thread,
          active: thread.id === threadId,
          unread: thread.id === threadId ? 0 : thread.unread,
          state: toThreadState(currentConnection, thread.id === threadId),
        }));
        $selectedThreadId.set(threadId);
        $threads.set(nextThreads);
      }),
      switchMap(({ threadId }) =>
        from(getActiveThreadHeader(threadId)).pipe(
          tap((header) => {
            if ($selectedThreadId.get() === threadId) {
              $header.set(header);
            }
          }),
          catchError((error) => {
            applySendFailed(getErrorMessage(error));
            return EMPTY;
          }),
        ),
      ),
    ),

    ofType('[TRIGGER]_CHAT_DRAFT_UPDATED').pipe(
      tap(({ body }) => {
        $draft.set(body);
      }),
    ),

    ofType('[TRIGGER]_CHAT_SEND_CLICKED').pipe(
      filter(() => !getChatState().isSending),
      switchMap(() => {
        const previous = getChatState();
        const threadId = previous.selectedThreadId;
        const body = previous.draft.trim();
        if (threadId.length === 0 || body.length === 0) {
          return EMPTY;
        }

        const userMessage: Message = {
          id: crypto.randomUUID(),
          role: 'user',
          body,
        };

        $draft.set('');
        $isSending.set(true);
        $assistantTyping.set(true);
        $errorMessage.set(null);
        $messagesByThread.set(
          appendMessage(previous.messagesByThread, threadId, userMessage),
        );
        $threads.set(
          updateThreadState(previous.threads, threadId, (thread) => ({
            ...thread,
            preview: body,
            time: 'now',
            state: 'active',
          })),
        );

        return from(postAssistantReply({ threadId, body })).pipe(
          tap((reply) => {
            const current = getChatState();
            const modelMessage: Message = {
              id: crypto.randomUUID(),
              role: 'model',
              body: reply,
            };

            $messagesByThread.set(
              appendMessage(current.messagesByThread, threadId, modelMessage),
            );
            $threads.set(
              updateThreadState(current.threads, threadId, (thread) => ({
                ...thread,
                preview: reply,
                time: 'now',
                state: 'active',
              })),
            );
            $isSending.set(false);
            $assistantTyping.set(false);
          }),
          catchError((error) => {
            applySendFailed(getErrorMessage(error));
            return EMPTY;
          }),
        );
      }),
    ),

    ofType('[TRIGGER]_CHAT_RETRY_CONNECTION').pipe(
      tap(() => applyConnectionStatus('reconnecting')),
      switchMap(() =>
        from(getConnectionStatus()).pipe(
          tap((status) => applyConnectionStatus(status)),
          catchError(() => {
            applyConnectionStatus('disconnected');
            return EMPTY;
          }),
        ),
      ),
    ),
  );

type ChatEventsRegistry = {
  register: () => () => void;
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => ChatStoreState;
  triggerBootstrap: () => void;
  triggerThreadSelected: (threadId: string) => void;
  triggerDraftUpdated: (body: string) => void;
  triggerSendClicked: () => void;
  triggerRetryConnection: () => void;
};

const createChatEventsRegistry = (): ChatEventsRegistry => ({
  register,
  subscribe,
  getSnapshot,
  triggerBootstrap: () => trigger('[TRIGGER]_CHAT_BOOTSTRAP'),
  triggerThreadSelected: (threadId) =>
    trigger('[TRIGGER]_CHAT_THREAD_SELECTED', { threadId }),
  triggerDraftUpdated: (body) =>
    trigger('[TRIGGER]_CHAT_DRAFT_UPDATED', { body }),
  triggerSendClicked: () => trigger('[TRIGGER]_CHAT_SEND_CLICKED'),
  triggerRetryConnection: () => trigger('[TRIGGER]_CHAT_RETRY_CONNECTION'),
});

const chatRegistry = createChatEventsRegistry();
let isStarted = false;

const ensureRegistryStarted = () => {
  if (isStarted) {
    return;
  }
  chatRegistry.register();
  chatRegistry.triggerBootstrap();
  isStarted = true;
};

export type ChatViewState = {
  threads: Thread[];
  messages: Message[];
  summary: ThreadsSummary;
  header: ActiveThreadHeader;
  draft: string;
  isSending: boolean;
  assistantTyping: boolean;
  connection: ConnectionStatus;
  errorMessage: string | null;
};

export type ChatViewActions = {
  selectThread: (threadId: string) => void;
  updateDraft: (body: string) => void;
  sendMessage: () => void;
  retryConnection: () => void;
};

export const useChatCommunication = (): ChatViewState & ChatViewActions => {
  useEffect(() => {
    ensureRegistryStarted();
  }, []);

  const snapshot = useSyncExternalStore(
    chatRegistry.subscribe,
    chatRegistry.getSnapshot,
  );

  return {
    threads: snapshot.threads,
    messages: snapshot.messagesByThread[snapshot.selectedThreadId] ?? [],
    summary: snapshot.summary,
    header: snapshot.header,
    draft: snapshot.draft,
    isSending: snapshot.isSending,
    assistantTyping: snapshot.assistantTyping,
    connection: snapshot.connection,
    errorMessage: snapshot.errorMessage,
    selectThread: chatRegistry.triggerThreadSelected,
    updateDraft: chatRegistry.triggerDraftUpdated,
    sendMessage: chatRegistry.triggerSendClicked,
    retryConnection: chatRegistry.triggerRetryConnection,
  };
};

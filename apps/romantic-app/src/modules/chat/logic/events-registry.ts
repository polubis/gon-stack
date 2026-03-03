import { useEffect, useSyncExternalStore } from 'react';
import { filter, from, map, mergeMap, of, switchMap, tap } from 'rxjs';

import {
  eda,
  type FactEvent,
  type TaskEvent,
  type TriggerEvent
} from '../../../libs/eda';
import {
  getActiveThreadHeader,
  getConnectionStatus,
  getThreadMessages,
  getThreads,
  getThreadsSummary,
  postAssistantReply
} from '../integration/backend';
import type {
  ActiveThreadHeader,
  ConnectionStatus,
  Message,
  Thread,
  ThreadState,
  ThreadsSummary
} from '../models';

type ChatState = {
  threads: Thread[];
  messagesByThread: Record<string, Message[]>;
  selectedThreadId: string;
  summary: ThreadsSummary;
  header: ActiveThreadHeader;
  draft: string;
  isSending: boolean;
  assistantTyping: boolean;
  connection: ConnectionStatus;
  errorMessage: string | null;
};

type SendPayload = {
  threadId: string;
  body: string;
};

type ChatEvents =
  | TriggerEvent<'[TRIGGER]_CHAT_BOOTSTRAP'>
  | TriggerEvent<'[TRIGGER]_CHAT_THREAD_SELECTED', { threadId: string }>
  | TriggerEvent<'[TRIGGER]_CHAT_DRAFT_UPDATED', { body: string }>
  | TriggerEvent<'[TRIGGER]_CHAT_SEND_CLICKED'>
  | TriggerEvent<'[TRIGGER]_CHAT_RETRY_CONNECTION'>
  | TaskEvent<'[TASK]_CHAT_LOAD_BOOTSTRAP'>
  | TaskEvent<'[TASK]_CHAT_LOAD_THREAD_HEADER', { threadId: string }>
  | TaskEvent<'[TASK]_CHAT_REQUEST_ASSISTANT_REPLY', SendPayload>
  | TaskEvent<'[TASK]_CHAT_RETRY_CONNECTION'>
  | FactEvent<
      '[FACT]_CHAT_BOOTSTRAP_READY',
      {
        threads: Thread[];
        messagesByThread: Record<string, Message[]>;
        selectedThreadId: string;
        summary: ThreadsSummary;
        header: ActiveThreadHeader;
      }
    >
  | FactEvent<'[FACT]_CHAT_THREAD_SELECTED', { threadId: string }>
  | FactEvent<'[FACT]_CHAT_THREAD_HEADER_READY', { threadId: string; header: ActiveThreadHeader }>
  | FactEvent<'[FACT]_CHAT_DRAFT_UPDATED', { body: string }>
  | FactEvent<'[FACT]_CHAT_USER_MESSAGE_ACCEPTED', SendPayload>
  | FactEvent<'[FACT]_CHAT_ASSISTANT_TYPING_STARTED'>
  | FactEvent<'[FACT]_CHAT_ASSISTANT_MESSAGE_READY', SendPayload>
  | FactEvent<'[FACT]_CHAT_SEND_COMPLETED'>
  | FactEvent<'[FACT]_CHAT_SEND_FAILED', { message: string }>
  | FactEvent<'[FACT]_CHAT_CONNECTION_UPDATED', { status: ConnectionStatus }>;

const {
  ofType,
  trigger,
  forwardAs,
  createRegistry,
  createForwardErrorAs
} = eda<ChatEvents>();

const forwardErrorAs = createForwardErrorAs<{ message: string }>((error) => {
  if (error instanceof Error) {
    return { message: error.message };
  }
  return { message: 'Unknown chat error' };
});

const fallbackHeader: ActiveThreadHeader = {
  title: 'New Chat',
  modelLabel: 'Amoria-4.1',
  contextStatus: 'Context window healthy'
};

const createBootstrap = async () => {
  const threads = await getThreads();
  const selectedThread = threads.find((thread) => thread.active) ?? threads[0];
  const selectedThreadId = selectedThread?.id ?? '';
  const summary = await getThreadsSummary();
  const header = selectedThreadId.length > 0 ? await getActiveThreadHeader(selectedThreadId) : fallbackHeader;
  const messagesEntries = await Promise.all(
    threads.map(async (thread) => [thread.id, await getThreadMessages(thread.id)] as const)
  );

  return {
    threads,
    messagesByThread: Object.fromEntries(messagesEntries),
    selectedThreadId,
    summary,
    header
  };
};

const createInitialState = (): ChatState => ({
  threads: [],
  messagesByThread: {},
  selectedThreadId: '',
  summary: { total: 0 },
  header: fallbackHeader,
  draft: '',
  isSending: false,
  assistantTyping: false,
  connection: 'connected',
  errorMessage: null
});

let state: ChatState = createInitialState();
const listeners = new Set<() => void>();

const setState = (updater: (previous: ChatState) => ChatState) => {
  state = updater(state);
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = () => state;

const appendMessage = (
  currentMessagesByThread: Record<string, Message[]>,
  threadId: string,
  message: Message
): Record<string, Message[]> => {
  return {
    ...currentMessagesByThread,
    [threadId]: [...(currentMessagesByThread[threadId] ?? []), message]
  };
};

const updateThreadState = (
  threads: Thread[],
  threadId: string,
  updater: (thread: Thread) => Thread
): Thread[] => threads.map((thread) => (thread.id === threadId ? updater(thread) : thread));

const toThreadState = (connection: ConnectionStatus, isSelected: boolean): ThreadState => {
  if (connection === 'disconnected') {
    return 'error';
  }
  if (connection === 'reconnecting') {
    return 'loading';
  }
  return isSelected ? 'active' : 'idle';
};

const register = () => createRegistry(
  ofType('[TRIGGER]_CHAT_BOOTSTRAP').pipe(forwardAs('[TASK]_CHAT_LOAD_BOOTSTRAP')),

  ofType('[TASK]_CHAT_LOAD_BOOTSTRAP').pipe(
    switchMap(() =>
      from(createBootstrap()).pipe(
        forwardAs('[FACT]_CHAT_BOOTSTRAP_READY'),
        forwardErrorAs('[FACT]_CHAT_SEND_FAILED', (error) => ({ message: error.message }))
      )
    )
  ),

  ofType('[FACT]_CHAT_BOOTSTRAP_READY').pipe(
    tap(({ threads, messagesByThread, selectedThreadId, summary, header }) => {
      setState((previous) => ({
        ...previous,
        threads,
        messagesByThread,
        selectedThreadId,
        summary,
        header
      }));
    })
  ),

  ofType('[TRIGGER]_CHAT_THREAD_SELECTED').pipe(forwardAs('[FACT]_CHAT_THREAD_SELECTED')),
  ofType('[TRIGGER]_CHAT_THREAD_SELECTED').pipe(forwardAs('[TASK]_CHAT_LOAD_THREAD_HEADER')),

  ofType('[FACT]_CHAT_THREAD_SELECTED').pipe(
    tap(({ threadId }) => {
      setState((previous) => {
        return {
          ...previous,
          selectedThreadId: threadId,
          threads: previous.threads.map((thread) => ({
            ...thread,
            active: thread.id === threadId,
            unread: thread.id === threadId ? 0 : thread.unread,
            state: toThreadState(previous.connection, thread.id === threadId)
          }))
        };
      });
    })
  ),
  ofType('[TASK]_CHAT_LOAD_THREAD_HEADER').pipe(
    switchMap(({ threadId }) =>
      from(getActiveThreadHeader(threadId)).pipe(
        map((header) => ({ threadId, header })),
        forwardAs('[FACT]_CHAT_THREAD_HEADER_READY'),
        forwardErrorAs('[FACT]_CHAT_SEND_FAILED', (error) => ({ message: error.message }))
      )
    )
  ),
  ofType('[FACT]_CHAT_THREAD_HEADER_READY').pipe(
    tap(({ threadId, header }) => {
      setState((previous) => {
        if (previous.selectedThreadId !== threadId) {
          return previous;
        }

        return {
          ...previous,
          header
        };
      });
    })
  ),

  ofType('[TRIGGER]_CHAT_DRAFT_UPDATED').pipe(forwardAs('[FACT]_CHAT_DRAFT_UPDATED')),

  ofType('[FACT]_CHAT_DRAFT_UPDATED').pipe(
    tap(({ body }) => {
      setState((previous) => ({ ...previous, draft: body }));
    })
  ),

  ofType('[TRIGGER]_CHAT_SEND_CLICKED').pipe(
    filter(() => !state.isSending),
    map(() => ({ threadId: state.selectedThreadId, body: state.draft.trim() })),
    filter(({ threadId, body }) => threadId.length > 0 && body.length > 0),
    forwardAs('[FACT]_CHAT_USER_MESSAGE_ACCEPTED'),
    forwardAs('[TASK]_CHAT_REQUEST_ASSISTANT_REPLY')
  ),

  ofType('[FACT]_CHAT_USER_MESSAGE_ACCEPTED').pipe(
    tap(({ threadId, body }) => {
      setState((previous) => {
        const userMessage: Message = {
          id: crypto.randomUUID(),
          role: 'user',
          body
        };

        return {
          ...previous,
          draft: '',
          isSending: true,
          assistantTyping: true,
          errorMessage: null,
          messagesByThread: appendMessage(previous.messagesByThread, threadId, userMessage),
          threads: updateThreadState(previous.threads, threadId, (thread) => ({
            ...thread,
            preview: body,
            time: 'now',
            state: 'active'
          }))
        };
      });
    }),
    forwardAs('[FACT]_CHAT_ASSISTANT_TYPING_STARTED')
  ),

  ofType('[TASK]_CHAT_REQUEST_ASSISTANT_REPLY').pipe(
    switchMap(({ threadId, body }) =>
      from(postAssistantReply({ threadId, body })).pipe(
        map((reply) => ({ threadId, body: reply })),
        forwardAs('[FACT]_CHAT_ASSISTANT_MESSAGE_READY'),
        forwardErrorAs('[FACT]_CHAT_SEND_FAILED', (error) => ({ message: error.message }))
      )
    )
  ),

  ofType('[FACT]_CHAT_ASSISTANT_MESSAGE_READY').pipe(
    tap(({ threadId, body }) => {
      setState((previous) => {
        const modelMessage: Message = {
          id: crypto.randomUUID(),
          role: 'model',
          body
        };

        return {
          ...previous,
          messagesByThread: appendMessage(previous.messagesByThread, threadId, modelMessage),
          threads: updateThreadState(previous.threads, threadId, (thread) => ({
            ...thread,
            preview: body,
            time: 'now',
            state: 'active'
          }))
        };
      });
    }),
    forwardAs('[FACT]_CHAT_SEND_COMPLETED')
  ),

  ofType('[FACT]_CHAT_SEND_COMPLETED').pipe(
    tap(() => {
      setState((previous) => ({
        ...previous,
        isSending: false,
        assistantTyping: false
      }));
    })
  ),

  ofType('[FACT]_CHAT_SEND_FAILED').pipe(
    tap(({ message }) => {
      setState((previous) => ({
        ...previous,
        isSending: false,
        assistantTyping: false,
        connection: 'disconnected',
        errorMessage: message,
        threads: previous.threads.map((thread) => ({
          ...thread,
          state: thread.id === previous.selectedThreadId ? 'error' : thread.state
        }))
      }));
    })
  ),

  ofType('[TRIGGER]_CHAT_RETRY_CONNECTION').pipe(
    forwardAs('[TASK]_CHAT_RETRY_CONNECTION')
  ),

  ofType('[TASK]_CHAT_RETRY_CONNECTION').pipe(
    switchMap(() =>
      of({ status: 'reconnecting' as ConnectionStatus }).pipe(
        forwardAs('[FACT]_CHAT_CONNECTION_UPDATED'),
        mergeMap(() =>
          from(getConnectionStatus()).pipe(
            map((status) => ({ status })),
            forwardAs('[FACT]_CHAT_CONNECTION_UPDATED'),
            forwardErrorAs('[FACT]_CHAT_CONNECTION_UPDATED', () => ({ status: 'disconnected' as ConnectionStatus }))
          )
        )
      )
    )
  ),

  ofType('[FACT]_CHAT_CONNECTION_UPDATED').pipe(
    tap(({ status }) => {
      setState((previous) => ({
        ...previous,
        connection: status,
        errorMessage: status === 'connected' ? null : previous.errorMessage,
        threads: previous.threads.map((thread) => {
          const isSelected = thread.id === previous.selectedThreadId;
          return {
            ...thread,
            state: toThreadState(status, isSelected)
          };
        })
      }));
    })
  )
);

type ChatEventsRegistry = {
  register: () => () => void;
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => ChatState;
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
  triggerThreadSelected: (threadId) => trigger('[TRIGGER]_CHAT_THREAD_SELECTED', { threadId }),
  triggerDraftUpdated: (body) => trigger('[TRIGGER]_CHAT_DRAFT_UPDATED', { body }),
  triggerSendClicked: () => trigger('[TRIGGER]_CHAT_SEND_CLICKED'),
  triggerRetryConnection: () => trigger('[TRIGGER]_CHAT_RETRY_CONNECTION')
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

  const snapshot = useSyncExternalStore(chatRegistry.subscribe, chatRegistry.getSnapshot);

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
    retryConnection: chatRegistry.triggerRetryConnection
  };
};

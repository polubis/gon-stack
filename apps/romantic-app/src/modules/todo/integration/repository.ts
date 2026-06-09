import type {
  ConnectionStatus,
  Message,
  MessageRole,
  Thread,
  ThreadId,
  MessageId,
} from '../domain/models';

type MockConfig = {
  delayMs?: number;
  errorFactor?: number;
};

const mock =
  ({ delayMs = 160, errorFactor = 0 }: MockConfig = {}) =>
  <TResponse>(response: TResponse) =>
  (signal?: AbortSignal): Promise<TResponse> =>
    new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        if (Math.floor(Math.random() * 101) <= errorFactor) {
          reject(new Error('Mock backend failure'));
          return;
        }
        resolve(response);
      }, delayMs);

      signal?.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      });
    });

type BackendThreadDto = {
  thread_id: string;
  title: string;
  last_preview: string;
  relative_time_label: string;
  unread_count: number;
  is_active: boolean;
  sync_state: 'active' | 'idle' | 'loading' | 'error';
};

const backendThreads: BackendThreadDto[] = [
  {
    thread_id: 'th-01',
    title: 'Date Night Brainstorm',
    last_preview: 'Can you suggest cozy ideas for Friday?',
    relative_time_label: '2m ago',
    unread_count: 2,
    is_active: true,
    sync_state: 'active',
  },
  {
    thread_id: 'th-02',
    title: 'Gift Ideas',
    last_preview: 'Something meaningful under $50',
    relative_time_label: '12m ago',
    unread_count: 0,
    is_active: false,
    sync_state: 'idle',
  },
  {
    thread_id: 'th-03',
    title: 'Weekend Escape',
    last_preview: 'Looking for a calm place nearby',
    relative_time_label: '41m ago',
    unread_count: 0,
    is_active: false,
    sync_state: 'loading',
  },
  {
    thread_id: 'th-04',
    title: 'Anniversary Note',
    last_preview: 'Make it warm but not cheesy',
    relative_time_label: 'Yesterday',
    unread_count: 0,
    is_active: false,
    sync_state: 'error',
  },
];

const toThread = (dto: BackendThreadDto): Thread => ({
  id: dto.thread_id as ThreadId,
  title: dto.title,
  preview: dto.last_preview,
  time: dto.relative_time_label,
  unread: dto.unread_count,
  active: dto.is_active,
  state: dto.sync_state,
});

type BackendMessageDto = {
  id: string;
  actor: 'assistant' | 'user' | 'system';
  content: string;
};

const backendMessagesByThread: Record<string, BackendMessageDto[]> = {
  'th-01': [
    {
      id: 'm-1',
      actor: 'assistant',
      content:
        "Love this. Let's build a romantic evening with one surprise moment and one grounding ritual.",
    },
    {
      id: 'm-2',
      actor: 'user',
      content: 'Perfect. Keep it low budget, intimate, and no crowded places.',
    },
    {
      id: 'm-3',
      actor: 'system',
      content:
        'Memory updated: prefers intimate plans, low budget, and quiet locations.',
    },
    {
      id: 'm-4',
      actor: 'assistant',
      content:
        'Plan draft: sunset walk, handwritten note exchange, then homemade dessert with a shared playlist.',
    },
  ],
  'th-02': [
    {
      id: 'm-5',
      actor: 'assistant',
      content:
        'Tell me your partner style and I will shortlist meaningful gifts.',
    },
  ],
  'th-03': [
    {
      id: 'm-6',
      actor: 'system',
      content: 'Travel suggestions sync in progress.',
    },
  ],
  'th-04': [
    {
      id: 'm-7',
      actor: 'system',
      content: 'Draft recovery failed. Try reconnecting and retry.',
    },
  ],
};

const toRole = (actor: BackendMessageDto['actor']): MessageRole => {
  if (actor === 'assistant') return 'model';
  return actor;
};

const toMessage = (dto: BackendMessageDto): Message => ({
  id: dto.id as MessageId,
  role: toRole(dto.actor),
  body: dto.content,
});

const buildReply = (prompt: string): string => {
  const normalized = prompt.trim().toLowerCase();

  if (normalized.includes('budget')) {
    return 'Budget-friendly plan: sunset walk, playlist exchange, and homemade dessert with a handwritten note.';
  }

  if (normalized.includes('gift')) {
    return 'Gift direction: choose one practical daily-use item plus one memory token tied to a shared moment.';
  }

  return 'Great direction. I can turn this into a step-by-step plan with timings, mood cues, and a backup option.';
};

export const getThreads = async (signal?: AbortSignal): Promise<Thread[]> => {
  const response = await mock({ delayMs: 120 })(backendThreads)(signal);
  return response.map(toThread);
};

export const getThreadMessages = async (
  threadId: string,
  signal?: AbortSignal,
): Promise<Message[]> => {
  const response = await mock({ delayMs: 140 })(
    backendMessagesByThread[threadId] ?? [],
  )(signal);
  return response.map(toMessage);
};

export const postAssistantReply = async (
  payload: { threadId: string; body: string },
  signal?: AbortSignal,
): Promise<string> => {
  const response = await mock({ delayMs: 850, errorFactor: 4 })(
    buildReply(payload.body),
  )(signal);
  return response;
};

export const getConnectionStatus = async (
  signal?: AbortSignal,
): Promise<ConnectionStatus> => {
  const response = await mock({
    delayMs: 600,
    errorFactor: 15,
  })<ConnectionStatus>('connected')(signal);
  return response;
};

import { atom, computed } from '@/libs/supa-store';
import type {
  ConnectionStatus,
  Message,
  Thread,
  ThreadId,
} from '../domain/models';

export const createStore = () => {
  const $isBootstrapping = atom(false);
  const $bootstrapError = atom<string | null>(null);
  const $threads = atom<Thread[]>([]);
  const $selectedThreadId = atom('' as ThreadId);
  const $messagesByThread = atom<Record<string, Message[]>>({});
  const $draft = atom('');
  const $isSending = atom(false);
  const $assistantTyping = atom(false);
  const $connection = atom<ConnectionStatus>('connected');
  const $errorMessage = atom<string | null>(null);
  const $searchQuery = atom('');

  return {
    $isBootstrapping,
    $bootstrapError,
    $threads,
    $selectedThreadId,
    $messagesByThread,
    $draft,
    $isSending,
    $assistantTyping,
    $connection,
    $errorMessage,
    $searchQuery,
    $activeThread: computed(
      [$threads, $selectedThreadId],
      (threads, selectedThreadId) =>
        threads.find((t) => t.id === selectedThreadId) ?? null,
    ),
    $activeMessages: computed(
      [$messagesByThread, $selectedThreadId],
      (messagesByThread, selectedThreadId) =>
        messagesByThread[selectedThreadId] ?? [],
    ),
    $filteredThreads: computed(
      [$threads, $searchQuery],
      (threads, searchQuery) => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return threads;
        return threads.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            t.preview.toLowerCase().includes(q),
        );
      },
    ),
  };
};

export type Store = ReturnType<typeof createStore>;

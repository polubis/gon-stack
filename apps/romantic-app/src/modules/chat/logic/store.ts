import { atom, computed, map } from '../../../libs/supa-store';
import type { Message, Thread, ThreadId, MessageId } from '../models';

export const createStore = () => {
  const $threads = map<Record<ThreadId, Thread>>({});
  const $activeThreadId = atom<ThreadId | null>(null);
  const $messages = map<Record<MessageId, Message>>({});

  return {
    $threadsList: computed($threads, (threads) => Object.values(threads)),
    $activeThread: computed(
      [$threads, $activeThreadId],
      (threads, activeThreadId) =>
        activeThreadId ? threads[activeThreadId] : null,
    ),
    $messagesList: computed($messages, (messages) => Object.values(messages)),
    $threads: $threads,
    $activeThreadId: $activeThreadId,
    $messages: $messages,
  };
};

export type Store = ReturnType<typeof createStore>;

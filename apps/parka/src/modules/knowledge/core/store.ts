import { atom } from '@repo/react-kit/supa-store';
import type {
  Category,
  Folder,
  KnowledgeNode,
  Notice,
  Priority,
} from '../domain/models';

export const createStore = () => {
  const $nodes = atom<KnowledgeNode[]>([]);
  const $folders = atom<Folder[]>([]);
  const $categories = atom<Category[]>([]);
  const $priorities = atom<Priority[]>([]);
  const $initializing = atom(true);
  const $isLoading = atom(false);
  const $error = atom<string | null>(null);
  const $notice = atom<Notice | null>(null);

  // Writes run one after another: a node never races its new folder.
  let tail: Promise<unknown> = Promise.resolve();
  const enqueue = <T>(run: () => Promise<T>): Promise<T> => {
    const result = tail.then(run);
    tail = result.catch(() => undefined);
    return result;
  };

  return {
    $nodes,
    $folders,
    $categories,
    $priorities,
    $initializing,
    $isLoading,
    $error,
    $notice,
    enqueue,
  };
};

export type Store = ReturnType<typeof createStore>;

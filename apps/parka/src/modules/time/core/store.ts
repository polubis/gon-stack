import { atom } from '@repo/react-kit/supa-store';
import type {
  BacklogTask,
  Category,
  Notice,
  Priority,
  Task,
} from '../domain/models';

export type Range = { from: string; to: string };

export const createStore = () => {
  const $tasks = atom<Task[]>([]);
  const $backlog = atom<BacklogTask[]>([]);
  const $categories = atom<Category[]>([]);
  const $priorities = atom<Priority[]>([]);
  const $initializing = atom(true);
  const $isLoading = atom(false);
  const $error = atom<string | null>(null);
  const $notice = atom<Notice | null>(null);
  /** Range the data in `$tasks` was loaded for. */
  const $loaded = atom<Range | null>(null);
  /** Range asked for last. */
  const $range = atom<Range | null>(null);
  /** Writes in flight; a load answered meanwhile is dropped and repeated. */
  const $pending = atom(0);
  const $stale = atom(false);
  /** Bumped when a write starts or ends: a load that saw it change is outdated. */
  const $writeSeq = atom(0);

  // Writes run one after another: a task never races its new category.
  let tail: Promise<unknown> = Promise.resolve();
  const enqueue = <T>(run: () => Promise<T>): Promise<T> => {
    const result = tail.then(run);
    tail = result.catch(() => undefined);
    return result;
  };

  return {
    $tasks,
    $backlog,
    $categories,
    $priorities,
    $initializing,
    $isLoading,
    $error,
    $notice,
    $loaded,
    $range,
    $pending,
    $stale,
    $writeSeq,
    enqueue,
  };
};

export type Store = ReturnType<typeof createStore>;

import { atom } from '@repo/react-kit/supa-store';
import type { View } from '../domain/events';
import type {
  Catalog,
  Category,
  Notice,
  Reel,
  ReelId,
  Tag,
  Topic,
  TopicId,
} from '../domain/models';

export const createStore = () => {
  const $categories = atom<Category[]>([]);
  const $catalogs = atom<Catalog[]>([]);
  const $tags = atom<Tag[]>([]);
  /** Every topic, unfiltered: feeds the brain and the summary. */
  const $all = atom<Topic[]>([]);
  /** Topics planned inside the viewed period, filtered and sorted. */
  const $ranged = atom<Topic[]>([]);
  /** Topics without a study day, filtered and sorted. */
  const $backlog = atom<Topic[]>([]);
  /** Reels of the topics opened so far (editor, viewer). */
  const $reels = atom<Record<TopicId, Reel[]>>({});
  /** Reels whose picture or clip is being sent or removed. */
  const $mediaBusy = atom<ReelId[]>([]);
  const $initializing = atom(true);
  const $isLoading = atom(false);
  const $loaded = atom(false);
  const $error = atom<string | null>(null);
  const $notice = atom<Notice | null>(null);
  /** The demo course is being created. */
  const $demoBusy = atom(false);
  /** View asked for last. */
  const $view = atom<View | null>(null);
  /** Writes in flight; a load answered meanwhile is dropped and repeated. */
  const $pending = atom(0);
  const $stale = atom(false);
  /** Bumped when a write starts or ends: a load that saw it change is outdated. */
  const $writeSeq = atom(0);
  /** Placeholder id -> id the server gave. */
  const ids = new Map<string, string>();

  // Writes run one after another: a topic never races its new catalog.
  let tail: Promise<unknown> = Promise.resolve();
  const enqueue = <T>(run: () => Promise<T>): Promise<T> => {
    const result = tail.then(run);
    tail = result.catch(() => undefined);
    return result;
  };

  return {
    $categories,
    $catalogs,
    $tags,
    $all,
    $ranged,
    $backlog,
    $reels,
    $mediaBusy,
    $initializing,
    $isLoading,
    $loaded,
    $error,
    $notice,
    $demoBusy,
    $view,
    $pending,
    $stale,
    $writeSeq,
    ids,
    enqueue,
  };
};

export type Store = ReturnType<typeof createStore>;

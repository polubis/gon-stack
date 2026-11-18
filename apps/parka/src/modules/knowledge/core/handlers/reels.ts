import { catchError, concatMap, EMPTY, from, mergeMap, tap } from 'rxjs';
import { errorMessage } from '@/shared/errors/error-message';
import type { Reel, ReelId, ReelMedia, TopicId } from '../../domain/models';
import {
  fetchTopic,
  postReel,
  putProgress,
  putReel,
  removeReel,
  removeReelMedia as sendRemoveReelMedia,
  uploadReelMedia as sendUploadReelMedia,
} from '../../integration/repository';
import { mutate } from '../actions/mutate';
import { notify } from '../actions/notify';
import { resolveId, write } from '../actions/pending';
import { bumpCounts, patchTopic } from '../actions/topics';
import type { Bus } from '../bus';
import type { Store } from '../store';

const byPosition = (a: Reel, b: Reel) => a.position - b.position;

const reelsOf = (store: Store, topicId: TopicId): Reel[] =>
  store.$reels.get()[topicId] ?? [];

const setReels = (store: Store, topicId: TopicId, reels: Reel[]): void =>
  store.$reels.set({
    ...store.$reels.get(),
    [topicId]: [...reels].sort(byPosition),
  });

const findReel = (store: Store, id: ReelId): Reel | undefined =>
  Object.values(store.$reels.get())
    .flat()
    .find((r) => r.id === id);

/** Reads a topic with its reels (editor, viewer); queued behind writes. */
export const loadReels = (store: Store, bus: Bus) =>
  bus.ofType('[TRIGGER]_LOAD_REELS').pipe(
    mergeMap(({ topicId }) =>
      from(write(store, bus, () => fetchTopic(resolveId(store, topicId)))).pipe(
        tap(({ topic, reels }) => {
          setReels(store, topic.id, reels);
          patchTopic(store, topic.id, (t) => ({
            ...t,
            reelCount: topic.reelCount,
            doneCount: topic.doneCount,
          }));
        }),
        catchError((error: unknown) => {
          notify(store, {
            tone: 'error',
            title: 'Nie udało się wczytać rolek',
            code: 'KNOWLEDGE_REELS_LOAD_FAILED',
            description: errorMessage(error),
            retry: () => bus.emit('[TRIGGER]_LOAD_REELS', { topicId }),
          });
          return EMPTY;
        }),
      ),
    ),
  );

export const createReel = (store: Store, bus: Bus) =>
  bus.ofType('[TRIGGER]_CREATE_REEL').pipe(
    tap(({ reel }) => {
      setReels(store, reel.topicId, [...reelsOf(store, reel.topicId), reel]);
      bumpCounts(store, reel.topicId, 1, 0);
    }),
    concatMap(({ reel }) =>
      mutate(store, bus, {
        run: () =>
          postReel({
            topicId: resolveId(store, reel.topicId),
            body: reel.body,
          }),
        saved: (saved) => {
          store.ids.set(reel.id, saved.id);
          setReels(
            store,
            reel.topicId,
            reelsOf(store, reel.topicId).map((r) =>
              r.id === reel.id ? saved : r,
            ),
          );
        },
        rollback: () => {
          setReels(
            store,
            reel.topicId,
            reelsOf(store, reel.topicId).filter((r) => r.id !== reel.id),
          );
          bumpCounts(store, reel.topicId, -1, 0);
        },
        success: 'Dodano rolkę.',
        failure: {
          title: 'Nie udało się dodać rolki',
          code: 'KNOWLEDGE_REEL_CREATE_FAILED',
        },
        retry: () => bus.emit('[TRIGGER]_CREATE_REEL', { reel }),
      }),
    ),
  );

export const updateReel = (store: Store, bus: Bus) =>
  bus.ofType('[TRIGGER]_UPDATE_REEL').pipe(
    concatMap(({ reel }) => {
      const previous = reelsOf(store, reel.topicId).find(
        (r) => r.id === reel.id,
      );
      const swap = (next: Reel) =>
        setReels(
          store,
          reel.topicId,
          reelsOf(store, reel.topicId).map((r) =>
            r.id === reel.id ? next : r,
          ),
        );
      swap(reel);
      return mutate(store, bus, {
        run: () => putReel({ ...reel, id: resolveId(store, reel.id) }),
        saved: (saved) => {
          swap(saved);
          // A move shifts the neighbours: take the order the server settled on.
          if (previous && previous.position !== reel.position)
            bus.emit('[TRIGGER]_LOAD_REELS', { topicId: reel.topicId });
        },
        rollback: () => previous && swap(previous),
        success: 'Zapisano rolkę.',
        failure: {
          title: 'Nie udało się zapisać rolki',
          code: 'KNOWLEDGE_REEL_UPDATE_FAILED',
        },
        retry: () => bus.emit('[TRIGGER]_UPDATE_REEL', { reel }),
      });
    }),
  );

export const deleteReel = (store: Store, bus: Bus) =>
  bus.ofType('[TRIGGER]_DELETE_REEL').pipe(
    concatMap(({ id }) => {
      const reel = findReel(store, id);
      if (!reel) return EMPTY;
      const own = reelsOf(store, reel.topicId);
      setReels(
        store,
        reel.topicId,
        own.filter((r) => r.id !== id),
      );
      bumpCounts(store, reel.topicId, -1, reel.done ? -1 : 0);
      return mutate(store, bus, {
        run: () => removeReel(resolveId(store, id)),
        saved: () => undefined,
        rollback: () => {
          setReels(store, reel.topicId, own);
          bumpCounts(store, reel.topicId, 1, reel.done ? 1 : 0);
        },
        success: 'Usunięto rolkę.',
        failure: {
          title: 'Nie udało się usunąć rolki',
          code: 'KNOWLEDGE_REEL_DELETE_FAILED',
        },
        retry: () => bus.emit('[TRIGGER]_DELETE_REEL', { id }),
      });
    }),
  );

const setBusy = (store: Store, id: ReelId, busy: boolean): void =>
  store.$mediaBusy.set([
    ...store.$mediaBusy.get().filter((b) => b !== id),
    ...(busy ? [id] : []),
  ]);

/** Swaps the media of a reel in the store; returns what it was before. */
const swapMedia = (
  store: Store,
  id: ReelId,
  media: ReelMedia | null,
): ReelMedia | null => {
  const reel = findReel(store, id);
  if (!reel) return null;
  setReels(
    store,
    reel.topicId,
    reelsOf(store, reel.topicId).map((r) =>
      r.id === id ? { ...r, media } : r,
    ),
  );
  return reel.media;
};

/** Shows the picked file at once (local preview), then sends it and re-reads the reels for fresh links. */
export const uploadReelMedia = (store: Store, bus: Bus) =>
  bus.ofType('[TRIGGER]_UPLOAD_REEL_MEDIA').pipe(
    concatMap(({ reelId, file }) => {
      const kind = file.type.startsWith('video/') ? 'video' : 'image';
      const preview = URL.createObjectURL(file);
      const previous = swapMedia(store, reelId, { kind, url: preview });
      setBusy(store, reelId, true);
      const finish = () => {
        setBusy(store, reelId, false);
        URL.revokeObjectURL(preview);
      };
      return mutate(store, bus, {
        run: () => sendUploadReelMedia(resolveId(store, reelId), file),
        saved: (saved) => {
          swapMedia(store, reelId, saved.media);
          finish();
          const topicId = findReel(store, reelId)?.topicId;
          if (topicId) bus.emit('[TRIGGER]_LOAD_REELS', { topicId });
        },
        rollback: () => {
          swapMedia(store, reelId, previous);
          finish();
        },
        success: 'Zapisano media rolki.',
        failure: {
          title: 'Nie udało się wysłać pliku',
          code: 'KNOWLEDGE_REEL_MEDIA_UPLOAD_FAILED',
        },
        retry: () => bus.emit('[TRIGGER]_UPLOAD_REEL_MEDIA', { reelId, file }),
      });
    }),
  );

export const removeReelMedia = (store: Store, bus: Bus) =>
  bus.ofType('[TRIGGER]_REMOVE_REEL_MEDIA').pipe(
    concatMap(({ reelId }) => {
      const previous = swapMedia(store, reelId, null);
      setBusy(store, reelId, true);
      return mutate(store, bus, {
        run: () => sendRemoveReelMedia(resolveId(store, reelId)),
        saved: () => setBusy(store, reelId, false),
        rollback: () => {
          swapMedia(store, reelId, previous);
          setBusy(store, reelId, false);
        },
        success: 'Usunięto media rolki.',
        failure: {
          title: 'Nie udało się usunąć pliku',
          code: 'KNOWLEDGE_REEL_MEDIA_REMOVE_FAILED',
        },
        retry: () => bus.emit('[TRIGGER]_REMOVE_REEL_MEDIA', { reelId }),
      });
    }),
  );

export const setProgress = (store: Store, bus: Bus) =>
  bus.ofType('[TRIGGER]_SET_PROGRESS').pipe(
    concatMap(({ reelId, done }) => {
      const reel = findReel(store, reelId);
      const flip = (value: boolean) => {
        if (!reel) return;
        setReels(
          store,
          reel.topicId,
          reelsOf(store, reel.topicId).map((r) =>
            r.id === reelId ? { ...r, done: value } : r,
          ),
        );
        bumpCounts(store, reel.topicId, 0, value ? 1 : -1);
      };
      if (reel && reel.done !== done) flip(done);
      return mutate(store, bus, {
        run: () => putProgress(resolveId(store, reelId), done),
        saved: () => undefined,
        rollback: () => reel && reel.done !== done && flip(reel.done),
        failure: {
          title: 'Nie udało się zapisać postępu',
          code: 'KNOWLEDGE_PROGRESS_FAILED',
        },
        retry: () => bus.emit('[TRIGGER]_SET_PROGRESS', { reelId, done }),
      });
    }),
  );

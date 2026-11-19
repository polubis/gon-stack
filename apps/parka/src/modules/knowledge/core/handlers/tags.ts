import { concatMap, tap } from 'rxjs';
import { postTag, putTag, removeTag } from '../../integration/repository';
import { mutate } from '../actions/mutate';
import { resolveId } from '../actions/pending';
import { snapshot } from '../actions/snapshot';
import type { Bus } from '../bus';
import type { Store } from '../store';

export const createTag = (store: Store, bus: Bus) =>
  bus.ofType('[TRIGGER]_CREATE_TAG').pipe(
    tap(({ tag }) => store.$tags.set([...store.$tags.get(), tag])),
    concatMap(({ tag }) =>
      mutate(store, bus, {
        run: () => postTag(tag),
        saved: (saved) => {
          store.ids.set(tag.id, saved.id);
          store.$tags.set(
            store.$tags.get().map((t) => (t.id === tag.id ? saved : t)),
          );
          const swap = <T extends { tagIds: string[] }>(list: T[]) =>
            list.map((t) => ({
              ...t,
              tagIds: t.tagIds.map((id) => (id === tag.id ? saved.id : id)),
            }));
          store.$all.set(swap(store.$all.get()));
          store.$listed.set(swap(store.$listed.get()));
          store.$backlog.set(swap(store.$backlog.get()));
        },
        rollback: () =>
          store.$tags.set(store.$tags.get().filter((t) => t.id !== tag.id)),
        success: 'Dodano tag.',
        failure: {
          title: 'Nie udało się dodać tagu',
          code: 'KNOWLEDGE_TAG_CREATE_FAILED',
        },
        retry: () => bus.emit('[TRIGGER]_CREATE_TAG', { tag }),
      }),
    ),
  );

export const updateTag = (store: Store, bus: Bus) =>
  bus.ofType('[TRIGGER]_UPDATE_TAG').pipe(
    concatMap(({ tag }) => {
      const previous = store.$tags.get().find((t) => t.id === tag.id);
      store.$tags.set(
        store.$tags.get().map((t) => (t.id === tag.id ? tag : t)),
      );
      return mutate(store, bus, {
        run: () => putTag({ ...tag, id: resolveId(store, tag.id) }),
        saved: () => undefined,
        rollback: () =>
          previous &&
          store.$tags.set(
            store.$tags.get().map((t) => (t.id === tag.id ? previous : t)),
          ),
        success: 'Zapisano tag.',
        failure: {
          title: 'Nie udało się zapisać tagu',
          code: 'KNOWLEDGE_TAG_UPDATE_FAILED',
        },
        retry: () => bus.emit('[TRIGGER]_UPDATE_TAG', { tag }),
      });
    }),
  );

export const deleteTag = (store: Store, bus: Bus) =>
  bus.ofType('[TRIGGER]_DELETE_TAG').pipe(
    concatMap(({ id }) => {
      const restore = snapshot(store);
      store.$tags.set(store.$tags.get().filter((t) => t.id !== id));
      const strip = <T extends { tagIds: string[] }>(list: T[]) =>
        list.map((t) => ({ ...t, tagIds: t.tagIds.filter((x) => x !== id) }));
      store.$all.set(strip(store.$all.get()));
      store.$listed.set(strip(store.$listed.get()));
      store.$backlog.set(strip(store.$backlog.get()));
      return mutate(store, bus, {
        run: () => removeTag(resolveId(store, id)),
        saved: () => undefined,
        rollback: restore,
        success: 'Usunięto tag.',
        failure: {
          title: 'Nie udało się usunąć tagu',
          code: 'KNOWLEDGE_TAG_DELETE_FAILED',
        },
        retry: () => bus.emit('[TRIGGER]_DELETE_TAG', { id }),
      });
    }),
  );

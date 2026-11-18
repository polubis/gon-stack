import { concatMap, tap } from 'rxjs';
import {
  postCategory,
  putCategory,
  removeCategory,
} from '../../integration/repository';
import { mutate } from '../actions/mutate';
import { resolveId } from '../actions/pending';
import { snapshot } from '../actions/snapshot';
import type { Bus } from '../bus';
import type { Store } from '../store';

export const createCategory = (store: Store, bus: Bus) =>
  bus.ofType('[TRIGGER]_CREATE_CATEGORY').pipe(
    tap(({ category }) =>
      store.$categories.set([...store.$categories.get(), category]),
    ),
    concatMap(({ category }) =>
      mutate(store, bus, {
        run: () => postCategory(category),
        saved: (saved) => {
          store.ids.set(category.id, saved.id);
          store.$categories.set(
            store.$categories
              .get()
              .map((c) => (c.id === category.id ? saved : c)),
          );
        },
        rollback: () =>
          store.$categories.set(
            store.$categories.get().filter((c) => c.id !== category.id),
          ),
        success: 'Dodano kategorię.',
        failure: {
          title: 'Nie udało się dodać kategorii',
          code: 'KNOWLEDGE_CATEGORY_CREATE_FAILED',
        },
        retry: () => bus.emit('[TRIGGER]_CREATE_CATEGORY', { category }),
      }),
    ),
  );

export const updateCategory = (store: Store, bus: Bus) =>
  bus.ofType('[TRIGGER]_UPDATE_CATEGORY').pipe(
    concatMap(({ category }) => {
      const previous = store.$categories
        .get()
        .find((c) => c.id === category.id);
      store.$categories.set(
        store.$categories
          .get()
          .map((c) => (c.id === category.id ? category : c)),
      );
      return mutate(store, bus, {
        run: () =>
          putCategory({ ...category, id: resolveId(store, category.id) }),
        saved: () => undefined,
        rollback: () =>
          previous &&
          store.$categories.set(
            store.$categories
              .get()
              .map((c) => (c.id === category.id ? previous : c)),
          ),
        success: 'Zapisano kategorię.',
        failure: {
          title: 'Nie udało się zapisać kategorii',
          code: 'KNOWLEDGE_CATEGORY_UPDATE_FAILED',
        },
        retry: () => bus.emit('[TRIGGER]_UPDATE_CATEGORY', { category }),
      });
    }),
  );

export const deleteCategory = (store: Store, bus: Bus) =>
  bus.ofType('[TRIGGER]_DELETE_CATEGORY').pipe(
    concatMap(({ id }) => {
      const restore = snapshot(store);
      store.$categories.set(store.$categories.get().filter((c) => c.id !== id));
      // Catalogs of a deleted category stay, unfiled.
      store.$catalogs.set(
        store.$catalogs
          .get()
          .map((c) => (c.categoryId === id ? { ...c, categoryId: null } : c)),
      );
      return mutate(store, bus, {
        run: () => removeCategory(resolveId(store, id)),
        saved: () => undefined,
        rollback: restore,
        success: 'Usunięto kategorię.',
        failure: {
          title: 'Nie udało się usunąć kategorii',
          code: 'KNOWLEDGE_CATEGORY_DELETE_FAILED',
        },
        retry: () => bus.emit('[TRIGGER]_DELETE_CATEGORY', { id }),
      });
    }),
  );

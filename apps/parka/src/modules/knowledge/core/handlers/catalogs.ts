import { concatMap, tap } from 'rxjs';
import {
  postCatalog,
  putCatalog,
  removeCatalog,
} from '../../integration/repository';
import { mutate } from '../actions/mutate';
import { resolveId } from '../actions/pending';
import { snapshot } from '../actions/snapshot';
import type { Bus } from '../bus';
import type { Store } from '../store';

const categoryOf = (
  store: Store,
  id: Parameters<typeof resolveId>[1] | null,
) => (id === null ? null : resolveId(store, id));

export const createCatalog = (store: Store, bus: Bus) =>
  bus.ofType('[TRIGGER]_CREATE_CATALOG').pipe(
    tap(({ catalog }) =>
      store.$catalogs.set([...store.$catalogs.get(), catalog]),
    ),
    concatMap(({ catalog }) =>
      mutate(store, bus, {
        run: () =>
          postCatalog({
            name: catalog.name,
            description: catalog.description,
            categoryId: categoryOf(
              store,
              catalog.categoryId,
            ) as typeof catalog.categoryId,
          }),
        saved: (saved) => {
          store.ids.set(catalog.id, saved.id);
          store.$catalogs.set(
            store.$catalogs.get().map((c) => (c.id === catalog.id ? saved : c)),
          );
          const swap = <T extends { catalogId: string }>(list: T[]) =>
            list.map((t) =>
              t.catalogId === catalog.id ? { ...t, catalogId: saved.id } : t,
            );
          store.$all.set(swap(store.$all.get()));
          store.$listed.set(swap(store.$listed.get()));
          store.$backlog.set(swap(store.$backlog.get()));
        },
        rollback: () =>
          store.$catalogs.set(
            store.$catalogs.get().filter((c) => c.id !== catalog.id),
          ),
        success: 'Dodano katalog.',
        failure: {
          title: 'Nie udało się dodać katalogu',
          code: 'KNOWLEDGE_CATALOG_CREATE_FAILED',
        },
        retry: () => bus.emit('[TRIGGER]_CREATE_CATALOG', { catalog }),
      }),
    ),
  );

export const updateCatalog = (store: Store, bus: Bus) =>
  bus.ofType('[TRIGGER]_UPDATE_CATALOG').pipe(
    concatMap(({ catalog }) => {
      const previous = store.$catalogs.get().find((c) => c.id === catalog.id);
      store.$catalogs.set(
        store.$catalogs.get().map((c) => (c.id === catalog.id ? catalog : c)),
      );
      return mutate(store, bus, {
        run: () =>
          putCatalog({
            ...catalog,
            id: resolveId(store, catalog.id),
            categoryId: categoryOf(
              store,
              catalog.categoryId,
            ) as typeof catalog.categoryId,
          }),
        saved: () => undefined,
        rollback: () =>
          previous &&
          store.$catalogs.set(
            store.$catalogs
              .get()
              .map((c) => (c.id === catalog.id ? previous : c)),
          ),
        success: 'Zapisano katalog.',
        failure: {
          title: 'Nie udało się zapisać katalogu',
          code: 'KNOWLEDGE_CATALOG_UPDATE_FAILED',
        },
        retry: () => bus.emit('[TRIGGER]_UPDATE_CATALOG', { catalog }),
      });
    }),
  );

export const deleteCatalog = (store: Store, bus: Bus) =>
  bus.ofType('[TRIGGER]_DELETE_CATALOG').pipe(
    concatMap(({ id }) => {
      const restore = snapshot(store);
      store.$catalogs.set(store.$catalogs.get().filter((c) => c.id !== id));
      // Topics of a deleted catalog go with it.
      const keep = <T extends { catalogId: string }>(list: T[]) =>
        list.filter((t) => t.catalogId !== id);
      store.$all.set(keep(store.$all.get()));
      store.$listed.set(keep(store.$listed.get()));
      store.$backlog.set(keep(store.$backlog.get()));
      return mutate(store, bus, {
        run: () => removeCatalog(resolveId(store, id)),
        saved: () => undefined,
        rollback: restore,
        success: 'Usunięto katalog.',
        failure: {
          title: 'Nie udało się usunąć katalogu',
          code: 'KNOWLEDGE_CATALOG_DELETE_FAILED',
        },
        retry: () => bus.emit('[TRIGGER]_DELETE_CATALOG', { id }),
      });
    }),
  );

import { createBus } from './bus';
import {
  createCatalog,
  deleteCatalog,
  updateCatalog,
} from './handlers/catalogs';
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from './handlers/categories';
import { loadDemo } from './handlers/demo';
import { dismissNotice } from './handlers/dismiss-notice';
import { load } from './handlers/load';
import {
  createReel,
  deleteReel,
  loadReels,
  removeReelMedia,
  setProgress,
  updateReel,
  uploadReelMedia,
} from './handlers/reels';
import { createTag, deleteTag, updateTag } from './handlers/tags';
import { createTopic, deleteTopic, updateTopic } from './handlers/topics';
import type { Store } from './store';

export const createRegistry = (store: Store) => {
  const bus = createBus();

  const register = bus.createRegistry(
    load(store, bus),
    createCategory(store, bus),
    updateCategory(store, bus),
    deleteCategory(store, bus),
    createCatalog(store, bus),
    updateCatalog(store, bus),
    deleteCatalog(store, bus),
    createTag(store, bus),
    updateTag(store, bus),
    deleteTag(store, bus),
    createTopic(store, bus),
    updateTopic(store, bus),
    deleteTopic(store, bus),
    loadReels(store, bus),
    createReel(store, bus),
    updateReel(store, bus),
    deleteReel(store, bus),
    uploadReelMedia(store, bus),
    removeReelMedia(store, bus),
    setProgress(store, bus),
    loadDemo(store, bus),
    dismissNotice(store, bus),
  );

  return { trigger: bus.trigger, register };
};

export type Registry = ReturnType<typeof createRegistry>;

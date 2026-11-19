import type { TopicId, ReelId } from '../domain/models';
import type { NoticeBody } from '../domain/models';
import type { View } from '../domain/events';
import { notify } from './actions/notify';
import type { Registry } from './registry';
import type { Store } from './store';
import type {
  Catalog,
  CatalogId,
  Category,
  CategoryId,
  Reel,
  Tag,
  TagId,
  Topic,
} from '../domain/models';

/** Public API of the module: triggers and state selectors. The reel viewer uses `useReels`, `loadReels`, `setProgress`. */
export const createFacade = (store: Store, trigger: Registry['trigger']) => ({
  load: (view: View) => trigger('[TRIGGER]_LOAD', { view }),
  refresh: () => trigger('[TRIGGER]_REFRESH'),
  createCategory: (category: Category) =>
    trigger('[TRIGGER]_CREATE_CATEGORY', { category }),
  updateCategory: (category: Category) =>
    trigger('[TRIGGER]_UPDATE_CATEGORY', { category }),
  deleteCategory: (id: CategoryId) =>
    trigger('[TRIGGER]_DELETE_CATEGORY', { id }),
  createCatalog: (catalog: Catalog) =>
    trigger('[TRIGGER]_CREATE_CATALOG', { catalog }),
  updateCatalog: (catalog: Catalog) =>
    trigger('[TRIGGER]_UPDATE_CATALOG', { catalog }),
  deleteCatalog: (id: CatalogId) => trigger('[TRIGGER]_DELETE_CATALOG', { id }),
  createTag: (tag: Tag) => trigger('[TRIGGER]_CREATE_TAG', { tag }),
  updateTag: (tag: Tag) => trigger('[TRIGGER]_UPDATE_TAG', { tag }),
  deleteTag: (id: TagId) => trigger('[TRIGGER]_DELETE_TAG', { id }),
  createTopic: (topic: Topic) => trigger('[TRIGGER]_CREATE_TOPIC', { topic }),
  updateTopic: (topic: Topic) => trigger('[TRIGGER]_UPDATE_TOPIC', { topic }),
  deleteTopic: (id: TopicId) => trigger('[TRIGGER]_DELETE_TOPIC', { id }),
  loadReels: (topicId: TopicId) => trigger('[TRIGGER]_LOAD_REELS', { topicId }),
  createReel: (reel: Reel) => trigger('[TRIGGER]_CREATE_REEL', { reel }),
  updateReel: (reel: Reel) => trigger('[TRIGGER]_UPDATE_REEL', { reel }),
  deleteReel: (id: ReelId) => trigger('[TRIGGER]_DELETE_REEL', { id }),
  uploadReelMedia: (reelId: ReelId, file: File) =>
    trigger('[TRIGGER]_UPLOAD_REEL_MEDIA', { reelId, file }),
  removeReelMedia: (reelId: ReelId) =>
    trigger('[TRIGGER]_REMOVE_REEL_MEDIA', { reelId }),
  setProgress: (reelId: ReelId, done: boolean) =>
    trigger('[TRIGGER]_SET_PROGRESS', { reelId, done }),
  loadDemo: () => trigger('[TRIGGER]_LOAD_DEMO'),
  notify: (notice: NoticeBody) => notify(store, notice),
  dismissNotice: () => trigger('[TRIGGER]_DISMISS_NOTICE'),
  useCategories: () => store.$categories.use(),
  useCatalogs: () => store.$catalogs.use(),
  useTags: () => store.$tags.use(),
  useAllTopics: () => store.$all.use(),
  useListed: () => store.$listed.use(),
  useBacklog: () => store.$backlog.use(),
  useReels: () => store.$reels.use(),
  useMediaBusy: () => store.$mediaBusy.use(),
  useLoaded: () => store.$loaded.use(),
  useInitializing: () => store.$initializing.use(),
  useIsLoading: () => store.$isLoading.use(),
  useDemoBusy: () => store.$demoBusy.use(),
  useError: () => store.$error.use(),
  useNotice: () => store.$notice.use(),
});

export type Facade = ReturnType<typeof createFacade>;

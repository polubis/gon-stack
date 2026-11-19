import type { Store } from '../store';

/** Everything a cascading delete may touch; call the result to put it back. */
export const snapshot = (store: Store): (() => void) => {
  const saved = {
    categories: store.$categories.get(),
    catalogs: store.$catalogs.get(),
    tags: store.$tags.get(),
    all: store.$all.get(),
    listed: store.$listed.get(),
    backlog: store.$backlog.get(),
    reels: store.$reels.get(),
  };
  return () => {
    store.$categories.set(saved.categories);
    store.$catalogs.set(saved.catalogs);
    store.$tags.set(saved.tags);
    store.$all.set(saved.all);
    store.$listed.set(saved.listed);
    store.$backlog.set(saved.backlog);
    store.$reels.set(saved.reels);
  };
};

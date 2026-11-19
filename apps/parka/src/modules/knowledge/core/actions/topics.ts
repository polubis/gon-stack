import { matchesFilters, sortTopics } from '../../domain/filters';
import type { Topic, TopicId } from '../../domain/models';
import type { Store } from '../store';

/** Where a topic belongs in the lists of the current view, like a reload would put it. */
export const place = (store: Store, topic: Topic): void => {
  const view = store.$view.get();
  const catalogs = store.$catalogs.get();
  const without = (list: Topic[]) => list.filter((t) => t.id !== topic.id);
  const sort = view?.filters.sort ?? 'position';
  const fits = view !== null && matchesFilters(topic, view.filters, catalogs);
  const into = (list: Topic[], yes: boolean) =>
    yes ? sortTopics([...without(list), topic], sort) : without(list);
  store.$all.set(sortTopics([...without(store.$all.get()), topic], 'position'));
  store.$listed.set(into(store.$listed.get(), fits));
  store.$backlog.set(
    into(store.$backlog.get(), fits && topic.studyDay === null),
  );
};

export const dropTopic = (store: Store, id: TopicId): void => {
  const keep = (list: Topic[]) => list.filter((t) => t.id !== id);
  store.$all.set(keep(store.$all.get()));
  store.$listed.set(keep(store.$listed.get()));
  store.$backlog.set(keep(store.$backlog.get()));
  const { [id]: _gone, ...reels } = store.$reels.get();
  store.$reels.set(reels);
};

/** Changes a topic where it stands (no re-filtering: rows never jump away). */
export const patchTopic = (
  store: Store,
  id: TopicId,
  patch: (topic: Topic) => Topic,
): void => {
  const apply = (list: Topic[]) =>
    list.map((t) => (t.id === id ? patch(t) : t));
  store.$all.set(apply(store.$all.get()));
  store.$listed.set(apply(store.$listed.get()));
  store.$backlog.set(apply(store.$backlog.get()));
};

export const findTopic = (store: Store, id: TopicId): Topic | undefined =>
  store.$all.get().find((t) => t.id === id);

/** Topic counters follow reel writes at once. */
export const bumpCounts = (
  store: Store,
  id: TopicId,
  reels: number,
  done: number,
): void =>
  patchTopic(store, id, (t) => ({
    ...t,
    reelCount: Math.max(0, t.reelCount + reels),
    doneCount: Math.max(0, t.doneCount + done),
  }));

/** The server gave a stored item its id: swap the placeholder everywhere. */
export const rekeyTopic = (store: Store, from: TopicId, saved: Topic): void => {
  store.ids.set(from, saved.id);
  const reels = store.$reels.get();
  if (reels[from]) {
    const { [from]: own, ...rest } = reels;
    store.$reels.set({
      ...rest,
      [saved.id]: own!.map((r) => ({ ...r, topicId: saved.id })),
    });
  }
  const swap = (list: Topic[]) => list.map((t) => (t.id === from ? saved : t));
  store.$all.set(swap(store.$all.get()));
  store.$listed.set(swap(store.$listed.get()));
  store.$backlog.set(swap(store.$backlog.get()));
};

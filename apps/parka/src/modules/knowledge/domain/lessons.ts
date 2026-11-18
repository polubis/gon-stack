import type { Catalog, Category, Reel, Topic, TopicId } from './models';

/**
 * Lessons in study order: categories by position (uncategorised last), then
 * catalogs, then topics by position. Topics without reels are skipped, except
 * the one in `keep` (the lesson being viewed).
 */
export const lessonOrder = (
  topics: readonly Topic[],
  catalogs: readonly Catalog[],
  categories: readonly Category[],
  keep?: TopicId,
): Topic[] => {
  const categoryRank = (catalog: Catalog | undefined): number => {
    const category = categories.find((c) => c.id === catalog?.categoryId);
    return category ? category.position : Number.MAX_SAFE_INTEGER;
  };
  const rankOf = (topic: Topic) => {
    const catalog = catalogs.find((c) => c.id === topic.catalogId);
    return [categoryRank(catalog), catalog?.position ?? 0, topic.position];
  };
  return topics
    .filter((t) => t.reelCount > 0 || t.id === keep)
    .sort((a, b) => {
      const [ra, rb] = [rankOf(a), rankOf(b)];
      return ra[0]! - rb[0]! || ra[1]! - rb[1]! || ra[2]! - rb[2]!;
    });
};

/** Lessons right before and after `id` in `order`. */
export const neighbourLessons = (
  order: readonly Topic[],
  id: TopicId,
): { prev: Topic | null; next: Topic | null } => {
  const at = order.findIndex((t) => t.id === id);
  return {
    prev: at > 0 ? order[at - 1]! : null,
    next: at >= 0 && at < order.length - 1 ? order[at + 1]! : null,
  };
};

/** Where a viewer resumes: the first reel not done yet, the first one when all are. */
export const resumeIndex = (reels: readonly Reel[]): number => {
  const at = reels.findIndex((r) => !r.done);
  return at < 0 ? 0 : at;
};

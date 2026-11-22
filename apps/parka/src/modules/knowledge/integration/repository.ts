import type { z } from 'zod';
import type {
  createKnowledgeCatalogSchema,
  createKnowledgeCategorySchema,
  createKnowledgeDemoSchema,
  createKnowledgeReelSchema,
  createKnowledgeTagSchema,
  createKnowledgeTopicSchema,
  deleteKnowledgeCategorySchema,
  deleteKnowledgeReelMediaSchema,
  getKnowledgeTopicSchema,
  listKnowledgeSchema,
  resetKnowledgeProgressSchema,
  setKnowledgeProgressSchema,
  updateKnowledgeCatalogSchema,
  updateKnowledgeCategorySchema,
  updateKnowledgeReelSchema,
  updateKnowledgeTagSchema,
  updateKnowledgeTopicSchema,
  uploadKnowledgeReelMediaSchema,
} from '@schemas/knowledge';
import { browserTimeZone } from '@/shared/date/date';
import { createRequestCache } from '@/shared/request-cache/request-cache';
import { API_ROUTER } from '@/shared/router/routes';
import type { ListQuery } from '../domain/filters';
import type {
  Catalog,
  CatalogId,
  Category,
  CategoryId,
  KnowledgeData,
  Reel,
  ReelId,
  Tag,
  TagId,
  Topic,
  TopicId,
} from '../domain/models';
import { toCatalog, toCategory, toReel, toTag, toTopic } from './mappers';

type Out<T extends () => z.ZodType<{ out: unknown }>> = z.infer<
  ReturnType<T>
>['out'];

const JSON_HEADERS = { 'Content-Type': 'application/json' };

const cache = createRequestCache();

/** Reads are shared and kept briefly; any write drops them, also when it ends. */
const send = async (...args: Parameters<typeof fetch>) => {
  cache.clear();
  try {
    return await fetch(...args);
  } finally {
    cache.clear();
  }
};

const json = (method: string, body?: unknown): RequestInit => ({
  method,
  headers: JSON_HEADERS,
  ...(body === undefined ? {} : { body: JSON.stringify(body) }),
});

/** A freshly opened module never starts from reads another module outdated. */
export const resetKnowledgeReads = () => cache.clear();

const readKnowledge = async (query: ListQuery): Promise<KnowledgeData> => {
  const response = await fetch(API_ROUTER.knowledge(query), {
    headers: { Accept: 'application/json' },
  });
  const body = (await response.json()) as Out<typeof listKnowledgeSchema>;
  if (body.code !== 200) throw new Error(body.message);
  return {
    categories: body.data.categories.map(toCategory),
    catalogs: body.data.catalogs.map(toCatalog),
    tags: body.data.tags.map(toTag),
    topics: body.data.topics.map(toTopic),
  };
};

/** Nothing else in this module reads lists; equal queries share one request. */
export const fetchKnowledge = (query: ListQuery): Promise<KnowledgeData> =>
  cache.read(JSON.stringify(query), () => readKnowledge(query));

export const fetchTopic = async (
  id: TopicId,
): Promise<{ topic: Topic; reels: Reel[] }> => {
  const response = await fetch(API_ROUTER.knowledgeTopicById(id), {
    headers: { Accept: 'application/json' },
  });
  const body = (await response.json()) as Out<typeof getKnowledgeTopicSchema>;
  if (body.code !== 200) throw new Error(body.message);
  return {
    topic: toTopic(body.data.topic),
    reels: body.data.reels.map(toReel),
  };
};

/** Server answers `201` for creates, `200` otherwise; anything else carries a message. */
const data = <T extends { code: number }>(
  body: T,
  ok: number,
): Extract<T, { code: number; data: unknown }>['data'] => {
  if (body.code !== ok)
    throw new Error((body as { message?: string }).message ?? 'Request failed');
  return (body as Extract<T, { data: unknown }>).data;
};

const done = (body: { code: number }): void => {
  if (body.code !== 200)
    throw new Error((body as { message?: string }).message ?? 'Request failed');
};

export const postCategory = async (
  input: Pick<Category, 'name' | 'color'>,
): Promise<Category> => {
  const response = await send(
    API_ROUTER.knowledgeCategories(),
    json('POST', { name: input.name, color: input.color }),
  );
  return toCategory(
    data(
      (await response.json()) as Out<typeof createKnowledgeCategorySchema>,
      201,
    ),
  );
};

export const putCategory = async (category: Category): Promise<Category> => {
  const response = await send(
    API_ROUTER.knowledgeCategoryById(category.id),
    json('PUT', {
      id: category.id,
      name: category.name,
      color: category.color,
      position: category.position,
    }),
  );
  return toCategory(
    data(
      (await response.json()) as Out<typeof updateKnowledgeCategorySchema>,
      200,
    ),
  );
};

export const removeCategory = async (id: CategoryId): Promise<void> => {
  const response = await send(
    API_ROUTER.knowledgeCategoryById(id),
    json('DELETE'),
  );
  done((await response.json()) as Out<typeof deleteKnowledgeCategorySchema>);
};

export const postCatalog = async (
  input: Pick<Catalog, 'name' | 'description' | 'categoryId'>,
): Promise<Catalog> => {
  const response = await send(
    API_ROUTER.knowledgeCatalogs(),
    json('POST', {
      name: input.name,
      description: input.description,
      categoryId: input.categoryId,
    }),
  );
  return toCatalog(
    data(
      (await response.json()) as Out<typeof createKnowledgeCatalogSchema>,
      201,
    ),
  );
};

export const putCatalog = async (catalog: Catalog): Promise<Catalog> => {
  const response = await send(
    API_ROUTER.knowledgeCatalogById(catalog.id),
    json('PUT', {
      id: catalog.id,
      categoryId: catalog.categoryId,
      name: catalog.name,
      description: catalog.description,
      position: catalog.position,
    }),
  );
  return toCatalog(
    data(
      (await response.json()) as Out<typeof updateKnowledgeCatalogSchema>,
      200,
    ),
  );
};

export const removeCatalog = async (id: CatalogId): Promise<void> => {
  const response = await send(
    API_ROUTER.knowledgeCatalogById(id),
    json('DELETE'),
  );
  done((await response.json()) as Out<typeof deleteKnowledgeCategorySchema>);
};

export const postTag = async (input: Pick<Tag, 'name'>): Promise<Tag> => {
  const response = await send(
    API_ROUTER.knowledgeTags(),
    json('POST', { name: input.name }),
  );
  return toTag(
    data((await response.json()) as Out<typeof createKnowledgeTagSchema>, 201),
  );
};

export const putTag = async (tag: Tag): Promise<Tag> => {
  const response = await send(
    API_ROUTER.knowledgeTagById(tag.id),
    json('PUT', { id: tag.id, name: tag.name }),
  );
  return toTag(
    data((await response.json()) as Out<typeof updateKnowledgeTagSchema>, 200),
  );
};

export const removeTag = async (id: TagId): Promise<void> => {
  const response = await send(API_ROUTER.knowledgeTagById(id), json('DELETE'));
  done((await response.json()) as Out<typeof deleteKnowledgeCategorySchema>);
};

export type TopicInput = Pick<
  Topic,
  'catalogId' | 'title' | 'description' | 'tagIds' | 'studyDay'
>;

export const postTopic = async (input: TopicInput): Promise<Topic> => {
  const response = await send(
    API_ROUTER.knowledgeTopics(),
    json('POST', {
      catalogId: input.catalogId,
      title: input.title,
      description: input.description,
      tagIds: input.tagIds,
      studyDay: input.studyDay,
    }),
  );
  return toTopic(
    data(
      (await response.json()) as Out<typeof createKnowledgeTopicSchema>,
      201,
    ),
  );
};

export const putTopic = async (
  id: TopicId,
  input: TopicInput & { position?: number },
): Promise<Topic> => {
  const response = await send(
    API_ROUTER.knowledgeTopicById(id),
    json('PUT', { ...input, id }),
  );
  return toTopic(
    data(
      (await response.json()) as Out<typeof updateKnowledgeTopicSchema>,
      200,
    ),
  );
};

export const removeTopic = async (id: TopicId): Promise<void> => {
  const response = await send(
    API_ROUTER.knowledgeTopicById(id),
    json('DELETE'),
  );
  done((await response.json()) as Out<typeof deleteKnowledgeCategorySchema>);
};

export const postReel = async (input: {
  topicId: TopicId;
  body: string;
  position?: number;
}): Promise<Reel> => {
  const response = await send(
    API_ROUTER.knowledgeReels(),
    json('POST', {
      topicId: input.topicId,
      body: input.body,
      position: input.position,
    }),
  );
  return toReel(
    data((await response.json()) as Out<typeof createKnowledgeReelSchema>, 201),
  );
};

export const putReel = async (
  reel: Pick<Reel, 'id' | 'body' | 'position'>,
): Promise<Reel> => {
  const response = await send(
    API_ROUTER.knowledgeReelById(reel.id),
    json('PUT', { id: reel.id, body: reel.body, position: reel.position }),
  );
  return toReel(
    data((await response.json()) as Out<typeof updateKnowledgeReelSchema>, 200),
  );
};

export const removeReel = async (id: ReelId): Promise<void> => {
  const response = await send(API_ROUTER.knowledgeReelById(id), json('DELETE'));
  done((await response.json()) as Out<typeof deleteKnowledgeCategorySchema>);
};

/** Sets (or replaces) the picture or clip of a reel; multipart field `file`. */
export const uploadReelMedia = async (
  id: ReelId,
  file: File,
): Promise<Reel> => {
  const form = new FormData();
  form.set('file', file);
  const response = await send(API_ROUTER.knowledgeReelMedia(id), {
    method: 'POST',
    body: form,
  });
  return toReel(
    data(
      (await response.json()) as Out<typeof uploadKnowledgeReelMediaSchema>,
      201,
    ),
  );
};

export const removeReelMedia = async (id: ReelId): Promise<Reel> => {
  const response = await send(
    API_ROUTER.knowledgeReelMedia(id),
    json('DELETE'),
  );
  return toReel(
    data(
      (await response.json()) as Out<typeof deleteKnowledgeReelMediaSchema>,
      200,
    ),
  );
};

export const putProgress = async (
  reelId: ReelId,
  isDone: boolean,
): Promise<void> => {
  const response = await send(
    API_ROUTER.knowledgeProgress(),
    json('PUT', { reelId, done: isDone }),
  );
  done((await response.json()) as Out<typeof setKnowledgeProgressSchema>);
};

/** Clears the progress of every reel of a topic. */
export const removeTopicProgress = async (topicId: TopicId): Promise<void> => {
  const response = await send(
    API_ROUTER.knowledgeTopicProgress(topicId),
    json('DELETE'),
  );
  done((await response.json()) as Out<typeof resetKnowledgeProgressSchema>);
};

/** Creates the sample course (once; repeating is safe). */
export const postDemo = async (): Promise<void> => {
  const response = await send(
    API_ROUTER.knowledgeDemo(),
    json('POST', { tz: browserTimeZone() }),
  );
  const body = (await response.json()) as Out<typeof createKnowledgeDemoSchema>;
  if (!('data' in body)) throw new Error(body.message);
};

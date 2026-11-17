import z from 'zod';
import { conflictOut, errorOut, notFoundOut } from './general';

const writeErrors = z.union([errorOut(), notFoundOut()]);
const deleteErrors = z.union([errorOut(), notFoundOut(), conflictOut()]);

const id = () => z.uuid();
const position = () => z.number().int().min(0).max(100000);
const name = (max: number) => z.string().trim().min(1).max(max);

/** Area: groups catalogs. */
export const knowledgeCategory = () =>
  z.object({
    id: id(),
    name: name(40),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    position: position(),
  });

/** Folder of topics; optionally filed under a category. */
export const knowledgeCatalog = () =>
  z.object({
    id: id(),
    categoryId: id().nullable(),
    name: name(80),
    description: z.string().trim().max(500),
    position: position(),
  });

export const knowledgeTag = () => z.object({ id: id(), name: name(30) });

/** A source of knowledge: a stack of reels. Counts cover the whole topic. */
export const knowledgeTopic = () =>
  z.object({
    id: id(),
    catalogId: id(),
    title: name(120),
    description: z.string().trim().max(500),
    position: position(),
    tagIds: z.array(id()),
    reelCount: z.number().int().min(0),
    doneCount: z.number().int().min(0),
    createdAt: z.string(),
    updatedAt: z.string(),
  });

/** One portion of Markdown, `done` when the owner finished it. */
export const knowledgeReel = () =>
  z.object({
    id: id(),
    topicId: id(),
    body: z.string().trim().min(1).max(8000),
    position: position(),
    done: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
  });

export const KNOWLEDGE_PROGRESS_FILTERS = [
  'all',
  'untouched',
  'started',
  'done',
] as const;
export const KNOWLEDGE_SORTS = ['position', 'title', 'newest'] as const;

/**
 * Everything for the overview in one read. Filters narrow `topics` only; the
 * summary always covers all topics so the brain stays stable while filtering.
 */
export const listKnowledgeSchema = () =>
  z.object({
    in: z.object({
      /** Case-insensitive text found in title or description. */
      q: z.string().trim().max(100).optional(),
      categoryId: id().optional(),
      catalogId: id().optional(),
      tagId: id().optional(),
      progress: z.enum(KNOWLEDGE_PROGRESS_FILTERS).optional(),
      sort: z.enum(KNOWLEDGE_SORTS).optional(),
    }),
    out: z.union([
      z.object({
        code: z.literal(200),
        data: z.object({
          categories: z.array(knowledgeCategory()),
          catalogs: z.array(knowledgeCatalog()),
          tags: z.array(knowledgeTag()),
          topics: z.array(knowledgeTopic()),
          summary: z.object({
            topics: z.number().int().min(0),
            /** Topics with at least one finished reel, none of them complete. */
            startedTopics: z.number().int().min(0),
            doneTopics: z.number().int().min(0),
            reels: z.number().int().min(0),
            doneReels: z.number().int().min(0),
          }),
        }),
      }),
      errorOut(),
    ]),
  });

export const createKnowledgeCategorySchema = () =>
  z.object({
    in: knowledgeCategory()
      .omit({ id: true })
      .partial({ color: true, position: true }),
    out: z.union([
      z.object({ code: z.literal(201), data: knowledgeCategory() }),
      conflictOut(),
      errorOut(),
    ]),
  });

export const updateKnowledgeCategorySchema = () =>
  z.object({
    in: knowledgeCategory(),
    out: z.union([
      z.object({ code: z.literal(200), data: knowledgeCategory() }),
      conflictOut(),
      writeErrors,
    ]),
  });

export const deleteKnowledgeCategorySchema = () =>
  z.object({
    in: z.object({ id: id() }),
    out: z.union([
      z.object({ code: z.literal(200), ok: z.literal(true) }),
      deleteErrors,
    ]),
  });

export const createKnowledgeCatalogSchema = () =>
  z.object({
    in: knowledgeCatalog()
      .omit({ id: true })
      .partial({ categoryId: true, description: true, position: true }),
    out: z.union([
      z.object({ code: z.literal(201), data: knowledgeCatalog() }),
      conflictOut(),
      errorOut(),
    ]),
  });

export const updateKnowledgeCatalogSchema = () =>
  z.object({
    in: knowledgeCatalog(),
    out: z.union([
      z.object({ code: z.literal(200), data: knowledgeCatalog() }),
      conflictOut(),
      writeErrors,
    ]),
  });

export const deleteKnowledgeCatalogSchema = deleteKnowledgeCategorySchema;

export const createKnowledgeTagSchema = () =>
  z.object({
    in: knowledgeTag().omit({ id: true }),
    out: z.union([
      z.object({ code: z.literal(201), data: knowledgeTag() }),
      conflictOut(),
      errorOut(),
    ]),
  });

export const updateKnowledgeTagSchema = () =>
  z.object({
    in: knowledgeTag(),
    out: z.union([
      z.object({ code: z.literal(200), data: knowledgeTag() }),
      conflictOut(),
      writeErrors,
    ]),
  });

export const deleteKnowledgeTagSchema = deleteKnowledgeCategorySchema;

const topicInput = () =>
  knowledgeTopic()
    .pick({ catalogId: true, title: true, description: true, tagIds: true })
    .extend({ position: position().optional() });

export const createKnowledgeTopicSchema = () =>
  z.object({
    in: topicInput().partial({ description: true, tagIds: true }),
    out: z.union([
      z.object({ code: z.literal(201), data: knowledgeTopic() }),
      writeErrors,
    ]),
  });

export const updateKnowledgeTopicSchema = () =>
  z.object({
    in: topicInput().extend({ id: id() }),
    out: z.union([
      z.object({ code: z.literal(200), data: knowledgeTopic() }),
      writeErrors,
    ]),
  });

export const deleteKnowledgeTopicSchema = deleteKnowledgeCategorySchema;

/** A topic with all its reels in order: what the reel viewer needs. */
export const getKnowledgeTopicSchema = () =>
  z.object({
    in: z.object({ id: id() }),
    out: z.union([
      z.object({
        code: z.literal(200),
        data: z.object({
          topic: knowledgeTopic(),
          reels: z.array(knowledgeReel()),
        }),
      }),
      writeErrors,
    ]),
  });

export const createKnowledgeReelSchema = () =>
  z.object({
    in: knowledgeReel()
      .pick({ topicId: true, body: true })
      .extend({ position: position().optional() }),
    out: z.union([
      z.object({ code: z.literal(201), data: knowledgeReel() }),
      writeErrors,
    ]),
  });

export const updateKnowledgeReelSchema = () =>
  z.object({
    in: knowledgeReel()
      .pick({ id: true, body: true })
      .extend({ position: position().optional() }),
    out: z.union([
      z.object({ code: z.literal(200), data: knowledgeReel() }),
      writeErrors,
    ]),
  });

export const deleteKnowledgeReelSchema = deleteKnowledgeCategorySchema;

/** Marks a reel finished (or not); repeating it is safe. */
export const setKnowledgeProgressSchema = () =>
  z.object({
    in: z.object({ reelId: id(), done: z.boolean() }),
    out: z.union([
      z.object({
        code: z.literal(200),
        data: z.object({ reelId: id(), done: z.boolean() }),
      }),
      writeErrors,
    ]),
  });

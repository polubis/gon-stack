import type { z } from 'zod';
import type {
  knowledgeCatalog,
  knowledgeCategory,
  knowledgeReel,
  knowledgeTag,
  knowledgeTopic,
} from '@schemas/knowledge';
import type {
  Catalog,
  CatalogId,
  Category,
  CategoryId,
  Reel,
  ReelId,
  Tag,
  TagId,
  Topic,
  TopicId,
} from '../domain/models';

type Dto<T extends () => z.ZodType> = z.infer<ReturnType<T>>;

export const toCategory = (dto: Dto<typeof knowledgeCategory>): Category => ({
  id: dto.id as CategoryId,
  name: dto.name,
  color: dto.color,
  position: dto.position,
});

export const toCatalog = (dto: Dto<typeof knowledgeCatalog>): Catalog => ({
  id: dto.id as CatalogId,
  categoryId: dto.categoryId as CategoryId | null,
  name: dto.name,
  description: dto.description,
  position: dto.position,
});

export const toTag = (dto: Dto<typeof knowledgeTag>): Tag => ({
  id: dto.id as TagId,
  name: dto.name,
});

export const toTopic = (dto: Dto<typeof knowledgeTopic>): Topic => ({
  id: dto.id as TopicId,
  catalogId: dto.catalogId as CatalogId,
  title: dto.title,
  description: dto.description,
  position: dto.position,
  studyDay: dto.studyDay,
  tagIds: dto.tagIds as TagId[],
  reelCount: dto.reelCount,
  doneCount: dto.doneCount,
  createdAt: dto.createdAt,
});

export const toReel = (dto: Dto<typeof knowledgeReel>): Reel => ({
  id: dto.id as ReelId,
  topicId: dto.topicId as TopicId,
  body: dto.body,
  position: dto.position,
  media: dto.media,
  done: dto.done,
});

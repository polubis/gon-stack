import type { Brand } from '@repo/type-beast/brand';

export type CategoryId = Brand<string, 'KnowledgeCategoryId'>;
export type CatalogId = Brand<string, 'KnowledgeCatalogId'>;
export type TagId = Brand<string, 'KnowledgeTagId'>;
export type TopicId = Brand<string, 'KnowledgeTopicId'>;
export type ReelId = Brand<string, 'KnowledgeReelId'>;

/** Area: groups catalogs. Colour is user data, not a theme token. */
export type Category = {
  id: CategoryId;
  name: string;
  color: string;
  position: number;
};

export type Catalog = {
  id: CatalogId;
  categoryId: CategoryId | null;
  name: string;
  description: string;
  position: number;
};

export type Tag = { id: TagId; name: string };

/** Stack of reels. Counts cover the whole topic. */
export type Topic = {
  id: TopicId;
  catalogId: CatalogId;
  title: string;
  description: string;
  position: number;
  /** Planned day to study (`YYYY-MM-DD`); `null` = backlog. */
  studyDay: string | null;
  tagIds: TagId[];
  reelCount: number;
  doneCount: number;
  createdAt: string;
};

/** `url` is a short-lived signed link, `null` when it could not be signed. */
export type ReelMedia = { kind: 'image' | 'video'; url: string | null };

/** One portion of Markdown. */
export type Reel = {
  id: ReelId;
  topicId: TopicId;
  body: string;
  position: number;
  media: ReelMedia | null;
  done: boolean;
};

export type KnowledgeData = {
  categories: Category[];
  catalogs: Catalog[];
  tags: Tag[];
  topics: Topic[];
};

export type PeriodKind = 'day' | 'week' | 'month' | 'year';

export type NoticeBody =
  | { tone: 'success'; message: string }
  | {
      tone: 'error';
      title: string;
      code: string;
      description: string;
      /** Re-runs the failed action. */
      retry?: () => void;
    };

export type Notice = { id: number } & NoticeBody;

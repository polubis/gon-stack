import type { SupabaseServer } from '@/shared/data-sources/supabase-server';
import type { Database } from '@/shared/data-sources/db-schema';
import { NotFound } from '../core/error-handling';
import { fromSupabaseError } from '../adapter/supabase';

type Tables = Database['public']['Tables'];

/** Progress is one-to-one with a reel: the embed is a row or null. */
type Progress = { reel_id: string } | null;

export const CATEGORY_COLUMNS = 'id, name, color, position';
export const CATALOG_COLUMNS = 'id, category_id, name, description, position';
export const TAG_COLUMNS = 'id, name';
/** A topic with the ids needed for tags and progress counts, in one read. */
export const TOPIC_COLUMNS =
  'id, catalog_id, title, description, position, study_day, created_at, updated_at, knowledge_topic_tags(tag_id), knowledge_reels(id, knowledge_reel_progress(reel_id))';
export const REEL_COLUMNS =
  'id, topic_id, body, position, media_path, media_kind, created_at, updated_at, knowledge_reel_progress(reel_id)';

export const toCategory = (
  row: Pick<
    Tables['knowledge_categories']['Row'],
    'id' | 'name' | 'color' | 'position'
  >,
) => ({ id: row.id, name: row.name, color: row.color, position: row.position });

export const toCatalog = (
  row: Pick<
    Tables['knowledge_catalogs']['Row'],
    'id' | 'category_id' | 'name' | 'description' | 'position'
  >,
) => ({
  id: row.id,
  categoryId: row.category_id,
  name: row.name,
  description: row.description,
  position: row.position,
});

export const toTag = (
  row: Pick<Tables['knowledge_tags']['Row'], 'id' | 'name'>,
) => ({
  id: row.id,
  name: row.name,
});

type TopicRow = Pick<
  Tables['knowledge_topics']['Row'],
  | 'id'
  | 'catalog_id'
  | 'title'
  | 'description'
  | 'position'
  | 'study_day'
  | 'created_at'
  | 'updated_at'
> & {
  knowledge_topic_tags: { tag_id: string }[];
  knowledge_reels: { id: string; knowledge_reel_progress: Progress }[];
};

export const toTopic = (row: TopicRow) => ({
  id: row.id,
  catalogId: row.catalog_id,
  title: row.title,
  description: row.description,
  position: row.position,
  studyDay: row.study_day,
  tagIds: row.knowledge_topic_tags.map((t) => t.tag_id),
  reelCount: row.knowledge_reels.length,
  doneCount: row.knowledge_reels.filter(
    (r) => r.knowledge_reel_progress !== null,
  ).length,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

type ReelRow = Pick<
  Tables['knowledge_reels']['Row'],
  | 'id'
  | 'topic_id'
  | 'body'
  | 'position'
  | 'media_path'
  | 'media_kind'
  | 'created_at'
  | 'updated_at'
> & { knowledge_reel_progress: Progress };

export const KNOWLEDGE_MEDIA_BUCKET = 'knowledge-media';
const MEDIA_LINK_SECONDS = 60 * 60;

/** Where a reel's file lives: inside the owner's folder, under the reel. */
export const knowledgeMediaPath = (userId: string, reelId: string) =>
  `${userId}/${reelId}/${crypto.randomUUID()}`;

const toMedia = (
  row: Pick<ReelRow, 'media_path' | 'media_kind'>,
  signed: Map<string, string>,
) => {
  const kind: 'image' | 'video' | null =
    row.media_kind === 'image'
      ? 'image'
      : row.media_kind === 'video'
        ? 'video'
        : null;
  if (!row.media_path || !kind) return null;
  return { kind, url: signed.get(row.media_path) ?? null };
};

/** `signed` maps a stored path to its link; a path without one shows `url: null`. */
export const toReel = (row: ReelRow, signed: Map<string, string>) => ({
  id: row.id,
  topicId: row.topic_id,
  body: row.body,
  position: row.position,
  media: toMedia(row, signed),
  done: row.knowledge_reel_progress !== null,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

/** Short-lived read links for stored files, in one call. */
export const signMedia = async (
  db: SupabaseServer,
  rows: { media_path: string | null }[],
) => {
  const paths = rows.flatMap((r) => (r.media_path ? [r.media_path] : []));
  const signed = new Map<string, string>();
  if (paths.length === 0) return signed;
  const { data, error } = await db.storage
    .from(KNOWLEDGE_MEDIA_BUCKET)
    .createSignedUrls(paths, MEDIA_LINK_SECONDS);
  if (error) throw fromSupabaseError(error);
  for (const item of data)
    if (item.path && item.signedUrl) signed.set(item.path, item.signedUrl);
  return signed;
};

/** Deletes stored files; used after their rows are gone, so a failure only leaves junk. */
export const removeMedia = async (db: SupabaseServer, paths: string[]) => {
  if (paths.length === 0) return;
  const { error } = await db.storage.from(KNOWLEDGE_MEDIA_BUCKET).remove(paths);
  if (error) throw fromSupabaseError(error);
};

/** Files of all reels inside the given topics. */
export const mediaPathsOfTopics = async (
  db: SupabaseServer,
  userId: string,
  topicIds: string[],
) => {
  if (topicIds.length === 0) return [];
  const { data, error } = await db
    .from('knowledge_reels')
    .select('media_path')
    .eq('user_id', userId)
    .in('topic_id', topicIds)
    .not('media_path', 'is', null);
  if (error) throw fromSupabaseError(error);
  return data.flatMap((r) => (r.media_path ? [r.media_path] : []));
};

/** Files of all reels inside a catalog (its topics go with it), in one read. */
export const mediaPathsOfCatalog = async (
  db: SupabaseServer,
  userId: string,
  catalogId: string,
) => {
  const { data, error } = await db
    .from('knowledge_reels')
    .select('media_path, knowledge_topics!inner(catalog_id)')
    .eq('user_id', userId)
    .eq('knowledge_topics.catalog_id', catalogId)
    .not('media_path', 'is', null);
  if (error) throw fromSupabaseError(error);
  return data.flatMap((r) => (r.media_path ? [r.media_path] : []));
};

/** Postgres unique violation: a name that is already taken. */
export const UNIQUE_VIOLATION = '23505';

/** Fails with 404 unless the owner has the row; never reveals other owners' rows. */
export const requireOwned = async (
  db: SupabaseServer,
  userId: string,
  table:
    | 'knowledge_categories'
    | 'knowledge_catalogs'
    | 'knowledge_topics'
    | 'knowledge_reels',
  id: string,
  message: string,
) => {
  const { data, error } = await db
    .from(table)
    .select('id')
    .eq('user_id', userId)
    .eq('id', id)
    .maybeSingle();
  if (error) throw fromSupabaseError(error);
  if (!data) throw new NotFound(undefined, message);
};

export const loadTopic = async (
  db: SupabaseServer,
  userId: string,
  id: string,
) => {
  const { data, error } = await db
    .from('knowledge_topics')
    .select(TOPIC_COLUMNS)
    .eq('user_id', userId)
    .eq('id', id)
    .maybeSingle();
  if (error) throw fromSupabaseError(error);
  if (!data) throw new NotFound(undefined, 'Topic not found');
  return toTopic(data);
};

/** Makes the topic carry exactly these tags; a tag the owner lacks answers 404. */
export const syncTopicTags = async (
  db: SupabaseServer,
  userId: string,
  topicId: string,
  tagIds: string[],
) => {
  const wanted = [...new Set(tagIds)];
  if (wanted.length > 0) {
    const tags = await db
      .from('knowledge_tags')
      .select('id')
      .eq('user_id', userId)
      .in('id', wanted);
    if (tags.error) throw fromSupabaseError(tags.error);
    if (tags.data.length !== wanted.length)
      throw new NotFound(undefined, 'Tag not found');

    const added = await db.from('knowledge_topic_tags').upsert(
      wanted.map((tag_id) => ({ user_id: userId, topic_id: topicId, tag_id })),
      { onConflict: 'user_id,topic_id,tag_id', ignoreDuplicates: true },
    );
    if (added.error) throw fromSupabaseError(added.error);
  }

  const removal = db
    .from('knowledge_topic_tags')
    .delete()
    .eq('user_id', userId)
    .eq('topic_id', topicId);
  const { error } =
    wanted.length > 0
      ? await removal.not('tag_id', 'in', `(${wanted.join(',')})`)
      : await removal;
  if (error) throw fromSupabaseError(error);
};

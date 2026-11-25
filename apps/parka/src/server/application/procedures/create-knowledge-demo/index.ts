import { createKnowledgeDemoSchema } from '@schemas/knowledge';
import { addDays, todayDay } from '@/shared/period/period';
import type { SupabaseServer } from '@/shared/data-sources/supabase-server';
import { fromSupabaseError } from '../../adapter/supabase';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import {
  DEMO_CATALOG,
  DEMO_CATEGORY,
  DEMO_LESSONS,
  DEMO_TAGS,
} from '../../shared/knowledge-demo';

const normalize = (name: string) => name.trim().toLowerCase();

/** Reuses the owner's category of that name (names are unique ignoring case). */
const ensureCategory = async (db: SupabaseServer, userId: string) => {
  const all = await db
    .from('knowledge_categories')
    .select('id, name')
    .eq('user_id', userId);
  if (all.error) throw fromSupabaseError(all.error);
  const found = all.data.find(
    (c) => normalize(c.name) === normalize(DEMO_CATEGORY.name),
  );
  if (found) return found.id;

  const { data, error } = await db
    .from('knowledge_categories')
    .insert({ user_id: userId, ...DEMO_CATEGORY })
    .select('id')
    .single();
  if (error) throw fromSupabaseError(error);
  return data.id;
};

/** Tag ids by lower-cased name; missing demo tags are created. */
const ensureTags = async (db: SupabaseServer, userId: string) => {
  const all = await db
    .from('knowledge_tags')
    .select('id, name')
    .eq('user_id', userId);
  if (all.error) throw fromSupabaseError(all.error);
  const ids = new Map(all.data.map((t) => [normalize(t.name), t.id]));

  const missing = DEMO_TAGS.filter((name) => !ids.has(normalize(name)));
  if (missing.length > 0) {
    const created = await db
      .from('knowledge_tags')
      .insert(missing.map((name) => ({ user_id: userId, name })))
      .select('id, name');
    if (created.error) throw fromSupabaseError(created.error);
    for (const t of created.data) ids.set(normalize(t.name), t.id);
  }
  return ids;
};

/**
 * Creates the sample course once per owner. The catalog name marks it: when it
 * exists the call only reports it (200); a failure midway removes the catalog
 * (topics and reels cascade) so a retry starts clean.
 */
export const createKnowledgeDemo = privateProcedure({
  schema: withZodSchema({ schema: createKnowledgeDemoSchema }),
})({
  handler: async (input, { db, user }) => {
    const existing = await db
      .from('knowledge_catalogs')
      .select('id, category_id, knowledge_topics(id, position, created_at)')
      .eq('user_id', user.id)
      .eq('name', DEMO_CATALOG.name)
      .order('created_at')
      .limit(1)
      .maybeSingle();
    if (existing.error) throw fromSupabaseError(existing.error);
    if (existing.data?.category_id) {
      const topics = existing.data.knowledge_topics.sort(
        (a, b) => a.position - b.position,
      );
      return {
        code: 200 as const,
        data: {
          categoryId: existing.data.category_id,
          catalogId: existing.data.id,
          topicIds: topics.map((t) => t.id),
        },
      };
    }

    const [categoryId, tagIds] = await Promise.all([
      ensureCategory(db, user.id),
      ensureTags(db, user.id),
    ]);

    const catalog = await db
      .from('knowledge_catalogs')
      .insert({
        user_id: user.id,
        category_id: categoryId,
        name: DEMO_CATALOG.name,
        description: DEMO_CATALOG.description,
      })
      .select('id')
      .single();
    if (catalog.error) throw fromSupabaseError(catalog.error);

    try {
      const start = todayDay(input.tz);
      const topics = DEMO_LESSONS.map((lesson, index) => ({
        id: crypto.randomUUID(),
        lesson,
        index,
      }));

      const topicInsert = await db.from('knowledge_topics').insert(
        topics.map(({ id, lesson, index }) => ({
          user_id: user.id,
          id,
          catalog_id: catalog.data.id,
          title: lesson.title,
          description: lesson.description,
          position: index,
          study_day: addDays(start, index),
        })),
      );
      if (topicInsert.error) throw fromSupabaseError(topicInsert.error);

      // Both only need the topics stored; the builders settle, never reject,
      // so no write is still running when a failure removes the catalog.
      const [tagInsert, reelInsert] = await Promise.all([
        db.from('knowledge_topic_tags').insert(
          topics.flatMap(({ id, lesson }) =>
            lesson.tags.map((name) => ({
              user_id: user.id,
              topic_id: id,
              tag_id: tagIds.get(normalize(name)) ?? '',
            })),
          ),
        ),
        db.from('knowledge_reels').insert(
          topics.flatMap(({ id, lesson }) =>
            lesson.reels.map((body, position) => ({
              user_id: user.id,
              topic_id: id,
              body,
              position,
            })),
          ),
        ),
      ]);
      if (tagInsert.error) throw fromSupabaseError(tagInsert.error);
      if (reelInsert.error) throw fromSupabaseError(reelInsert.error);

      return {
        code: 201 as const,
        data: {
          categoryId,
          catalogId: catalog.data.id,
          topicIds: topics.map((t) => t.id),
        },
      };
    } catch (error) {
      await db
        .from('knowledge_catalogs')
        .delete()
        .eq('user_id', user.id)
        .eq('id', catalog.data.id);
      throw error;
    }
  },
});

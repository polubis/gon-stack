import { listKnowledgeSchema } from '@schemas/knowledge';
import { fromSupabaseError } from '../../adapter/supabase';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import {
  CATALOG_COLUMNS,
  CATEGORY_COLUMNS,
  TAG_COLUMNS,
  TOPIC_COLUMNS,
  toCatalog,
  toCategory,
  toTag,
  toTopic,
} from '../../shared/knowledge';
import { filterTopics, summarize } from '../../shared/knowledge-view';

const byPosition = <T extends { position: number }>(a: T, b: T) =>
  a.position - b.position;

export const listKnowledge = privateProcedure({
  schema: withZodSchema({ schema: listKnowledgeSchema }),
})({
  handler: async (input, { db, user }) => {
    const [categories, catalogs, tags, topics] = await Promise.all([
      db
        .from('knowledge_categories')
        .select(CATEGORY_COLUMNS)
        .eq('user_id', user.id)
        .order('position')
        .order('created_at'),
      db
        .from('knowledge_catalogs')
        .select(CATALOG_COLUMNS)
        .eq('user_id', user.id)
        .order('position')
        .order('created_at'),
      db
        .from('knowledge_tags')
        .select(TAG_COLUMNS)
        .eq('user_id', user.id)
        .order('name'),
      db
        .from('knowledge_topics')
        .select(TOPIC_COLUMNS)
        .eq('user_id', user.id)
        .order('position')
        .order('created_at'),
    ]);
    for (const result of [categories, catalogs, tags, topics])
      if (result.error) throw fromSupabaseError(result.error);

    const allTopics = (topics.data ?? []).map(toTopic);
    const catalogList = (catalogs.data ?? []).map(toCatalog).sort(byPosition);

    return {
      code: 200 as const,
      data: {
        categories: (categories.data ?? []).map(toCategory).sort(byPosition),
        catalogs: catalogList,
        tags: (tags.data ?? []).map(toTag),
        topics: filterTopics(allTopics, catalogList, input),
        summary: summarize(allTopics),
      },
    };
  },
});

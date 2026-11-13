import {
  listNotificationsSchema,
  NOTIFICATIONS_RETENTION_DAYS,
  notificationEvent,
} from '@schemas/notifications';
import { BadRequest } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { fromSupabaseError } from '../../adapter/supabase';

const SEPARATOR = '|';

/** `created_at|id` of the last row of a page: a stable position in (created_at, id) order. */
const parseCursor = (cursor: string): { at: string; id: string } => {
  const split = cursor.indexOf(SEPARATOR);
  const at = cursor.slice(0, split);
  const id = cursor.slice(split + 1);
  if (split < 1 || !id || Number.isNaN(Date.parse(at)))
    throw new BadRequest(undefined, 'Invalid cursor');
  return { at, id };
};

export const listNotifications = privateProcedure({
  schema: withZodSchema({ schema: listNotificationsSchema }),
})({
  handler: async (input, { db }) => {
    // No scheduler here: expired rows go the next time the user looks.
    const cutoff = new Date(
      Date.now() - NOTIFICATIONS_RETENTION_DAYS * 24 * 60 * 60 * 1000,
    ).toISOString();
    const purged = await db
      .from('notifications')
      .delete()
      .lt('created_at', cutoff);
    if (purged.error) throw fromSupabaseError(purged.error);

    let query = db
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(input.limit + 1);

    if (input.cursor) {
      const { at, id } = parseCursor(input.cursor);
      query = query.or(
        `created_at.lt."${at}",and(created_at.eq."${at}",id.lt."${id}")`,
      );
    }

    const [page, unread] = await Promise.all([
      query,
      db
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .is('read_at', null),
    ]);
    if (page.error) throw fromSupabaseError(page.error);
    if (unread.error) throw fromSupabaseError(unread.error);

    const rows = page.data.slice(0, input.limit);
    const last = rows.at(-1);
    const hasMore = page.data.length > input.limit;

    return {
      code: 200 as const,
      data: rows.map((n) => {
        const base = {
          id: n.id,
          title: n.title,
          body: n.body,
          createdAt: n.created_at,
          read: n.read_at !== null,
        };
        const event = notificationEvent().safeParse({
          kind: n.kind,
          payload: n.payload,
        });
        return event.success
          ? { ...base, ...event.data }
          : { ...base, kind: 'other' as const, payload: null };
      }),
      nextCursor:
        hasMore && last ? `${last.created_at}${SEPARATOR}${last.id}` : null,
      unread: unread.count ?? 0,
    };
  },
});

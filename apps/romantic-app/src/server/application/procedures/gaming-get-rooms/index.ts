import { schema } from '@schemas/gaming-get-rooms';
import { privateProcedure } from '../../core/procedure';
import { withZodSchema } from '../../adapter/zod';
import { InternalServer } from '../../core/error-handling';
import { supabaseAdmin } from '@/shared/data-sources/supabase-admin';

export const gamingGetRooms = privateProcedure({
  schema: withZodSchema({ schema }),
})({
  handler: async ({ query }, { db }) => {
    console.log('[gaming-get-rooms] handler start', { query });
    let dbQuery = db
      .from('rooms')
      .select('*', { count: 'exact' });

    if (query.search) {
      dbQuery = dbQuery.ilike('name', `%${query.search}%`);
    }

    if (query.code) {
      dbQuery = dbQuery.eq('code', query.code);
    } else {
      dbQuery = dbQuery.eq('is_public', true);
    }

    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);

    dbQuery = dbQuery
      .range((page - 1) * limit, page * limit - 1)
      .order('created_at', { ascending: false });

    const { data, error, count } = await dbQuery;
    console.log('[gaming-get-rooms] rooms query result', { rowCount: data?.length, count, error });

    if (error) {
      throw new InternalServer(error.message);
    }

    const rooms = data ?? [];
    const roomIds = rooms.map((r) => r.id);

    // Use admin client to count participants — room_participants RLS only allows
    // members to see rows, so the user client would return 0 for unjoined public rooms
    let participantCounts: Record<string, number> = {};
    if (roomIds.length > 0) {
      const { data: pData, error: pError } = await supabaseAdmin()
        .from('room_participants')
        .select('room_id')
        .in('room_id', roomIds);
      console.log('[gaming-get-rooms] participant counts result', { rowCount: pData?.length, pError });

      participantCounts = (pData ?? []).reduce<Record<string, number>>(
        (acc, row) => {
          acc[row.room_id] = (acc[row.room_id] ?? 0) + 1;
          return acc;
        },
        {},
      );
    }

    return {
      code: 200,
      rooms: rooms.map((r) => ({
        id: r.id,
        name: r.name,
        roomCode: r.code,
        visibility: r.is_public ? ('public' as const) : ('private' as const),
        hasPassword: r.password_hash !== null,
        creatorId: r.created_by,
        participantCount: participantCounts[r.id] ?? 0,
        createdAt: r.created_at,
      })),
      total: count ?? 0,
    };
  },
});

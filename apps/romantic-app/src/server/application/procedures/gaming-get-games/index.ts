import { schema } from '@schemas/gaming-get-games';
import { privateProcedure } from '../../core/procedure';
import { withZodSchema } from '../../adapter/zod';
import { InternalServer, NotFound } from '../../core/error-handling';
import { supabaseAdmin } from '@/shared/data-sources/supabase-admin';

const toStatus = (
  s: string,
): 'game_waiting' | 'game_pending' | 'game_finished' => {
  if (s === 'pending') return 'game_pending';
  if (s === 'finished') return 'game_finished';
  return 'game_waiting';
};

export const gamingGetGames = privateProcedure({
  schema: withZodSchema({ schema }),
})({
  handler: async ({ query, path }, { db }) => {
    const { roomId } = path;

    const { data: room, error: roomError } = await db
      .from('rooms')
      .select('id')
      .eq('id', roomId)
      .single();

    if (roomError || !room) {
      throw new NotFound('Room not found');
    }

    let dbQuery = db
      .from('games')
      .select('*', { count: 'exact' })
      .eq('room_id', roomId);

    if (query.filterCategory) {
      dbQuery = dbQuery.eq('category', query.filterCategory);
    }
    if (query.filterGameName) {
      dbQuery = dbQuery.ilike('name', `%${query.filterGameName}%`);
    }

    const sortDir = query.sortDir !== 'desc';

    if (query.sortBy === 'category') {
      dbQuery = dbQuery.order('category', { ascending: sortDir });
    } else if (query.sortBy === 'game_name') {
      dbQuery = dbQuery.order('name', { ascending: sortDir });
    } else {
      dbQuery = dbQuery.order('sort_order', { ascending: sortDir });
    }

    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);
    dbQuery = dbQuery.range((page - 1) * limit, page * limit - 1);

    const { data, error, count } = await dbQuery;

    if (error) {
      throw new InternalServer(error.message);
    }

    const games = data ?? [];
    const gameIds = games.map((g) => g.id);

    let playerCounts: Record<string, number> = {};
    if (gameIds.length > 0) {
      const { data: pData } = await supabaseAdmin()
        .from('game_participants')
        .select('game_id')
        .in('game_id', gameIds);

      playerCounts = (pData ?? []).reduce<Record<string, number>>(
        (acc, row) => {
          acc[row.game_id] = (acc[row.game_id] ?? 0) + 1;
          return acc;
        },
        {},
      );
    }

    return {
      code: 200,
      games: games.map((g) => ({
        id: g.id,
        name: g.name,
        type: 'casual' as const,
        status: toStatus(g.status),
        category: g.category,
        difficulty: g.difficulty as 'Easy' | 'Medium' | 'Hard',
        maxPlayers: g.max_players,
        playerCount: playerCounts[g.id] ?? 0,
        timePerQuestion: g.time_per_question,
        creatorId: g.created_by,
        createdAt: g.created_at,
      })),
      total: count ?? 0,
    };
  },
});

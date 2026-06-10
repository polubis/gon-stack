import { schema } from '@schemas/gaming-update-game';
import { privateProcedure } from '../../core/procedure';
import { withZodSchema } from '../../adapter/zod';
import { Forbidden, InternalServer, NotFound } from '../../core/error-handling';
import { supabaseAdmin } from '@/shared/data-sources/supabase-admin';

const toDbStatus = (s: 'game_pending' | 'game_finished') =>
  s === 'game_pending' ? 'pending' : 'finished';

const toStatus = (
  s: string,
): 'game_waiting' | 'game_pending' | 'game_finished' => {
  if (s === 'pending') return 'game_pending';
  if (s === 'finished') return 'game_finished';
  return 'game_waiting';
};

export const gamingUpdateGame = privateProcedure({
  schema: withZodSchema({ schema }),
})({
  handler: async ({ path, payload }, { db, user }) => {
    const { gameId } = path;

    const { data: existing, error: fetchError } = await db
      .from('games')
      .select('id, created_by')
      .eq('id', gameId)
      .single();

    if (fetchError || !existing) {
      throw new NotFound('Game not found');
    }

    if (existing.created_by !== user.id) {
      throw new Forbidden('Only the game creator can update game status');
    }

    const updates: Record<string, unknown> = {
      status: toDbStatus(payload.status),
    };

    if (payload.status === 'game_pending') {
      updates.started_at = new Date().toISOString();
    } else if (payload.status === 'game_finished') {
      updates.finished_at = new Date().toISOString();
    }

    const { error: updateError } = await db
      .from('games')
      .update(updates)
      .eq('id', gameId);

    if (updateError) {
      throw new InternalServer(updateError.message);
    }

    const { data: game, error: gameError } = await db
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single();

    if (gameError || !game) {
      throw new InternalServer('Failed to fetch updated game');
    }

    const { data: pData } = await supabaseAdmin()
      .from('game_participants')
      .select('game_id')
      .eq('game_id', gameId);

    const playerCount = (pData ?? []).length;

    return {
      code: 200,
      game: {
        id: game.id,
        name: game.name,
        type: 'casual' as const,
        status: toStatus(game.status),
        category: game.category,
        difficulty: game.difficulty as 'Easy' | 'Medium' | 'Hard',
        maxPlayers: game.max_players,
        playerCount,
        timePerQuestion: game.time_per_question,
        creatorId: game.created_by,
        createdAt: game.created_at,
      },
    };
  },
});

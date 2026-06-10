import { schema } from '@schemas/gaming-create-game';
import { privateProcedure } from '../../core/procedure';
import { withZodSchema } from '../../adapter/zod';
import { Forbidden, InternalServer, NotFound } from '../../core/error-handling';

export const gamingCreateGame = privateProcedure({
  schema: withZodSchema({ schema }),
})({
  handler: async ({ path, payload }, { db, user }) => {
    const { roomId } = path;

    const { data: room, error: roomError } = await db
      .from('rooms')
      .select('id')
      .eq('id', roomId)
      .single();

    if (roomError || !room) {
      throw new NotFound('Room not found');
    }

    const { data: game, error } = await db
      .from('games')
      .insert({
        room_id: roomId,
        created_by: user.id,
        name: payload.name,
        type: payload.type,
        category: payload.category,
        difficulty: payload.difficulty,
        description: payload.description,
        max_players: payload.maxPlayers,
        time_per_question: payload.timePerQuestion,
        status: 'waiting',
      })
      .select()
      .single();

    if (error || !game) {
      throw new InternalServer(error?.message ?? 'Failed to create game');
    }

    return {
      code: 201,
      game: {
        id: game.id,
        name: game.name,
        type: 'casual' as const,
        status: 'game_waiting' as const,
        category: game.category,
        difficulty: game.difficulty as 'Easy' | 'Medium' | 'Hard',
        maxPlayers: game.max_players,
        playerCount: 0,
        timePerQuestion: game.time_per_question,
        creatorId: game.created_by,
        createdAt: game.created_at,
      },
    };
  },
});

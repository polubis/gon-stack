import { schema } from '@schemas/gaming-join-game';
import { privateProcedure } from '../../core/procedure';
import { withZodSchema } from '../../adapter/zod';
import { Forbidden, InternalServer, NotFound } from '../../core/error-handling';

export const gamingJoinGame = privateProcedure({
  schema: withZodSchema({ schema }),
})({
  handler: async ({ path }, { db, user }) => {
    const { gameId } = path;

    const { data: game, error: gameError } = await db
      .from('games')
      .select('id, status')
      .eq('id', gameId)
      .single();

    if (gameError || !game) {
      throw new NotFound('Game not found');
    }

    if (game.status !== 'waiting') {
      throw new Forbidden('Game is not accepting new players');
    }

    const { error } = await db
      .from('game_participants')
      .insert({ game_id: gameId, user_id: user.id });

    if (error) {
      if (error.code === '23505') {
        return {
          code: 409,
          type: 'conflict' as const,
          message: 'Already joined this game',
        };
      }
      throw new InternalServer(error.message);
    }

    return {
      code: 201,
      player: {
        userId: user.id,
        displayName: user.id,
        score: 0 as const,
        joinedAt: new Date().toISOString(),
      },
    };
  },
});

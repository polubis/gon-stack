import { schema } from '@schemas/gaming-leave-game';
import { privateProcedure } from '../../core/procedure';
import { withZodSchema } from '../../adapter/zod';
import { Forbidden, InternalServer } from '../../core/error-handling';

export const gamingLeaveGame = privateProcedure({
  schema: withZodSchema({ schema }),
})({
  handler: async ({ path }, { db, user }) => {
    const { gameId, userId } = path;

    if (userId !== user.id) {
      throw new Forbidden('Cannot remove another player');
    }

    const { error } = await db
      .from('game_participants')
      .delete()
      .eq('game_id', gameId)
      .eq('user_id', userId);

    if (error) {
      throw new InternalServer(error.message);
    }

    return { code: 204 };
  },
});

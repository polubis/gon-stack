import { schema } from '@schemas/gaming-remove-participant';
import { privateProcedure } from '../../core/procedure';
import { withZodSchema } from '../../adapter/zod';
import { InternalServer } from '../../core/error-handling';

export const gamingRemoveParticipant = privateProcedure({
  schema: withZodSchema({ schema }),
})({
  handler: async ({ path }, { db }) => {
    const { roomId, userId } = path;

    // RLS allows: user removes self OR room creator removes any participant
    const { error } = await db
      .from('room_participants')
      .delete()
      .eq('room_id', roomId)
      .eq('user_id', userId);

    if (error) {
      throw new InternalServer(error.message);
    }

    return { code: 204 };
  },
});

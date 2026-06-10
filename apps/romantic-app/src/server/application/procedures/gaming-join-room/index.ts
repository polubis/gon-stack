import { schema } from '@schemas/gaming-join-room';
import { privateProcedure } from '../../core/procedure';
import { withZodSchema } from '../../adapter/zod';
import { Forbidden, InternalServer, NotFound } from '../../core/error-handling';

export const gamingJoinRoom = privateProcedure({
  schema: withZodSchema({ schema }),
})({
  handler: async ({ payload }, { db, user }) => {
    // join_room() is SECURITY DEFINER — bypasses room_participants RLS
    const { error } = await db.rpc('join_room', {
      p_code: payload.roomCode,
      p_password: payload.roomPassword,
    });

    if (error) {
      if (error.message.includes('room_not_found')) {
        throw new NotFound('Room not found');
      }
      if (error.message.includes('invalid_password')) {
        throw new Forbidden('Invalid room password');
      }
      if (error.message.includes('already')) {
        throw new Forbidden('Already a participant');
      }
      throw new InternalServer(error.message);
    }

    return {
      code: 201,
      participant: {
        userId: user.id,
        displayName: user.id,
        joinedAt: new Date().toISOString(),
      },
    };
  },
});

import { schema } from '@schemas/gaming-get-room';
import { privateProcedure } from '../../core/procedure';
import { withZodSchema } from '../../adapter/zod';
import { Forbidden, InternalServer, NotFound } from '../../core/error-handling';

export const gamingGetRoom = privateProcedure({
  schema: withZodSchema({ schema }),
})({
  handler: async ({ path }, { db, user }) => {
    const { roomId } = path;

    const { data: room, error: roomError } = await db
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (roomError || !room) {
      throw new NotFound('Room not found');
    }

    if (!room.is_public) {
      const { data: participant, error: participantError } = await db
        .from('room_participants')
        .select('id')
        .eq('room_id', roomId)
        .eq('user_id', user.id)
        .single();

      if (participantError || !participant) {
        throw new Forbidden('You are not a participant of this room');
      }
    }

    const { count, error: countError } = await db
      .from('room_participants')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', roomId);

    if (countError) {
      throw new InternalServer(countError.message);
    }

    return {
      code: 200,
      room: {
        id: room.id,
        name: room.name,
        roomCode: room.code,
        visibility: room.is_public ? ('public' as const) : ('private' as const),
        hasPassword: room.password_hash !== null,
        creatorId: room.created_by,
        participantCount: count ?? 0,
        createdAt: room.created_at,
      },
    };
  },
});

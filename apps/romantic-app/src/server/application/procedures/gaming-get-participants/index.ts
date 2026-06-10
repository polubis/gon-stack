import { schema } from '@schemas/gaming-get-participants';
import { privateProcedure } from '../../core/procedure';
import { withZodSchema } from '../../adapter/zod';
import { InternalServer, NotFound } from '../../core/error-handling';

export const gamingGetParticipants = privateProcedure({
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

    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);

    const { data, error, count } = await db
      .from('room_participants')
      .select('*', { count: 'exact' })
      .eq('room_id', roomId)
      .range((page - 1) * limit, page * limit - 1);

    if (error) {
      throw new InternalServer(error.message);
    }

    return {
      code: 200,
      participants: (data ?? []).map((p) => ({
        userId: p.user_id,
        displayName: p.user_id,
        joinedAt: p.joined_at,
      })),
      total: count ?? 0,
    };
  },
});

import { schema } from '@schemas/gaming-create-room';
import { privateProcedure } from '../../core/procedure';
import { withZodSchema } from '../../adapter/zod';
import { InternalServer } from '../../core/error-handling';

export const gamingCreateRoom = privateProcedure({
  schema: withZodSchema({ schema }),
})({
  handler: async ({ payload }, { db, user }) => {
    console.log('[gaming-create-room] handler start', { userId: user.id, payload });
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();

    // TODO: hash password before storing
    const password_hash = payload.password ?? null;

    const { data: room, error: roomError } = await db
      .from('rooms')
      .insert({
        name: payload.name,
        code,
        is_public: payload.visibility === 'public',
        password_hash,
        created_by: user.id,
      })
      .select()
      .single();

    console.log('[gaming-create-room] room insert result', { roomId: room?.id, roomError });

    if (roomError || !room) {
      throw new InternalServer(roomError?.message ?? 'Failed to create room');
    }

    // join_room() is SECURITY DEFINER — the only permitted way to insert into room_participants
    // For password-protected rooms, skip auto-join since password hashing (TODO) is not yet implemented
    if (!payload.password) {
      const { error: joinError } = await db.rpc('join_room', { p_code: code });
      console.log('[gaming-create-room] join_room result', { joinError });
    }

    return {
      code: 201,
      room: {
        id: room.id,
        name: room.name,
        roomCode: room.code,
        visibility: room.is_public ? ('public' as const) : ('private' as const),
        hasPassword: room.password_hash !== null,
        creatorId: user.id,
        participantCount: payload.password ? 0 : 1,
        createdAt: room.created_at,
      },
    };
  },
});

import { schema } from '@schemas/get-friends-attendance';
import { InternalServer, NotFound } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';

export const getFriendsAttendance = privateProcedure({
  schema: withZodSchema({ schema }),
})({
  handler: async (input, { db, user }) => {
    const eventResult = await db
      .from('events')
      .select('id')
      .eq('id', input.eventId)
      .single();

    if (eventResult.error || !eventResult.data) {
      throw new NotFound('Event not found');
    }

    const friendsResult = await db
      .from('friendships')
      .select('friend_id')
      .eq('user_id', user.id);

    if (friendsResult.error) {
      throw new InternalServer('Failed to fetch friends');
    }

    const friendIds = friendsResult.data.map((f) => f.friend_id);

    if (friendIds.length === 0) {
      return { code: 200 as const, friends: [] };
    }

    const attendanceResult = await db
      .from('event_attendances')
      .select('user_id')
      .eq('event_id', input.eventId)
      .eq('visibility', 'public')
      .in('user_id', friendIds);

    if (attendanceResult.error) {
      throw new InternalServer('Failed to fetch friends attendance');
    }

    const attendingFriendIds = attendanceResult.data.map((a) => a.user_id);

    if (attendingFriendIds.length === 0) {
      return { code: 200 as const, friends: [] };
    }

    const profilesResult = await db
      .from('profiles')
      .select('id, username, avatar_url')
      .in('id', attendingFriendIds);

    if (profilesResult.error) {
      throw new InternalServer('Failed to fetch friend profiles');
    }

    return {
      code: 200 as const,
      friends: profilesResult.data.map((p) => ({
        displayName: p.username ?? 'Anonymous',
        avatarUrl: p.avatar_url ?? undefined,
      })),
    };
  },
});

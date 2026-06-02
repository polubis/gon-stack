import { schema } from '@schemas/delete-event';
import { InternalServer, NotFound, Forbidden } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';

export const deleteEvent = privateProcedure({
  schema: withZodSchema({ schema }),
})({
  handler: async (input, { db, user }) => {
    const fetchResult = await db
      .from('events')
      .select('owner_id')
      .eq('id', input.eventId)
      .single();

    if (fetchResult.error || !fetchResult.data) {
      throw new NotFound('Event not found');
    }

    const isOwner = fetchResult.data.owner_id === user.id;
    if (!isOwner) {
      const adminResult = await db.rpc('is_admin');
      if (adminResult.error || !adminResult.data) {
        throw new Forbidden('You do not have permission to delete this event');
      }
    }

    const deleteResult = await db
      .from('events')
      .delete()
      .eq('id', input.eventId);

    if (deleteResult.error) {
      throw new InternalServer('Failed to delete event');
    }

    return { code: 200 as const };
  },
});

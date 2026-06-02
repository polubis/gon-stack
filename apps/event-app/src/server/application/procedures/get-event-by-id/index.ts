import { schema } from '@schemas/get-event-by-id';
import { InternalServer, NotFound } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { publicProcedure } from '../../core/procedure';

export const getEventById = publicProcedure({
  schema: withZodSchema({ schema }),
})({
  handler: async (input, { db }) => {
    const fetchResult = await db
      .from('events')
      .select('*')
      .eq('id', input.eventId)
      .single();

    if (fetchResult.error || !fetchResult.data) {
      throw new NotFound('Event not found');
    }

    const event = fetchResult.data;

    const { count, error: countError } = await db
      .from('event_attendances')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', input.eventId);

    if (countError) {
      throw new InternalServer('Failed to fetch event attendee count');
    }

    return {
      code: 200 as const,
      event: {
        id: event.id,
        name: event.name,
        description: event.description ?? undefined,
        category: event.category,
        startDateTime: event.start_date_time,
        endDateTime: event.end_date_time ?? undefined,
        address: {
          street: event.street,
          number: event.number,
          postalCode: event.postal_code,
          city: event.city,
        },
        coordinates: {
          lat: event.lat,
          lng: event.lng,
        },
        externalLink: event.external_link ?? undefined,
        imageUrl: event.image_url ?? undefined,
        keywords: event.keywords,
        organizerInfo: event.organizer_info ?? undefined,
        isFeatured: event.is_featured,
        attendeeCount: count ?? 0,
      },
    };
  },
});

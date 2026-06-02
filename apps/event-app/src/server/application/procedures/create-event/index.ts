import { schema } from '@schemas/create-event';
import { InternalServer } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';

export const createEvent = privateProcedure({
  schema: withZodSchema({ schema }),
})({
  handler: async (input, { db, user }) => {
    const insertResult = await db
      .from('events')
      .insert({
        owner_id: user.id,
        name: input.name,
        description: input.description ?? null,
        category: input.category,
        start_date_time: input.startDateTime,
        end_date_time: input.endDateTime ?? null,
        street: input.address.street,
        number: input.address.number,
        postal_code: input.address.postalCode,
        city: input.address.city,
        lat: input.coordinates.lat,
        lng: input.coordinates.lng,
        external_link: input.externalLink ?? null,
        image_url: input.imageUrl ?? null,
        keywords: input.keywords ?? [],
        organizer_info: input.organizerInfo ?? null,
      })
      .select()
      .single();

    if (insertResult.error || !insertResult.data) {
      throw new InternalServer('Failed to create event');
    }

    const event = insertResult.data;

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
        attendeeCount: 0,
      },
    };
  },
});

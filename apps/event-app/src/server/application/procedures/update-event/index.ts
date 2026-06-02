import { schema } from '@schemas/update-event';
import type { Database } from '@/shared/data-sources/db-schema';
import { InternalServer, NotFound, Forbidden } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';

type EventUpdate = Database['public']['Tables']['events']['Update'];

export const updateEvent = privateProcedure({
  schema: withZodSchema({ schema }),
})({
  handler: async (input, { db, user }) => {
    const fetchResult = await db
      .from('events')
      .select('*')
      .eq('id', input.eventId)
      .single();

    if (fetchResult.error || !fetchResult.data) {
      throw new NotFound('Event not found');
    }

    const event = fetchResult.data;

    const isOwner = event.owner_id === user.id;
    const needsAdminCheck = !isOwner || input.isFeatured !== undefined;

    let isAdmin = false;
    if (needsAdminCheck) {
      const adminResult = await db.rpc('is_admin');
      isAdmin = !adminResult.error && !!adminResult.data;
    }

    if (!isOwner && !isAdmin) {
      throw new Forbidden('You do not have permission to update this event');
    }

    if (input.isFeatured !== undefined && !isAdmin) {
      throw new Forbidden(
        'Only admins can change the featured status of an event',
      );
    }

    const updatePayload: EventUpdate = {};
    if (input.name !== undefined) updatePayload.name = input.name;
    if (input.category !== undefined) updatePayload.category = input.category;
    if (input.startDateTime !== undefined)
      updatePayload.start_date_time = input.startDateTime;
    if (input.endDateTime !== undefined)
      updatePayload.end_date_time = input.endDateTime;
    if (input.address !== undefined) {
      updatePayload.street = input.address.street;
      updatePayload.number = input.address.number;
      updatePayload.postal_code = input.address.postalCode;
      updatePayload.city = input.address.city;
    }
    if (input.coordinates !== undefined) {
      updatePayload.lat = input.coordinates.lat;
      updatePayload.lng = input.coordinates.lng;
    }
    if (input.externalLink !== undefined)
      updatePayload.external_link = input.externalLink;
    if (input.imageUrl !== undefined) updatePayload.image_url = input.imageUrl;
    if (input.keywords !== undefined) updatePayload.keywords = input.keywords;
    if (input.organizerInfo !== undefined)
      updatePayload.organizer_info = input.organizerInfo;
    if (input.isFeatured !== undefined)
      updatePayload.is_featured = input.isFeatured;

    const updateResult = await db
      .from('events')
      .update(updatePayload)
      .eq('id', input.eventId)
      .select()
      .single();

    if (updateResult.error || !updateResult.data) {
      throw new InternalServer('Failed to update event');
    }

    const updated = updateResult.data;

    const { count } = await db
      .from('event_attendances')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', input.eventId);

    return {
      code: 200 as const,
      event: {
        id: updated.id,
        name: updated.name,
        description: updated.description ?? undefined,
        category: updated.category,
        startDateTime: updated.start_date_time,
        endDateTime: updated.end_date_time ?? undefined,
        address: {
          street: updated.street,
          number: updated.number,
          postalCode: updated.postal_code,
          city: updated.city,
        },
        coordinates: {
          lat: updated.lat,
          lng: updated.lng,
        },
        externalLink: updated.external_link ?? undefined,
        imageUrl: updated.image_url ?? undefined,
        keywords: updated.keywords,
        organizerInfo: updated.organizer_info ?? undefined,
        isFeatured: updated.is_featured,
        attendeeCount: count ?? 0,
      },
    };
  },
});

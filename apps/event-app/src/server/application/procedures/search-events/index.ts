import { schema } from '@schemas/search-events';
import { BadRequest, InternalServer } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { publicProcedure } from '../../core/procedure';

type DateRange = { from: string; to: string };

const resolveDateLabel = (label: string): DateRange | null => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (label === 'Today') {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return { from: today.toISOString(), to: tomorrow.toISOString() };
  }

  if (label === 'This Week') {
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
    const nextMonday = new Date(monday);
    nextMonday.setDate(monday.getDate() + 7);
    return { from: monday.toISOString(), to: nextMonday.toISOString() };
  }

  if (label === 'This Weekend') {
    const dayOfWeek = today.getDay();
    const saturday = new Date(today);
    saturday.setDate(today.getDate() + ((6 - dayOfWeek + 7) % 7));
    const monday = new Date(saturday);
    monday.setDate(saturday.getDate() + 2);
    return { from: saturday.toISOString(), to: monday.toISOString() };
  }

  if (label === 'This Month') {
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const firstOfNextMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      1,
    );
    return {
      from: firstOfMonth.toISOString(),
      to: firstOfNextMonth.toISOString(),
    };
  }

  return null;
};

export const searchEvents = publicProcedure({
  schema: withZodSchema({ schema }),
})({
  handler: async (input, { db }) => {
    let dateFrom: string | undefined;
    let dateTo: string | undefined;

    if (input.dateLabel) {
      const range = resolveDateLabel(input.dateLabel);
      if (!range) {
        throw new BadRequest(`Unrecognized date label: ${input.dateLabel}`);
      }
      dateFrom = range.from;
      dateTo = range.to;
    }

    let query = db
      .from('events')
      .select('id, name, category, start_date_time, city, is_featured', {
        count: 'exact',
      });

    if (input.name) {
      query = query.ilike('name', `%${input.name}%`);
    }

    if (input.category) {
      query = query.eq('category', input.category);
    }

    if (input.city && input.city !== 'Cała Polska') {
      query = query.eq('city', input.city);
    }

    if (dateFrom) {
      query = query.gte('start_date_time', dateFrom);
    }

    if (dateTo) {
      query = query.lt('start_date_time', dateTo);
    }

    if (input.isFeatured !== undefined) {
      query = query.eq('is_featured', input.isFeatured);
    }

    const offset = input.offset ?? 0;
    const limit = input.limit ?? 20;

    const { data, count, error } = await query.range(
      offset,
      offset + limit - 1,
    );

    if (error) {
      throw new InternalServer('Failed to search events');
    }

    return {
      code: 200 as const,
      events: (data ?? []).map((e) => ({
        id: e.id,
        name: e.name,
        category: e.category,
        startDateTime: e.start_date_time,
        city: e.city,
        isFeatured: e.is_featured,
      })),
      total: count ?? 0,
    };
  },
});

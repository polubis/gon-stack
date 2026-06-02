import { schema } from '@schemas/geocode-address';
import { NotFound, InternalServer } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { publicProcedure } from '../../core/procedure';

export const geocodeAddress = publicProcedure({
  schema: withZodSchema({ schema }),
})({
  handler: async ({ q }) => {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`;

    let res: Response;
    try {
      res = await fetch(url, {
        headers: {
          'Accept-Language': 'pl',
          'User-Agent': 'Afisz/1.0 (event-app)',
        },
      });
    } catch {
      throw new InternalServer('Geocoding service unavailable');
    }

    if (!res.ok) throw new InternalServer('Geocoding service unavailable');

    const data: unknown = await res.json();
    if (!Array.isArray(data) || data.length === 0)
      throw new NotFound('Address not found');

    const first = data[0] as { lat: string; lon: string };
    return {
      code: 200 as const,
      lat: parseFloat(first.lat),
      lng: parseFloat(first.lon),
    };
  },
});

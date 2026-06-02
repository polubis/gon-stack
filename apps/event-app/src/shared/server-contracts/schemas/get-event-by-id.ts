import z from 'zod';

const category = z.enum([
  'Concert',
  'Festival',
  'Sports',
  'Culture',
  'Theatre',
  'Food & Drink',
]);

export const schema = () =>
  z.object({
    in: z.object({
      eventId: z.string(),
    }),
    out: z.union([
      z.object({
        code: z.literal(200),
        event: z.object({
          id: z.string(),
          name: z.string(),
          description: z.string().optional(),
          category,
          startDateTime: z.string().datetime({ offset: true }),
          endDateTime: z.string().datetime({ offset: true }).optional(),
          address: z.object({
            street: z.string(),
            number: z.string(),
            postalCode: z.string(),
            city: z.string(),
          }),
          coordinates: z.object({
            lat: z.number(),
            lng: z.number(),
          }),
          externalLink: z.string().url().optional(),
          imageUrl: z.string().url().optional(),
          keywords: z.array(z.string()),
          organizerInfo: z.string().optional(),
          isFeatured: z.boolean(),
          attendeeCount: z.number().int(),
        }),
      }),
      z.object({
        code: z.literal(404),
        type: z.literal('not-found'),
        message: z.string(),
      }),
      z.object({
        code: z.literal(500),
        type: z.literal('internal-server'),
        message: z.string(),
      }),
    ]),
  });

export type Schema = z.infer<ReturnType<typeof schema>>;

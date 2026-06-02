import z from 'zod';

export const categorySchema = z.enum([
  'Concert',
  'Festival',
  'Sports',
  'Culture',
  'Theatre',
  'Food & Drink',
]);

const address = z.object({
  street: z.string().min(1),
  number: z.string().min(1),
  postalCode: z.string().min(1),
  city: z.string().min(1),
});

const coordinates = z.object({
  lat: z.number(),
  lng: z.number(),
});

const eventDetail = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  category: categorySchema,
  startDateTime: z.string().datetime({ offset: true }),
  endDateTime: z.string().datetime({ offset: true }).optional(),
  address,
  coordinates,
  externalLink: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
  keywords: z.array(z.string()),
  organizerInfo: z.string().optional(),
  attendeeCount: z.number().int(),
});

export const schema = () =>
  z.object({
    in: z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      category: categorySchema,
      startDateTime: z.string().datetime(),
      endDateTime: z.string().datetime().optional(),
      address,
      coordinates,
      externalLink: z.string().url().optional(),
      imageUrl: z.string().url().optional(),
      keywords: z.array(z.string()).optional(),
      organizerInfo: z.string().optional(),
    }),
    out: z.union([
      z.object({
        code: z.literal(200),
        event: eventDetail,
      }),
      z.object({
        code: z.literal(400),
        type: z.literal('bad-request'),
        message: z.string(),
      }),
      z.object({
        code: z.literal(401),
        type: z.literal('unauthorized'),
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

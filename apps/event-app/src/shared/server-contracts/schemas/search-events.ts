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
      name: z.string().optional(),
      category: category.optional(),
      city: z.string().optional(),
      dateLabel: z.string().optional(),
      isFeatured: z.boolean().optional(),
      offset: z.number().int().min(0).optional(),
      limit: z.number().int().min(1).max(100).optional(),
    }),
    out: z.union([
      z.object({
        code: z.literal(200),
        events: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            category,
            startDateTime: z.string().datetime({ offset: true }),
            city: z.string(),
            isFeatured: z.boolean(),
          }),
        ),
        total: z.number().int(),
      }),
      z.object({
        code: z.literal(400),
        type: z.literal('bad-request'),
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

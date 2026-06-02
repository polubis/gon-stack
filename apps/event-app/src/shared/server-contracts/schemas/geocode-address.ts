import z from 'zod';

export const schema = () =>
  z.object({
    in: z.object({
      q: z.string().min(1),
    }),
    out: z.union([
      z.object({
        code: z.literal(200),
        lat: z.number(),
        lng: z.number(),
      }),
      z.object({
        code: z.literal(404),
        type: z.literal('not-found'),
        message: z.string(),
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

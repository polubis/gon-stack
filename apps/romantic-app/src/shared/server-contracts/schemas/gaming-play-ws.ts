import z from 'zod';

export const schema = () =>
  z.object({
    in: z.object({
      query: z.object({
        token: z.string(),
      }),
      path: z.object({
        gameId: z.string().uuid(),
      }),
      payload: z.object({}),
    }),
    out: z.union([
      z.object({
        code: z.literal(200),
        event: z.string(),
        data: z.unknown(),
      }),
      z.object({
        code: z.literal(401),
        type: z.literal('unauthorized'),
        message: z.string(),
      }),
      z.object({
        code: z.literal(403),
        type: z.literal('forbidden'),
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

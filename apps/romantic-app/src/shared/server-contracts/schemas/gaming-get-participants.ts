import z from 'zod';

export const schema = () =>
  z.object({
    in: z.object({
      query: z.object({
        filterUserName: z.string().optional(),
        sortBy: z.enum(['user_name']).optional(),
        sortDir: z.enum(['asc', 'desc']).optional(),
        page: z.string().optional(),
        limit: z.string().optional(),
      }),
      path: z.object({
        roomId: z.string().uuid(),
      }),
      payload: z.object({}),
    }),
    out: z.union([
      z.object({
        code: z.literal(200),
        participants: z.array(
          z.object({
            userId: z.string().uuid(),
            displayName: z.string(),
            joinedAt: z.string(),
          }),
        ),
        total: z.number(),
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

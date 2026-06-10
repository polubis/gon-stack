import z from 'zod';

export const schema = () =>
  z.object({
    in: z.object({
      query: z.object({
        search: z.string().optional(),
        code: z.string().optional(),
        page: z.string().optional(),
        limit: z.string().optional(),
      }),
      path: z.object({}),
      payload: z.object({}),
    }),
    out: z.union([
      z.object({
        code: z.literal(200),
        rooms: z.array(
          z.object({
            id: z.string().uuid(),
            name: z.string(),
            roomCode: z.string(),
            visibility: z.enum(['public', 'private']),
            hasPassword: z.boolean(),
            creatorId: z.string().uuid(),
            participantCount: z.number(),
            createdAt: z.string(),
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
        code: z.literal(500),
        type: z.literal('internal-server'),
        message: z.string(),
      }),
    ]),
  });

export type Schema = z.infer<ReturnType<typeof schema>>;

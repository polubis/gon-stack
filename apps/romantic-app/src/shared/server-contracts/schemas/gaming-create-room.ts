import z from 'zod';

export const schema = () =>
  z.object({
    in: z.object({
      query: z.object({}),
      path: z.object({}),
      payload: z.object({
        name: z.string().min(1).max(100),
        visibility: z.enum(['public', 'private']),
        password: z.string().optional(),
      }),
    }),
    out: z.union([
      z.object({
        code: z.literal(201),
        room: z.object({
          id: z.string().uuid(),
          name: z.string(),
          roomCode: z.string(),
          visibility: z.enum(['public', 'private']),
          hasPassword: z.boolean(),
          creatorId: z.string().uuid(),
          participantCount: z.number(),
          createdAt: z.string(),
        }),
      }),
      z.object({
        code: z.literal(401),
        type: z.literal('unauthorized'),
        message: z.string(),
      }),
      z.object({
        code: z.literal(422),
        type: z.literal('validation-error'),
        errors: z.array(
          z.object({
            field: z.string(),
            message: z.string(),
          }),
        ),
      }),
      z.object({
        code: z.literal(500),
        type: z.literal('internal-server'),
        message: z.string(),
      }),
    ]),
  });

export type Schema = z.infer<ReturnType<typeof schema>>;

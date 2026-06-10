import z from 'zod';

export const schema = () =>
  z.object({
    in: z.object({
      query: z.object({}),
      path: z.object({
        roomId: z.string().uuid(),
      }),
      payload: z.object({
        roomCode: z.string().min(1),
        roomPassword: z.string().optional(),
      }),
    }),
    out: z.union([
      z.object({
        code: z.literal(201),
        participant: z.object({
          userId: z.string().uuid(),
          displayName: z.string(),
          joinedAt: z.string(),
        }),
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
        code: z.literal(409),
        type: z.literal('conflict'),
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

import z from 'zod';

export const schema = () =>
  z.object({
    in: z.object({
      eventId: z.string(),
    }),
    out: z.union([
      z.object({
        code: z.literal(200),
        friends: z.array(
          z.object({
            displayName: z.string(),
            avatarUrl: z.string().url().optional(),
          }),
        ),
      }),
      z.object({
        code: z.literal(401),
        type: z.literal('unauthorized'),
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

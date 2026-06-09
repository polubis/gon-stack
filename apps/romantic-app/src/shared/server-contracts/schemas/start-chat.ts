import z from 'zod';

export const schema = () =>
  z.object({
    in: z.object({}),
    out: z.union([
      z.object({
        code: z.literal(200),
        conversationId: z.string(),
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

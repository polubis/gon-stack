import z from 'zod';

export const schema = () =>
  z.object({
    in: z.object({
      sessionId: z.string().min(1),
      categoryId: z.string().min(1),
      questionId: z.string().min(1),
      answer: z.union([z.string(), z.number(), z.boolean()]),
    }),
    out: z.union([
      z.object({
        code: z.literal(200),
        accepted: z.literal(true),
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

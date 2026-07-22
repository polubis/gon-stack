import z from 'zod';

const answerValue = z.union([z.string(), z.number()]);

export const schema = () =>
  z.object({
    in: z.object({
      answers: z.record(z.string(), answerValue),
    }),
    out: z.union([
      z.object({
        code: z.literal(200),
        ok: z.literal(true),
      }),
      z.object({
        code: z.literal(400),
        type: z.literal('bad-request'),
        message: z.string(),
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

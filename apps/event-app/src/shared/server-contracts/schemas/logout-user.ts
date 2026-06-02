import z from 'zod';

export const schema = () =>
  z.object({
    in: z.object({}),
    out: z.union([
      z.object({
        code: z.literal(303),
        location: z.string(),
      }),
      z.object({
        code: z.literal(500),
        type: z.literal('internal-server'),
        message: z.string(),
      }),
    ]),
  });

export type Schema = z.infer<ReturnType<typeof schema>>;

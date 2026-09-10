import z from 'zod';

export const schema = () =>
  z.object({
    in: z.union([
      z.object({
        email: z.string().min(1),
        password: z.string().min(1),
      }),
      z.object({
        provider: z.literal('google'),
      }),
    ]),
    out: z.union([
      z.object({
        code: z.literal(303),
        location: z.string(),
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

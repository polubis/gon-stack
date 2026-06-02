import z from 'zod';

export const schema = () =>
  z.object({
    in: z.object({}),
    out: z.union([
      z.object({
        code: z.literal(200),
        data: z.object({
          id: z.string(),
          username: z.string().nullable(),
          avatar_url: z.string().nullable(),
          role: z.union([z.literal('user'), z.literal('admin')]),
          created_at: z.string(),
        }),
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

import z from 'zod';
import { errorOut } from './general';

export const schema = () =>
  z.object({
    in: z.object({
      email: z.string().min(1),
      password: z.string().min(1),
    }),
    out: z.union([
      z.object({
        code: z.literal(303),
        location: z.string(),
      }),
      z.object({
        code: z.literal(200),
        ok: z.literal(true),
      }),
      errorOut(),
    ]),
  });

export type Schema = z.infer<ReturnType<typeof schema>>;

import z from 'zod';
import { errorOut } from './general';

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
      errorOut(),
    ]),
  });

export type Schema = z.infer<ReturnType<typeof schema>>;

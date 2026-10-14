import z from 'zod';
import { errorOut } from './general';

/** Who the session cookie belongs to; `user: null` when signed out. */
export const schema = () =>
  z.object({
    in: z.object({}),
    out: z.union([
      z.object({
        code: z.literal(200),
        user: z
          .object({
            id: z.string().min(1),
            email: z.string(),
            displayName: z.string().nullable(),
            avatarUrl: z.string().nullable(),
          })
          .nullable(),
      }),
      errorOut(),
    ]),
  });

export type Schema = z.infer<ReturnType<typeof schema>>;

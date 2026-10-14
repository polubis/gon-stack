import z from 'zod';
import { errorOut } from './general';

/** No input signs the active account out; `all` signs out every account. */
export const schema = () =>
  z.object({
    in: z.object({
      userId: z.uuid().optional(),
      all: z.boolean().optional(),
    }),
    out: z.union([
      z.object({
        code: z.literal(200),
        /** Where the client goes next: another account or the sign-in page. */
        location: z.string(),
      }),
      errorOut(),
    ]),
  });

export type Schema = z.infer<ReturnType<typeof schema>>;

import z from 'zod';
import { errorOut } from './general';

const accountErrorOut = () =>
  z.union([
    errorOut(),
    z.object({
      code: z.literal(404),
      type: z.literal('not-found'),
      message: z.string(),
    }),
    z.object({
      code: z.literal(409),
      type: z.literal('conflict'),
      message: z.string(),
    }),
  ]);

/** Non-sensitive metadata only; tokens never leave the server. */
export const account = () =>
  z.object({
    userId: z.string().min(1),
    email: z.string(),
    avatarUrl: z.string().nullable(),
  });

export const listAccountsSchema = () =>
  z.object({
    in: z.object({}),
    out: z.union([
      z.object({
        code: z.literal(200),
        activeId: z.string().nullable(),
        accounts: z.array(account()),
      }),
      errorOut(),
    ]),
  });

export const switchAccountSchema = () =>
  z.object({
    in: z.object({ userId: z.uuid() }),
    out: z.union([
      z.object({ code: z.literal(200), activeId: z.string() }),
      accountErrorOut(),
    ]),
  });

export type ListAccountsSchema = z.infer<ReturnType<typeof listAccountsSchema>>;
export type SwitchAccountSchema = z.infer<
  ReturnType<typeof switchAccountSchema>
>;

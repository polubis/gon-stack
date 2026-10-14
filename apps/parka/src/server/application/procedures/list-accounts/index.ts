import { listAccountsSchema } from '@schemas/auth-accounts';
import { withZodSchema } from '../../adapter/zod';
import { publicProcedure } from '../../core/procedure';

export const listAccounts = publicProcedure({
  schema: withZodSchema({ schema: listAccountsSchema }),
})({
  handler: async (_input, { sessions }) => ({
    code: 200 as const,
    activeId: sessions.activeId(),
    accounts: sessions.list(),
  }),
});

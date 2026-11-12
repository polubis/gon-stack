import { listAccountsSchema } from '@schemas/auth-accounts';
import { withZodSchema } from '../../adapter/zod';
import { AVATAR_BUCKET, avatarPath } from '../../shared/avatar';
import { publicProcedure } from '../../core/procedure';

export const listAccounts = publicProcedure({
  schema: withZodSchema({ schema: listAccountsSchema }),
})({
  handler: async (_input, { sessions, db }) => ({
    code: 200 as const,
    activeId: sessions.activeId(),
    // Uploaded pictures live in the public bucket, not in auth metadata; the
    // client falls back to initials when an account has none.
    accounts: sessions.list().map((account) => ({
      ...account,
      avatarUrl:
        account.avatarUrl ??
        db.storage
          .from(AVATAR_BUCKET)
          .getPublicUrl(avatarPath(account.userId, 64)).data.publicUrl,
    })),
  }),
});

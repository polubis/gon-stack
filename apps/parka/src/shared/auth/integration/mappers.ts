import type { Schema as MeSchema } from '@schemas/auth-me';
import type { ListAccountsSchema } from '@schemas/auth-accounts';
import type {
  Accounts,
  Auth,
  AvatarUrl,
  DisplayName,
  Email,
  UserId,
} from '../domain/models';

export const toAuth = (dto: MeSchema['out']): Auth => {
  if (dto.code !== 200 || !dto.user) return { status: 'unauthenticated' };

  return {
    status: 'authenticated',
    user: {
      id: dto.user.id as UserId,
      email: dto.user.email as Email,
      displayName: dto.user.displayName as DisplayName | null,
      avatarUrl: dto.user.avatarUrl as AvatarUrl | null,
    },
  };
};

export const toAccounts = (dto: ListAccountsSchema['out']): Accounts =>
  dto.code === 200
    ? {
        activeId: dto.activeId as UserId | null,
        items: dto.accounts.map(({ userId, email, avatarUrl }) => ({
          id: userId as UserId,
          email: email as Email,
          avatarUrl: avatarUrl as AvatarUrl | null,
        })),
      }
    : { activeId: null, items: [] };

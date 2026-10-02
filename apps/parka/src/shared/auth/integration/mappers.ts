import type { Auth, AvatarUrl, DisplayName, UserId } from '../domain/models';

type UserDto = {
  id: string;
  user_metadata?: Record<string, unknown>;
};

const text = (value: unknown) =>
  typeof value === 'string' && value ? value : null;

export const toAuth = (user: UserDto | null | undefined): Auth => {
  if (!user) return { status: 'unauthenticated' };

  const meta = user.user_metadata ?? {};
  const displayName = text(meta.full_name) ?? text(meta.name);
  const avatarUrl = text(meta.avatar_url) ?? text(meta.picture);

  return {
    status: 'authenticated',
    user: {
      id: user.id as UserId,
      displayName: displayName as DisplayName | null,
      avatarUrl: avatarUrl as AvatarUrl | null,
    },
  };
};

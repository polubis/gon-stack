import type { Brand } from '@repo/type-beast/brand';

export type UserId = Brand<string, 'UserId'>;
export type DisplayName = Brand<string, 'DisplayName'>;
export type AvatarUrl = Brand<string, 'AvatarUrl'>;

export type AuthUser = {
  id: UserId;
  displayName: DisplayName | null;
  avatarUrl: AvatarUrl | null;
};

export type Auth =
  | { status: 'checking' }
  | { status: 'unauthenticated' }
  | { status: 'authenticated'; user: AuthUser };

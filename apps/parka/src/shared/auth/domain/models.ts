import type { Brand } from '@repo/type-beast/brand';

export type UserId = Brand<string, 'UserId'>;
export type Email = Brand<string, 'Email'>;
export type DisplayName = Brand<string, 'DisplayName'>;
export type AvatarUrl = Brand<string, 'AvatarUrl'>;

export type AuthUser = {
  id: UserId;
  email: Email;
  displayName: DisplayName | null;
  avatarUrl: AvatarUrl | null;
};

export type Auth =
  | { status: 'checking' }
  | { status: 'unauthenticated' }
  | { status: 'authenticated'; user: AuthUser };

/** One signed-in account of this browser; never carries tokens. */
export type Account = {
  id: UserId;
  email: Email;
  avatarUrl: AvatarUrl | null;
};

export type Accounts = { activeId: UserId | null; items: Account[] };

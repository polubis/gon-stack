import type { Schema as MeSchema } from '@schemas/auth-me';
import type {
  ListAccountsSchema,
  SwitchAccountSchema,
} from '@schemas/auth-accounts';
import type { Schema as LogoutSchema } from '@schemas/logout-user';
import { API_ROUTER } from '@/shared/router/routes';
import type { Accounts, Auth, UserId } from '../domain/models';
import { announceAuthChange } from './auth-channel';
import { dropPushSubscription } from './device-cleanup';
import { toAccounts, toAuth } from './mappers';

const postJson = (url: string, body: object) =>
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

/**
 * The browser never sees tokens: the server owns the session cookies and
 * answers who is signed in. Any failure resolves as signed out.
 */
export const fetchAuth = async (): Promise<Auth> => {
  try {
    const res = await fetch(API_ROUTER.authMe());
    return toAuth((await res.json()) as MeSchema['out']);
  } catch {
    return { status: 'unauthenticated' };
  }
};

export const fetchAccounts = async (): Promise<Accounts> => {
  const res = await fetch(API_ROUTER.authAccounts());
  const dto = (await res.json()) as ListAccountsSchema['out'];
  if (dto.code !== 200) throw new Error(dto.message);
  return toAccounts(dto);
};

export const switchAccount = async (userId: UserId): Promise<void> => {
  const res = await postJson(API_ROUTER.authSwitch(), { userId });
  const dto = (await res.json()) as SwitchAccountSchema['out'];
  if (dto.code !== 200) throw new Error(dto.message);
  announceAuthChange();
};

/**
 * Signs out one account, the active one (`'active'`) or every account
 * (`'all'`). Returns where to go next.
 */
export const logoutAccount = async (
  target: UserId | 'active' | 'all',
): Promise<string> => {
  const res = await postJson(
    API_ROUTER.authLogout(),
    target === 'all'
      ? { all: true }
      : target === 'active'
        ? {}
        : { userId: target },
  );
  const dto = (await res.json()) as LogoutSchema['out'];
  if (dto.code !== 200) throw new Error(dto.message);
  // A signed-out device must not keep receiving that account's notifications.
  await dropPushSubscription();
  announceAuthChange();
  return dto.location;
};

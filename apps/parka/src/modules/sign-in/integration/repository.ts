import type { Schema } from '@schemas/login-user';
import { API_ROUTER } from '@/shared/router/routes';
import type { Credentials, SignInResult } from '../domain/models';
import { toSignInResult } from './mappers';

/** Nothing else in this module fetches. */
export const signIn = async (
  credentials: Credentials,
): Promise<SignInResult> => {
  const res = await fetch(API_ROUTER.authLogin(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
    redirect: 'manual',
  });

  if (res.type === 'opaqueredirect') return { status: 'redirected' };

  return toSignInResult((await res.json()) as Schema['out']);
};

import type { Schema } from '@schemas/login-user';
import { apiRoutes } from '@/shared/router';

export type SignInResult =
  { status: 'redirected' } | { status: 'rejected'; message: string };

/** Nothing else in this module fetches. */
export const signIn = async (
  email: string,
  password: string,
): Promise<SignInResult> => {
  const res = await fetch(apiRoutes.authLogin(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    redirect: 'manual',
  });

  if (res.type === 'opaqueredirect') return { status: 'redirected' };

  const body = (await res.json()) as Schema['out'];

  return {
    status: 'rejected',
    message: 'message' in body ? body.message : 'Sign-in failed. Try again.',
  };
};

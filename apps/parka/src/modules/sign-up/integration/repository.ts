import type { Schema } from '@schemas/register-user';
import { API_ROUTER } from '@/shared/router';

export type SignUpResult =
  | { status: 'redirected' }
  | { status: 'pending-confirmation' }
  | { status: 'rejected'; message: string };

/** Nothing else in this module fetches. */
export const signUp = async (
  email: string,
  password: string,
): Promise<SignUpResult> => {
  const res = await fetch(API_ROUTER.authRegister(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    redirect: 'manual',
  });

  if (res.type === 'opaqueredirect') return { status: 'redirected' };

  const body = (await res.json()) as Schema['out'];

  if (body.code === 200) return { status: 'pending-confirmation' };

  return {
    status: 'rejected',
    message: 'message' in body ? body.message : 'Sign-up failed. Try again.',
  };
};

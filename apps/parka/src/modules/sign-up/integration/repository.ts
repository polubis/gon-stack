import type { Schema } from '@schemas/register-user';
import { API_ROUTER } from '@/shared/router';
import type { Credentials, SignUpResult } from '../domain/models';
import { toSignUpResult } from './mappers';

/** Nothing else in this module fetches. */
export const signUp = async (
  credentials: Credentials,
): Promise<SignUpResult> => {
  const res = await fetch(API_ROUTER.authRegister(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
    redirect: 'manual',
  });

  if (res.type === 'opaqueredirect') return { status: 'redirected' };

  return toSignUpResult((await res.json()) as Schema['out']);
};

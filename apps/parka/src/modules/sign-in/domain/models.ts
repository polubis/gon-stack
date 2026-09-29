import type { Brand } from '@repo/type-beast/brand';

export type Email = Brand<string, 'Email'>;
export type Password = Brand<string, 'Password'>;

export type Credentials = { email: Email; password: Password };

export type SignInResult =
  { status: 'redirected' } | { status: 'rejected'; message: string };

import type { Brand } from '@repo/type-beast/brand';

export type Email = Brand<string, 'Email'>;
export type Password = Brand<string, 'Password'>;

export type Credentials = { email: Email; password: Password };

export type SignUpResult =
  | { status: 'redirected' }
  | { status: 'pending-confirmation' }
  | { status: 'rejected'; message: string };

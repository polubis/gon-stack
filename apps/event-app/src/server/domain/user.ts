import type { Brand } from '@repo/type-beast/brand';

export type Email = Brand<string, 'Email'>;
export type Username = Brand<string, 'Username'>;

export type UserId = Brand<string, 'UserId'>;

export class KnownUser {
  type: 'known';

  constructor(
    public id: UserId,
    public email: Email,
    public username: Username,
  ) {}
}

export class UnknownUser {
  type: 'unknown';
}

export type User = KnownUser | UnknownUser;

import type { Brand } from '@repo/type-beast/brand';

export type TokenId = Brand<string, 'AccessTokenId'>;

export type TokenStatus = 'active' | 'expired' | 'revoked';

/** A token as listed: never carries the secret, only a masked form of it. */
export type AccessToken = {
  id: TokenId;
  name: string;
  /** First and last characters of the secret, e.g. `Ab12` and `xy89`. */
  hint: string;
  tail: string;
  status: TokenStatus;
  /** Days a new secret lives; `null` never expires. */
  ttlDays: number | null;
  expiresAt: string | null;
  lastUsedAt: string | null;
  rotatedAt: string | null;
  createdAt: string;
};

/** The one-time reveal of a freshly issued secret; held in memory only. */
export type Secret = {
  token: string;
  name: string;
  kind: 'created' | 'rotated';
};

export type NoticeBody =
  | { tone: 'success'; message: string }
  | {
      tone: 'error';
      title: string;
      code: string;
      description: string;
      retry?: () => void;
    };

export type Notice = { id: number } & NoticeBody;

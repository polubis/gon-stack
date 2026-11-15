import { describe, expect, it } from 'vitest';
import { toAccessToken } from '../integration/mappers';

type Dto = Parameters<typeof toAccessToken>[0];

const dto = (patch: Partial<Dto> = {}): Dto => ({
  id: '0b9a4a52-6a9c-4f3c-8f0e-1d6f1c7a0001',
  name: 'Claude Desktop',
  hint: 'Zq8x',
  tail: 'Yb6k',
  status: 'active',
  ttlDays: 30,
  expiresAt: '2026-11-23T10:00:00.000Z',
  lastUsedAt: '2026-11-01T10:00:00.000Z',
  rotatedAt: null,
  createdAt: '2026-10-24T10:00:00.000Z',
  ...patch,
});

describe('access tokens mappers', () => {
  it('keeps every listed field of a token', () => {
    expect(toAccessToken(dto())).toEqual(dto());
  });

  it('keeps a token that never expires', () => {
    const token = toAccessToken(dto({ ttlDays: null, expiresAt: null }));

    expect(token.ttlDays).toBeNull();
    expect(token.expiresAt).toBeNull();
  });

  it('keeps the status of a revoked token', () => {
    expect(toAccessToken(dto({ status: 'revoked' })).status).toBe('revoked');
  });

  it('drops fields that are not part of a listed token', () => {
    const token = toAccessToken({ ...dto(), token: 'secret' } as Dto);

    expect(token).not.toHaveProperty('token');
  });
});

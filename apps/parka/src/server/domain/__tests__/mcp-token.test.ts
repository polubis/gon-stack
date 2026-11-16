import { describe, expect, it } from 'vitest';
import {
  hashMcpToken,
  issueMcpToken,
  looksLikeMcpToken,
  mcpTokenStatus,
} from '../mcp-token';

const NOW = new Date('2026-11-18T10:00:00.000Z');

describe('mcp token issuing', () => {
  it('gives a token that passes the shape check', async () => {
    const issued = await issueMcpToken(30, NOW);

    expect(looksLikeMcpToken(issued.token)).toBe(true);
  });

  it('gives a different secret each time', async () => {
    const first = await issueMcpToken(null, NOW);
    const second = await issueMcpToken(null, NOW);

    expect(first.token).not.toBe(second.token);
  });

  it('stores the hash of the token, never the token', async () => {
    const issued = await issueMcpToken(null, NOW);

    expect(issued.hash).toBe(await hashMcpToken(issued.token));
    expect(issued.hash).toMatch(/^[0-9a-f]{64}$/);
    expect(issued.hash).not.toContain(issued.token);
  });

  it('keeps the first and last four secret characters as a hint', async () => {
    const issued = await issueMcpToken(null, NOW);
    const secret = issued.token.replace('parka_mcp_', '');

    expect(issued.hint).toBe(secret.slice(0, 4));
    expect(issued.tail).toBe(secret.slice(-4));
  });

  it('expires after the given number of days', async () => {
    const issued = await issueMcpToken(7, NOW);

    expect(issued.expiresAt).toBe('2026-11-25T10:00:00.000Z');
  });

  it('never expires without a lifetime', async () => {
    const issued = await issueMcpToken(null, NOW);

    expect(issued.expiresAt).toBeNull();
  });
});

describe('mcp token hashing', () => {
  it('matches the known SHA-256 digest', async () => {
    expect(await hashMcpToken('abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
  });
});

describe('mcp token shape check', () => {
  it('rejects a value without the prefix', () => {
    expect(looksLikeMcpToken(`other_${'a'.repeat(40)}`)).toBe(false);
  });

  it('rejects a value that is too short', () => {
    expect(looksLikeMcpToken('parka_mcp_abc')).toBe(false);
  });

  it('rejects a value that is too long', () => {
    expect(looksLikeMcpToken(`parka_mcp_${'a'.repeat(200)}`)).toBe(false);
  });
});

describe('mcp token status', () => {
  it('is active with no revoke and no expiry', () => {
    expect(mcpTokenStatus({ revokedAt: null, expiresAt: null }, NOW)).toBe(
      'active',
    );
  });

  it('is active before its expiry', () => {
    expect(
      mcpTokenStatus(
        { revokedAt: null, expiresAt: '2026-11-18T10:00:01.000Z' },
        NOW,
      ),
    ).toBe('active');
  });

  it('is expired exactly at its expiry', () => {
    expect(
      mcpTokenStatus(
        { revokedAt: null, expiresAt: '2026-11-18T10:00:00.000Z' },
        NOW,
      ),
    ).toBe('expired');
  });

  it('is revoked even when it also expired', () => {
    expect(
      mcpTokenStatus(
        {
          revokedAt: '2026-11-01T00:00:00.000Z',
          expiresAt: '2026-11-02T00:00:00.000Z',
        },
        NOW,
      ),
    ).toBe('revoked');
  });
});

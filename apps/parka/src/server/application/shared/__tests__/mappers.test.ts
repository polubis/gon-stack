import { describe, expect, it } from 'vitest';
import { toMcpToken } from '../mcp-token';
import { toTaskAttachment } from '../task-attachment';
import { toTaskComment, tokenNames } from '../task-comment';

const tokenRow = {
  id: 'token-1',
  name: 'CI bot',
  token_hint: 'abcd',
  token_tail: 'wxyz',
  ttl_days: 30 as number | null,
  expires_at: null as string | null,
  revoked_at: null as string | null,
  rotated_at: null,
  last_used_at: null,
  created_at: '2026-11-01T00:00:00.000Z',
};

describe('mcp token mapper', () => {
  it('exposes the hint and tail but no secret or hash', () => {
    const token = toMcpToken(tokenRow);

    expect(token).toMatchObject({ hint: 'abcd', tail: 'wxyz', name: 'CI bot' });
    expect(Object.keys(token)).not.toContain('hash');
  });

  it('keeps a supported lifetime', () => {
    expect(toMcpToken({ ...tokenRow, ttl_days: 90 }).ttlDays).toBe(90);
  });

  it('drops an unsupported lifetime', () => {
    expect(toMcpToken({ ...tokenRow, ttl_days: 12 }).ttlDays).toBeNull();
  });

  it('has no lifetime for a token that never expires', () => {
    expect(toMcpToken({ ...tokenRow, ttl_days: null }).ttlDays).toBeNull();
  });

  it('reports an expired token', () => {
    const token = toMcpToken(
      { ...tokenRow, expires_at: '2026-11-10T00:00:00.000Z' },
      new Date('2026-11-18T00:00:00.000Z'),
    );

    expect(token.status).toBe('expired');
  });

  it('reports a revoked token', () => {
    const token = toMcpToken({
      ...tokenRow,
      revoked_at: '2026-11-05T00:00:00.000Z',
    });

    expect(token.status).toBe('revoked');
  });
});

const commentRow = {
  id: 'comment-1',
  body: 'Done',
  created_at: '2026-11-18T08:00:00.000Z',
  edited_at: null,
  mcp_token_id: 'token-1' as string | null,
  bot_name: 'Old name' as string | null,
  bot_ref: 'bot-ref' as string | null,
};

describe('task comment mapper', () => {
  it('signs a bot comment with the current token name', () => {
    const names = tokenNames([{ id: 'token-1', name: 'Renamed' }]);

    expect(toTaskComment(commentRow, names).bot).toEqual({
      name: 'Renamed',
      ref: 'bot-ref',
    });
  });

  it('keeps the stored name once the token is deleted', () => {
    expect(toTaskComment(commentRow, tokenNames([])).bot).toEqual({
      name: 'Old name',
      ref: 'bot-ref',
    });
  });

  it('keeps the stored name for a comment without a token id', () => {
    const row = { ...commentRow, mcp_token_id: null };

    expect(toTaskComment(row, tokenNames([])).bot?.name).toBe('Old name');
  });

  it('has no bot for a comment written by the owner', () => {
    const row = { ...commentRow, bot_name: null, bot_ref: null };

    expect(toTaskComment(row, tokenNames([])).bot).toBeNull();
  });

  it('carries the body and timestamps', () => {
    expect(toTaskComment(commentRow, tokenNames([]))).toMatchObject({
      id: 'comment-1',
      body: 'Done',
      createdAt: '2026-11-18T08:00:00.000Z',
      editedAt: null,
    });
  });
});

describe('task attachment mapper', () => {
  it('maps a row to what the client shows', () => {
    const row = {
      id: 'a1',
      name: 'clip.mp4',
      size: 1024,
      mime: 'video/mp4',
      status: 'uploading',
      user_id: 'u1',
    };

    expect(toTaskAttachment(row as never)).toEqual({
      id: 'a1',
      name: 'clip.mp4',
      size: 1024,
      mime: 'video/mp4',
      status: 'uploading',
    });
  });
});

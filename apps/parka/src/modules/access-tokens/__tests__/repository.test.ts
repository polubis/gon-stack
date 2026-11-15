import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import type { TokenId } from '../domain/models';
import {
  deleteToken,
  fetchTokens,
  postResume,
  postRevocation,
  postToken,
} from '../integration/repository';

const ID = '0b9a4a52-6a9c-4f3c-8f0e-1d6f1c7a0001' as TokenId;

const item = (patch: Record<string, unknown> = {}) => ({
  id: ID,
  name: 'Claude Desktop',
  hint: 'Zq8x',
  tail: 'Yb6k',
  status: 'active',
  ttlDays: 30,
  expiresAt: '2026-11-23T10:00:00.000Z',
  lastUsedAt: null,
  rotatedAt: null,
  createdAt: '2026-10-24T10:00:00.000Z',
  ...patch,
});

const failure = (code: number, message: string) =>
  HttpResponse.json({ code, message });

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('access tokens repository', () => {
  it('lists tokens of the account', async () => {
    server.use(
      http.get('/api/mcp-tokens/', () =>
        HttpResponse.json({ code: 200, data: [item(), item({ name: 'CLI' })] }),
      ),
    );

    const tokens = await fetchTokens(new AbortController().signal);

    expect(tokens.map((token) => token.name)).toEqual([
      'Claude Desktop',
      'CLI',
    ]);
  });

  it('fails the list with the server message', async () => {
    server.use(
      http.get('/api/mcp-tokens/', () => failure(401, 'Sesja wygasła')),
    );

    await expect(fetchTokens(new AbortController().signal)).rejects.toThrow(
      'Sesja wygasła',
    );
  });

  it('stops a list that was aborted', async () => {
    server.use(
      http.get('/api/mcp-tokens/', () =>
        HttpResponse.json({ code: 200, data: [] }),
      ),
    );
    const controller = new AbortController();
    controller.abort();

    await expect(fetchTokens(controller.signal)).rejects.toThrow();
  });

  it('returns the one time secret with the new token', async () => {
    server.use(
      http.post('/api/mcp-tokens/', async ({ request }) => {
        const body = (await request.json()) as { name: string };
        return HttpResponse.json({
          code: 201,
          data: { token: 'parka_mcp_secret', item: item({ name: body.name }) },
        });
      }),
    );

    const created = await postToken('Laptop', null);

    expect(created.token).toBe('parka_mcp_secret');
    expect(created.item.name).toBe('Laptop');
  });

  it('fails creating a token with the server message', async () => {
    server.use(
      http.post('/api/mcp-tokens/', () => failure(409, 'Limit tokenów')),
    );

    await expect(postToken('Laptop', 30)).rejects.toThrow('Limit tokenów');
  });

  it('pauses a token', async () => {
    server.use(
      http.post(`/api/mcp-tokens/${ID}/revoke/`, () =>
        HttpResponse.json({ code: 200, data: item({ status: 'revoked' }) }),
      ),
    );

    expect((await postRevocation(ID)).status).toBe('revoked');
  });

  it('fails pausing with the server message', async () => {
    server.use(
      http.post(`/api/mcp-tokens/${ID}/revoke/`, () =>
        failure(404, 'Nie ma tokenu'),
      ),
    );

    await expect(postRevocation(ID)).rejects.toThrow('Nie ma tokenu');
  });

  it('resumes a paused token', async () => {
    server.use(
      http.post(`/api/mcp-tokens/${ID}/resume/`, () =>
        HttpResponse.json({ code: 200, data: item() }),
      ),
    );

    expect((await postResume(ID)).status).toBe('active');
  });

  it('fails resuming with the server message', async () => {
    server.use(
      http.post(`/api/mcp-tokens/${ID}/resume/`, () =>
        failure(409, 'Token wygasł'),
      ),
    );

    await expect(postResume(ID)).rejects.toThrow('Token wygasł');
  });

  it('deletes a token', async () => {
    server.use(
      http.delete(`/api/mcp-tokens/${ID}/`, () =>
        HttpResponse.json({ code: 200, data: null }),
      ),
    );

    await expect(deleteToken(ID)).resolves.toBeUndefined();
  });

  it('fails deleting with the server message', async () => {
    server.use(
      http.delete(`/api/mcp-tokens/${ID}/`, () => failure(500, 'Błąd serwera')),
    );

    await expect(deleteToken(ID)).rejects.toThrow('Błąd serwera');
  });
});

import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import type { Credentials } from '../domain/models';
import { signUp } from '../integration/repository';

const credentials = {
  email: 'ada@example.com',
  password: 'secret-pass-1',
} as Credentials;

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('sign up repository', () => {
  it('sends credentials as json', async () => {
    let body: unknown;
    let contentType: string | null = null;
    server.use(
      http.post('/api/auth/register/', async ({ request }) => {
        body = await request.json();
        contentType = request.headers.get('Content-Type');
        return HttpResponse.json({ code: 200, ok: true });
      }),
    );

    await signUp(credentials);

    expect(body).toEqual(credentials);
    expect(contentType).toBe('application/json');
  });

  it('waits for confirmation when the account is created', async () => {
    server.use(
      http.post('/api/auth/register/', () =>
        HttpResponse.json({ code: 200, ok: true }),
      ),
    );

    await expect(signUp(credentials)).resolves.toEqual({
      status: 'pending-confirmation',
    });
  });

  it('reports a redirect without reading the body', async () => {
    server.use(
      http.post(
        '/api/auth/register/',
        () =>
          new HttpResponse(null, {
            status: 302,
            headers: { Location: '/app/' },
          }),
      ),
    );

    await expect(signUp(credentials)).resolves.toEqual({
      status: 'redirected',
    });
  });

  it('keeps the rejection message from the server', async () => {
    server.use(
      http.post('/api/auth/register/', () =>
        HttpResponse.json({ code: 400, type: 'bad-request', message: 'Taken' }),
      ),
    );

    await expect(signUp(credentials)).resolves.toEqual({
      status: 'rejected',
      message: 'Taken',
    });
  });

  it('fails when the response is not json', async () => {
    server.use(
      http.post(
        '/api/auth/register/',
        () => new HttpResponse('Bad gateway', { status: 502 }),
      ),
    );

    await expect(signUp(credentials)).rejects.toThrow();
  });

  it('fails when the network is down', async () => {
    server.use(http.post('/api/auth/register/', () => HttpResponse.error()));

    await expect(signUp(credentials)).rejects.toThrow();
  });
});

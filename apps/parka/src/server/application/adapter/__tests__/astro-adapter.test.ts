import type { APIContext } from 'astro';
import { describe, expect, it } from 'vitest';
import { astroAdapter } from '../astro';

const run = async (
  request: Request,
  params: Record<string, string> = {},
  response: { code: number; [key: string]: unknown } = { code: 200 },
) => {
  let input: unknown;
  const route = astroAdapter(async (readInput) => {
    input = await readInput();
    return response;
  });
  const result = await route({ request, params } as unknown as APIContext);
  return { result, input: async () => input };
};

const post = (body: BodyInit, contentType?: string, url = 'http://x/api/a/') =>
  new Request(url, {
    method: 'POST',
    body,
    headers: contentType ? { 'content-type': contentType } : {},
  });

describe('astro procedure adapter', () => {
  it('merges json body, query string and path params', async () => {
    const { input } = await run(
      post(JSON.stringify({ a: 1 }), 'application/json', 'http://x/api/a/?b=2'),
      { c: '3' },
    );

    expect(await input()).toEqual({ a: 1, b: '2', c: '3' });
  });

  it('lets path params win over the body', async () => {
    const { input } = await run(
      post(JSON.stringify({ id: 'body' }), 'application/json'),
      { id: 'path' },
    );

    expect(await input()).toEqual({ id: 'path' });
  });

  it('reads multipart fields', async () => {
    const form = new FormData();
    form.set('name', 'Ala');

    const { input } = await run(post(form));

    expect(await input()).toEqual({ name: 'Ala' });
  });

  it('ignores the body of a GET', async () => {
    const { input } = await run(
      new Request('http://x/api/a/?q=1', { method: 'GET' }),
    );

    expect(await input()).toEqual({ q: '1' });
  });

  it('treats an empty json body as no fields', async () => {
    const { input } = await run(post('', 'application/json'));

    expect(await input()).toEqual({});
  });

  it('ignores a json body that is not an object', async () => {
    const { input } = await run(post('[1,2]', 'application/json'));

    expect(await input()).toEqual({});
  });

  it('ignores an unknown content type', async () => {
    const { input } = await run(post('hello', 'text/plain'));

    expect(await input()).toEqual({});
  });

  it('rejects malformed json as a bad request', async () => {
    const route = astroAdapter(async (readInput) => {
      await readInput();
      return { code: 200 };
    });

    await expect(
      route({
        request: post('{oops', 'application/json'),
        params: {},
      } as unknown as APIContext),
    ).rejects.toMatchObject({ code: 400, message: 'Malformed request body' });
  });

  it('answers with the procedure code as json that is never cached', async () => {
    const { result } = await run(
      post('{}', 'application/json'),
      {},
      {
        code: 404,
        type: 'not-found',
      },
    );

    expect(result.status).toBe(404);
    expect(result.headers.get('Content-Type')).toBe('application/json');
    expect(result.headers.get('Cache-Control')).toBe('private, no-store');
    expect(await result.json()).toEqual({ code: 404, type: 'not-found' });
  });

  it('redirects when the procedure asks for it', async () => {
    const { result } = await run(
      new Request('http://x/api/cb/'),
      {},
      { code: 302, location: '/home' },
    );

    expect(result.status).toBe(302);
    expect(result.headers.get('Location')).toBe('/home');
    expect(result.headers.get('Cache-Control')).toBe('private, no-store');
    expect(result.body).toBeNull();
  });

  it('answers json when a redirect code has no location', async () => {
    const { result } = await run(
      new Request('http://x/api/cb/'),
      {},
      {
        code: 302,
      },
    );

    expect(result.headers.get('Location')).toBeNull();
    expect(await result.json()).toEqual({ code: 302 });
  });
});

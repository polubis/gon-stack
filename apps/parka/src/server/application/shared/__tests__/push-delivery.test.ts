import { describe, expect, it, vi } from 'vitest';
import { deliverPush } from '../push-delivery';
import type { VapidKeys } from '../web-push';

const toBase64Url = (bytes: Uint8Array): string =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

const vapidKeys = async (): Promise<VapidKeys> => {
  const pair = await crypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign'],
  );
  const jwk = await crypto.subtle.exportKey('jwk', pair.privateKey);
  return {
    subject: 'mailto:dev@parka.test',
    publicKey: toBase64Url(
      new Uint8Array(await crypto.subtle.exportKey('raw', pair.publicKey)),
    ),
    privateKey: jwk.d!,
  };
};

const subscription = async (endpoint: string) => {
  const pair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits'],
  );
  return {
    endpoint,
    p256dh: toBase64Url(
      new Uint8Array(await crypto.subtle.exportKey('raw', pair.publicKey)),
    ),
    auth: toBase64Url(crypto.getRandomValues(new Uint8Array(16))),
  };
};

/** Just enough of the Supabase query builder for the sender. */
const fakeDb = (push: boolean | null, subs: object[]) => {
  const deleted: string[][] = [];
  const db = {
    from: (table: string) => {
      if (table === 'notification_preferences')
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: push === null ? null : { push },
                error: null,
              }),
            }),
          }),
        };
      return {
        select: () => ({ eq: async () => ({ data: subs, error: null }) }),
        delete: () => ({
          eq: () => ({
            in: async (_column: string, endpoints: string[]) => {
              deleted.push(endpoints);
              return { error: null };
            },
          }),
        }),
      };
    },
  };
  return { db: db as never, deleted };
};

const message = { title: 'Dodano wydatek', body: 'Żabka · 12,00 zł' };

const respond = (status: (url: string) => number) =>
  vi.fn(
    async (url: string) => new Response(null, { status: status(url) }),
  ) as unknown as typeof fetch & ReturnType<typeof vi.fn>;

describe('push delivery', () => {
  it('pushes to every device when the user turned push on', async () => {
    const { db } = fakeDb(true, [
      await subscription('https://push.example.com/a'),
      await subscription('https://push.example.com/b'),
    ]);
    const send = respond(() => 201);

    await deliverPush(db, 'u1', [message], { keys: await vapidKeys(), send });

    expect(
      send.mock.calls.map((call) => (call as unknown as [string])[0]).sort(),
    ).toEqual(['https://push.example.com/a', 'https://push.example.com/b']);
  });

  it('sends nothing when the user turned push off', async () => {
    const { db } = fakeDb(false, [
      await subscription('https://push.example.com/a'),
    ]);
    const send = respond(() => 201);

    await deliverPush(db, 'u1', [message], { keys: await vapidKeys(), send });

    expect(send).not.toHaveBeenCalled();
  });

  it('sends nothing when the server has no VAPID keys', async () => {
    const { db } = fakeDb(true, [
      await subscription('https://push.example.com/a'),
    ]);
    const send = respond(() => 201);

    await deliverPush(db, 'u1', [message], { keys: null, send });

    expect(send).not.toHaveBeenCalled();
  });

  it('removes subscriptions the push service reports as expired', async () => {
    const { db, deleted } = fakeDb(true, [
      await subscription('https://push.example.com/alive'),
      await subscription('https://push.example.com/gone'),
      await subscription('https://push.example.com/expired'),
    ]);
    const send = respond((url) =>
      url.endsWith('gone') ? 410 : url.endsWith('expired') ? 404 : 201,
    );

    await deliverPush(db, 'u1', [message], { keys: await vapidKeys(), send });

    expect(deleted.map((endpoints) => [...endpoints].sort())).toEqual([
      ['https://push.example.com/expired', 'https://push.example.com/gone'],
    ]);
  });

  it('never throws when the push service is down', async () => {
    const { db } = fakeDb(true, [
      await subscription('https://push.example.com/a'),
    ]);
    const send = vi.fn(async () => {
      throw new Error('network');
    }) as unknown as typeof fetch;

    await expect(
      deliverPush(db, 'u1', [message], { keys: await vapidKeys(), send }),
    ).resolves.toBeUndefined();
  });
});

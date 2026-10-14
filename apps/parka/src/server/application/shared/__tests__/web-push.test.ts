import { describe, expect, it, vi } from 'vitest';
import { sendWebPush, type VapidKeys } from '../web-push';

type Bytes = Uint8Array<ArrayBuffer>;

const ecdh = { name: 'ECDH', namedCurve: 'P-256' } as const;
const ecdsa = { name: 'ECDSA', namedCurve: 'P-256' } as const;

const toBase64Url = (bytes: Uint8Array): string =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

const fromBase64Url = (value: string): Bytes => {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
};

const newBrowser = async () => {
  const pair = await crypto.subtle.generateKey(ecdh, true, ['deriveBits']);
  const publicKey = new Uint8Array(
    await crypto.subtle.exportKey('raw', pair.publicKey),
  );
  const auth = crypto.getRandomValues(new Uint8Array(16));
  return { pair, publicKey, auth };
};

const newVapid = async (): Promise<VapidKeys> => {
  const pair = await crypto.subtle.generateKey(ecdsa, true, ['sign']);
  const jwk = await crypto.subtle.exportKey('jwk', pair.privateKey);
  const raw = new Uint8Array(
    await crypto.subtle.exportKey('raw', pair.publicKey),
  );
  return {
    subject: 'mailto:dev@parka.test',
    publicKey: toBase64Url(raw),
    privateKey: jwk.d!,
  };
};

const text = (value: string): Bytes => new TextEncoder().encode(value);

const hkdf = async (
  salt: Bytes,
  ikm: Bytes,
  info: Bytes,
  bytes: number,
): Promise<Bytes> => {
  const key = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, [
    'deriveBits',
  ]);
  return new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: 'HKDF', hash: 'SHA-256', salt, info },
      key,
      bytes * 8,
    ),
  );
};

/** What a browser does with the delivered body (RFC 8291). */
const decrypt = async (
  body: Bytes,
  browser: Awaited<ReturnType<typeof newBrowser>>,
): Promise<string> => {
  const salt = body.slice(0, 16);
  const idLength = body[20]!;
  const serverPublic = body.slice(21, 21 + idLength);
  const ciphertext = body.slice(21 + idLength);

  const serverKey = await crypto.subtle.importKey(
    'raw',
    serverPublic,
    ecdh,
    false,
    [],
  );
  const secret = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: 'ECDH', public: serverKey },
      browser.pair.privateKey,
      256,
    ),
  );
  const ikm = await hkdf(
    browser.auth,
    secret,
    new Uint8Array([
      ...text('WebPush: info\0'),
      ...browser.publicKey,
      ...serverPublic,
    ]),
    32,
  );
  const cek = await hkdf(salt, ikm, text('Content-Encoding: aes128gcm\0'), 16);
  const nonce = await hkdf(salt, ikm, text('Content-Encoding: nonce\0'), 12);
  const aes = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, [
    'decrypt',
  ]);
  const plain = new Uint8Array(
    await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: nonce },
      aes,
      ciphertext,
    ),
  );
  expect(plain.at(-1)).toBe(2);
  return new TextDecoder().decode(plain.slice(0, -1));
};

const deliver = async (payload: string) => {
  const browser = await newBrowser();
  const vapid = await newVapid();
  const send = vi.fn(async () => new Response(null, { status: 201 }));

  const status = await sendWebPush(
    vapid,
    {
      endpoint: 'https://push.example.com/send/abc',
      p256dh: toBase64Url(browser.publicKey),
      auth: toBase64Url(browser.auth),
    },
    payload,
    send as unknown as typeof fetch,
  );

  const [url, init] = send.mock.calls[0] as unknown as [string, RequestInit];
  return { browser, vapid, status, url, init };
};

describe('web push', () => {
  it('delivers a message only the subscribed browser can read', async () => {
    const { browser, status, url, init } = await deliver(
      '{"title":"Dodano wydatek"}',
    );

    expect(status).toBe(201);
    expect(url).toBe('https://push.example.com/send/abc');
    expect((init.headers as Record<string, string>)['Content-Encoding']).toBe(
      'aes128gcm',
    );
    expect(await decrypt(init.body as Bytes, browser)).toBe(
      '{"title":"Dodano wydatek"}',
    );
  });

  it('proves the sender with a VAPID signature the push service can verify', async () => {
    const { vapid, init } = await deliver('x');

    const header = (init.headers as Record<string, string>).Authorization!;
    const [, jwt, key] = /^vapid t=(\S+), k=(\S+)$/.exec(header)!;
    expect(key).toBe(vapid.publicKey);

    const [head, claims, signature] = jwt!.split('.');
    const verifyKey = await crypto.subtle.importKey(
      'raw',
      fromBase64Url(vapid.publicKey),
      ecdsa,
      false,
      ['verify'],
    );
    const valid = await crypto.subtle.verify(
      { name: 'ECDSA', hash: 'SHA-256' },
      verifyKey,
      fromBase64Url(signature!),
      text(`${head}.${claims}`),
    );
    expect(valid).toBe(true);
    expect(
      JSON.parse(new TextDecoder().decode(fromBase64Url(claims!))),
    ).toMatchObject({
      aud: 'https://push.example.com',
      sub: 'mailto:dev@parka.test',
    });
  });
});

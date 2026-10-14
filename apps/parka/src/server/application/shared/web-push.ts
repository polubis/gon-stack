/**
 * Web Push for Workers: WebCrypto only (no Node libs). VAPID (RFC 8292) signs
 * the request, `aes128gcm` (RFC 8188 / RFC 8291) encrypts the payload.
 */

export type VapidKeys = {
  /** `mailto:` or https URL the push service can contact. */
  subject: string;
  /** Base64url uncompressed P-256 public key (65 bytes). */
  publicKey: string;
  /** Base64url P-256 private scalar (32 bytes). */
  privateKey: string;
};

export type PushTarget = {
  endpoint: string;
  /** Base64url browser public key. */
  p256dh: string;
  /** Base64url browser auth secret. */
  auth: string;
};

type Bytes = Uint8Array<ArrayBuffer>;

const encoder = new TextEncoder();

const RECORD_SIZE = 4096;
const TTL_SECONDS = 86_400;
const JWT_LIFETIME_SECONDS = 12 * 60 * 60;

const fromBase64Url = (value: string): Bytes => {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='));
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
};

const toBase64Url = (bytes: Uint8Array): string =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

const concat = (...parts: Uint8Array[]): Bytes => {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
};

const hkdf = async (
  salt: Bytes,
  ikm: Bytes,
  info: Bytes,
  bytes: number,
): Promise<Bytes> => {
  const key = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, [
    'deriveBits',
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt, info },
    key,
    bytes * 8,
  );
  return new Uint8Array(bits);
};

const vapidAuthorization = async (
  keys: VapidKeys,
  endpoint: string,
): Promise<string> => {
  const publicBytes = fromBase64Url(keys.publicKey);
  const signingKey = await crypto.subtle.importKey(
    'jwk',
    {
      kty: 'EC',
      crv: 'P-256',
      d: keys.privateKey,
      x: toBase64Url(publicBytes.slice(1, 33)),
      y: toBase64Url(publicBytes.slice(33, 65)),
    },
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign'],
  );

  const part = (value: object) =>
    toBase64Url(encoder.encode(JSON.stringify(value)));
  const unsigned = `${part({ typ: 'JWT', alg: 'ES256' })}.${part({
    aud: new URL(endpoint).origin,
    exp: Math.floor(Date.now() / 1000) + JWT_LIFETIME_SECONDS,
    sub: keys.subject,
  })}`;
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    signingKey,
    encoder.encode(unsigned),
  );

  return `vapid t=${unsigned}.${toBase64Url(new Uint8Array(signature))}, k=${keys.publicKey}`;
};

const encrypt = async (target: PushTarget, payload: string): Promise<Bytes> => {
  const browserPublic = fromBase64Url(target.p256dh);
  const authSecret = fromBase64Url(target.auth);

  const ephemeral = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits'],
  );
  const ephemeralPublic = new Uint8Array(
    await crypto.subtle.exportKey('raw', ephemeral.publicKey),
  );
  const browserKey = await crypto.subtle.importKey(
    'raw',
    browserPublic,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    [],
  );
  const sharedSecret = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: 'ECDH', public: browserKey },
      ephemeral.privateKey,
      256,
    ),
  );

  const ikm = await hkdf(
    authSecret,
    sharedSecret,
    concat(encoder.encode('WebPush: info\0'), browserPublic, ephemeralPublic),
    32,
  );
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(
    salt,
    ikm,
    encoder.encode('Content-Encoding: aes128gcm\0'),
    16,
  );
  const nonce = await hkdf(
    salt,
    ikm,
    encoder.encode('Content-Encoding: nonce\0'),
    12,
  );

  const aes = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, [
    'encrypt',
  ]);
  // 0x02 closes the only (last) record.
  const plaintext = concat(encoder.encode(payload), new Uint8Array([2]));
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, aes, plaintext),
  );

  const header = new Uint8Array(21);
  header.set(salt, 0);
  new DataView(header.buffer).setUint32(16, RECORD_SIZE);
  header[20] = ephemeralPublic.length;
  return concat(header, ephemeralPublic, ciphertext);
};

/**
 * Sends one encrypted message. Resolves with the push service HTTP status:
 * 2xx delivered, 404/410 means the subscription is gone for good.
 */
export const sendWebPush = async (
  keys: VapidKeys,
  target: PushTarget,
  payload: string,
  send: typeof fetch = fetch,
): Promise<number> => {
  const response = await send(target.endpoint, {
    method: 'POST',
    headers: {
      Authorization: await vapidAuthorization(keys, target.endpoint),
      'Content-Encoding': 'aes128gcm',
      'Content-Type': 'application/octet-stream',
      TTL: String(TTL_SECONDS),
      Urgency: 'normal',
    },
    body: await encrypt(target, payload),
    signal: AbortSignal.timeout(5000),
  });
  return response.status;
};

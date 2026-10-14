// @vitest-environment node
import type { AstroCookies } from 'astro';
import { describe, expect, it } from 'vitest';
import { sessionStore } from '../session-store';

type Written = { value: string; options: Record<string, unknown> };

const ID_A = '0a0a0a0a-0a0a-4a0a-8a0a-0a0a0a0a0a0a';
const ID_B = '0b0b0b0b-0b0b-4b0b-8b0b-0b0b0b0b0b0b';

const encode = (id: string, email: string, token = 'access') =>
  `base64-${Buffer.from(
    JSON.stringify({
      access_token: token,
      refresh_token: 'refresh',
      user: { id, email, user_metadata: { avatar_url: `https://img/${id}` } },
    }),
  ).toString('base64url')}`;

/** A request carrying `sent` cookies and a cookie jar recording the replies. */
const arrange = (
  sent: Record<string, string> = {},
  url = 'https://parka.app/',
) => {
  const written = new Map<string, Written>();
  const removed = new Set<string>();
  const cookies = {
    set: (name: string, value: string, options: Record<string, unknown>) => {
      written.set(name, { value, options });
    },
    delete: (name: string) => removed.add(name),
  } as unknown as AstroCookies;
  const header = Object.entries(sent)
    .map(([name, value]) => `${name}=${value}`)
    .join('; ');
  const request = new Request(url, {
    headers: header ? { Cookie: header } : {},
  });
  return { store: sessionStore({ request, cookies }), written, removed };
};

const signedInAs = (id: string, email: string) => ({
  [`parka-acct.${id}`]: encode(id, email),
});

describe('session cookies', () => {
  it('forces httpOnly, lax and path on every cookie it writes', () => {
    const { store, written } = arrange();

    store.setAll([
      {
        name: 'parka-auth',
        value: encode(ID_A, 'a@parka.test'),
        options: { httpOnly: false, sameSite: 'none', path: '/x' },
      },
      {
        name: 'parka-auth-code-verifier',
        value: 'verifier',
        options: { httpOnly: false },
      },
    ]);

    expect(written.size).toBeGreaterThan(0);
    for (const { options } of written.values()) {
      expect(options).toMatchObject({
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      });
    }
  });

  it('marks cookies secure on https only', () => {
    const secure = arrange({}, 'https://parka.app/');
    const plain = arrange({}, 'http://localhost:4325/');
    const cookie = [
      { name: 'parka-auth', value: encode(ID_A, 'a@parka.test'), options: {} },
    ];

    secure.store.setAll(cookie);
    plain.store.setAll(cookie);

    expect(secure.written.get(`parka-acct.${ID_A}`)?.options.secure).toBe(true);
    expect(plain.written.get(`parka-acct.${ID_A}`)?.options.secure).toBe(false);
  });

  it('stores a first sign-in as the active account', () => {
    const { store } = arrange();

    store.setAll([
      { name: 'parka-auth', value: encode(ID_A, 'a@parka.test'), options: {} },
    ]);

    expect(store.activeId()).toBe(ID_A);
    expect(store.list()).toEqual([
      { userId: ID_A, email: 'a@parka.test', avatarUrl: `https://img/${ID_A}` },
    ]);
  });

  it('keeps the first account when a second signs in and activates it', () => {
    const { store } = arrange(signedInAs(ID_A, 'a@parka.test'));

    store.setAll([
      { name: 'parka-auth', value: encode(ID_B, 'b@parka.test'), options: {} },
    ]);

    expect(store.list().map((a) => a.email)).toEqual([
      'a@parka.test',
      'b@parka.test',
    ]);
    expect(store.activeId()).toBe(ID_B);
  });

  it('shows Supabase only the active account as its session', () => {
    const { store } = arrange({
      ...signedInAs(ID_A, 'a@parka.test'),
      ...signedInAs(ID_B, 'b@parka.test'),
      'parka-active': ID_B,
    });

    expect(store.getAll()).toEqual([
      { name: 'parka-auth', value: encode(ID_B, 'b@parka.test') },
    ]);
  });

  it('switches what Supabase sees without touching the other account', () => {
    const { store } = arrange({
      ...signedInAs(ID_A, 'a@parka.test'),
      ...signedInAs(ID_B, 'b@parka.test'),
      'parka-active': ID_B,
    });

    store.activate(ID_A);

    expect(store.getAll()).toEqual([
      { name: 'parka-auth', value: encode(ID_A, 'a@parka.test') },
    ]);
    expect(store.has(ID_B)).toBe(true);
  });

  it('saves a rotated token on the active account only', () => {
    const { store, written } = arrange({
      ...signedInAs(ID_A, 'a@parka.test'),
      ...signedInAs(ID_B, 'b@parka.test'),
      'parka-active': ID_B,
    });
    const rotated = encode(ID_B, 'b@parka.test', 'rotated');

    store.setAll([{ name: 'parka-auth', value: rotated, options: {} }]);

    expect(written.get(`parka-acct.${ID_B}`)?.value).toBe(rotated);
    expect(written.has(`parka-acct.${ID_A}`)).toBe(false);
    expect(store.getAll()[0]?.value).toBe(rotated);
  });

  it('rebuilds a chunked session from its parts', () => {
    const value = encode(ID_A, 'a@parka.test');
    const { store } = arrange({
      [`parka-acct.${ID_A}.1`]: value.slice(20),
      [`parka-acct.${ID_A}.0`]: value.slice(0, 20),
    });

    expect(store.getAll()).toHaveLength(2);
    expect(store.getAll()).toEqual(
      expect.arrayContaining([
        { name: 'parka-auth.0', value: value.slice(0, 20) },
        { name: 'parka-auth.1', value: value.slice(20) },
      ]),
    );
    expect(store.list()[0]?.email).toBe('a@parka.test');
  });

  it('drops only the active account when Supabase signs out', () => {
    const { store, removed } = arrange({
      ...signedInAs(ID_A, 'a@parka.test'),
      ...signedInAs(ID_B, 'b@parka.test'),
      'parka-active': ID_B,
    });

    store.setAll([{ name: 'parka-auth', value: '', options: { maxAge: 0 } }]);

    expect(removed).toContain(`parka-acct.${ID_B}`);
    expect(store.has(ID_B)).toBe(false);
    expect(store.has(ID_A)).toBe(true);
  });

  it('falls back to a remaining account after forgetting the active one', () => {
    const { store } = arrange({
      ...signedInAs(ID_A, 'a@parka.test'),
      ...signedInAs(ID_B, 'b@parka.test'),
      'parka-active': ID_B,
    });

    store.forget(ID_B);

    expect(store.activeId()).toBe(ID_A);
  });

  it('has nobody signed in once the last account is forgotten', () => {
    const { store } = arrange(signedInAs(ID_A, 'a@parka.test'));

    store.forget(ID_A);

    expect(store.activeId()).toBeNull();
    expect(store.list()).toEqual([]);
    expect(store.getAll()).toEqual([]);
  });

  it('ignores a pointer to an account that is not signed in', () => {
    const { store } = arrange({
      ...signedInAs(ID_A, 'a@parka.test'),
      'parka-active': ID_B,
    });

    expect(store.activeId()).toBe(ID_A);
  });

  it('passes other cookies such as the PKCE verifier through', () => {
    const { store } = arrange({
      ...signedInAs(ID_A, 'a@parka.test'),
      'parka-auth-code-verifier': 'verifier',
      theme: 'dark',
    });

    expect(store.getAll()).toContainEqual({
      name: 'parka-auth-code-verifier',
      value: 'verifier',
    });
    expect(store.getAll()).toContainEqual({ name: 'theme', value: 'dark' });
  });
});

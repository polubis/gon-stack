import { parseCookieHeader } from '@supabase/ssr';
import type { AstroCookies } from 'astro';

type CookieOptions = Parameters<AstroCookies['set']>[2];
type CookieToSet = { name: string; value: string; options: CookieOptions };

export type StoredAccount = {
  userId: string;
  email: string;
  avatarUrl: string | null;
};

type Session = {
  user?: { id?: unknown; email?: unknown; user_metadata?: unknown };
};

const STORAGE = 'parka-auth';
const LIFETIME = 60 * 60 * 24 * 400;
const ACTIVE_COOKIE = 'parka-active';
const ACCOUNT_PREFIX = 'parka-acct.';
const ACCOUNT_COOKIE = /^parka-acct\.([0-9a-f-]{36})((?:\.\d+)?)$/;
const SESSION_COOKIE = new RegExp(`^${STORAGE}((?:\\.\\d+)?)$`);
const ENCODING_PREFIX = 'base64-';

const chunkIndex = (suffix: string) => (suffix ? Number(suffix.slice(1)) : -1);

const combine = (parts: { suffix: string; value: string }[]) =>
  [...parts]
    .sort((a, b) => chunkIndex(a.suffix) - chunkIndex(b.suffix))
    .map((part) => part.value)
    .join('');

const text = (value: unknown) =>
  typeof value === 'string' && value ? value : null;

/** Reads the session out of a stored cookie value; `null` when unreadable. */
const decodeSession = (value: string): Session | null => {
  try {
    const json = value.startsWith(ENCODING_PREFIX)
      ? new TextDecoder().decode(
          Uint8Array.from(
            atob(
              value
                .slice(ENCODING_PREFIX.length)
                .replace(/-/g, '+')
                .replace(/_/g, '/'),
            ),
            (char) => char.charCodeAt(0),
          ),
        )
      : value;
    const parsed: unknown = JSON.parse(json);
    return typeof parsed === 'object' && parsed !== null
      ? (parsed as Session)
      : null;
  } catch {
    return null;
  }
};

const toAccount = (value: string): StoredAccount | null => {
  const user = decodeSession(value)?.user;
  const userId = text(user?.id);
  if (!user || !userId) return null;

  const meta =
    typeof user.user_metadata === 'object' && user.user_metadata !== null
      ? (user.user_metadata as Record<string, unknown>)
      : {};

  return {
    userId,
    email: text(user.email) ?? '',
    avatarUrl: text(meta.avatar_url) ?? text(meta.picture),
  };
};

/**
 * Per-request view of the signed-in accounts. Every account owns a set of
 * httpOnly cookies; one pointer cookie marks the active one. Supabase only
 * ever sees the active account, under its usual storage key, so token
 * rotation lands back on the right account without extra code.
 */
const createSessionStore = ({
  request,
  cookies,
}: {
  request: Request;
  cookies: AstroCookies;
}) => {
  const jar = new Map<string, string>(
    parseCookieHeader(request.headers.get('Cookie') ?? '').map(
      ({ name, value }) => [name, value ?? ''],
    ),
  );
  const secure = new URL(request.url).protocol === 'https:';

  const put = (name: string, value: string, options: CookieOptions = {}) => {
    cookies.set(name, value, {
      ...options,
      path: '/',
      httpOnly: true,
      secure,
      sameSite: 'lax',
    });
    if (value) jar.set(name, value);
    else jar.delete(name);
  };

  const drop = (name: string) => {
    cookies.delete(name, { path: '/' });
    jar.delete(name);
  };

  const partsOf = (userId: string) =>
    [...jar.entries()].flatMap(([name, value]) => {
      const match = ACCOUNT_COOKIE.exec(name);
      return match && match[1] === userId
        ? [{ name, suffix: match[2], value }]
        : [];
    });

  const accountIds = () => [
    ...new Set(
      [...jar.keys()].flatMap((name) => ACCOUNT_COOKIE.exec(name)?.[1] ?? []),
    ),
  ];

  const activeId = () => {
    const ids = accountIds();
    const pointer = jar.get(ACTIVE_COOKIE);
    return pointer && ids.includes(pointer) ? pointer : (ids[0] ?? null);
  };

  const accountCookie = (userId: string, sessionCookieName: string) =>
    `${ACCOUNT_PREFIX}${userId}${SESSION_COOKIE.exec(sessionCookieName)![1]}`;

  return {
    /** What the Supabase client reads: the active account as the session. */
    getAll: () => {
      const id = activeId();
      const session = id
        ? partsOf(id).map(({ suffix, value }) => ({
            name: `${STORAGE}${suffix}`,
            value,
          }))
        : [];
      return [
        ...[...jar.entries()]
          .filter(
            ([name]) =>
              name !== ACTIVE_COOKIE &&
              !ACCOUNT_COOKIE.test(name) &&
              !SESSION_COOKIE.test(name),
          )
          .map(([name, value]) => ({ name, value })),
        ...session,
      ];
    },

    /** What the Supabase client writes: sign-in, rotation or sign-out. */
    setAll: (toSet: CookieToSet[]) => {
      toSet
        .filter(({ name }) => !SESSION_COOKIE.test(name))
        .forEach(({ name, value, options }) => put(name, value, options));

      const session = toSet.filter(({ name }) => SESSION_COOKIE.test(name));
      if (session.length === 0) return;

      const live = session.filter(({ value }) => value);
      if (live.length === 0) {
        const id = activeId();
        if (id) partsOf(id).forEach(({ name }) => drop(name));
        return;
      }

      const value = combine(
        live.map(({ name, value: part }) => ({
          suffix: SESSION_COOKIE.exec(name)![1],
          value: part,
        })),
      );
      const userId = toAccount(value)?.userId ?? activeId();
      if (!userId) return;

      const fresh = new Set(
        live.map(({ name }) => accountCookie(userId, name)),
      );
      partsOf(userId)
        .filter(({ name }) => !fresh.has(name))
        .forEach(({ name }) => drop(name));
      live.forEach(({ name, value: part, options }) =>
        put(accountCookie(userId, name), part, options),
      );
      put(ACTIVE_COOKIE, userId, { maxAge: LIFETIME });
    },

    activeId,

    list: (): StoredAccount[] =>
      accountIds().flatMap((id) => {
        const account = toAccount(combine(partsOf(id)));
        return account?.userId === id ? [account] : [];
      }),

    has: (userId: string) => accountIds().includes(userId),

    activate: (userId: string) =>
      put(ACTIVE_COOKIE, userId, { maxAge: LIFETIME }),

    /** Forgets one account; the first remaining one becomes active. */
    forget: (userId: string) => {
      partsOf(userId).forEach(({ name }) => drop(name));
      const next = accountIds()[0];
      if (next) put(ACTIVE_COOKIE, next, { maxAge: LIFETIME });
      else drop(ACTIVE_COOKIE);
    },
  };
};

export type SessionStore = ReturnType<typeof createSessionStore>;

const stores = new WeakMap<AstroCookies, SessionStore>();

/** Name Supabase stores its session under; chunks get a `.N` suffix. */
export const STORAGE_KEY = STORAGE;

/** One store per request, so the Supabase client and procedures share state. */
export const sessionStore = (context: {
  request: Request;
  cookies: AstroCookies;
}): SessionStore => {
  const existing = stores.get(context.cookies);
  if (existing) return existing;
  const created = createSessionStore(context);
  stores.set(context.cookies, created);
  return created;
};

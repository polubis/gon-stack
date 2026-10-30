import { execFileSync } from 'node:child_process';
import {
  request as playwrightRequest,
  type APIRequestContext,
} from '@playwright/test';

/**
 * Black-box harness for the finance REST endpoints: synthetic accounts are
 * created through the Supabase admin API, rows are seeded through the Data
 * API as the service role, and every read goes through the running app with
 * the same cookies a browser would hold. No page is ever opened.
 */

const PASSWORD = 'Synthetic-pass-12345';
const COOKIE_CHUNK = 3180;

type Keys = { api: string; anon: string; service: string };

let keys: Keys | undefined;

const stackKeys = (): Keys => {
  if (keys) return keys;
  const out = execFileSync(
    'pnpm',
    ['exec', 'supabase', 'status', '-o', 'env'],
    {
      encoding: 'utf8',
      shell: true,
    },
  );
  const read = (name: string): string => {
    const match = new RegExp(`^${name}="?([^"\r\n]+)"?`, 'm').exec(out);
    if (!match) throw new Error(`supabase status has no ${name}`);
    return match[1]!;
  };
  return (keys = {
    api: read('API_URL'),
    anon: read('ANON_KEY'),
    service: read('SERVICE_ROLE_KEY'),
  });
};

const serviceHeaders = (): Record<string, string> => ({
  apikey: stackKeys().service,
  Authorization: `Bearer ${stackKeys().service}`,
  'Content-Type': 'application/json',
});

const failed = async (what: string, res: Response): Promise<never> => {
  throw new Error(`${what} failed: ${res.status} ${await res.text()}`);
};

const sessionCookie = (userId: string, session: unknown): string => {
  const value = `base64-${Buffer.from(JSON.stringify(session)).toString('base64url')}`;
  const parts: string[] = [];
  for (let i = 0; i < value.length; i += COOKIE_CHUNK) {
    parts.push(value.slice(i, i + COOKIE_CHUNK));
  }
  return parts
    .map(
      (part, i) =>
        `parka-acct.${userId}${parts.length > 1 ? `.${i}` : ''}=${part}`,
    )
    .concat(`parka-active=${userId}`)
    .join('; ');
};

export type SeedExpense = {
  id: string;
  date: string;
  amount: number;
  categoryId: string | null;
  merchant?: string;
  paymentMethod?: string;
  isBill?: boolean;
  deviceId?: string;
  deviceName?: string;
  items?: {
    id: string;
    name?: string;
    unitPrice: number;
    quantity?: number;
    discount?: number;
    categoryId: string;
  }[];
};

export type SeedRecurring = {
  id: string;
  name: string;
  cost: number;
  categoryId: string;
  interval?: 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
  active?: boolean;
  items?: {
    id: string;
    name: string;
    unitPrice: number;
    quantity?: number;
    discount?: number;
    categoryId: string;
  }[];
};

export type SeedData = {
  categories?: { id: string; name: string; color?: string; icon?: string }[];
  expenses?: SeedExpense[];
  limits?: {
    id: string;
    scope: 'total' | 'category';
    categoryId?: string;
    amount: number;
    alertAt?: number;
  }[];
  recurring?: SeedRecurring[];
};

export type Account = {
  id: string;
  /** Requests made as this account, through the running app. */
  http: APIRequestContext;
  seed: (data: SeedData) => Promise<void>;
  /** Rows of a table as the service role sees them (for state assertions). */
  count: (table: string) => Promise<number>;
  remove: () => Promise<void>;
};

export const insertRows = async (
  table: string,
  rows: object[],
): Promise<void> => {
  const { api } = stackKeys();
  // The Data API caps one request body in practice; chunk big seeds.
  for (let i = 0; i < rows.length; i += 500) {
    const res = await fetch(`${api}/rest/v1/${table}`, {
      method: 'POST',
      headers: { ...serviceHeaders(), Prefer: 'return=minimal' },
      body: JSON.stringify(rows.slice(i, i + 500)),
    });
    if (!res.ok) await failed(`seed ${table}`, res);
  }
};

const seedInto = async (userId: string, data: SeedData): Promise<void> => {
  const own = { user_id: userId };
  await insertRows(
    'categories',
    (data.categories ?? []).map((c) => ({
      ...own,
      id: c.id,
      name: c.name,
      color: c.color ?? '#4b5a52',
      icon: c.icon ?? 'sparkles',
    })),
  );
  await insertRows(
    'recurring_expenses',
    (data.recurring ?? []).map((r) => ({
      ...own,
      id: r.id,
      name: r.name,
      cost: r.cost,
      category_id: r.categoryId,
      interval: r.interval ?? 'monthly',
      start_date: r.startDate,
      end_date: r.endDate ?? null,
      active: r.active ?? true,
      payment_method: 'card',
    })),
  );
  await insertRows(
    'recurring_items',
    (data.recurring ?? []).flatMap((r) =>
      (r.items ?? []).map((it) => ({
        ...own,
        id: it.id,
        recurring_id: r.id,
        name: it.name,
        unit_price: it.unitPrice,
        quantity: it.quantity ?? 1,
        discount: it.discount ?? 0,
        category_id: it.categoryId,
      })),
    ),
  );
  await insertRows(
    'expenses',
    (data.expenses ?? []).map((e) => ({
      ...own,
      id: e.id,
      merchant: e.merchant ?? `Shop ${e.id}`,
      date: e.date,
      amount: e.amount,
      category_id: e.categoryId,
      payment_method: e.paymentMethod ?? 'card',
      is_bill: e.isBill ?? false,
      source: 'manual',
      device_id: e.deviceId ?? null,
      device_name: e.deviceName ?? null,
      device_type: e.deviceName ? 'mobile' : null,
    })),
  );
  await insertRows(
    'receipt_items',
    (data.expenses ?? []).flatMap((e) =>
      (e.items ?? []).map((it) => ({
        ...own,
        id: it.id,
        expense_id: e.id,
        name: it.name ?? `Item ${it.id}`,
        unit_price: it.unitPrice,
        quantity: it.quantity ?? 1,
        discount: it.discount ?? 0,
        category_id: it.categoryId,
      })),
    ),
  );
  await insertRows(
    'limits',
    (data.limits ?? []).map((l) => ({
      ...own,
      id: l.id,
      scope: l.scope,
      category_id: l.categoryId ?? null,
      amount: l.amount,
      alert_at: l.alertAt ?? 80,
    })),
  );
};

/** A confirmed account with no data, signed in on a fresh HTTP client. */
export const createAccount = async (
  baseURL: string,
  label: string,
  name = label,
): Promise<Account> => {
  const { api, anon } = stackKeys();
  const email = `api-${label}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@parka.test`;

  const created = await fetch(`${api}/auth/v1/admin/users`, {
    method: 'POST',
    headers: serviceHeaders(),
    body: JSON.stringify({
      email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { username: name },
    }),
  });
  if (!created.ok) await failed('create user', created);
  const { id } = (await created.json()) as { id: string };

  const profile = await fetch(`${api}/rest/v1/profiles`, {
    method: 'POST',
    headers: {
      ...serviceHeaders(),
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify({ user_id: id, name, email }),
  });
  if (!profile.ok) await failed('create profile', profile);

  const login = await fetch(`${api}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: anon, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: PASSWORD }),
  });
  if (!login.ok) await failed('sign in', login);

  const http = await playwrightRequest.newContext({
    baseURL,
    extraHTTPHeaders: {
      cookie: sessionCookie(id, await login.json()),
      Accept: 'application/json',
    },
  });

  return {
    id,
    http,
    seed: (data) => seedInto(id, data),
    count: async (table) => {
      const res = await fetch(
        `${api}/rest/v1/${table}?user_id=eq.${id}&select=id`,
        {
          headers: { ...serviceHeaders(), Prefer: 'count=exact', Range: '0-0' },
        },
      );
      return Number(res.headers.get('content-range')?.split('/')[1] ?? 0);
    },
    remove: async () => {
      await http.dispose();
      await fetch(`${api}/auth/v1/admin/users/${id}`, {
        method: 'DELETE',
        headers: serviceHeaders(),
      });
    },
  };
};

/** `YYYY-MM-DD` of the UTC day `offset` days from today. */
export const dayFromToday = (offset: number): string => {
  const day = new Date();
  day.setUTCDate(day.getUTCDate() + offset);
  return day.toISOString().slice(0, 10);
};

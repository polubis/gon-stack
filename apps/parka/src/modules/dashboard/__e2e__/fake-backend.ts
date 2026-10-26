import type { Page, Route } from '@playwright/test';
import { summarizeDashboard } from '@/server/domain/dashboard';
import {
  clampPeriod,
  resolvePeriod,
  shiftPeriod,
  todayDay,
  type PeriodKind,
} from '@/shared/period/period';
import {
  dueOccurrences,
  type RecurringRule,
} from '@/shared/recurring/occurrences';

type Row = { id: string };
type Expense = Row & {
  merchant?: string;
  paymentMethod?: string;
  isBill?: boolean;
  source?: string;
  device?: {
    id: string;
    name: string;
    type: string;
    avatar?: string | null;
    model?: string | null;
    os?: string | null;
    browser?: string | null;
    screen?: string | null;
    customName?: string | null;
    photo?: { variants: { size: number; url: string }[] } | null;
  } | null;
  items?: Item[];
  date: string;
  amount: number;
  categoryId: string | null;
  recurringId?: string | null;
  occurrenceDate?: string | null;
};
type Item = {
  id: string;
  name: string;
  unitPrice: number;
  quantity: number;
  discount: number;
  categoryId: string;
};
type Category = Row & { name: string; icon: string; color: string };
type Limit = Row & { scope: 'total' | 'category'; amount: number };
type Recurring = RecurringRule & { paymentMethod: string; items?: Item[] };

type Suggestion = {
  field: 'merchant' | 'paymentMethod';
  value: string;
  useCount: number;
  lastUsed: string | null;
};

export type Seed = {
  categories: Category[];
  expenses: Expense[];
  limits: Limit[];
  recurring: Recurring[];
  /** Remembered shop / payment method values; none when omitted. */
  suggestions?: Suggestion[];
};

export type Backend = {
  /** Number of API requests matching `method` and `path`. */
  count: (method: string, path: string) => number;
};

/** What the scan endpoint answers for any photo. */
/** Stands in for the stored WebP variants the server would link. */
const PROFILE_AVATAR_URL = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f97316"/><stop offset="1" stop-color="#7c3aed"/></linearGradient></defs><rect width="64" height="64" fill="url(#g)"/><circle cx="32" cy="26" r="11" fill="#fde68a"/><rect x="14" y="40" width="36" height="30" rx="16" fill="#fde68a"/></svg>',
)}`;

const SCANNED_RECEIPT = {
  merchant: 'Biedronka',
  date: new Date().toISOString(),
  amount: 42.5,
  paymentMethod: 'Karta',
  items: [
    {
      name: 'Chleb',
      unitPrice: 42.5,
      quantity: 1,
      discount: 0,
      category: { status: 'unknown', suggestion: 'Spożywcze' },
    },
  ],
};

const json = (route: Route, body: unknown) =>
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });

const replace = <T extends Row>(list: T[], item: T): T[] =>
  list.map((x) => (x.id === item.id ? item : x));

const without = <T extends Row>(list: T[], id: string | undefined): T[] =>
  list.filter((x) => x.id !== id);

/**
 * In-memory stand-in for the API behind the dashboard. Writes change the
 * state and the dashboard summary is computed from that state with the real
 * server-side domain code, so a test proves the numbers the UI shows after a
 * change, not what a stub was told to say. Reads materialize due recurring
 * charges the way the real server does (same pure `dueOccurrences`).
 */
export const installBackend = async (
  page: Page,
  seed: Seed,
  fixedToday?: string,
): Promise<Backend> => {
  const state = structuredClone(seed);
  state.recurring = state.recurring.map((r) => ({ items: [], ...r }));
  const profiles = new Map<
    string,
    { avatar: string | null; customName: string | null }
  >();
  /** Stands in for the stored variants of a device photo, per device id. */
  const devicePhotos = new Map<
    string,
    { variants: { size: number; url: string }[] }
  >();
  let profileAvatar: { variants: { size: number; url: string }[] } | null =
    null;
  let suggestions: Suggestion[] = state.suggestions ?? [];
  const todayOf = (timeZone?: string): string =>
    fixedToday ?? todayDay(timeZone);
  const requests: { method: string; path: string }[] = [];

  /** Turns due occurrences into expenses, once each, like the server does. */
  const materialize = (timeZone?: string) => {
    const today = todayOf(timeZone);
    for (const rule of state.recurring) {
      const due = dueOccurrences(rule, today);
      for (const day of due) {
        const exists = state.expenses.some(
          (e) => e.recurringId === rule.id && e.occurrenceDate === day,
        );
        if (!exists)
          state.expenses.push({
            id: `${rule.id}:${day}`,
            merchant: rule.name,
            date: `${day}T12:00:00.000Z`,
            amount: rule.cost,
            paymentMethod: rule.paymentMethod,
            isBill: true,
            source: 'manual',
            device: null,
            // Own copies, like the server: a later edit of the rule leaves them.
            items: (rule.items ?? []).map((it) => ({
              ...it,
              id: `${rule.id}:${day}:${it.id}`,
            })),
            categoryId: rule.categoryId,
            recurringId: rule.id,
            occurrenceDate: day,
          });
      }
      const newest = due.at(-1);
      if (newest) rule.lastMaterializedDate = newest;
    }
  };

  const summary = (
    kind: PeriodKind,
    from: string,
    to?: string,
    timeZone?: string,
  ) => {
    const today = todayOf(timeZone);
    const period = clampPeriod(resolvePeriod(kind, from, to), today);
    const previous = shiftPeriod(period, -1);
    const total = state.limits.find((l) => l.scope === 'total');
    return {
      ...summarizeDashboard({
        expenses: state.expenses,
        categories: state.categories,
        period,
        previous,
        today,
        monthlyLimit: total ? total.amount : null,
        timeZone,
      }),
      userName: 'Anna',
    };
  };

  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();
    const [, , collection, id] = url.pathname.split('/');
    requests.push({ method, path: url.pathname });

    if (collection === 'dashboard') {
      materialize(url.searchParams.get('tz') ?? undefined);
      return json(route, {
        code: 200,
        data: summary(
          (url.searchParams.get('kind') ?? 'month') as PeriodKind,
          url.searchParams.get('from') ?? todayOf(),
          url.searchParams.get('to') ?? undefined,
          url.searchParams.get('tz') ?? undefined,
        ),
      });
    }

    if (collection === 'receipts') {
      return json(route, { code: 200, data: SCANNED_RECEIPT });
    }

    if (collection === 'suggestions') {
      if (method === 'GET')
        return json(route, { code: 200, data: suggestions });
      if (method === 'DELETE' || method === 'PUT') {
        const edit = request.postDataJSON() as Suggestion & {
          newValue?: string;
        };
        const same = (x: Suggestion) =>
          x.field === edit.field &&
          x.value.toLowerCase() === edit.value.trim().toLowerCase();
        suggestions =
          method === 'DELETE'
            ? suggestions.filter((x) => !same(x))
            : suggestions.map((x) =>
                same(x) ? { ...x, value: edit.newValue ?? x.value } : x,
              );
        return json(route, { code: 200, ok: true });
      }
      const body = request.postDataJSON() as Suggestion;
      const key = body.value.trim().toLowerCase();
      const known = suggestions.find(
        (x) => x.field === body.field && x.value.toLowerCase() === key,
      );
      const next: Suggestion = {
        field: body.field,
        value: body.value,
        useCount: (known?.useCount ?? 0) + 1,
        lastUsed: new Date().toISOString(),
      };
      suggestions = [...suggestions.filter((x) => x !== known), next];
      return json(route, { code: 200, ok: true });
    }

    if (collection === 'device-photo' && method === 'POST') {
      const deviceId = /name="deviceId"\r\n\r\n([^\r]+)/.exec(
        request.postDataBuffer()?.toString('latin1') ?? '',
      )?.[1];
      if (!deviceId)
        return json(route, {
          code: 400,
          type: 'bad-request',
          message: 'No device',
        });
      const photo = {
        variants: [32, 64, 128, 256].map((size) => ({
          size,
          url: PROFILE_AVATAR_URL,
        })),
      };
      devicePhotos.set(deviceId, photo);
      return json(route, { code: 200, data: photo });
    }

    if (collection === 'avatar') {
      if (method === 'POST') {
        profileAvatar = {
          variants: [32, 64, 128, 256].map((size) => ({
            size,
            url: PROFILE_AVATAR_URL,
          })),
        };
      }
      return json(route, { code: 200, data: profileAvatar });
    }

    if (collection === 'settings') {
      if (method === 'PUT') {
        const body = request.postDataJSON() as {
          devices: {
            id: string;
            avatar: string | null;
            customName?: string | null;
          }[];
        };
        for (const d of body.devices)
          profiles.set(d.id, {
            avatar: d.avatar,
            customName: d.customName ?? null,
          });
        return json(route, { code: 200, data: body });
      }
      const devices = new Map<string, NonNullable<Expense['device']>>();
      for (const e of state.expenses)
        if (e.device && !devices.has(e.device.id))
          devices.set(e.device.id, {
            ...e.device,
            avatar: profiles.get(e.device.id)?.avatar ?? null,
            customName: profiles.get(e.device.id)?.customName ?? null,
            photo: devicePhotos.get(e.device.id) ?? null,
          });
      return json(route, {
        code: 200,
        data: {
          profile: { name: 'Anna' },
          notifications: {
            push: true,
            email: false,
            limitWarnings: true,
            receiptConfirmations: true,
            limitAlerts: true,
          },
          devices: [...devices.values()],
        },
      });
    }

    if (collection === 'notifications') {
      return json(route, { code: 200, data: [] });
    }

    if (method === 'GET') {
      if (collection === 'expenses' || collection === 'recurring')
        materialize(url.searchParams.get('tz') ?? undefined);
      const lists = {
        expenses: state.expenses,
        categories: state.categories,
        limits: state.limits,
        recurring: state.recurring,
      } as Record<string, Row[]>;
      if (!(collection in lists)) return route.fallback();
      if (collection === 'expenses')
        return json(route, {
          code: 200,
          data: state.expenses.map((e) =>
            e.device
              ? {
                  ...e,
                  device: {
                    ...e.device,
                    avatar: profiles.get(e.device.id)?.avatar ?? null,
                    customName: profiles.get(e.device.id)?.customName ?? null,
                    photo: devicePhotos.get(e.device.id) ?? null,
                  },
                }
              : e,
          ),
        });
      return json(route, { code: 200, data: lists[collection] });
    }

    if (method === 'DELETE') {
      if (collection === 'expenses')
        state.expenses = without(state.expenses, id);
      if (collection === 'limits') state.limits = without(state.limits, id);
      if (collection === 'recurring') {
        state.recurring = without(state.recurring, id);
        state.expenses = state.expenses.map((e) =>
          e.recurringId === id ? { ...e, recurringId: null } : e,
        );
      }
      return json(route, { code: 200, ok: true });
    }

    const body = request.postDataJSON();
    const created = method === 'POST';
    if (collection === 'expenses')
      state.expenses = created
        ? [...state.expenses, body]
        : replace(state.expenses, body);
    if (collection === 'limits')
      state.limits = created
        ? [...state.limits, body]
        : replace(state.limits, body);
    if (collection === 'recurring')
      state.recurring = created
        ? [...state.recurring, { ...body, lastMaterializedDate: null }]
        : state.recurring.map((r) =>
            // Like the server: the mark is never taken from the request.
            r.id === body.id
              ? { ...body, lastMaterializedDate: r.lastMaterializedDate }
              : r,
          );
    return json(route, { code: created ? 201 : 200, data: body });
  });

  return {
    count: (method, path) =>
      requests.filter((r) => r.method === method && r.path === path).length,
  };
};

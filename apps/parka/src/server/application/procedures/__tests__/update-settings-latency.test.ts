// @vitest-environment node
import type { APIContext } from 'astro';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const LATENCY_MS = 25;

type Result = { data: unknown; error: { code: string } | null };

let results: Record<string, Result> = {};
let calls: string[] = [];

const ok = (data: unknown): Result => ({ data, error: null });

/** Every round trip costs fixed latency, like a real network call. */
const later = <T>(value: T) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(value), LATENCY_MS));

const query = (table: string) => {
  let op = 'select';
  const done = () => {
    calls.push(`${table}.${op}`);
    return later(results[`${table}.${op}`] ?? ok([]));
  };
  const chain: Record<string, unknown> = {
    select: () => chain,
    upsert: () => ((op = 'upsert'), chain),
    update: () => ((op = 'update'), chain),
    delete: () => ((op = 'delete'), chain),
    eq: () => chain,
    in: () => chain,
    is: () => chain,
    not: () => chain,
    then: (resolve: (value: unknown) => unknown) => done().then(resolve),
  };
  return chain;
};

vi.mock('@/shared/data-sources/supabase-server', () => ({
  supabaseServer: () => ({
    auth: {
      getUser: () =>
        later({
          data: {
            user: {
              id: 'u-1',
              email: 'anna@parka.test',
              user_metadata: { full_name: 'Anna Kowalska' },
            },
          },
          error: null,
        }),
    },
    from: query,
  }),
}));

const { updateSettings } = await import('../update-settings');

const context = {
  request: new Request('http://localhost/api/'),
  cookies: {},
} as unknown as APIContext;

const device = (
  id: string,
  avatar: string | null,
  customName: string | null,
) => ({
  id,
  name: `Phone ${id}`,
  type: 'mobile',
  avatar,
  photo: null,
  model: null,
  os: null,
  browser: null,
  screen: null,
  customName,
});

const settings = (push: boolean) => ({
  profile: { name: 'Anna' },
  notifications: {
    push,
    email: false,
    limitWarnings: true,
    receiptConfirmations: true,
    limitAlerts: true,
  },
  devices: [device('d-1', null, 'Work phone'), device('d-2', null, null)],
});

/** Simulated milliseconds until the call settles. */
const elapsedMs = async (call: Promise<unknown>) => {
  let settled = false;
  void call.then(
    () => (settled = true),
    () => (settled = true),
  );
  let elapsed = 0;
  while (!settled && elapsed < LATENCY_MS * 20) {
    await vi.advanceTimersByTimeAsync(1);
    elapsed += 1;
  }
  return elapsed;
};

beforeEach(() => {
  calls = [];
  results = {
    'expenses.select': ok([{ device_id: 'd-1' }]),
    'time_tasks.select': ok([{ device_id: 'd-2' }]),
  };
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('update settings latency', () => {
  it('saves everything in fewer round trips by writing independent parts together', async () => {
    const call = updateSettings(async () => settings(false), context);

    const ms = await elapsedMs(call);

    expect(await call).toMatchObject({ code: 200, data: settings(false) });
    // sign-in, profile + preferences + push + devices read, set | reset then delete
    expect(ms).toBeLessThanOrEqual(LATENCY_MS * 4 + 5);
  });

  it('writes the set and the cleared devices and keeps the push subscriptions when push is on', async () => {
    const call = updateSettings(async () => settings(true), context);
    await elapsedMs(call);

    expect(await call).toMatchObject({ code: 200 });
    expect(calls).toEqual(
      expect.arrayContaining([
        'profiles.upsert',
        'notification_preferences.upsert',
        'device_profiles.upsert',
        'device_profiles.update',
        'device_profiles.delete',
      ]),
    );
    expect(calls).not.toContain('push_subscriptions.delete');
  });

  it('raises the first failure in write order and writes nothing for devices', async () => {
    results['profiles.upsert'] = { data: null, error: { code: '500' } };
    results['notification_preferences.upsert'] = {
      data: null,
      error: { code: '500' },
    };

    const call = updateSettings(async () => settings(true), context);
    await elapsedMs(call);

    expect(await call).toMatchObject({ code: 500 });
    expect(calls).not.toContain('device_profiles.upsert');
  });
});

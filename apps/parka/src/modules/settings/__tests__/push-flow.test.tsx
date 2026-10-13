import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Provider, useContext } from '../presentation/context';

const SETTINGS = {
  profile: { name: 'Ada', email: 'ada@example.com' },
  notifications: {
    push: false,
    email: false,
    limitWarnings: true,
    receiptConfirmations: true,
    limitAlerts: true,
  },
  devices: [],
};

const SUBSCRIPTION = {
  endpoint: 'https://push.example.com/send/abc',
  keys: { p256dh: 'p256dh-key', auth: 'auth-key' },
};

/** Browser with Web Push; `answer` is what the user picks in the prompt. */
const stubBrowser = (answer: NotificationPermission, subscribed = false) => {
  let current: object | null = subscribed
    ? { unsubscribe: vi.fn(async () => true) }
    : null;
  const pushManager = {
    getSubscription: vi.fn(async () => current),
    subscribe: vi.fn(async () => {
      current = {
        toJSON: () => SUBSCRIPTION,
        unsubscribe: vi.fn(async () => {
          current = null;
          return true;
        }),
      };
      return current;
    }),
  };
  const registration = { pushManager };
  vi.stubGlobal('PushManager', class {});
  vi.stubGlobal('Notification', {
    permission: subscribed ? 'granted' : 'default',
    requestPermission: vi.fn(async () => answer),
  });
  Object.defineProperty(navigator, 'serviceWorker', {
    configurable: true,
    value: {
      getRegistration: vi.fn(async () => registration),
      register: vi.fn(async () => registration),
      ready: Promise.resolve(registration),
    },
  });
};

const stubApi = () => {
  const calls: { url: string; method: string; body?: unknown }[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      const method = init?.method ?? 'GET';
      const body = init?.body ? JSON.parse(String(init.body)) : undefined;
      calls.push({ url, method, body });
      if (url.includes('/api/push/'))
        return { json: async () => ({ code: 200, ok: true }) };
      if (url.includes('/api/avatar/'))
        return { json: async () => ({ code: 200, data: null }) };
      return {
        json: async () => ({
          code: 200,
          data: method === 'PUT' ? body : SETTINGS,
        }),
      };
    }),
  );
  return calls;
};

const setup = async () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider>{children}</Provider>
  );
  const view = renderHook(
    () => {
      const ctx = useContext();
      return {
        ctx,
        settings: ctx.useSettings(),
        push: ctx.usePush(),
        notice: ctx.useNotice(),
      };
    },
    { wrapper },
  );
  act(() => view.result.current.ctx.load());
  await waitFor(() => expect(view.result.current.settings).not.toBeNull());
  await waitFor(() => expect(view.result.current.push).not.toBe('checking'));
  return view;
};

describe('push notifications setting', () => {
  beforeEach(() => vi.stubEnv('PUBLIC_PARKA_VAPID_PUBLIC_KEY', 'BAAA'));
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    Reflect.deleteProperty(navigator, 'serviceWorker');
  });

  it('turns on: asks permission, subscribes the device and saves the choice', async () => {
    stubBrowser('granted');
    const calls = stubApi();
    const view = await setup();
    expect(view.result.current.push).toBe('off');

    act(() => view.result.current.ctx.togglePush(true));

    await waitFor(() => expect(view.result.current.push).toBe('on'));
    await waitFor(() =>
      expect(view.result.current.settings?.notifications.push).toBe(true),
    );
    expect(calls.find((c) => c.url.includes('/api/push/'))).toMatchObject({
      method: 'PUT',
      body: SUBSCRIPTION,
    });
  });

  it('stays off and reports the error when the user denies the permission', async () => {
    stubBrowser('denied');
    stubApi();
    const view = await setup();

    act(() => view.result.current.ctx.togglePush(true));

    await waitFor(() => expect(view.result.current.notice?.tone).toBe('error'));
    expect(view.result.current.notice).toMatchObject({
      code: 'PUSH_PERMISSION_DENIED',
    });
    expect(view.result.current.push).toBe('blocked');
    expect(view.result.current.settings?.notifications.push).toBe(false);
  });

  it('turns off: unsubscribes the device and saves the choice', async () => {
    stubBrowser('granted', true);
    stubApi();
    const view = await setup();
    expect(view.result.current.push).toBe('on');

    act(() => view.result.current.ctx.togglePush(false));

    await waitFor(() => expect(view.result.current.push).toBe('off'));
    await waitFor(() =>
      expect(view.result.current.settings?.notifications.push).toBe(false),
    );
  });

  it('reports an unsupported browser', async () => {
    stubApi();
    const view = await setup();

    expect(view.result.current.push).toBe('unsupported');
  });

  it('reports a missing server key', async () => {
    vi.stubEnv('PUBLIC_PARKA_VAPID_PUBLIC_KEY', '');
    stubBrowser('granted');
    stubApi();
    const view = await setup();

    expect(view.result.current.push).toBe('unconfigured');
  });
});

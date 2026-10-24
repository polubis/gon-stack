import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
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

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const stubApi = () => {
  const calls: { url: string; method: string; body?: unknown }[] = [];
  server.use(
    http.all('/api/*', async ({ request }) => {
      const { pathname } = new URL(request.url);
      const text = await request.text();
      const body = text ? (JSON.parse(text) as unknown) : undefined;
      calls.push({ url: pathname, method: request.method, body });
      if (pathname.includes('/api/push/'))
        return HttpResponse.json({ code: 200, ok: true });
      if (pathname.includes('/api/avatar/'))
        return HttpResponse.json({ code: 200, data: null });
      return HttpResponse.json({
        code: 200,
        data: request.method === 'PUT' ? body : SETTINGS,
      });
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

  it('keeps push on after the browser lost the subscription', async () => {
    stubBrowser('granted');
    vi.stubGlobal('Notification', {
      permission: 'granted',
      requestPermission: vi.fn(async () => 'granted'),
    });
    const calls = stubApi();
    server.use(
      http.get('/api/settings/', () =>
        HttpResponse.json({
          code: 200,
          data: {
            ...SETTINGS,
            notifications: { ...SETTINGS.notifications, push: true },
          },
        }),
      ),
    );
    const view = await setup();

    await waitFor(() => expect(view.result.current.push).toBe('on'));
    expect(view.result.current.settings?.notifications.push).toBe(true);
    expect(calls.find((c) => c.url.includes('/api/push/'))).toMatchObject({
      method: 'PUT',
      body: SUBSCRIPTION,
    });
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

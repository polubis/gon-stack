import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  PushPermissionError,
  disablePush,
  enablePush,
  readPushState,
  resubscribePush,
} from '../integration/push';

const SUBSCRIPTION = {
  endpoint: 'https://push.example.com/send/abc',
  keys: { p256dh: 'p256dh-key', auth: 'auth-key' },
};

type Browser = {
  permission?: NotificationPermission;
  answer?: NotificationPermission;
  subscribed?: boolean;
  incomplete?: boolean;
};

const unsubscribe = vi.fn(async () => true);

const stubBrowser = ({
  permission = 'default',
  answer = 'granted',
  subscribed = false,
  incomplete = false,
}: Browser = {}) => {
  const made = {
    toJSON: () =>
      incomplete ? { endpoint: SUBSCRIPTION.endpoint } : SUBSCRIPTION,
    unsubscribe,
  };
  const registration = {
    pushManager: {
      getSubscription: vi.fn(async () => (subscribed ? made : null)),
      subscribe: vi.fn(async () => made),
    },
  };
  vi.stubGlobal('PushManager', class {});
  vi.stubGlobal('Notification', {
    permission,
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

beforeEach(() => {
  unsubscribe.mockClear();
  vi.stubEnv('PUBLIC_PARKA_VAPID_PUBLIC_KEY', 'BKgEihISCNMw-_A');
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  Reflect.deleteProperty(navigator, 'serviceWorker');
});

describe('browser push', () => {
  it('reports unsupported when the browser has no web push', async () => {
    Reflect.deleteProperty(navigator, 'serviceWorker');

    expect(await readPushState()).toBe('unsupported');
  });

  it('reports unconfigured when the server has no public key', async () => {
    stubBrowser();
    vi.stubEnv('PUBLIC_PARKA_VAPID_PUBLIC_KEY', '');

    expect(await readPushState()).toBe('unconfigured');
  });

  it('reports blocked when the user denied the permission', async () => {
    stubBrowser({ permission: 'denied' });

    expect(await readPushState()).toBe('blocked');
  });

  it('reports off when the device is not subscribed', async () => {
    stubBrowser();

    expect(await readPushState()).toBe('off');
  });

  it('reports on when permission is granted and the device is subscribed', async () => {
    stubBrowser({ permission: 'granted', subscribed: true });

    expect(await readPushState()).toBe('on');
  });

  it('reports off when a subscription exists without permission', async () => {
    stubBrowser({ permission: 'default', subscribed: true });

    expect(await readPushState()).toBe('off');
  });

  it('subscribes the device after the user grants permission', async () => {
    stubBrowser({ answer: 'granted' });

    expect(await enablePush()).toEqual(SUBSCRIPTION);
  });

  it('refuses to subscribe when the user dismisses the prompt', async () => {
    stubBrowser({ answer: 'default' });

    await expect(enablePush()).rejects.toMatchObject({
      permission: 'default',
    });
    await expect(enablePush()).rejects.toBeInstanceOf(PushPermissionError);
  });

  it('rejects an incomplete subscription from the browser', async () => {
    stubBrowser({ incomplete: true });

    await expect(enablePush()).rejects.toThrow('incomplete push subscription');
  });

  it('reuses the live subscription without subscribing again', async () => {
    stubBrowser({ permission: 'granted', subscribed: true });

    expect(await resubscribePush()).toEqual(SUBSCRIPTION);
  });

  it('subscribes silently when the browser dropped the subscription', async () => {
    stubBrowser({ permission: 'granted' });

    expect(await resubscribePush()).toEqual(SUBSCRIPTION);
  });

  it('unsubscribes this device', async () => {
    stubBrowser({ permission: 'granted', subscribed: true });

    await disablePush();

    expect(unsubscribe).toHaveBeenCalledOnce();
  });

  it('does nothing when the device has no subscription', async () => {
    stubBrowser();

    await expect(disablePush()).resolves.toBeUndefined();
    expect(unsubscribe).not.toHaveBeenCalled();
  });
});

import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import {
  fetchSettings,
  postAvatar,
  postDevicePhoto,
  putPushSubscription,
  putSettings,
} from '../integration/repository';
import type { Settings } from '../domain/models';

const SETTINGS: Settings = {
  profile: { name: 'Ada' },
  notifications: {
    limitWarnings: true,
    receiptConfirmations: true,
    limitAlerts: true,
    push: false,
    email: false,
  },
  devices: [],
};

const VARIANTS = [{ size: 64, url: 'https://cdn.example.com/p-64.webp' }];

const failure = (code: number, message: string) =>
  HttpResponse.json({ code, message });

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('settings repository', () => {
  it('loads settings of the account', async () => {
    server.use(
      http.get('/api/settings/', () =>
        HttpResponse.json({ code: 200, data: SETTINGS }),
      ),
    );

    const settings = await fetchSettings(new AbortController().signal);

    expect(settings).toEqual(SETTINGS);
  });

  it('fails the load with the server message', async () => {
    server.use(http.get('/api/settings/', () => failure(401, 'Sesja wygasła')));

    await expect(fetchSettings(new AbortController().signal)).rejects.toThrow(
      'Sesja wygasła',
    );
  });

  it('stops an aborted load', async () => {
    server.use(
      http.get('/api/settings/', () =>
        HttpResponse.json({ code: 200, data: SETTINGS }),
      ),
    );
    const controller = new AbortController();
    controller.abort();

    await expect(fetchSettings(controller.signal)).rejects.toThrow();
  });

  it('saves settings and returns the saved ones', async () => {
    let sent: unknown;
    server.use(
      http.put('/api/settings/', async ({ request }) => {
        sent = await request.json();
        return HttpResponse.json({ code: 200, data: SETTINGS });
      }),
    );
    const next = { ...SETTINGS, profile: { name: 'Ada L.' } };

    const saved = await putSettings(next);

    expect(sent).toEqual(next);
    expect(saved).toEqual(SETTINGS);
  });

  it('fails the save with the server message', async () => {
    server.use(http.put('/api/settings/', () => failure(422, 'Zła nazwa')));

    await expect(putSettings(SETTINGS)).rejects.toThrow('Zła nazwa');
  });

  it('uploads an avatar and returns its variants', async () => {
    let body = '';
    server.use(
      http.post('/api/avatar/', async ({ request }) => {
        body = await request.text();
        return HttpResponse.json({ code: 200, data: { variants: VARIANTS } });
      }),
    );

    const avatar = await postAvatar(new File(['x'], 'me.png'));

    expect(body).toContain('name="file"');
    expect(avatar).toEqual({ variants: VARIANTS });
  });

  it('fails the avatar upload with the server message', async () => {
    server.use(http.post('/api/avatar/', () => failure(413, 'Za duży plik')));

    await expect(postAvatar(new File(['x'], 'me.png'))).rejects.toThrow(
      'Za duży plik',
    );
  });

  it('uploads a device photo for the chosen device', async () => {
    let body = '';
    server.use(
      http.post('/api/device-photo/', async ({ request }) => {
        body = await request.text();
        return HttpResponse.json({ code: 200, data: { variants: VARIANTS } });
      }),
    );

    const photo = await postDevicePhoto('device-1', new File(['x'], 'd.png'));

    expect(body).toContain('device-1');
    expect(photo).toEqual({ variants: VARIANTS });
  });

  it('fails the device photo upload with the server message', async () => {
    server.use(
      http.post('/api/device-photo/', () => failure(415, 'Zły format')),
    );

    await expect(
      postDevicePhoto('device-1', new File(['x'], 'd.png')),
    ).rejects.toThrow('Zły format');
  });

  it('sends the push subscription to the server', async () => {
    let sent: unknown;
    server.use(
      http.put('/api/push/', async ({ request }) => {
        sent = await request.json();
        return HttpResponse.json({ code: 200, data: null });
      }),
    );
    const subscription = {
      endpoint: 'https://push.example.com/send/abc',
      keys: { p256dh: 'p', auth: 'a' },
    };

    await putPushSubscription(subscription);

    expect(sent).toEqual(subscription);
  });

  it('fails the push subscription with the server message', async () => {
    server.use(http.put('/api/push/', () => failure(500, 'Push nie działa')));

    await expect(
      putPushSubscription({ endpoint: 'e', keys: { p256dh: 'p', auth: 'a' } }),
    ).rejects.toThrow('Push nie działa');
  });
});

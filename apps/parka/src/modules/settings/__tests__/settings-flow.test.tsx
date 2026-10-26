import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { Provider, useContext } from '../presentation/context';

const SETTINGS = {
  profile: { name: 'Ada' },
  notifications: {
    push: false,
    email: true,
    limitWarnings: true,
    receiptConfirmations: true,
    limitAlerts: true,
  },
  devices: [
    { id: 'device-1', name: 'Safari on iOS', type: 'mobile', avatar: null },
  ],
};

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const stubApi = (putResponse: object) =>
  server.use(
    http.get('/api/settings/', () =>
      HttpResponse.json({ code: 200, data: SETTINGS }),
    ),
    http.put('/api/settings/', () => HttpResponse.json(putResponse)),
  );

const setup = async () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider>{children}</Provider>
  );
  const view = renderHook(
    () => {
      const ctx = useContext();
      return { ctx, settings: ctx.useSettings(), notice: ctx.useNotice() };
    },
    { wrapper },
  );
  act(() => view.result.current.ctx.load());
  await waitFor(() => expect(view.result.current.settings).not.toBeNull());
  return view;
};

describe('settings', () => {
  it('loads the profile on mount', async () => {
    stubApi({ code: 200, data: SETTINGS });
    const view = await setup();

    expect(view.result.current.settings?.profile.name).toBe('Ada');
  });

  it('toggles a notification and confirms with a toast', async () => {
    stubApi({
      code: 200,
      data: {
        ...SETTINGS,
        notifications: { ...SETTINGS.notifications, push: true },
      },
    });
    const view = await setup();

    act(() =>
      view.result.current.ctx.update({
        ...view.result.current.settings!,
        notifications: {
          ...view.result.current.settings!.notifications,
          push: true,
        },
      }),
    );

    expect(view.result.current.settings?.notifications.push).toBe(true);
    await waitFor(() =>
      expect(view.result.current.notice?.tone).toBe('success'),
    );
  });

  it('reverts the change and reports an error when saving fails', async () => {
    stubApi({ code: 500, message: 'boom' });
    const view = await setup();

    act(() =>
      view.result.current.ctx.update({
        ...view.result.current.settings!,
        profile: { name: 'Bob' },
      }),
    );

    await waitFor(() => expect(view.result.current.notice?.tone).toBe('error'));
    expect(view.result.current.settings?.profile.name).toBe('Ada');
  });
});

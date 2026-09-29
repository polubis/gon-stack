import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Provider, useContext } from '../presentation/context';

const SETTINGS = {
  profile: { name: 'Ada', email: 'ada@example.com' },
  notifications: {
    push: false,
    email: true,
    limitWarnings: true,
    receiptConfirmations: true,
    limitAlerts: true,
  },
};

const stubApi = (putResponse: object) =>
  vi.stubGlobal(
    'fetch',
    vi.fn(async (_url: string, init?: RequestInit) => ({
      json: async () =>
        init?.method === 'PUT' ? putResponse : { code: 200, data: SETTINGS },
    })),
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
  afterEach(() => vi.unstubAllGlobals());

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
        profile: { name: 'Bob', email: 'bob@example.com' },
      }),
    );

    await waitFor(() => expect(view.result.current.notice?.tone).toBe('error'));
    expect(view.result.current.settings?.profile.name).toBe('Ada');
  });
});

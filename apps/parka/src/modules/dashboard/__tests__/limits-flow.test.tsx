import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Provider, useContext } from '../presentation/context';
import type { Limit, LimitId, Month } from '../domain/models';
import { readBody } from './dashboard-backend';

const TOTAL = {
  id: 'l-1',
  scope: 'total',
  amount: 1000,
  alertAt80: true,
  delivery: 'push',
};

const stubApi = (writeResponse: object) =>
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      const body = init?.method
        ? writeResponse
        : readBody(url, { limits: [TOTAL] });
      return { json: async () => body };
    }),
  );

const setup = async () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider>{children}</Provider>
  );
  const view = renderHook(
    () => {
      const ctx = useContext();
      return {
        ctx,
        limits: ctx.useLimits(),
        notice: ctx.useNotice(),
      };
    },
    { wrapper },
  );
  act(() => view.result.current.ctx.load('2025-04' as Month));
  await waitFor(() => expect(view.result.current.limits).toHaveLength(1));
  return view;
};

const raised: Limit = {
  id: 'l-1' as LimitId,
  scope: 'total',
  amount: 2000,
  alertAt80: true,
  delivery: 'push',
};

describe('dashboard limits changes', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('raises the limit and confirms with a toast', async () => {
    stubApi({ code: 200, data: { ...TOTAL, amount: 2000 } });
    const view = await setup();

    act(() => view.result.current.ctx.updateLimit(raised));

    expect(view.result.current.limits[0].amount).toBe(2000);
    await waitFor(() =>
      expect(view.result.current.notice?.tone).toBe('success'),
    );
  });

  it('restores the old limit and reports an error when saving fails', async () => {
    stubApi({ code: 500, message: 'boom' });
    const view = await setup();

    act(() => view.result.current.ctx.updateLimit(raised));

    await waitFor(() => expect(view.result.current.notice?.tone).toBe('error'));
    expect(view.result.current.limits[0].amount).toBe(1000);
  });

  it('sets a monthly limit when none exists yet', async () => {
    const created: Limit = { ...raised, id: 'l-2' as LimitId, amount: 3000 };
    stubApi({ code: 201, data: created });
    const view = await setup();

    act(() => view.result.current.ctx.createLimit(created));

    expect(view.result.current.limits).toHaveLength(2);
    await waitFor(() =>
      expect(view.result.current.notice?.tone).toBe('success'),
    );
  });
});

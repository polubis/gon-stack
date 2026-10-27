import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { Provider, useContext } from '../presentation/context';
import type { Limit, LimitId } from '../domain/models';
import { readHandlers } from './dashboard-backend';
import { periodContaining } from '@/shared/period/period';

const TOTAL = {
  id: 'l-1',
  scope: 'total',
  amount: 1000,
  alertAt: 80,
};

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const stubApi = (writeResponse: object) =>
  server.use(
    ...readHandlers({ limits: [TOTAL] }),
    http.post('/api/limits/', () => HttpResponse.json(writeResponse)),
    http.put('/api/limits/:id/', () => HttpResponse.json(writeResponse)),
    http.delete('/api/limits/:id/', () => HttpResponse.json(writeResponse)),
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
  act(() =>
    view.result.current.ctx.load(periodContaining('month', '2025-04-01')),
  );
  await waitFor(() => expect(view.result.current.limits).toHaveLength(1));
  return view;
};

const raised: Limit = {
  id: 'l-1' as LimitId,
  scope: 'total',
  amount: 2000,
  alertAt: 80,
};

describe('dashboard limits changes', () => {
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

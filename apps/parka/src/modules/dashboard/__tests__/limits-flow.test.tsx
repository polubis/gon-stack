import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Provider, useContext } from '../presentation/context';
import type { Goal, GoalId, Limit, LimitId } from '../domain/models';

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
        : url.includes('limits')
          ? { code: 200, data: [TOTAL] }
          : { code: 200, data: [] };
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
        goals: ctx.useGoals(),
        notice: ctx.useNotice(),
      };
    },
    { wrapper },
  );
  act(() => view.result.current.ctx.loadLimits());
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

const GOAL: Goal = {
  id: 'g-1' as GoalId,
  name: 'Trip',
  target: 500,
  saved: 0,
  months: 3,
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

  it('adds a goal right away and keeps it when the server accepts', async () => {
    stubApi({ code: 201, data: GOAL });
    const view = await setup();

    act(() => view.result.current.ctx.createGoal(GOAL));

    expect(view.result.current.goals).toHaveLength(1);
    await waitFor(() =>
      expect(view.result.current.notice?.tone).toBe('success'),
    );
  });

  it('drops the goal and reports an error when creating fails', async () => {
    stubApi({ code: 500, message: 'boom' });
    const view = await setup();

    act(() => view.result.current.ctx.createGoal(GOAL));

    await waitFor(() => expect(view.result.current.notice?.tone).toBe('error'));
    expect(view.result.current.goals).toHaveLength(0);
  });
});

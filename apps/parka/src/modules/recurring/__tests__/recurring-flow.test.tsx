import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Provider, useContext } from '../presentation/context';

const RECURRING = {
  id: 'r-1',
  name: 'Netflix',
  cost: 49,
  nextPaymentDate: '2025-05-01T00:00:00Z',
  active: true,
  paymentMethod: 'card',
  categoryId: 'c-1',
  history: [{ date: '2025-04-01T00:00:00Z', amount: 49 }],
};

const stubApi = (putResponse: object) =>
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => ({
      json: async () =>
        init?.method === 'PUT'
          ? putResponse
          : url.includes('categories')
            ? {
                code: 200,
                data: [
                  { id: 'c-1', name: 'Food', icon: 'cart', color: '#0f7a4f' },
                ],
              }
            : { code: 200, data: [RECURRING] },
    })),
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
        recurring: ctx.useRecurring(),
        categories: ctx.useCategories(),
        notice: ctx.useNotice(),
      };
    },
    { wrapper },
  );
  act(() => view.result.current.ctx.load());
  await waitFor(() => expect(view.result.current.recurring).toHaveLength(1));
  return view;
};

describe('recurring tracking', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('loads items together with their categories', async () => {
    stubApi({ code: 200, data: RECURRING });
    const view = await setup();

    await waitFor(() => expect(view.result.current.categories).toHaveLength(1));
  });

  it('pauses tracking right away and confirms with a toast', async () => {
    stubApi({ code: 200, data: { ...RECURRING, active: false } });
    const view = await setup();

    act(() =>
      view.result.current.ctx.update({
        ...view.result.current.recurring[0]!,
        active: false,
      }),
    );

    expect(view.result.current.recurring[0]!.active).toBe(false);
    await waitFor(() =>
      expect(view.result.current.notice?.tone).toBe('success'),
    );
  });

  it('resumes tracking and reports an error when saving fails', async () => {
    stubApi({ code: 500, message: 'boom' });
    const view = await setup();

    act(() =>
      view.result.current.ctx.update({
        ...view.result.current.recurring[0]!,
        active: false,
      }),
    );

    await waitFor(() => expect(view.result.current.notice?.tone).toBe('error'));
    expect(view.result.current.recurring[0]!.active).toBe(true);
  });
});

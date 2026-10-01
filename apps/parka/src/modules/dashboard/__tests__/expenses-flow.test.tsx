import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Provider, useContext } from '../presentation/context';
import type { ExpenseId } from '../domain/models';

const EXPENSE = {
  id: 'e-1',
  merchant: 'Shop',
  date: '2025-04-02T10:00:00Z',
  amount: 10,
  categoryId: 'c-1',
  paymentMethod: 'card',
  isBill: false,
  source: 'manual',
  items: [],
};

const stubApi = (deleteResponse: object) =>
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      const body =
        init?.method === 'DELETE'
          ? deleteResponse
          : url.includes('categories')
            ? { code: 200, data: [] }
            : { code: 200, data: [EXPENSE] };
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
        expenses: ctx.useExpenses(),
        notice: ctx.useNotice(),
      };
    },
    { wrapper },
  );
  act(() => view.result.current.ctx.loadExpenses());
  await waitFor(() => expect(view.result.current.expenses).toHaveLength(1));
  return view;
};

describe('dashboard expenses removal', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('removes the expense and confirms with a toast', async () => {
    stubApi({ code: 200, ok: true });
    const view = await setup();

    act(() => view.result.current.ctx.removeExpense('e-1' as ExpenseId));

    expect(view.result.current.expenses).toHaveLength(0);
    await waitFor(() =>
      expect(view.result.current.notice?.tone).toBe('success'),
    );
  });

  it('brings the expense back and reports an error when removal fails', async () => {
    stubApi({ code: 500, message: 'boom' });
    const view = await setup();

    act(() => view.result.current.ctx.removeExpense('e-1' as ExpenseId));

    await waitFor(() => expect(view.result.current.notice?.tone).toBe('error'));
    expect(view.result.current.expenses).toHaveLength(1);
  });
});

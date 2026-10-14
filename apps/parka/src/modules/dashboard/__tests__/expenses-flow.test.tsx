import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Provider, useContext } from '../presentation/context';
import type { ExpenseId } from '../domain/models';
import { periodContaining } from '@/shared/period/period';
import { answerApi, readBody, startBackend } from './dashboard-backend';

const MONTH = periodContaining('month', '2025-04-01');

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

const server = startBackend();

const stubApi = (deleteResponse: object) =>
  answerApi(server, ({ method, url }) =>
    method === 'DELETE'
      ? deleteResponse
      : readBody(url, { expenses: [EXPENSE] }),
  );

const summaryReads = (calls: ReturnType<typeof stubApi>) =>
  calls.filter(({ url }) => url.includes('/api/dashboard')).length;

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
  act(() => view.result.current.ctx.load(MONTH));
  await waitFor(() => expect(view.result.current.expenses).toHaveLength(1));
  return view;
};

describe('dashboard expenses removal', () => {
  it('removes the expense and confirms with a toast', async () => {
    stubApi({ code: 200, ok: true });
    const view = await setup();

    act(() => view.result.current.ctx.removeExpense('e-1' as ExpenseId, MONTH));

    expect(view.result.current.expenses).toHaveLength(0);
    await waitFor(() =>
      expect(view.result.current.notice?.tone).toBe('success'),
    );
  });

  it('reads the summary again once the removal is saved', async () => {
    const calls = stubApi({ code: 200, ok: true });
    const view = await setup();
    await waitFor(() => expect(summaryReads(calls)).toBe(1));

    act(() => view.result.current.ctx.removeExpense('e-1' as ExpenseId, MONTH));

    await waitFor(() => expect(summaryReads(calls)).toBe(2));
  });

  it('keeps the summary as it was when removal fails', async () => {
    const calls = stubApi({ code: 500, message: 'boom' });
    const view = await setup();

    act(() => view.result.current.ctx.removeExpense('e-1' as ExpenseId, MONTH));

    await waitFor(() => expect(view.result.current.notice?.tone).toBe('error'));
    expect(summaryReads(calls)).toBe(1);
  });

  it('brings the expense back and reports an error when removal fails', async () => {
    stubApi({ code: 500, message: 'boom' });
    const view = await setup();

    act(() => view.result.current.ctx.removeExpense('e-1' as ExpenseId, MONTH));

    await waitFor(() => expect(view.result.current.notice?.tone).toBe('error'));
    expect(view.result.current.expenses).toHaveLength(1);
  });
});

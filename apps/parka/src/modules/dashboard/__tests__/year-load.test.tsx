import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Provider, useContext } from '../presentation/context';
import type { ExpenseId } from '../domain/models';
import { periodContaining } from '@/shared/period/period';
import { answerApi, readBody, startBackend } from './dashboard-backend';

const APRIL = periodContaining('month', '2025-04-01');
const MARCH = periodContaining('month', '2025-03-01');
const LAST_YEAR = periodContaining('year', '2024-06-01');

const expense = (id: string, amount: number, date: string) => ({
  id,
  merchant: `Shop ${id}`,
  date,
  amount,
  categoryId: 'c-1',
  paymentMethod: 'card',
  isBill: false,
  source: 'manual',
  items: [],
});

const EXPENSES = [
  expense('e-apr', 10, '2025-04-02T12:00:00Z'),
  expense('e-mar', 7, '2025-03-02T12:00:00Z'),
  expense('e-old', 5, '2024-06-02T12:00:00Z'),
];

const server = startBackend();

const stubApi = () =>
  answerApi(server, ({ method, url }) =>
    method === 'DELETE'
      ? { code: 200, ok: true }
      : readBody(url, { expenses: EXPENSES }),
  );

const reads = (calls: ReturnType<typeof stubApi>) =>
  calls.filter(({ method, url }) => method === 'GET' && !url.includes('avatar'))
    .length;

const setup = async () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider>{children}</Provider>
  );
  const view = renderHook(
    () => {
      const ctx = useContext();
      return { ctx, summary: ctx.useData(), expenses: ctx.useExpenses() };
    },
    { wrapper },
  );
  act(() => view.result.current.ctx.load(APRIL));
  await waitFor(() => expect(view.result.current.summary).not.toBeNull());
  return view;
};

describe('dashboard loading of a whole year', () => {
  it('counts the month from everything read upfront', async () => {
    stubApi();

    const view = await setup();

    expect(view.result.current.summary?.total).toBe(10);
    expect(view.result.current.summary?.previousTotal).toBe(7);
  });

  it('switches to another month and year without reading again', async () => {
    const calls = stubApi();
    const view = await setup();
    const before = reads(calls);

    act(() => view.result.current.ctx.load(MARCH));
    await waitFor(() => expect(view.result.current.summary?.total).toBe(7));
    act(() => view.result.current.ctx.load(LAST_YEAR));
    await waitFor(() => expect(view.result.current.summary?.total).toBe(5));

    expect(reads(calls)).toBe(before);
  });

  it('recounts the totals at once when an expense is removed', async () => {
    stubApi();
    const view = await setup();

    act(() =>
      view.result.current.ctx.removeExpense('e-apr' as ExpenseId, APRIL),
    );

    expect(view.result.current.summary?.total).toBe(0);
  });

  it('reads again when the view is opened anew', async () => {
    const calls = stubApi();
    const first = await setup();
    const once = reads(calls);
    first.unmount();

    await setup();

    expect(reads(calls)).toBe(once * 2);
  });
});

import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { periodContaining } from '@/shared/period/period';
import { Provider, useContext } from '../presentation/context';
import { totalProgress, upcomingCharges } from '../presentation/selectors';
import type { Expense, Limit, Recurring } from '../domain/models';
import { readHandlers } from './dashboard-backend';

const NETFLIX = {
  id: 'r-1',
  name: 'Netflix',
  cost: 30,
  interval: 'monthly',
  startDate: '2025-05-15',
  endDate: null,
  lastMaterializedDate: null,
  active: true,
  paymentMethod: 'card',
  categoryId: 'c-1',
};

const server = setupServer();

/** Backend with one recurring item; every write answers with `writeResponse`. */
const mockBackend = (writeResponse: object) =>
  server.use(
    ...readHandlers({ recurring: [NETFLIX] }),
    http.post('/api/recurring/', () => HttpResponse.json(writeResponse)),
    http.put('/api/recurring/:id/', () => HttpResponse.json(writeResponse)),
    http.delete('/api/recurring/:id/', () => HttpResponse.json(writeResponse)),
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
        notice: ctx.useNotice(),
      };
    },
    { wrapper },
  );
  act(() => view.result.current.ctx.load(TEST_PERIOD));
  await waitFor(() => expect(view.result.current.recurring).toHaveLength(1));
  return view;
};

const asRecurring = (over: Record<string, unknown> = {}) =>
  ({ ...NETFLIX, ...over }) as unknown as Recurring;

const TEST_PERIOD = periodContaining('month', '2025-06-01');

describe('recurring expenses', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('saves an edit right away and confirms with a toast', async () => {
    mockBackend({ code: 200, data: { ...NETFLIX, cost: 45 } });
    const view = await setup();

    act(() =>
      view.result.current.ctx.updateRecurring(
        {
          ...view.result.current.recurring[0]!,
          cost: 45,
        },
        TEST_PERIOD,
      ),
    );

    expect(view.result.current.recurring[0]!.cost).toBe(45);
    await waitFor(() =>
      expect(view.result.current.notice?.tone).toBe('success'),
    );
  });

  it('reverts an edit and reports an error when saving fails', async () => {
    mockBackend({ code: 500, message: 'boom' });
    const view = await setup();

    act(() =>
      view.result.current.ctx.updateRecurring(
        {
          ...view.result.current.recurring[0]!,
          cost: 45,
        },
        TEST_PERIOD,
      ),
    );

    await waitFor(() => expect(view.result.current.notice?.tone).toBe('error'));
    expect(view.result.current.recurring[0]!.cost).toBe(30);
  });

  it('removes an item right away and confirms with a toast', async () => {
    mockBackend({ code: 200, ok: true });
    const view = await setup();

    act(() =>
      view.result.current.ctx.removeRecurring(NETFLIX.id as never, TEST_PERIOD),
    );

    expect(view.result.current.recurring).toHaveLength(0);
    await waitFor(() =>
      expect(view.result.current.notice?.tone).toBe('success'),
    );
  });

  it('brings an item back when removing it fails', async () => {
    mockBackend({ code: 500, message: 'boom' });
    const view = await setup();

    act(() =>
      view.result.current.ctx.removeRecurring(NETFLIX.id as never, TEST_PERIOD),
    );

    await waitFor(() => expect(view.result.current.notice?.tone).toBe('error'));
    expect(view.result.current.recurring).toHaveLength(1);
  });
});

describe('upcoming recurring payments', () => {
  const total = {
    id: 'l-0',
    scope: 'total',
    amount: 100,
    alertAt80: true,
    delivery: 'push',
  } as unknown as Limit;

  it('announces the next payment of each rule, latest first', () => {
    const list = [
      asRecurring(),
      asRecurring({ id: 'r-2', name: 'Prąd', startDate: '2025-06-25' }),
    ];

    expect(
      upcomingCharges(list, '2025-06-20').map((u) => [
        u.recurring.name,
        u.date,
      ]),
    ).toEqual([
      ['Netflix', '2025-07-15'],
      ['Prąd', '2025-06-25'],
    ]);
  });

  it('keeps only payments inside the selected range, latest first', () => {
    const list = [
      asRecurring({ id: 'r-1', name: 'Późno', startDate: '2025-06-28' }),
      asRecurring({ id: 'r-2', name: 'Poza', startDate: '2025-07-02' }),
      asRecurring({ id: 'r-3', name: 'Wcześnie', startDate: '2025-06-22' }),
    ];

    expect(
      upcomingCharges(list, '2025-06-20', TEST_PERIOD).map((u) => u.date),
    ).toEqual(['2025-06-28', '2025-06-22']);
  });

  it('announces nothing for a paused or finished rule', () => {
    const list = [
      asRecurring({ active: false }),
      asRecurring({ id: 'r-2', endDate: '2025-06-01' }),
    ];

    expect(upcomingCharges(list, '2025-06-20')).toEqual([]);
  });

  it('leaves the limit usage alone: only real expenses count', () => {
    const charged = {
      id: 'r-1:2025-05-15',
      amount: 30,
      date: '2025-06-15T12:00:00.000Z',
      categoryId: 'c-1',
      items: [],
    } as unknown as Expense;
    const period = periodContaining('month', '2025-06-01');

    expect(totalProgress([total], [], period)).toMatchObject({ spent: 0 });
    expect(totalProgress([total], [charged], period)).toMatchObject({
      spent: 30,
      pct: 30,
    });
  });
});

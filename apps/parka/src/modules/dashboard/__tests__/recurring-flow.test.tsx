import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { Provider, useContext } from '../presentation/context';
import { totalProgress, withRecurring } from '../presentation/selectors';
import type { CategoryId, Limit, Month, Recurring } from '../domain/models';
import { readHandlers } from './dashboard-backend';

const NETFLIX = {
  id: 'r-1',
  name: 'Netflix',
  cost: 30,
  nextPaymentDate: '2025-05-15T00:00:00Z',
  active: true,
  paymentMethod: 'card',
  categoryId: 'c-1',
  history: [],
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
  act(() => view.result.current.ctx.load(TEST_MONTH));
  await waitFor(() => expect(view.result.current.recurring).toHaveLength(1));
  return view;
};

const asRecurring = (over: Partial<typeof NETFLIX> = {}) =>
  ({ ...NETFLIX, ...over }) as unknown as Recurring;

const TEST_MONTH = '2025-06' as Month;

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
        TEST_MONTH,
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
        TEST_MONTH,
      ),
    );

    await waitFor(() => expect(view.result.current.notice?.tone).toBe('error'));
    expect(view.result.current.recurring[0]!.cost).toBe(30);
  });

  it('removes an item right away and confirms with a toast', async () => {
    mockBackend({ code: 200, ok: true });
    const view = await setup();

    act(() =>
      view.result.current.ctx.removeRecurring(NETFLIX.id as never, TEST_MONTH),
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
      view.result.current.ctx.removeRecurring(NETFLIX.id as never, TEST_MONTH),
    );

    await waitFor(() => expect(view.result.current.notice?.tone).toBe('error'));
    expect(view.result.current.recurring).toHaveLength(1);
  });
});

describe('recurring expenses in the totals', () => {
  const month = (value: string) => value as Month;
  const total = {
    id: 'l-0',
    scope: 'total',
    amount: 100,
    alertAt80: true,
    delivery: 'push',
  } as unknown as Limit;

  it('counts the charge in every month from the first payment on', () => {
    const list = [asRecurring()];

    expect(withRecurring([], list, month('2025-04'))).toHaveLength(0);
    expect(withRecurring([], list, month('2025-05'))).toHaveLength(1);
    expect(withRecurring([], list, month('2025-09'))).toHaveLength(1);
  });

  it('raises the limit usage by the recurring cost', () => {
    const expenses = withRecurring([], [asRecurring()], month('2025-06'));

    expect(totalProgress([total], expenses, month('2025-06'))).toMatchObject({
      spent: 30,
      pct: 30,
    });
  });

  it('ignores paused items', () => {
    const list = [asRecurring({ active: false })];

    expect(withRecurring([], list, month('2025-06'))).toHaveLength(0);
  });

  it('files the charge under the item category', () => {
    const [charge] = withRecurring([], [asRecurring()], month('2025-06'));

    expect(charge?.categoryId).toBe('c-1' as CategoryId);
    expect(charge?.source).toBe('recurring');
  });
});

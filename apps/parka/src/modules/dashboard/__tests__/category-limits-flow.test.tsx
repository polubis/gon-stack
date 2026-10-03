import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { Provider, useContext } from '../presentation/context';
import type { CategoryLimit, LimitId, Month } from '../domain/models';
import { readHandlers } from './dashboard-backend';

const FOOD = {
  id: 'l-1',
  scope: 'category',
  categoryId: 'c-1',
  amount: 300,
  alertAt80: true,
  delivery: 'push',
};
const TOTAL = {
  id: 'l-0',
  scope: 'total',
  amount: 1000,
  alertAt80: true,
  delivery: 'push',
};

const server = setupServer();

/** Backend with both limits; every write answers with `writeResponse`. */
const mockBackend = (writeResponse: object) =>
  server.use(
    ...readHandlers({ limits: [TOTAL, FOOD] }),
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
  act(() => view.result.current.ctx.load('2025-04' as Month));
  await waitFor(() => expect(view.result.current.limits).toHaveLength(2));
  return view;
};

const raised: CategoryLimit = {
  id: 'l-1' as LimitId,
  scope: 'category',
  categoryId: 'c-1' as CategoryLimit['categoryId'],
  amount: 450,
  alertAt80: false,
  delivery: 'email',
};

const amountOf = (limits: { id: string; amount: number }[], id: string) =>
  limits.find((l) => l.id === id)?.amount;

describe('category limits', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe('category limit editing', () => {
    it('applies the new settings at once and confirms with a toast', async () => {
      mockBackend({ code: 200, data: { ...FOOD, amount: 450 } });
      const view = await setup();

      act(() => view.result.current.ctx.updateLimit(raised));

      expect(amountOf(view.result.current.limits, 'l-1')).toBe(450);
      expect(amountOf(view.result.current.limits, 'l-0')).toBe(1000);
      await waitFor(() =>
        expect(view.result.current.notice?.tone).toBe('success'),
      );
    });

    it('restores the old settings and reports an error when saving fails', async () => {
      mockBackend({ code: 500, message: 'boom' });
      const view = await setup();

      act(() => view.result.current.ctx.updateLimit(raised));

      await waitFor(() =>
        expect(view.result.current.notice?.tone).toBe('error'),
      );
      expect(amountOf(view.result.current.limits, 'l-1')).toBe(300);
    });
  });

  describe('category limit removal', () => {
    it('drops the limit right away and confirms with a toast', async () => {
      mockBackend({ code: 200, ok: true });
      const view = await setup();

      act(() => view.result.current.ctx.removeLimit('l-1' as LimitId));

      expect(view.result.current.limits.map((l) => l.id)).toEqual(['l-0']);
      await waitFor(() =>
        expect(view.result.current.notice?.tone).toBe('success'),
      );
    });

    it('brings the limit back and reports an error when removal fails', async () => {
      mockBackend({ code: 404, message: 'Limit not found' });
      const view = await setup();

      act(() => view.result.current.ctx.removeLimit('l-1' as LimitId));

      await waitFor(() =>
        expect(view.result.current.notice?.tone).toBe('error'),
      );
      expect(view.result.current.limits).toHaveLength(2);
    });
  });
});

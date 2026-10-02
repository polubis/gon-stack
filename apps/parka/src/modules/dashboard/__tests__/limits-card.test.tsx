import { useEffect } from 'react';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { Provider, useContext } from '../presentation/context';
import { LimitsCard } from '../presentation/limits-card';
import type { Month } from '../domain/models';

const MONTH = '2025-04' as Month;

const CATEGORY = { id: 'c-1', name: 'Spożywcze', icon: 'cart', color: '#0a0' };
const FOOD_LIMIT = {
  id: 'l-1',
  scope: 'category',
  categoryId: 'c-1',
  amount: 300,
  alertAt80: true,
  delivery: 'push',
};
const TOTAL_LIMIT = {
  id: 'l-0',
  scope: 'total',
  amount: 1000,
  alertAt80: true,
  delivery: 'push',
};

const server = setupServer();

/** Backend holding `limits` and one category; writes are accepted. */
const mockBackend = (limits: object[]) =>
  server.use(
    http.get('/api/limits/', () =>
      HttpResponse.json({ code: 200, data: limits }),
    ),
    http.get('/api/categories/', () =>
      HttpResponse.json({ code: 200, data: [CATEGORY] }),
    ),
    http.get('/api/expenses/', () =>
      HttpResponse.json({ code: 200, data: [] }),
    ),
    http.get('/api/goals/', () => HttpResponse.json({ code: 200, data: [] })),
    http.post('/api/limits/', async ({ request }) =>
      HttpResponse.json({ code: 201, data: await request.json() }),
    ),
    http.put('/api/limits/:id/', async ({ request }) =>
      HttpResponse.json({ code: 200, data: await request.json() }),
    ),
    http.delete('/api/limits/:id/', () =>
      HttpResponse.json({ code: 200, ok: true }),
    ),
  );

const Harness = () => {
  const ctx = useContext();
  useEffect(() => {
    ctx.loadLimits();
    ctx.loadExpenses();
  }, [ctx]);
  return <LimitsCard month={MONTH} />;
};

const renderCard = async () => {
  const user = userEvent.setup();
  render(
    <Provider>
      <Harness />
    </Provider>,
  );
  await screen.findByRole('button', { name: /Dodaj limit/ });
  await waitFor(() =>
    expect(screen.queryByText('Brak zdefiniowanego limitu.')).toBeNull(),
  );
  return user;
};

const openEditor = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(
    await screen.findByRole('button', { name: 'Edytuj limit: Spożywcze' }),
  );
  return screen.findByRole('dialog', { name: 'Edytuj limit' });
};

describe('limits card', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe('limits card with a limit on every category', () => {
    it('explains why a limit cannot be added', async () => {
      mockBackend([TOTAL_LIMIT, FOOD_LIMIT]);
      const user = await renderCard();
      const add = screen.getByRole('button', { name: /Dodaj limit/ });

      await user.click(add);

      expect(add).toHaveAttribute('aria-disabled', 'true');
      expect(add).toHaveAccessibleDescription(
        'Wszystkie kategorie mają już ustawiony limit.',
      );
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('edits the amount of a category limit', async () => {
      mockBackend([TOTAL_LIMIT, FOOD_LIMIT]);
      const user = await renderCard();
      const dialog = await openEditor(user);

      expect(within(dialog).getByLabelText('Kategoria')).toBeDisabled();
      const amount = within(dialog).getByLabelText('Limit miesięczny');
      expect(amount).toHaveValue('300');

      await user.clear(amount);
      await user.type(amount, '450');
      await user.click(within(dialog).getByRole('button', { name: 'Zapisz' }));

      expect(screen.queryByRole('dialog')).toBeNull();
      expect(screen.getByText(/450,00/)).toBeInTheDocument();
    });

    it('leaves the limit untouched when the editor is dismissed with Escape', async () => {
      mockBackend([TOTAL_LIMIT, FOOD_LIMIT]);
      const user = await renderCard();
      await openEditor(user);

      await user.keyboard('{Escape}');

      expect(screen.queryByRole('dialog')).toBeNull();
      expect(screen.getByText(/300,00/)).toBeInTheDocument();
    });

    it('keeps keyboard focus inside the editor', async () => {
      mockBackend([TOTAL_LIMIT, FOOD_LIMIT]);
      const user = await renderCard();
      const dialog = await openEditor(user);

      const close = within(dialog).getByRole('button', { name: 'Zamknij' });
      const remove = within(dialog).getByRole('button', { name: 'Usuń limit' });

      act(() => remove.focus());
      await user.tab();
      expect(close).toHaveFocus();

      await user.tab({ shift: true });
      expect(remove).toHaveFocus();
    });

    it('removes a category limit and frees its category for a new one', async () => {
      mockBackend([TOTAL_LIMIT, FOOD_LIMIT]);
      const user = await renderCard();
      const dialog = await openEditor(user);

      await user.click(
        within(dialog).getByRole('button', { name: 'Usuń limit' }),
      );

      expect(screen.queryByRole('dialog')).toBeNull();
      expect(screen.getByText('Brak limitów kategorii.')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Dodaj limit/ }),
      ).not.toHaveAttribute('aria-disabled');
    });
  });

  describe('limits card without a category limit', () => {
    it('creates a limit for the free category', async () => {
      mockBackend([TOTAL_LIMIT]);
      const user = await renderCard();

      await user.click(screen.getByRole('button', { name: /Dodaj limit/ }));
      const dialog = await screen.findByRole('dialog', { name: 'Nowy limit' });
      expect(
        within(dialog).queryByRole('button', { name: 'Usuń limit' }),
      ).toBeNull();
      await user.click(within(dialog).getByRole('button', { name: 'Zapisz' }));

      expect(screen.queryByRole('dialog')).toBeNull();
      expect(
        await screen.findByRole('button', { name: 'Edytuj limit: Spożywcze' }),
      ).toBeInTheDocument();
    });
  });
});

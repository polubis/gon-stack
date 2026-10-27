import { useEffect } from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';
import { Provider, useContext } from '../presentation/context';
import { LimitModals } from '../presentation/limit-modals';
import { LimitsCard } from '../presentation/limits-card';
import { periodContaining } from '@/shared/period/period';
import { readHandlers } from './dashboard-backend';

const PERIOD = periodContaining('month', '2025-04-01');

const CATEGORY = { id: 'c-1', name: 'Spożywcze', icon: 'cart', color: '#0a0' };
const FOOD_LIMIT = {
  id: 'l-1',
  scope: 'category',
  categoryId: 'c-1',
  amount: 300,
  alertAt: 80,
};
const TOTAL_LIMIT = {
  id: 'l-0',
  scope: 'total',
  amount: 1000,
  alertAt: 80,
};

const server = setupServer();
let sent: unknown[] = [];

/** Backend holding `limits` and one category; writes are accepted. */
const mockBackend = (limits: object[]) =>
  server.use(
    ...readHandlers({ limits, categories: [CATEGORY] }),
    http.post('/api/limits/', async ({ request }) => {
      const body = await request.json();
      sent.push(body);
      return HttpResponse.json({ code: 201, data: body });
    }),
    http.put('/api/limits/:id/', async ({ request }) => {
      const body = await request.json();
      sent.push(body);
      return HttpResponse.json({ code: 200, data: body });
    }),
    http.delete('/api/limits/:id/', () =>
      HttpResponse.json({ code: 200, ok: true }),
    ),
  );

const Harness = () => {
  const ctx = useContext();
  useEffect(() => {
    ctx.load(PERIOD);
  }, [ctx]);
  return (
    <>
      <LimitsCard period={PERIOD} />
      <LimitModals />
    </>
  );
};

const renderCard = async () => {
  const user = userEvent.setup();
  render(
    <Provider>
      <Harness />
    </Provider>,
  );
  await screen.findByRole('button', { name: /Zarządzaj limitami/ });
  await waitFor(() =>
    expect(screen.queryByText('Brak zdefiniowanego limitu.')).toBeNull(),
  );
  return user;
};

const openManager = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button', { name: /Zarządzaj limitami/ }));
  return screen.findByRole('dialog', { name: 'Limity' });
};

const openEditor = async (user: ReturnType<typeof userEvent.setup>) => {
  const manager = await openManager(user);
  await user.click(
    within(manager).getByRole('button', { name: 'Edytuj limit: Spożywcze' }),
  );
  return screen.findByRole('dialog', { name: 'Edytuj limit' });
};

const gone = (name: string) =>
  waitFor(() => expect(screen.queryByRole('dialog', { name })).toBeNull());

describe('limits managed in a modal', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  beforeEach(() => {
    sent = [];
  });
  afterEach(() => {
    server.resetHandlers();
    window.history.replaceState(null, '', '/');
  });
  afterAll(() => server.close());

  describe('widget', () => {
    it('shows progress only, without editing controls', async () => {
      mockBackend([TOTAL_LIMIT, FOOD_LIMIT]);
      await renderCard();

      expect(screen.getByText(/powiadomienie od 80%/)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Edytuj limit/ })).toBeNull();
      expect(screen.queryByRole('button', { name: /Dodaj limit/ })).toBeNull();
    });
  });

  describe('limits list modal', () => {
    it('lists the monthly and the category limits', async () => {
      mockBackend([TOTAL_LIMIT, FOOD_LIMIT]);
      const user = await renderCard();

      const manager = await openManager(user);

      expect(
        within(manager).getByRole('button', {
          name: 'Edytuj limit: Limit miesięczny',
        }),
      ).toBeInTheDocument();
      expect(
        within(manager).getByRole('button', {
          name: 'Edytuj limit: Spożywcze',
        }),
      ).toBeInTheDocument();
    });
  });

  describe('limit editing', () => {
    it('edits the amount and the threshold of a category limit', async () => {
      mockBackend([TOTAL_LIMIT, FOOD_LIMIT]);
      const user = await renderCard();
      const dialog = await openEditor(user);

      expect(within(dialog).getByLabelText('Kategoria')).toBeDisabled();
      const amount = within(dialog).getByLabelText('Limit miesięczny');
      expect(amount).toHaveValue('300');
      const threshold = within(dialog).getByLabelText(/Powiadom od/);
      expect(threshold).toHaveValue('80');

      await user.clear(amount);
      await user.type(amount, '450');
      await user.clear(threshold);
      await user.type(threshold, '60');
      await user.click(within(dialog).getByRole('button', { name: 'Zapisz' }));

      await gone('Edytuj limit');
      expect(sent).toEqual([
        expect.objectContaining({ id: 'l-1', amount: 450, alertAt: 60 }),
      ]);
    });

    it('offers no switch to turn limit notifications off', async () => {
      mockBackend([TOTAL_LIMIT, FOOD_LIMIT]);
      const user = await renderCard();
      const dialog = await openEditor(user);

      expect(within(dialog).queryByRole('switch')).toBeNull();
      expect(within(dialog).queryByRole('radio')).toBeNull();
      expect(
        within(dialog).getByText(/Powiadomienie w aplikacji dostaniesz zawsze/),
      ).toBeInTheDocument();
    });

    it('rejects a threshold above 100 percent', async () => {
      mockBackend([TOTAL_LIMIT, FOOD_LIMIT]);
      const user = await renderCard();
      const dialog = await openEditor(user);
      const threshold = within(dialog).getByLabelText(/Powiadom od/);

      await user.clear(threshold);
      await user.type(threshold, '150');

      expect(
        within(dialog).getByRole('button', { name: 'Zapisz' }),
      ).toBeDisabled();
    });

    it('leaves the limit untouched when the editor is dismissed with Escape', async () => {
      mockBackend([TOTAL_LIMIT, FOOD_LIMIT]);
      const user = await renderCard();
      await openEditor(user);

      await user.keyboard('{Escape}');

      await gone('Edytuj limit');
      expect(sent).toEqual([]);
    });
  });

  describe('limit removal', () => {
    it('asks for confirmation, then removes the limit', async () => {
      mockBackend([TOTAL_LIMIT, FOOD_LIMIT]);
      const user = await renderCard();
      const dialog = await openEditor(user);

      await user.click(
        within(dialog).getByRole('button', { name: 'Usuń limit' }),
      );
      const confirm = await screen.findByRole('dialog', {
        name: 'Usunąć limit?',
      });
      await user.click(within(confirm).getByRole('button', { name: 'Usuń' }));

      await gone('Usunąć limit?');
      expect(
        await screen.findByText('Brak limitów kategorii.'),
      ).toBeInTheDocument();
    });

    it('keeps the limit when the confirmation is cancelled', async () => {
      mockBackend([TOTAL_LIMIT, FOOD_LIMIT]);
      const user = await renderCard();
      const dialog = await openEditor(user);

      await user.click(
        within(dialog).getByRole('button', { name: 'Usuń limit' }),
      );
      const confirm = await screen.findByRole('dialog', {
        name: 'Usunąć limit?',
      });
      await user.click(within(confirm).getByRole('button', { name: 'Anuluj' }));

      await gone('Usunąć limit?');
      expect(
        screen.getByRole('dialog', { name: 'Edytuj limit' }),
      ).toBeInTheDocument();
    });
  });

  describe('limit creation', () => {
    it('creates a limit for the free category with the chosen threshold', async () => {
      mockBackend([TOTAL_LIMIT]);
      const user = await renderCard();
      const manager = await openManager(user);

      await user.click(within(manager).getByRole('button', { name: /Dodaj/ }));
      const dialog = await screen.findByRole('dialog', { name: 'Nowy limit' });
      expect(
        within(dialog).queryByRole('button', { name: 'Usuń limit' }),
      ).toBeNull();
      const threshold = within(dialog).getByLabelText(/Powiadom od/);
      await user.clear(threshold);
      await user.type(threshold, '50');
      await user.click(within(dialog).getByRole('button', { name: 'Zapisz' }));

      await gone('Nowy limit');
      expect(sent).toEqual([
        expect.objectContaining({
          scope: 'category',
          categoryId: 'c-1',
          alertAt: 50,
        }),
      ]);
      expect(
        await within(manager).findByText(/powiadomienie od 50%/),
      ).toBeInTheDocument();
    });

    it('cannot save a new limit when everything already has one', async () => {
      mockBackend([TOTAL_LIMIT, FOOD_LIMIT]);
      const user = await renderCard();
      const manager = await openManager(user);

      await user.click(within(manager).getByRole('button', { name: /Dodaj/ }));
      const dialog = await screen.findByRole('dialog', { name: 'Nowy limit' });

      expect(
        within(dialog).getByRole('button', { name: 'Zapisz' }),
      ).toBeDisabled();
    });
  });

  describe('new user', () => {
    it('sets the monthly limit from the empty state', async () => {
      mockBackend([]);
      const user = userEvent.setup();
      render(
        <Provider>
          <Harness />
        </Provider>,
      );

      const empty = await screen.findByRole('status');
      expect(
        within(empty).getByRole('heading', { name: 'Brak limitów' }),
      ).toBeInTheDocument();

      await user.click(
        within(empty).getByRole('button', { name: /Ustaw limit miesięczny/ }),
      );
      const dialog = await screen.findByRole('dialog', { name: 'Nowy limit' });
      await user.click(within(dialog).getByRole('button', { name: 'Zapisz' }));

      await gone('Nowy limit');
      expect(sent).toEqual([
        expect.objectContaining({ scope: 'total', alertAt: 80 }),
      ]);
    });
  });
});

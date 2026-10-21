import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { fakeSuggestions } from '@/__tests__/suggestions-backend';
import type { Suggestion } from '@/shared/form-memory/domain/suggestions';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

vi.mock('@/shared/router/navigation', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/router/navigation')>()),
  navigateTo: vi.fn(),
}));

const { Main } = await import('../presentation/main');

const FOOD = { id: 'c-1', name: 'Spożywcze', icon: 'cart', color: '#0a0' };

const saved = (
  field: Suggestion['field'],
  value: string,
  useCount: number,
): Suggestion => ({ field, value, useCount, lastUsed: null });

const server = setupServer();

const open = async (seed: Suggestion[]) => {
  const suggestions = fakeSuggestions(seed);
  server.use(
    ...suggestions.handlers,
    http.get('/api/categories/', () =>
      HttpResponse.json({ code: 200, data: [FOOD] }),
    ),
    http.get('/api/expenses/', () =>
      HttpResponse.json({ code: 200, data: [] }),
    ),
  );
  window.history.replaceState(null, '', '/app/expenses/new/');
  const user = userEvent.setup();
  render(<Main />);
  await screen.findByLabelText('Sklep');
  await waitFor(() =>
    expect(
      screen.getAllByRole('button', { name: /Podpowiedzi/ }).length,
    ).toBeGreaterThan(0),
  );
  return { user, suggestions };
};

const SEED = [
  saved('paymentMethod', 'Karta', 5),
  saved('paymentMethod', 'BLIK', 2),
  saved('merchant', 'Biedronka', 4),
];

const manage = async (
  user: Awaited<ReturnType<typeof open>>['user'],
  field: 'Metoda płatności' | 'Sklep',
) => {
  await user.click(
    screen.getByRole('button', { name: `Podpowiedzi: ${field}` }),
  );
  await user.click(screen.getByRole('button', { name: 'Zarządzaj' }));
  return screen.findByRole('dialog', {
    name: field === 'Sklep' ? 'Sklepy' : 'Metody płatności',
  });
};

describe('managing remembered payment methods and shops', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => {
    server.resetHandlers();
    window.localStorage.clear();
  });
  afterAll(() => server.close());

  it('ends the payment method list with a manage button', async () => {
    const { user } = await open(SEED);

    await user.click(
      screen.getByRole('button', { name: 'Podpowiedzi: Metoda płatności' }),
    );

    const list = screen.getByRole('listbox');
    expect(list.parentElement?.lastElementChild).toContainElement(
      screen.getByRole('button', { name: 'Zarządzaj' }),
    );
  });

  it('opens the shops manage popup from the shop list', async () => {
    const { user } = await open(SEED);

    const dialog = await manage(user, 'Sklep');

    expect(within(dialog).getByText('Biedronka')).toBeInTheDocument();
    expect(window.location.search).toContain('modal=manage-suggestions');
  });

  it('renames a payment method', async () => {
    const { user, suggestions } = await open(SEED);
    const dialog = await manage(user, 'Metoda płatności');

    await user.click(
      within(dialog).getByRole('button', { name: 'Zmień nazwę: BLIK' }),
    );
    const input = within(dialog).getByLabelText('Nowa nazwa: BLIK');
    await user.clear(input);
    await user.type(input, 'Przelew');
    await user.click(
      within(dialog).getByRole('button', { name: 'Zapisz nazwę' }),
    );

    expect(await within(dialog).findByText('Przelew')).toBeInTheDocument();
    expect(within(dialog).queryByText('BLIK')).not.toBeInTheDocument();
    await waitFor(() =>
      expect(suggestions.items().map((i) => i.value)).toContain('Przelew'),
    );
  });

  it('refuses a name that already exists', async () => {
    const { user } = await open(SEED);
    const dialog = await manage(user, 'Metoda płatności');

    await user.click(
      within(dialog).getByRole('button', { name: 'Zmień nazwę: BLIK' }),
    );
    const input = within(dialog).getByLabelText('Nowa nazwa: BLIK');
    await user.clear(input);
    await user.type(input, 'karta');
    await user.click(
      within(dialog).getByRole('button', { name: 'Zapisz nazwę' }),
    );

    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'Taka nazwa już istnieje.',
    );
  });

  it('deletes a shop only after confirmation', async () => {
    const { user, suggestions } = await open(SEED);
    const dialog = await manage(user, 'Sklep');

    await user.click(
      within(dialog).getByRole('button', { name: 'Usuń: Biedronka' }),
    );
    const confirm = await screen.findByRole('dialog', {
      name: 'Usunąć „Biedronka”?',
    });
    expect(suggestions.items().map((i) => i.value)).toContain('Biedronka');
    await user.click(within(confirm).getByRole('button', { name: 'Usuń' }));

    await waitFor(() =>
      expect(suggestions.items().map((i) => i.value)).not.toContain(
        'Biedronka',
      ),
    );
    expect(
      await screen.findByText('Nic tu jeszcze nie ma'),
    ).toBeInTheDocument();
  });

  it('keeps the value when deletion is cancelled', async () => {
    const { user, suggestions } = await open(SEED);
    const dialog = await manage(user, 'Sklep');

    await user.click(
      within(dialog).getByRole('button', { name: 'Usuń: Biedronka' }),
    );
    const confirm = await screen.findByRole('dialog', {
      name: 'Usunąć „Biedronka”?',
    });
    await user.click(within(confirm).getByRole('button', { name: 'Anuluj' }));

    expect(suggestions.items().map((i) => i.value)).toContain('Biedronka');
    expect(
      await screen.findByRole('dialog', { name: 'Sklepy' }),
    ).toBeInTheDocument();
  });

  it('restores a value and explains when the server refuses deletion', async () => {
    const { user } = await open(SEED);
    server.use(
      http.delete('/api/suggestions/', () =>
        HttpResponse.json({ code: 500, type: 'internal', message: 'Boom' }),
      ),
    );
    const dialog = await manage(user, 'Sklep');

    await user.click(
      within(dialog).getByRole('button', { name: 'Usuń: Biedronka' }),
    );
    await user.click(
      within(
        await screen.findByRole('dialog', { name: 'Usunąć „Biedronka”?' }),
      ).getByRole('button', { name: 'Usuń' }),
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'SUGGESTION_DELETE_FAILED',
    );
    expect(within(dialog).getByText('Biedronka')).toBeInTheDocument();
  });
});

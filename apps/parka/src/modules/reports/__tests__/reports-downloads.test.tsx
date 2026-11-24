import { render, screen, waitFor } from '@testing-library/react';
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
  vi,
} from 'vitest';
import { Main } from '../presentation/main';

const category = (id: string, name: string) => ({
  id,
  name,
  icon: 'cart',
  color: 'green',
});

const expense = (
  id: string,
  merchant: string,
  date: string,
  amount: number,
  categoryId: string,
) => ({
  id,
  merchant,
  date,
  amount,
  categoryId,
  paymentMethod: 'card',
  isBill: false,
  source: 'manual',
  items: [],
});

const recurring = (id: string, active: boolean) => ({
  id,
  name: id,
  cost: 10,
  nextPaymentDate: '2025-05-01',
  active,
  paymentMethod: 'card',
  categoryId: 'c-1',
  history: [],
});

const NOW = new Date().toISOString();

const server = setupServer();

let failing = false;

const stubApi = () =>
  server.use(
    http.get('/api/categories/', () =>
      failing
        ? HttpResponse.json({ code: 500, message: 'boom' })
        : HttpResponse.json({
            code: 200,
            data: [category('c-1', 'Jedzenie'), category('c-2', 'Dom')],
          }),
    ),
    http.get('/api/recurring/', () =>
      HttpResponse.json({
        code: 200,
        data: [
          recurring('r-1', true),
          recurring('r-2', true),
          recurring('r-3', false),
        ],
      }),
    ),
    http.get('/api/expenses/', () =>
      HttpResponse.json({
        code: 200,
        data: [
          expense('e-1', 'Biedronka', NOW, 12.5, 'c-1'),
          expense('e-2', 'Castorama', NOW, 30, 'c-2'),
          expense('e-3', 'Stary sklep', '2020-01-15T10:00:00.000Z', 99, 'c-1'),
        ],
      }),
    ),
  );

const saved: { name: string; blob: Blob }[] = [];
let lastBlob: Blob | null = null;

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());

beforeEach(() => {
  failing = false;
  saved.length = 0;
  lastBlob = null;
  URL.createObjectURL = (blob: Blob) => {
    lastBlob = blob;
    return 'blob:report';
  };
  URL.revokeObjectURL = () => {};
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
    this: HTMLAnchorElement,
  ) {
    if (lastBlob) saved.push({ name: this.download, blob: lastBlob });
  });
});

afterEach(() => {
  server.resetHandlers();
  vi.restoreAllMocks();
});

const loaded = async () => {
  stubApi();
  render(<Main />);
  const csv = screen.getByRole('button', { name: /Pobierz CSV/ });
  await waitFor(() => expect(csv).toHaveProperty('disabled', false));
};

describe('report summary', () => {
  it('sums only this month and counts its categories and active recurring', async () => {
    await loaded();

    expect(screen.getByText(/42,50/)).toBeTruthy();
    expect(screen.getByText('Kategorie').parentElement?.textContent).toBe(
      '2Kategorie',
    );
    expect(
      screen.getByText('Transakcje cykliczne').parentElement?.textContent,
    ).toBe('2Transakcje cykliczne');
  });
});

describe('report downloads', () => {
  it('downloads a CSV with this month rows only', async () => {
    await loaded();

    await userEvent.click(screen.getByRole('button', { name: /Pobierz CSV/ }));

    expect(saved).toHaveLength(1);
    expect(saved[0].name).toMatch(/^parka-raport-\d{4}-\d{2}\.csv$/);
    const csv = await saved[0].blob.text();
    expect(csv.split('\n')[0]).toBe('Data;Sklep;Kategoria;Kwota;Typ');
    expect(csv).toContain('Biedronka;Jedzenie;12.50;Zakup');
    expect(csv).toContain('Castorama;Dom;30.00;Zakup');
    expect(csv).not.toContain('Stary sklep');
  });

  it('downloads a full report with summary and rows', async () => {
    await loaded();

    await userEvent.click(
      screen.getByRole('button', { name: /Pobierz pełny raport/ }),
    );

    expect(saved).toHaveLength(1);
    expect(saved[0].name).toMatch(/^parka-raport-\d{4}-\d{2}\.txt$/);
    const text = await saved[0].blob.text();
    expect(text).toContain('Liczba kategorii: 2');
    expect(text).toContain('Transakcje cykliczne: 2');
    expect(text).toContain('Biedronka;Jedzenie;12.50;Zakup');
  });
});

describe('report load failure', () => {
  it('keeps downloads disabled, then recovers on retry', async () => {
    failing = true;
    stubApi();
    render(<Main />);

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('REPORTS_LOAD');
    expect(alert.textContent).toContain('boom');
    expect(screen.getByRole('button', { name: /Pobierz CSV/ })).toHaveProperty(
      'disabled',
      true,
    );

    failing = false;
    await userEvent.click(
      screen.getByRole('button', { name: 'Spróbuj ponownie' }),
    );

    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /Pobierz CSV/ }),
      ).toHaveProperty('disabled', false),
    );
  });
});

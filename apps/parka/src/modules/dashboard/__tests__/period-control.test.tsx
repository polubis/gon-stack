import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Main } from '../presentation/main';
import { readBody } from './dashboard-backend';

const TODAY = '2026-10-10T12:00:00Z';

const expense = (id: string, merchant: string, date: string) => ({
  id,
  merchant,
  date,
  amount: 12,
  categoryId: 'c-1',
  paymentMethod: 'card',
  isBill: false,
  source: 'manual',
  items: [],
});

const stubApi = () => {
  const fetchMock = vi.fn(async (url: string) => ({
    json: async () =>
      readBody(String(url), {
        categories: [
          { id: 'c-1', name: 'Jedzenie', icon: 'cart', color: 'green' },
        ],
        expenses: [
          expense('e-1', 'Sklep Dzisiejszy', '2026-10-10T10:00:00Z'),
          expense('e-2', 'Sklep Zeszłotygodniowy', '2026-10-03T10:00:00Z'),
          expense('e-3', 'Sklep Zeszłoroczny', '2025-06-03T10:00:00Z'),
        ],
      }),
  }));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

const asked = (fetchMock: ReturnType<typeof stubApi>) =>
  fetchMock.mock.calls
    .map(([url]) => String(url))
    .filter((url) => url.includes('/api/dashboard'));

const label = () => {
  const el = document.querySelector('[data-e2e="dashboard:period-label"]');
  if (!el) throw new Error('No period label.');
  return el;
};
const next = () =>
  screen.getByRole<HTMLButtonElement>('button', { name: 'Następny okres' });
const prev = () => screen.getByRole('button', { name: 'Poprzedni okres' });
const kindButton = () => screen.getByRole('button', { name: /^Zakres: / });
const valueButton = () => screen.getByRole('button', { name: /^Wybierz / });
/** Opens the range list from the icon and picks a kind. */
const kind = async (name: string) => {
  await userEvent.click(kindButton());
  await userEvent.click(screen.getByRole('button', { name }));
};
/** Opens the picker of the active period and returns its content. */
const openPicker = async (name: string) => {
  await userEvent.click(valueButton());
  return screen.getByLabelText(name);
};

const open = async (search = '') => {
  window.history.replaceState(null, '', `/app/${search}`);
  const fetchMock = stubApi();
  render(<Main />);
  await screen.findByText('Limity');
  return fetchMock;
};

describe('dashboard period control', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'], now: new Date(TODAY) });
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('opens on the current month and cannot go forward', async () => {
    await open();

    expect(label().textContent).toBe('Październik 2026');
    expect(kindButton().getAttribute('aria-label')).toBe('Zakres: Miesiąc');
    expect(next().disabled).toBe(true);
  });

  it('goes back and forward again, stopping at the present', async () => {
    const fetchMock = await open();

    await userEvent.click(prev());

    expect(label().textContent).toBe('Wrzesień 2026');
    expect(next().disabled).toBe(false);
    await waitFor(() =>
      expect(asked(fetchMock).at(-1)).toContain('kind=month&from=2026-09-01'),
    );

    await userEvent.click(next());

    expect(label().textContent).toBe('Październik 2026');
    expect(next().disabled).toBe(true);
  });

  it('does not ask for a future period when forward is blocked', async () => {
    const fetchMock = await open();
    const before = asked(fetchMock).length;

    await userEvent.click(next());

    expect(asked(fetchMock)).toHaveLength(before);
    expect(label().textContent).toBe('Październik 2026');
  });

  it('shows the current week, Monday to Sunday, and steps by week', async () => {
    const fetchMock = await open();

    await kind('Tydzień');

    expect(label().textContent).toBe('Tydzień 5–11 paź 2026');
    expect(screen.getByText('Wydatki w tym tygodniu')).toBeTruthy();
    await waitFor(() =>
      expect(asked(fetchMock).at(-1)).toContain('kind=week&from=2026-10-05'),
    );

    await userEvent.click(prev());

    expect(label().textContent).toMatch(/^Tydzień 28 wrz–4 paź 2026$/);
    expect(next().disabled).toBe(false);
  });

  it('shows a single day and steps by day', async () => {
    await open();

    await kind('Dzień');

    expect(label().textContent).toBe('10 października 2026');
    expect(next().disabled).toBe(true);

    await userEvent.click(prev());

    expect(label().textContent).toBe('9 października 2026');
  });

  it('shows the current year, then last year, then back to this one', async () => {
    const fetchMock = await open();

    await kind('Rok');
    expect(label().textContent).toBe('2026');
    expect(next().disabled).toBe(true);

    await userEvent.click(prev());
    expect(label().textContent).toBe('2025');
    await waitFor(() =>
      expect(asked(fetchMock).at(-1)).toContain('kind=year&from=2025-01-01'),
    );

    await userEvent.click(next());
    expect(label().textContent).toBe('2026');
    expect(next().disabled).toBe(true);
  });

  it('lists only the expenses of the selected period', async () => {
    await open();

    await kind('Dzień');
    expect(
      screen.getByRole('button', { name: /Sklep Dzisiejszy/ }),
    ).toBeTruthy();
    expect(
      screen.queryByRole('button', { name: /Zeszłotygodniowy/ }),
    ).toBeNull();

    await kind('Miesiąc');
    await userEvent.click(prev());
    expect(
      screen.queryByRole('button', { name: /Sklep Dzisiejszy/ }),
    ).toBeNull();
    expect(
      within(screen.getByRole('region', { name: 'Wydatki' })).getByText(
        'Brak wydatków w tym okresie.',
      ),
    ).toBeTruthy();

    await kind('Rok');
    await userEvent.click(prev());
    expect(screen.getByRole('button', { name: /Zeszłoroczny/ })).toBeTruthy();
  });

  it('works from the keyboard', async () => {
    await open();
    prev().focus();

    await userEvent.keyboard('{Enter}');

    expect(label().textContent).toBe('Wrzesień 2026');
    expect(document.activeElement).toBe(prev());
  });

  it('keeps the period in the address', async () => {
    await open();

    await kind('Tydzień');
    expect(window.location.search).toBe('?range=week&from=2026-10-05');

    await kind('Miesiąc');
    expect(window.location.search).toBe('?month=2026-10');
  });

  it('restores a period from the address', async () => {
    await open('?range=year&from=2025-01-01');

    expect(label().textContent).toBe('2025');
  });

  it('snaps a future period from the address back to the present', async () => {
    const fetchMock = await open('?month=2030-01');

    expect(label().textContent).toBe('Październik 2026');
    expect(asked(fetchMock).every((url) => !url.includes('2030'))).toBe(true);
  });

  it('keeps the data visible while the next period loads', async () => {
    await open();
    let release = () => {};
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (url: string) =>
          new Promise((resolve) => {
            release = () =>
              resolve({ json: async () => readBody(String(url)) });
          }),
      ),
    );

    await userEvent.click(prev());

    expect(screen.getByText('Wydatki w tym miesiącu')).toBeTruthy();
    expect(screen.getByText('Ładowanie danych')).toBeTruthy();
    release();
  });

  describe('quick jump', () => {
    const optionNames = (list: HTMLElement) =>
      within(list)
        .getAllByRole('button')
        .map((b) => b.textContent);

    it('jumps to a chosen month from a list without future months', async () => {
      const fetchMock = await open();
      const list = await openPicker('Wybierz miesiąc');
      const names = optionNames(list);
      expect(names[0]).toBe('Październik 2026');
      expect(names).not.toContain('Listopad 2026');

      await userEvent.click(
        within(list).getByRole('button', { name: 'Marzec 2026' }),
      );

      expect(label().textContent).toBe('Marzec 2026');
      expect(screen.queryByLabelText('Wybierz miesiąc')).toBeNull();
      await waitFor(() =>
        expect(asked(fetchMock).at(-1)).toContain('kind=month&from=2026-03-01'),
      );
    });

    it('opens the picker of the chosen range', async () => {
      await open();
      await kind('Tydzień');

      const list = await openPicker('Wybierz tydzień');

      expect(optionNames(list)[0]).toBe('Tydzień 5–11 paź 2026');
    });

    it('jumps to a chosen day', async () => {
      await open();
      await kind('Dzień');
      const input = (await openPicker('Wybierz dzień')) as HTMLInputElement;
      expect(input.type).toBe('date');
      expect(input.max).toBe('2026-10-10');

      fireEvent.change(input, { target: { value: '2026-02-14' } });

      expect(label().textContent).toBe('14 lutego 2026');
    });

    it('jumps to a chosen week', async () => {
      await open();
      await kind('Tydzień');
      const list = await openPicker('Wybierz tydzień');

      await userEvent.click(
        within(list).getByRole('button', { name: 'Tydzień 2–8 mar 2026' }),
      );

      expect(label().textContent).toBe('Tydzień 2–8 mar 2026');
    });

    it('lists only years up to the present and jumps to one', async () => {
      await open();
      await kind('Rok');
      const list = await openPicker('Wybierz rok');
      const years = optionNames(list);
      expect(years[0]).toBe('2026');
      expect(years).not.toContain('2027');

      await userEvent.click(within(list).getByRole('button', { name: '2022' }));

      expect(label().textContent).toBe('2022');
    });

    it('keeps the kind list and the picker reachable from the keyboard', async () => {
      await open();
      prev().focus();

      // Next is disabled at the present, so the period follows right away.
      await userEvent.tab();
      expect(document.activeElement).toBe(valueButton());
      await userEvent.tab();
      expect(document.activeElement).toBe(kindButton());

      await userEvent.keyboard('{Enter}');
      expect(screen.getByRole('button', { name: 'Rok' })).toBeTruthy();
    });
  });

  describe('own range', () => {
    const apply = async (from: string, to: string) => {
      await userEvent.click(valueButton());
      fireEvent.change(screen.getByLabelText('Od'), {
        target: { value: from },
      });
      fireEvent.change(screen.getByLabelText('Do'), { target: { value: to } });
      await userEvent.click(screen.getByRole('button', { name: 'Zastosuj' }));
    };

    it('starts with the last seven days', async () => {
      await open();

      await kind('Własny');

      expect(label().textContent).toBe('4 paź – 10 paź 2026');
      expect(next().disabled).toBe(true);
    });

    it('shows the chosen from-to range and asks for it', async () => {
      const fetchMock = await open();
      await kind('Własny');

      await apply('2026-09-01', '2026-09-30');

      expect(label().textContent).toBe('1 wrz – 30 wrz 2026');
      await waitFor(() =>
        expect(asked(fetchMock).at(-1)).toContain(
          'kind=custom&from=2026-09-01&to=2026-09-30',
        ),
      );
      expect(window.location.search).toBe(
        '?range=custom&from=2026-09-01&to=2026-09-30',
      );
    });

    it('steps by its own length', async () => {
      await open();
      await kind('Własny');
      await apply('2026-09-01', '2026-09-30');

      await userEvent.click(prev());

      expect(label().textContent).toBe('2 sie – 31 sie 2026');
      await userEvent.click(next());
      expect(label().textContent).toBe('1 wrz – 30 wrz 2026');
    });

    it('refuses an end date before the start', async () => {
      await open();
      await kind('Własny');
      await userEvent.click(valueButton());

      fireEvent.change(screen.getByLabelText('Od'), {
        target: { value: '2026-10-05' },
      });
      fireEvent.change(screen.getByLabelText('Do'), {
        target: { value: '2026-10-01' },
      });

      expect(screen.getByRole('alert').textContent).toMatch(/przed/);
      expect(
        screen.getByRole<HTMLButtonElement>('button', { name: 'Zastosuj' })
          .disabled,
      ).toBe(true);
    });

    it('restores the range from the address', async () => {
      await open('?range=custom&from=2026-08-10&to=2026-08-20');

      expect(label().textContent).toBe('10 sie – 20 sie 2026');
    });

    it('cuts the end of a range at the present', async () => {
      await open('?range=custom&from=2026-10-01&to=2027-01-01');

      expect(label().textContent).toBe('1 paź – 10 paź 2026');
    });
  });

  describe('limit scaled to the period', () => {
    const openWithLimit = async () => {
      window.history.replaceState(null, '', '/app/');
      vi.stubGlobal(
        'fetch',
        vi.fn(async (url: string) => {
          const body = readBody(String(url), {
            limits: [
              {
                id: 'l-0',
                scope: 'total',
                amount: 3100,
                alertAt80: true,
                delivery: 'push',
              },
            ],
          });
          return {
            json: async () =>
              String(url).includes('/api/dashboard')
                ? { ...body, data: { ...body.data, monthlyLimit: 3100 } }
                : body,
          };
        }),
      );
      render(<Main />);
      await screen.findByText('Limity');
    };
    const stat = (label: string) =>
      screen.getByText(label).parentElement?.textContent ?? '';

    it('shows the whole monthly limit for a month', async () => {
      await openWithLimit();

      expect(stat('Do limitu na miesiąc')).toMatch(/3.?090,00/);
    });

    it('shows a seventh-of-a-month share for a week', async () => {
      await openWithLimit();

      await kind('Tydzień');

      expect(stat('Do limitu na tydzień')).toMatch(/690,00/);
    });

    it('shows one day of the limit for a day', async () => {
      await openWithLimit();

      await kind('Dzień');

      expect(stat('Do limitu na dzień')).toMatch(/90,00/);
    });

    it('shows twelve months of the limit for a year', async () => {
      await openWithLimit();

      await kind('Rok');

      expect(stat('Do limitu na rok')).toMatch(/37.190,00/);
    });

    it('labels the limits card with what the limit covers', async () => {
      await openWithLimit();

      await kind('Tydzień');

      const card = screen.getByRole('region', { name: 'Limity' });
      expect(within(card).getByText(/Limit na tydzień/)).toBeTruthy();
    });
  });
});

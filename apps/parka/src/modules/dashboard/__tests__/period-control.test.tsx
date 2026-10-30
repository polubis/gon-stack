import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { pickOption } from '@/__tests__/pick-option';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Main } from '../presentation/main';
import { answerApi, readBody, startBackend } from './dashboard-backend';

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

const server = startBackend();

const stubApi = () =>
  answerApi(server, ({ url }) =>
    readBody(url, {
      categories: [
        { id: 'c-1', name: 'Jedzenie', icon: 'cart', color: 'green' },
      ],
      expenses: [
        expense('e-1', 'Sklep Dzisiejszy', '2026-10-10T10:00:00Z'),
        expense('e-2', 'Sklep Zeszłotygodniowy', '2026-10-03T10:00:00Z'),
        expense('e-3', 'Sklep Zeszłoroczny', '2025-06-03T10:00:00Z'),
      ],
    }),
  );

const asked = (calls: ReturnType<typeof stubApi>) =>
  calls.map(({ url }) => url).filter((url) => url.includes('/api/dashboard'));

const label = () => {
  const el = document.querySelector('[data-e2e="period-control:label"]');
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
  const calls = stubApi();
  render(<Main />);
  await screen.findByText('Limity');
  return calls;
};

describe('dashboard period control', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'], now: new Date(TODAY) });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('swipes right to the previous month and left to come back', async () => {
    await open();
    const main = screen.getByRole('main');
    const swipe = (from: number, to: number) => {
      fireEvent.touchStart(main, {
        touches: [{ clientX: from, clientY: 200 }],
      });
      fireEvent.touchEnd(main, {
        changedTouches: [{ clientX: to, clientY: 205 }],
      });
    };

    swipe(300, 100);
    expect(label().textContent).toBe('10.2026');

    swipe(100, 300);
    await waitFor(() => expect(label().textContent).toBe('09.2026'));

    swipe(300, 100);
    await waitFor(() => expect(label().textContent).toBe('10.2026'));
  });

  it('ignores swipes on a device with a mouse', async () => {
    vi.stubGlobal(
      'matchMedia',
      (query: string) =>
        ({
          matches: false,
          media: query,
          addEventListener: () => {},
          removeEventListener: () => {},
        }) as unknown as MediaQueryList,
    );
    await open();
    const main = screen.getByRole('main');

    fireEvent.touchStart(main, { touches: [{ clientX: 100, clientY: 200 }] });
    fireEvent.touchMove(main, { touches: [{ clientX: 300, clientY: 200 }] });
    fireEvent.touchEnd(main, {
      changedTouches: [{ clientX: 300, clientY: 205 }],
    });

    expect(main.style.transform).toBe('');
    expect(label().textContent).toBe('10.2026');
    vi.unstubAllGlobals();
  });

  it('resists a drag towards the future and snaps back', async () => {
    await open();
    const main = screen.getByRole('main');

    fireEvent.touchStart(main, { touches: [{ clientX: 300, clientY: 200 }] });
    fireEvent.touchMove(main, { touches: [{ clientX: 200, clientY: 200 }] });
    expect(main.style.transform).toBe('translateX(-20px)');

    fireEvent.touchEnd(main, {
      changedTouches: [{ clientX: 200, clientY: 200 }],
    });
    expect(main.style.transform).toBe('');
    expect(label().textContent).toBe('10.2026');
  });

  it('opens the previous month without asking for it again', async () => {
    const calls = await open();
    await waitFor(() =>
      expect(asked(calls).join(' ')).toContain('from=2026-09-01'),
    );

    await userEvent.click(prev());

    await waitFor(() => expect(label().textContent).toBe('09.2026'));
    expect(
      asked(calls).filter((url) => url.includes('from=2026-09-01')),
    ).toHaveLength(1);
  });

  it('opens on the current month and cannot go forward', async () => {
    await open();

    expect(label().textContent).toBe('10.2026');
    expect(kindButton().getAttribute('aria-label')).toBe('Zakres: Miesiąc');
    expect(next().disabled).toBe(true);
  });

  it('goes back and forward again, stopping at the present', async () => {
    const calls = await open();

    await userEvent.click(prev());

    expect(label().textContent).toBe('09.2026');
    expect(next().disabled).toBe(false);
    await waitFor(() =>
      expect(asked(calls).join(' ')).toContain('kind=month&from=2026-09-01'),
    );

    await userEvent.click(next());

    expect(label().textContent).toBe('10.2026');
    expect(next().disabled).toBe(true);
  });

  it('does not ask for a future period when forward is blocked', async () => {
    const calls = await open();
    const before = asked(calls).length;

    await userEvent.click(next());

    expect(asked(calls)).toHaveLength(before);
    expect(label().textContent).toBe('10.2026');
  });

  it('shows the current week, Monday to Sunday, and steps by week', async () => {
    const calls = await open();

    await kind('Tydzień');

    expect(label().textContent).toBe('05.10.2026 – 11.10.2026');
    expect(screen.getByText('Wydatki w tym tygodniu')).toBeTruthy();
    await waitFor(() =>
      expect(asked(calls).join(' ')).toContain('kind=week&from=2026-10-05'),
    );

    await userEvent.click(prev());

    expect(label().textContent).toMatch(/^28.09.2026 – 04.10.2026$/);
    expect(next().disabled).toBe(false);
  });

  it('shows a single day and steps by day', async () => {
    await open();

    await kind('Dzień');

    expect(label().textContent).toBe('10.10.2026');
    expect(next().disabled).toBe(true);

    await userEvent.click(prev());

    expect(label().textContent).toBe('09.10.2026');
  });

  it('returns to the present with Dziś', async () => {
    await open();
    await userEvent.click(prev());
    expect(label().textContent).toBe('09.2026');

    await userEvent.click(kindButton());
    await userEvent.click(screen.getByRole('button', { name: 'Dziś' }));

    expect(label().textContent).toBe('10.2026');
    expect(next().disabled).toBe(true);
  });

  it('shows the current year, then last year, then back to this one', async () => {
    const calls = await open();

    await kind('Rok');
    expect(label().textContent).toBe('2026');
    expect(next().disabled).toBe(true);

    await userEvent.click(prev());
    expect(label().textContent).toBe('2025');
    await waitFor(() =>
      expect(asked(calls).join(' ')).toContain('kind=year&from=2025-01-01'),
    );

    await userEvent.click(next());
    expect(label().textContent).toBe('2026');
    expect(next().disabled).toBe(true);
  });

  it('lists only the expenses of the selected period', async () => {
    await open();

    await kind('Dzień');
    expect(
      screen.getByRole('button', { name: /^Sklep Dzisiejszy/ }),
    ).toBeTruthy();
    expect(
      screen.queryByRole('button', { name: /Zeszłotygodniowy/ }),
    ).toBeNull();

    await kind('Miesiąc');
    await userEvent.click(prev());
    expect(
      screen.queryByRole('button', { name: /^Sklep Dzisiejszy/ }),
    ).toBeNull();
    expect(
      within(screen.getByRole('region', { name: 'Wydatki' })).getByText(
        'Brak wydatków w tym okresie.',
      ),
    ).toBeTruthy();

    await kind('Rok');
    await userEvent.click(prev());
    expect(
      screen.getByRole('button', { name: /^(?!Więcej).*Zeszłoroczny/ }),
    ).toBeTruthy();
  });

  it('works from the keyboard', async () => {
    await open();
    prev().focus();

    await userEvent.keyboard('{Enter}');

    expect(label().textContent).toBe('09.2026');
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
    const calls = await open('?month=2030-01');

    expect(label().textContent).toBe('10.2026');
    expect(asked(calls).every((url) => !url.includes('2030'))).toBe(true);
  });

  it('keeps the data visible while the next period loads', async () => {
    await open();
    let release = () => {};
    server.use(
      http.all(
        '/api/*',
        ({ request }) =>
          new Promise<Response>((resolve) => {
            release = () => resolve(HttpResponse.json(readBody(request.url)));
          }),
      ),
    );

    await userEvent.click(prev());
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
      const calls = await open();
      const list = await openPicker('Wybierz miesiąc');
      const names = optionNames(list);
      expect(names[0]).toBe('10.2026');
      expect(names).not.toContain('Listopad 2026');

      await userEvent.click(
        within(list).getByRole('button', { name: '03.2026' }),
      );

      expect(label().textContent).toBe('03.2026');
      expect(screen.queryByLabelText('Wybierz miesiąc')).toBeNull();
      await waitFor(() =>
        expect(asked(calls).join(' ')).toContain('kind=month&from=2026-03-01'),
      );
    });

    it('opens the picker of the chosen range', async () => {
      await open();
      await kind('Tydzień');

      const list = await openPicker('Wybierz tydzień');

      expect(optionNames(list)[0]).toBe('05.10.2026 – 11.10.2026');
    });

    it('jumps to a chosen day', async () => {
      await open();
      await kind('Dzień');
      const input = (await openPicker('Wybierz dzień')) as HTMLInputElement;
      expect(input.type).toBe('date');
      expect(input.max).toBe('2026-10-10');

      fireEvent.change(input, { target: { value: '2026-02-14' } });

      expect(label().textContent).toBe('14.02.2026');
    });

    it('jumps to a chosen week', async () => {
      await open();
      await kind('Tydzień');
      const list = await openPicker('Wybierz tydzień');

      await userEvent.click(
        within(list).getByRole('button', { name: '02.03.2026 – 08.03.2026' }),
      );

      expect(label().textContent).toBe('02.03.2026 – 08.03.2026');
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
    const dialog = () => screen.getByRole('dialog', { name: 'Własny zakres' });
    const day = (name: string) =>
      within(dialog()).getByRole('button', { name });
    const applyButton = () =>
      within(dialog()).getByRole<HTMLButtonElement>('button', {
        name: 'Zastosuj',
      });
    /** Picks days in the calendar, going back `months` months first. */
    const choose = async (months: number, from: string, to: string) => {
      for (let i = 0; i < months; i++)
        await userEvent.click(
          within(dialog()).getByRole('button', { name: 'Poprzedni miesiąc' }),
        );
      await userEvent.click(day(from));
      await userEvent.click(day(to));
    };
    const apply = async (months: number, from: string, to: string) => {
      await choose(months, from, to);
      await userEvent.click(applyButton());
    };

    it('opens a modal with a calendar as soon as own range is chosen', async () => {
      await open();

      await kind('Własny');

      expect(dialog()).toBeTruthy();
      expect(screen.queryByLabelText('Od')).toBeNull();
      expect(window.location.search).toContain('modal=period-range');
      expect(day('10 października 2026').getAttribute('aria-pressed')).toBe(
        'true',
      );
    });

    it('shows the chosen from-to range and asks for it', async () => {
      const calls = await open();
      await kind('Własny');

      await apply(1, '1 września 2026', '30 września 2026');

      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      expect(label().textContent).toBe('01.09.2026 – 30.09.2026');
      await waitFor(() =>
        expect(asked(calls).join(' ')).toContain(
          'kind=custom&from=2026-09-01&to=2026-09-30',
        ),
      );
      expect(window.location.search).toContain(
        'range=custom&from=2026-09-01&to=2026-09-30',
      );
    });

    it('reopens the modal from the period label', async () => {
      await open();
      await kind('Własny');
      await apply(1, '1 września 2026', '30 września 2026');
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());

      await userEvent.click(valueButton());

      expect(dialog()).toBeTruthy();
      expect(day('1 września 2026').getAttribute('aria-pressed')).toBe('true');
    });

    it('steps by its own length', async () => {
      await open();
      await kind('Własny');
      await apply(1, '1 września 2026', '30 września 2026');
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());

      await userEvent.click(prev());

      expect(label().textContent).toBe('02.08.2026 – 31.08.2026');
      await userEvent.click(next());
      expect(label().textContent).toBe('01.09.2026 – 30.09.2026');
    });

    it('waits for both days before it can be applied', async () => {
      await open();
      await kind('Własny');

      await userEvent.click(day('5 października 2026'));

      expect(applyButton().disabled).toBe(true);
      await userEvent.click(day('8 października 2026'));
      expect(applyButton().disabled).toBe(false);
    });

    it('starts again from an earlier second click', async () => {
      await open();
      await kind('Własny');

      await userEvent.click(day('5 października 2026'));
      await userEvent.click(day('1 października 2026'));

      expect(applyButton().disabled).toBe(true);
      expect(day('1 października 2026').getAttribute('aria-pressed')).toBe(
        'true',
      );
      expect(day('5 października 2026').getAttribute('aria-pressed')).toBe(
        'false',
      );
    });

    it('does not offer days after today', async () => {
      await open();
      await kind('Własny');

      expect(day('11 października 2026').hasAttribute('disabled')).toBe(true);
      expect(
        within(dialog())
          .getByRole('button', { name: 'Następny miesiąc' })
          .hasAttribute('disabled'),
      ).toBe(true);
    });

    const monthTitle = () =>
      within(dialog()).getByRole('button', { name: /wybierz miesiąc i rok/ });
    const jumpTo = async (year: string, month: string) => {
      await userEvent.click(monthTitle());
      await pickOption(
        userEvent.setup(),
        within(dialog()).getByRole('combobox', { name: 'Rok' }),
        year,
      );
      await userEvent.click(
        within(dialog()).getByRole('button', { name: month }),
      );
    };

    it('jumps to a chosen month of another year in a few taps', async () => {
      await open();
      await kind('Własny');

      await jumpTo('2023', 'marzec');

      expect(monthTitle().textContent).toBe('marzec 2023');
      expect(day('1 marca 2023')).toBeTruthy();
      expect(document.activeElement).toBe(monthTitle());
    });

    it('picks days after a jump and applies them', async () => {
      await open();
      await kind('Własny');

      await jumpTo('2025', 'czerwiec');
      await userEvent.click(day('3 czerwca 2025'));
      await userEvent.click(day('9 czerwca 2025'));
      await userEvent.click(applyButton());

      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      expect(label().textContent).toBe('03.06.2025 – 09.06.2025');
    });

    it('steps the year with arrows and never past the present', async () => {
      await open();
      await kind('Własny');
      await userEvent.click(monthTitle());
      const nextYear = within(dialog()).getByRole<HTMLButtonElement>('button', {
        name: 'Następny rok',
      });

      expect(nextYear.disabled).toBe(true);
      await userEvent.click(
        within(dialog()).getByRole('button', { name: 'Poprzedni rok' }),
      );

      expect(nextYear.disabled).toBe(false);
      expect(
        within(dialog()).getByRole('combobox', { name: 'Rok' }),
      ).toHaveTextContent('2025');
    });

    it('does not offer months after the present', async () => {
      await open();
      await kind('Własny');
      await userEvent.click(monthTitle());

      const grid = within(dialog());
      expect(
        grid.getByRole<HTMLButtonElement>('button', { name: 'październik' })
          .disabled,
      ).toBe(false);
      expect(
        grid.getByRole<HTMLButtonElement>('button', { name: 'listopad' })
          .disabled,
      ).toBe(true);
      expect(grid.queryByRole('option', { name: '2027' })).toBeNull();
    });

    it('opens the month grid from the keyboard and returns focus', async () => {
      await open();
      await kind('Własny');
      monthTitle().focus();

      await userEvent.keyboard('{Enter}');

      expect(monthTitle().getAttribute('aria-expanded')).toBe('true');
      expect(document.activeElement).toBe(
        within(dialog()).getByRole('button', { name: 'październik' }),
      );
      await userEvent.keyboard('{Enter}');
      expect(monthTitle().getAttribute('aria-expanded')).toBe('false');
      expect(document.activeElement).toBe(monthTitle());
    });

    it('keeps the selected days while jumping around', async () => {
      await open();
      await kind('Własny');
      await userEvent.click(day('5 października 2026'));

      await jumpTo('2025', 'styczeń');
      await jumpTo('2026', 'październik');

      expect(day('5 października 2026').getAttribute('aria-pressed')).toBe(
        'true',
      );
    });

    it('closes without changing the range', async () => {
      await open();
      await kind('Własny');

      await userEvent.click(
        within(dialog()).getByRole('button', { name: 'Zamknij' }),
      );

      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      expect(label().textContent).toBe('04.10.2026 – 10.10.2026');
    });

    it('restores the range from the address', async () => {
      await open('?range=custom&from=2026-08-10&to=2026-08-20');

      expect(label().textContent).toBe('10.08.2026 – 20.08.2026');
    });

    it('cuts the end of a range at the present', async () => {
      await open('?range=custom&from=2026-10-01&to=2027-01-01');

      expect(label().textContent).toBe('01.10.2026 – 10.10.2026');
    });
  });

  describe('limit scaled to the period', () => {
    const openWithLimit = async () => {
      window.history.replaceState(null, '', '/app/');
      answerApi(server, ({ url }) => {
        const body = readBody(url, {
          limits: [
            {
              id: 'l-0',
              scope: 'total',
              amount: 3100,
              alertAt: 80,
            },
          ],
        });
        return url.includes('/api/dashboard')
          ? { ...body, data: { ...body.data, monthlyLimit: 3100 } }
          : body;
      });
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

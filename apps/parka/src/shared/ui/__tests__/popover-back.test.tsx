import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ExpenseMenu } from '@/modules/dashboard/presentation/expense-menu';
import type { Expense } from '@/modules/dashboard/domain/models';
import { AddMenu } from '@/modules/dashboard/presentation/add-menu';
import { PeriodControl } from '@/shared/period-control/presentation/period-control';
import { currentPeriod } from '@/shared/period/period';
import { SelectPopover } from '../select-popover';

const expense = { id: 'e-1', merchant: 'Lidl', date: '2026-10-01' } as Expense;

const TODAY = '2026-10-10';

const useScreen = (narrow: boolean) =>
  vi.stubGlobal(
    'matchMedia',
    (query: string) =>
      ({
        matches: narrow,
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      }) as unknown as MediaQueryList,
  );

const period = (
  <PeriodControl
    period={currentPeriod('month', TODAY)}
    today={TODAY}
    onChange={() => {}}
  />
);

const cases = [
  {
    name: 'menu',
    ui: <ExpenseMenu expense={expense} />,
    trigger: { name: 'Więcej: Lidl' },
    content: () => screen.queryByRole('menu'),
  },
  {
    name: 'add menu',
    ui: <AddMenu side="top">Dodaj</AddMenu>,
    trigger: { name: 'Dodaj' },
    content: () => screen.queryByRole('menu', { name: 'Dodaj' }),
  },
  {
    name: 'period value popover',
    ui: period,
    trigger: { name: /^Wybierz miesiąc/ },
    content: () => screen.queryByLabelText('Wybierz miesiąc', { exact: true }),
  },
  {
    name: 'period kind popover',
    ui: period,
    trigger: { name: /^Zakres: / },
    content: () => screen.queryByRole('list', { name: 'Zakres' }),
  },
  {
    name: 'select popover',
    ui: (
      <SelectPopover label="Kolor" value="Zielony">
        {() => <p>Panel koloru</p>}
      </SelectPopover>
    ),
    trigger: { name: /Kolor/ },
    content: () => screen.queryByText('Panel koloru'),
  },
];

describe.each(cases)('$name on a phone', ({ ui, trigger, content }) => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
    useScreen(true);
  });
  afterEach(() => vi.unstubAllGlobals());

  it('closes on the system Back button', async () => {
    render(ui);
    await userEvent.click(screen.getByRole('button', trigger));
    expect(content()).toBeTruthy();

    window.history.back();

    await waitFor(() => expect(content()).toBeNull());
  });

  it('keeps itself in the URL while open and leaves it once closed', async () => {
    render(ui);
    const modals = () =>
      new URLSearchParams(window.location.search).getAll('modal');

    await userEvent.click(screen.getByRole('button', trigger));
    expect(modals()).toHaveLength(1);

    await userEvent.keyboard('{Escape}');

    await waitFor(() => expect(content()).toBeNull());
    await waitFor(() => expect(modals()).toHaveLength(0));
  });
});

describe('two add menus on one phone page', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
    useScreen(true);
  });
  afterEach(() => vi.unstubAllGlobals());

  const renderBoth = () =>
    render(
      <>
        <AddMenu side="bottom">Dodaj w nagłówku</AddMenu>
        <AddMenu side="top">Dodaj pływający</AddMenu>
      </>,
    );

  it('opens only the one that was pressed', async () => {
    renderBoth();

    await userEvent.click(
      screen.getByRole('button', { name: 'Dodaj pływający' }),
    );

    expect(screen.getAllByRole('menu')).toHaveLength(1);
    expect(
      screen.getByRole('button', { name: 'Dodaj w nagłówku' }),
    ).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes only the opened one on Back', async () => {
    renderBoth();
    await userEvent.click(
      screen.getByRole('button', { name: 'Dodaj w nagłówku' }),
    );

    window.history.back();

    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    expect(
      screen.getByRole('button', { name: 'Dodaj pływający' }),
    ).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('menu on a desktop', () => {
  beforeEach(() => useScreen(false));
  afterEach(() => vi.unstubAllGlobals());

  it('opens without touching the URL', async () => {
    render(<ExpenseMenu expense={expense} />);

    await userEvent.click(screen.getByRole('button', { name: 'Więcej: Lidl' }));

    expect(screen.getByRole('menu')).toBeTruthy();
    expect(window.location.search).toBe('');
  });
});

import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderTime } from './render-time';
import { task, setupTimeBackend } from './time-backend';

const backend = setupTimeBackend();

afterEach(() => vi.useRealTimers());

describe('date labels in time', () => {
  it('names weekday, day and month on each day of the week', async () => {
    backend.seed([task()]);
    renderTime('week');

    const heading = await screen.findByRole('heading', {
      name: 'wtorek, 20 października',
    });

    expect(within(heading).getByText('wt.')).toBeInTheDocument();
    expect(within(heading).getByText('20 paź')).toBeInTheDocument();
  });

  it('names the weekday over every column of the month', async () => {
    backend.seed([task()]);
    renderTime('month');

    await screen.findByRole('listitem', {
      name: 'wtorek, 20 października, 1 zadanie',
    });

    expect(screen.getByText('niedz.')).toBeInTheDocument();
  });

  it('shows the full date in task details', async () => {
    const user = userEvent.setup();
    backend.seed([task({ at: '09:00' })]);
    renderTime();
    await user.click(
      await screen.findByRole('button', {
        name: 'Szczegóły zadania: Raport miesięczny',
      }),
    );

    const details = within(await screen.findByRole('dialog'));

    expect(
      details.getByText('wtorek, 20 października 2026, 09:00'),
    ).toBeVisible();
  });

  it('shows the date each quick move leads to', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    renderTime();
    await user.click(
      await screen.findByRole('button', { name: 'Więcej: Raport miesięczny' }),
    );

    const tomorrow = await screen.findByRole('menuitem', {
      name: 'Przenieś na jutro: Raport miesięczny',
    });

    expect(tomorrow).toHaveTextContent('śr. 21 paź');
  });

  it('shows the weekday of the day chosen for a new task', async () => {
    const user = userEvent.setup();
    renderTime();
    await user.click(
      await screen.findByRole('button', { name: 'Dodaj zadanie' }),
    );

    const dialog = within(await screen.findByRole('dialog'));

    expect(dialog.getByText('wtorek, 20 października 2026')).toBeVisible();
  });
});

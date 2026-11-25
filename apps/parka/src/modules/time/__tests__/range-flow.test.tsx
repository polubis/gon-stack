import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { registerNavigator } from '@/shared/router/navigation';
import { renderTime } from './render-time';
import { setupTimeBackend, task } from './time-backend';

const backend = setupTimeBackend();

afterEach(() => {
  vi.useRealTimers();
  registerNavigator(null);
});

const seedRange = () =>
  backend.seed([
    task({ id: 't-1', title: 'Przed zakresem', day: '2026-10-05' }),
    task({ id: 't-2', title: 'Pierwszy w zakresie', day: '2026-10-12' }),
    task({
      id: 't-3',
      title: 'Drugi w zakresie',
      day: '2026-10-15',
      done: true,
    }),
    task({ id: 't-4', title: 'Po zakresie', day: '2026-10-25' }),
  ]);

/** Navigator writing the real history (popovers live in it) and reporting pushes. */
const historyNavigator = (push: (path: string) => void) => ({
  push: (path: string, state?: Record<string, unknown>) => {
    push(path);
    window.history.pushState(state ?? null, '', path);
  },
  replace: (path: string, state?: Record<string, unknown>) =>
    window.history.replaceState(state ?? window.history.state, '', path),
});

const open = () => renderTime('custom', '2026-10-10', '&to=2026-10-20');

describe('own range view', () => {
  it('lists only tasks of the days in the range, grouped by day', async () => {
    seedRange();
    open();

    expect(
      await screen.findByRole('button', {
        name: 'Szczegóły zadania: Pierwszy w zakresie',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: 'Szczegóły zadania: Drugi w zakresie',
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Przed zakresem')).toBeNull();
    expect(screen.queryByText('Po zakresie')).toBeNull();
    expect(screen.getAllByRole('heading', { level: 2 }).length).toBeGreaterThan(
      1,
    );
  });

  it('shows the statistics of the range only', async () => {
    seedRange();
    backend.state.moves = [
      { taskId: 't-2', at: '2026-10-13T08:00:00.000Z' },
      { taskId: 't-1', at: '2026-10-01T08:00:00.000Z' },
    ];
    open();
    await screen.findByText('Pierwszy w zakresie');

    const card = (
      await screen.findByRole('heading', { name: 'Przeniesienia' })
    ).closest('div.rounded-3xl') as HTMLElement;
    expect(await within(card).findAllByText('1')).toHaveLength(2);
    expect(screen.getAllByText('50%').length).toBeGreaterThan(0);
  });

  it('names the range when it holds no tasks', async () => {
    seedRange();
    renderTime('custom', '2026-09-01', '&to=2026-09-03');

    expect(await screen.findByText('Brak zadań')).toBeInTheDocument();
    expect(screen.getByText(/Nic nie zaplanowano: .*wrz/)).toBeInTheDocument();
  });

  it('labels the control with the range and offers the own range preset', async () => {
    seedRange();
    open();
    await screen.findByText('Pierwszy w zakresie');

    expect(
      screen.getByRole('button', { name: /^Wybierz przedział/ }),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /^Zakres:/ }));
    const presets = within(
      await screen.findByRole('list', { name: 'Zakres' }),
    ).getAllByRole('button');

    expect(presets.map((item) => item.textContent)).toEqual([
      'Dzień',
      'Tydzień',
      'Miesiąc',
      'Rok',
      'Własny',
    ]);
  });

  it('moves to the own range route from another view', async () => {
    const push = vi.fn();
    registerNavigator(historyNavigator(push));
    seedRange();
    renderTime('week');
    await screen.findAllByRole('button', { name: /^Szczegóły zadania/ });

    await userEvent.click(screen.getByRole('button', { name: /^Zakres:/ }));
    await userEvent.click(
      await screen.findByRole('button', { name: 'Własny' }),
    );

    expect(push).toHaveBeenCalledWith(
      '/app/time/range/?from=2026-10-14&to=2026-10-20',
    );
  });

  it('marks free days of a week with an empty state', async () => {
    seedRange();
    renderTime('week');
    await screen.findAllByRole('button', { name: /^Szczegóły zadania/ });

    const free = await screen.findAllByRole('heading', { name: 'Wolny dzień' });

    expect(free.length).toBeGreaterThan(0);
    expect(free.length).toBeLessThan(7);
    expect(screen.queryByText('Brak zadań.')).toBeNull();
  });
});

import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { registerNavigator } from '@/shared/router/navigation';
import { renderTime } from './render-time';
import { backlogTask, setupTimeBackend, task } from './time-backend';

const backend = setupTimeBackend();

afterEach(() => {
  vi.useRealTimers();
  registerNavigator(null);
});

const row = (title: string) =>
  screen.findAllByRole('button', { name: `Edytuj zadanie: ${title}` });

describe('time statistics tab', () => {
  it('shows the tasks tab first', async () => {
    backend.seed([task({ id: 't-1', title: 'Raport' })]);
    renderTime('week');

    expect((await row('Raport'))[0]).toBeVisible();
    expect(screen.getByRole('tab', { name: 'Zadania' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('switches to statistics', async () => {
    backend.seed([task({ id: 't-1', title: 'Raport' })]);
    renderTime('week');
    await row('Raport');

    await userEvent.click(screen.getByRole('tab', { name: 'Statystyki' }));

    expect(await screen.findByText('Zrealizowane zadania')).toBeVisible();
    expect(screen.queryByRole('button', { name: /Raport/ })).toBeNull();
    expect(window.location.search).toContain('view=stats');
  });

  it('switches back from statistics to the tasks', async () => {
    backend.seed([task({ id: 't-1', title: 'Raport' })]);
    renderTime('week');
    await row('Raport');
    await userEvent.click(screen.getByRole('tab', { name: 'Statystyki' }));
    await screen.findByText('Zrealizowane zadania');

    await userEvent.click(screen.getByRole('tab', { name: 'Zadania' }));

    expect((await row('Raport'))[0]).toBeVisible();
    expect(window.location.search).not.toContain('view=stats');
  });

  it('opens straight on statistics from the link', async () => {
    backend.seed([task({ id: 't-1' })]);
    renderTime('week', '2026-10-20', '&view=stats');

    expect(await screen.findByText('Zrealizowane zadania')).toBeVisible();
    expect(screen.getByRole('tab', { name: 'Statystyki' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('summarises the week: completion, overdue, active and backlog', async () => {
    backend.seed([
      task({ id: 't-1', title: 'Gotowe', done: true }),
      task({ id: 't-2', title: 'W toku', inProgress: true }),
      task({ id: 't-3', title: 'Spóźnione', day: '2026-10-19' }),
      task({ id: 't-4', title: 'Inny tydzień', day: '2026-11-20' }),
    ]);
    backend.seedBacklog([backlogTask()]);
    renderTime('week', '2026-10-20', '&view=stats');

    expect((await screen.findAllByText('1 z 3'))[0]).toBeVisible();
    expect(
      screen.getByRole('progressbar', { name: /Zrealizowano 33% zadań/ }),
    ).toBeVisible();
    expect(
      within(screen.getByRole('region', { name: 'W trakcie' })).getByText(
        'W toku',
      ),
    ).toBeVisible();
    expect(screen.queryByText('Inny tydzień')).toBeNull();
  });

  it('names the period when it has no tasks', async () => {
    renderTime('week', '2026-10-20', '&view=stats');

    expect(await screen.findByText('Brak statystyk')).toBeVisible();
    expect(
      screen.getByText(
        'Nic nie zaplanowano: poniedziałek, 19 – niedziela, 25 października 2026.',
      ),
    ).toBeVisible();
  });
});

describe('time statistics journey', () => {
  const seedWeek = () =>
    backend.seed([
      task({ id: 't-1', title: 'Gotowe', done: true }),
      task({ id: 't-2', title: 'W toku', inProgress: true }),
      task({ id: 't-3', title: 'Do zrobienia' }),
    ]);

  const openStats = async () => {
    seedWeek();
    renderTime('week');
    await row('Gotowe');
    await userEvent.click(screen.getByRole('tab', { name: 'Statystyki' }));
    await screen.findByText('Zrealizowane zadania');
  };

  it('opens statistics with the completion of the week', async () => {
    seedWeek();
    renderTime('week');
    await row('Gotowe');

    await userEvent.click(screen.getByRole('tab', { name: 'Statystyki' }));

    expect(await screen.findByText('Zrealizowane zadania')).toBeVisible();
    expect(window.location.search).toContain('view=stats');
    expect(
      screen.getByRole('progressbar', { name: /Zrealizowano 33% zadań/ }),
    ).toBeVisible();
    expect(screen.getAllByText('1 z 3')[0]).toBeVisible();
    expect(
      within(screen.getByRole('region', { name: 'W trakcie' })).getByText(
        'W toku',
      ),
    ).toBeVisible();
  });

  it('moves statistics to the next week and says there are none', async () => {
    await openStats();

    await userEvent.click(
      screen.getByRole('button', { name: 'Następny okres' }),
    );

    expect(await screen.findByText('Brak statystyk')).toBeVisible();
    expect(screen.getByRole('tab', { name: 'Statystyki' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('moves statistics back to the week with data', async () => {
    await openStats();
    await userEvent.click(
      screen.getByRole('button', { name: 'Następny okres' }),
    );
    await screen.findByText('Brak statystyk');

    await userEvent.click(
      screen.getByRole('button', { name: 'Poprzedni okres' }),
    );

    expect(await screen.findByText('Zrealizowane zadania')).toBeVisible();
  });

  it('returns from statistics to the tasks', async () => {
    await openStats();

    await userEvent.click(screen.getByRole('tab', { name: 'Zadania' }));

    expect((await row('Gotowe'))[0]).toBeVisible();
    expect(screen.queryByText('Zrealizowane zadania')).toBeNull();
    expect(window.location.search).not.toContain('view=stats');
  });
});

/** Navigator writing the real history (popovers live in it) and reporting pushes. */
const historyNavigator = (push: (path: string) => void) => ({
  push: (path: string, state?: Record<string, unknown>) => {
    push(path);
    window.history.pushState(state ?? null, '', path);
  },
  replace: (path: string, state?: Record<string, unknown>) =>
    window.history.replaceState(state ?? window.history.state, '', path),
});

describe('time statistics period kind', () => {
  it('keeps the statistics tab when another kind of period is picked', async () => {
    const push = vi.fn();
    registerNavigator(historyNavigator(push));
    backend.seed([task({ id: 't-1' })]);
    renderTime('week', '2026-10-20', '&view=stats');
    await screen.findByText('Zrealizowane zadania');

    await userEvent.click(screen.getByRole('button', { name: /^Zakres:/ }));
    await userEvent.click(
      await screen.findByRole('button', { name: 'Miesiąc' }),
    );

    expect(push).toHaveBeenCalledWith(
      '/app/time/month/?date=2026-10-20&view=stats',
    );
  });

  it('leaves the tab out of the link from the task lists', async () => {
    const push = vi.fn();
    registerNavigator(historyNavigator(push));
    backend.seed([task({ id: 't-1' })]);
    renderTime('week');
    await screen.findAllByRole('button', { name: /^Edytuj zadanie/ });

    await userEvent.click(screen.getByRole('button', { name: /^Zakres:/ }));
    await userEvent.click(
      await screen.findByRole('button', { name: 'Miesiąc' }),
    );

    expect(push).toHaveBeenCalledWith('/app/time/month/?date=2026-10-20');
  });
});

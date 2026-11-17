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

const seedWeek = () =>
  backend.seed([
    task({ id: 't-1', title: 'Gotowe', done: true }),
    task({ id: 't-2', title: 'W toku', inProgress: true }),
    task({ id: 't-3', title: 'Do zrobienia' }),
  ]);

describe('time screen structure', () => {
  it('has no separate statistics tab', async () => {
    seedWeek();
    renderTime('week');
    await row('Gotowe');

    expect(screen.queryByRole('tab', { name: 'Statystyki' })).toBeNull();
    expect(screen.queryByRole('tab', { name: 'Zadania' })).toBeNull();
  });

  it('shows summary, then tasks, then the rest of statistics', async () => {
    seedWeek();
    renderTime('week');
    const [task_] = await row('Gotowe');

    const summary = await screen.findByText('Zrealizowane zadania');
    const status = screen.getByRole('heading', { name: 'Status' });
    const categories = screen.getByRole('heading', { name: 'Kategorie' });

    const before = Node.DOCUMENT_POSITION_FOLLOWING;
    expect(summary.compareDocumentPosition(task_) & before).toBeTruthy();
    expect(task_.compareDocumentPosition(status) & before).toBeTruthy();
    expect(task_.compareDocumentPosition(categories) & before).toBeTruthy();
  });

  it('lays summary, tasks and statistics out as cards of one grid, like finance', async () => {
    seedWeek();
    renderTime('week');
    await row('Gotowe');

    const hero = (await screen.findByText('Zrealizowane zadania')).closest(
      '.hero-card',
    );
    const status = screen
      .getByRole('heading', { name: 'Status' })
      .closest('div.rounded-3xl');
    const categories = screen
      .getByRole('heading', { name: 'Kategorie' })
      .closest('div.rounded-3xl');
    const grid = hero?.parentElement;

    expect(grid).toHaveClass('xl:grid', 'xl:grid-cols-12', 'gap-3', 'md:gap-4');
    expect(status?.parentElement).toBe(grid);
    expect(categories?.parentElement).toBe(grid);
  });

  it('summarises the week: completion, overdue, active and backlog', async () => {
    backend.seed([
      task({ id: 't-1', title: 'Gotowe', done: true }),
      task({ id: 't-2', title: 'W toku', inProgress: true }),
      task({ id: 't-3', title: 'Spóźnione', day: '2026-10-19' }),
      task({ id: 't-4', title: 'Inny tydzień', day: '2026-11-20' }),
    ]);
    backend.seedBacklog([backlogTask()]);
    renderTime('week');

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

  it('shows only the empty state when the period has no tasks', async () => {
    renderTime('week');

    expect(await screen.findByText('Brak zadań')).toBeVisible();
    expect(
      screen.getByText(
        'Nic nie zaplanowano: poniedziałek, 19 – niedziela, 25 października 2026.',
      ),
    ).toBeVisible();
    expect(screen.queryByText('Zrealizowane zadania')).toBeNull();
  });

  it('follows the period: next week is empty, back brings the summary', async () => {
    seedWeek();
    renderTime('week');
    await row('Gotowe');

    await userEvent.click(
      screen.getByRole('button', { name: 'Następny okres' }),
    );
    expect(await screen.findByText('Brak zadań')).toBeVisible();
    expect(screen.queryByText('Zrealizowane zadania')).toBeNull();

    await userEvent.click(
      screen.getByRole('button', { name: 'Poprzedni okres' }),
    );
    expect(await screen.findByText('Zrealizowane zadania')).toBeVisible();
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

describe('time period kind', () => {
  it('keeps the link free of any tab when another kind is picked', async () => {
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

describe('moves statistics', () => {
  it('shows how many tasks were moved in the viewed week', async () => {
    seedWeek();
    backend.state.moves = [
      { taskId: 't-1', at: '2026-10-20T08:00:00.000Z' },
      { taskId: 't-1', at: '2026-10-21T08:00:00.000Z' },
      { taskId: 't-2', at: '2026-10-21T09:00:00.000Z' },
      { taskId: 't-3', at: '2026-09-01T09:00:00.000Z' },
    ];
    renderTime('week');
    await row('Gotowe');

    const card = (
      await screen.findByRole('heading', { name: 'Przeniesienia' })
    ).closest('div.rounded-3xl') as HTMLElement;

    expect(await within(card).findByText('3')).toBeInTheDocument();
    expect(within(card).getByText('2')).toBeInTheDocument();
  });
});

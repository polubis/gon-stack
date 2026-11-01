import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderTime, TODAY } from './render-time';
import { task, setupTimeBackend } from './time-backend';

const backend = setupTimeBackend();

afterEach(() => vi.useRealTimers());

const row = (title: string) =>
  screen.findByRole('button', { name: `Edytuj zadanie: ${title}` });

const queryParams = (url: string) => new URL(url).searchParams;

const readsOf = (from: string, to: string) =>
  backend.reads().filter(({ url }) => {
    const params = queryParams(url);
    return params.get('from') === from && params.get('to') === to;
  });

describe('time loading', () => {
  it('shows tasks of the day in time order with the current hour marked', async () => {
    backend.seed([
      task({ id: 't-2', title: 'Obiad', at: '13:00', priorityId: 'medium' }),
      task({ id: 't-1', title: 'Raport', at: '09:00' }),
      task({ id: 't-3', title: 'Rachunek', at: null }),
      task({ id: 't-4', title: 'Inny dzień', day: '2026-10-21' }),
    ]);
    renderTime();

    await row('Raport');

    const plan = within(
      screen.getByRole('region', { name: 'Zadania na dziś' }),
    );
    expect(
      plan
        .getAllByRole('button', { name: /^Szczegóły zadania:/ })
        .map((b) => b.textContent),
    ).toEqual(['Raport', 'Obiad']);
    expect(plan.getByText('Teraz 13:40')).toBeInTheDocument();
    expect(screen.getByRole('listitem', { current: 'time' })).toHaveTextContent(
      'Obiad',
    );
    expect(screen.getByText('Rachunek')).toBeInTheDocument();
    expect(screen.queryByText('Inny dzień')).toBeNull();
  });

  it('names the period in the empty state', async () => {
    renderTime();

    expect(
      await screen.findByText(
        'Nic nie zaplanowano: wtorek, 20 października 2026.',
      ),
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'Dodaj zadanie' })).toBeVisible();
  });

  it('offers a retry when loading fails', async () => {
    const user = userEvent.setup();
    backend.state.failReads = true;
    renderTime();

    expect(
      await screen.findByText('Nie udało się wczytać zadań'),
    ).toBeVisible();
    expect(screen.getByText('TIME_LOAD')).toBeVisible();
    expect(screen.getByText('Database unavailable')).toBeVisible();

    backend.state.failReads = false;
    backend.seed([task()]);
    await user.click(screen.getByRole('button', { name: 'Spróbuj ponownie' }));

    expect(await row('Raport miesięczny')).toBeVisible();
  });
});

describe('time navigation', () => {
  it('loads the next day and keeps the date in the address', async () => {
    const user = userEvent.setup();
    backend.seed([
      task(),
      task({ id: 't-2', title: 'Jutro', day: '2026-10-21' }),
    ]);
    renderTime();
    await row('Raport miesięczny');

    await user.click(screen.getByRole('button', { name: 'Następny okres' }));

    expect(await row('Jutro')).toBeVisible();
    expect(
      screen.getByRole('group', { name: 'Zakres czasu' }),
    ).toHaveTextContent('21.10.2026');
    expect(window.location.search).toContain('date=2026-10-21');
    expect(readsOf('2026-10-21', '2026-10-21')).toHaveLength(1);
  });

  it('returns to today with the Dziś option', async () => {
    const user = userEvent.setup();
    renderTime('day', '2026-11-05');
    await screen.findByRole('heading', { name: 'Brak zadań' });

    await user.click(screen.getByRole('button', { name: /Zakres:/ }));
    await user.click(await screen.findByRole('button', { name: 'Dziś' }));

    expect(
      await screen.findByText(
        'Nic nie zaplanowano: wtorek, 20 października 2026.',
      ),
    ).toBeVisible();
    expect(window.location.search).toContain('date=2026-10-20');
  });

  it('returns to the current week with the Dziś option in the week view', async () => {
    const user = userEvent.setup();
    renderTime('week', '2026-11-05');
    await screen.findByRole('heading', { name: 'Brak zadań' });

    await user.click(screen.getByRole('button', { name: /Zakres:/ }));
    await user.click(await screen.findByRole('button', { name: 'Dziś' }));

    expect(
      await screen.findByRole('group', { name: 'Zakres czasu' }),
    ).toHaveTextContent('19.10.2026 – 25.10.2026');
    expect(window.location.search).toContain('date=2026-10-20');
    await waitFor(() =>
      expect(readsOf('2026-10-19', '2026-10-25')).toHaveLength(1),
    );
  });

  it('reaches Dziś with the keyboard and returns to today', async () => {
    const user = userEvent.setup();
    renderTime('day', '2026-11-05');
    await screen.findByRole('heading', { name: 'Brak zadań' });

    await user.click(screen.getByRole('button', { name: /Zakres:/ }));
    await screen.findByRole('list', { name: 'Zakres' });
    await user.keyboard('{End}');
    expect(screen.getByRole('button', { name: 'Dziś' })).toHaveFocus();
    await user.keyboard('{Enter}');

    expect(
      await screen.findByText(
        'Nic nie zaplanowano: wtorek, 20 października 2026.',
      ),
    ).toBeVisible();
  });

  it('closes the range list after Dziś', async () => {
    const user = userEvent.setup();
    renderTime('day', '2026-11-05');
    await screen.findByRole('heading', { name: 'Brak zadań' });

    await user.click(screen.getByRole('button', { name: /Zakres:/ }));
    await user.click(await screen.findByRole('button', { name: 'Dziś' }));

    await waitFor(() =>
      expect(screen.queryByRole('list', { name: 'Zakres' })).toBeNull(),
    );
  });

  it('asks for the whole week in the week view', async () => {
    renderTime('week');
    await screen.findByRole('heading', { name: 'Brak zadań' });

    const first = backend.reads()[0]!;
    expect(queryParams(first.url).get('from')).toBe('2026-10-19');
    expect(queryParams(first.url).get('to')).toBe('2026-10-25');
    expect(
      screen.getByRole('group', { name: 'Zakres czasu' }),
    ).toHaveTextContent('19.10.2026 – 25.10.2026');
  });
});

describe('time swipe and prefetch', () => {
  const swipe = (target: HTMLElement, from: number, to: number) => {
    fireEvent.touchStart(target, {
      touches: [{ clientX: from, clientY: 200 }],
    });
    fireEvent.touchEnd(target, {
      changedTouches: [{ clientX: to, clientY: 205 }],
    });
  };

  it('swipes left to the next day and right back', async () => {
    backend.seed([
      task(),
      task({ id: 't-2', title: 'Jutro', day: '2026-10-21' }),
    ]);
    renderTime();
    await row('Raport miesięczny');
    const main = screen.getByRole('main');

    swipe(main, 300, 100);
    expect(await row('Jutro')).toBeVisible();
    expect(window.location.search).toContain('date=2026-10-21');

    swipe(main, 100, 300);
    expect(await row('Raport miesięczny')).toBeVisible();
    expect(window.location.search).toContain('date=2026-10-20');
  });

  it('moves the content with the finger and snaps back on a short swipe', async () => {
    renderTime();
    await screen.findByRole('heading', { name: 'Brak zadań' });
    const main = screen.getByRole('main');

    fireEvent.touchStart(main, { touches: [{ clientX: 300, clientY: 200 }] });
    fireEvent.touchMove(main, { touches: [{ clientX: 250, clientY: 202 }] });
    const [filters, data] = Array.from(main.children) as HTMLElement[];
    expect(data!.style.transform).toBe('translateX(-30px)');
    expect(filters!.style.transform).toBe('');

    fireEvent.touchEnd(main, {
      changedTouches: [{ clientX: 250, clientY: 202 }],
    });
    expect(data!.style.transform).toBe('');
    expect(window.location.search).toContain('date=2026-10-20');
  });

  it('ignores a short or mostly vertical swipe', async () => {
    renderTime();
    await screen.findByRole('heading', { name: 'Brak zadań' });
    const main = screen.getByRole('main');

    swipe(main, 200, 170);
    fireEvent.touchStart(main, { touches: [{ clientX: 300, clientY: 100 }] });
    fireEvent.touchEnd(main, {
      changedTouches: [{ clientX: 150, clientY: 400 }],
    });

    expect(window.location.search).toContain('date=2026-10-20');
  });

  it('opens a neighbouring day without asking for it again', async () => {
    const user = userEvent.setup();
    renderTime();
    await screen.findByRole('heading', { name: 'Brak zadań' });
    await waitFor(() =>
      expect(readsOf('2026-10-21', '2026-10-21')).toHaveLength(1),
    );

    await user.click(screen.getByRole('button', { name: 'Następny okres' }));

    await screen.findByText(/21 października 2026/);
    expect(readsOf('2026-10-21', '2026-10-21')).toHaveLength(1);
  });
});

describe('time task creation', () => {
  it('shows the new task at once and confirms with a toast', async () => {
    const user = userEvent.setup();
    renderTime();
    await user.click(
      await screen.findByRole('button', { name: 'Dodaj zadanie' }),
    );

    const dialog = within(await screen.findByRole('dialog'));
    await user.type(dialog.getByRole('textbox', { name: 'Nazwa' }), 'Kurs');
    await user.click(dialog.getByRole('radio', { name: 'Wysoki' }));
    await user.click(dialog.getByRole('switch', { name: 'Cały dzień' }));
    await user.click(dialog.getByRole('button', { name: 'Dodaj' }));

    expect(await row('Kurs')).toBeVisible();
    expect(await screen.findByText('Dodano zadanie.')).toBeVisible();
    await waitFor(() => expect(backend.writes()).toHaveLength(1));
    expect(backend.writes()[0]).toMatchObject({
      method: 'POST',
      body: {
        title: 'Kurs',
        categoryId: 'work',
        priorityId: 'high',
        day: '2026-10-20',
        at: '12:00',
        done: false,
      },
    });
  });

  it('saves a whole-day task without an hour', async () => {
    const user = userEvent.setup();
    renderTime();
    await user.click(
      await screen.findByRole('button', { name: 'Dodaj zadanie' }),
    );

    const dialog = within(await screen.findByRole('dialog'));
    await user.type(dialog.getByRole('textbox', { name: 'Nazwa' }), 'Rachunek');
    expect(dialog.getByRole('switch', { name: 'Cały dzień' })).toBeChecked();
    await user.click(dialog.getByRole('button', { name: 'Dodaj' }));

    await waitFor(() => expect(backend.writes()).toHaveLength(1));
    expect(backend.writes()[0]!.body).toMatchObject({ at: null });
  });

  it('rolls the task back and offers retry when the server rejects it', async () => {
    const user = userEvent.setup();
    backend.state.failWrites = true;
    renderTime();
    await user.click(
      await screen.findByRole('button', { name: 'Dodaj zadanie' }),
    );
    const dialog = within(await screen.findByRole('dialog'));
    await user.type(dialog.getByRole('textbox', { name: 'Nazwa' }), 'Kurs');
    await user.click(dialog.getByRole('button', { name: 'Dodaj' }));

    const toast = within(await screen.findByRole('alert'));
    expect(toast.getByText('Nie udało się dodać zadania')).toBeVisible();
    expect(toast.getByText('TASK_CREATE_FAILED')).toBeVisible();
    expect(toast.getByText('Database unavailable')).toBeVisible();
    expect(
      screen.queryByRole('button', { name: /Edytuj zadanie: Kurs/ }),
    ).toBeNull();

    backend.state.failWrites = false;
    await user.click(toast.getByRole('button', { name: /ponownie|Ponów/i }));

    expect(await row('Kurs')).toBeVisible();
  });
});

describe('time task maintenance', () => {
  it('marks a task done and saves it', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    renderTime();

    const box = await screen.findByRole('checkbox', {
      name: 'Zrobione: Raport miesięczny',
    });
    expect(box).toHaveAttribute('aria-checked', 'false');
    await user.click(box);
    expect(box).toHaveAttribute('aria-checked', 'mixed');
    await user.click(box);

    expect(box).toBeChecked();
    expect(await screen.findByText('Zadanie zrobione.')).toBeVisible();
    await waitFor(() => expect(backend.writes()).toHaveLength(2));
    expect(backend.writes()[1]).toMatchObject({
      method: 'PUT',
      body: { id: 't-1', done: true, inProgress: false },
    });
  });

  it('cycles a task through todo, in progress, done and back', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    renderTime();

    const box = await screen.findByRole('checkbox', {
      name: 'Zrobione: Raport miesięczny',
    });
    await user.click(box);
    await user.click(box);
    await user.click(box);

    expect(box).toHaveAttribute('aria-checked', 'false');
    await waitFor(() => expect(backend.writes()).toHaveLength(3));
    expect(backend.writes().map((w) => w.body)).toMatchObject([
      { inProgress: true, done: false },
      { inProgress: false, done: true },
      { inProgress: false, done: false },
    ]);
  });

  it('marks a task in progress, shows it and saves it', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    renderTime();

    await user.click(
      await screen.findByRole('checkbox', {
        name: 'Zrobione: Raport miesięczny',
      }),
    );

    expect(await screen.findByText('W trakcie')).toBeVisible();
    await waitFor(() => expect(backend.writes()).toHaveLength(1));
    expect(backend.writes()[0]).toMatchObject({
      method: 'PUT',
      body: { id: 't-1', inProgress: true, done: false },
    });
  });

  it('finishing a task in progress clears the in progress mark', async () => {
    const user = userEvent.setup();
    backend.seed([task({ inProgress: true })]);
    renderTime();

    await user.click(
      await screen.findByRole('checkbox', {
        name: 'Zrobione: Raport miesięczny',
      }),
    );

    expect(screen.queryByText('W trakcie')).not.toBeInTheDocument();
    await waitFor(() => expect(backend.writes()).toHaveLength(1));
    expect(backend.writes()[0]).toMatchObject({
      body: { id: 't-1', done: true, inProgress: false },
    });
  });

  it('edits the title and moves the task to another day', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    renderTime();
    await user.click(await row('Raport miesięczny'));

    const dialog = within(await screen.findByRole('dialog'));
    const title = dialog.getByRole('textbox', { name: 'Nazwa' });
    await user.clear(title);
    await user.type(title, 'Raport roczny');
    await user.click(dialog.getByRole('button', { name: 'Zapisz' }));

    expect(await row('Raport roczny')).toBeVisible();
    await waitFor(() => expect(backend.writes()).toHaveLength(1));
    expect(backend.writes()[0]!.body).toMatchObject({
      id: 't-1',
      title: 'Raport roczny',
    });
  });

  it('restores a task whose change the server rejected', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    backend.state.failWrites = true;
    renderTime();

    const box = await screen.findByRole('checkbox', {
      name: 'Zrobione: Raport miesięczny',
    });
    await user.click(box);

    const toast = within(await screen.findByRole('alert'));
    expect(toast.getByText('TASK_UPDATE_FAILED')).toBeVisible();
    expect(box).not.toBeChecked();
  });

  it('deletes a task only after confirmation', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    renderTime();
    await user.click(await row('Raport miesięczny'));
    await user.click(
      within(await screen.findByRole('dialog')).getByRole('button', {
        name: 'Usuń',
      }),
    );

    const confirm = await screen.findByText('Usunąć zadanie?');
    expect(confirm).toBeVisible();
    expect(backend.writes()).toHaveLength(0);
    await user.click(
      within(screen.getAllByRole('dialog').at(-1)!).getByRole('button', {
        name: 'Usuń',
      }),
    );

    await waitFor(() =>
      expect(
        screen.queryByRole('button', { name: /Edytuj zadanie: Raport/ }),
      ).toBeNull(),
    );
    expect(await screen.findByText('Usunięto zadanie.')).toBeVisible();
    await waitFor(() => expect(backend.writes()).toHaveLength(1));
    expect(backend.writes()[0]).toMatchObject({ method: 'DELETE' });
    expect(backend.writes()[0]!.url).toContain('/api/time/tasks/t-1/');
  });

  it('lets the last deleted task leave before the empty state shows', async () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({
        matches: false,
        addEventListener: () => {},
        removeEventListener: () => {},
      })),
    );
    const user = userEvent.setup();
    backend.seed([task()]);
    renderTime();
    await user.click(await row('Raport miesięczny'));
    await user.click(
      within(await screen.findByRole('dialog')).getByRole('button', {
        name: 'Usuń',
      }),
    );
    await user.click(
      within(screen.getAllByRole('dialog').at(-1)!).getByRole('button', {
        name: 'Usuń',
      }),
    );

    expect(screen.queryByRole('heading', { name: 'Brak zadań' })).toBeNull();
    expect(
      await screen.findByRole('heading', { name: 'Brak zadań' }),
    ).toBeVisible();
    vi.unstubAllGlobals();
  });

  it('opens details, not the editor, when the row is clicked', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    renderTime();

    await user.click(
      await screen.findByRole('button', {
        name: 'Szczegóły zadania: Raport miesięczny',
      }),
    );

    expect(
      await screen.findByRole('dialog', { name: 'Szczegóły zadania' }),
    ).toBeVisible();
    expect(backend.writes()).toHaveLength(0);
  });

  it('moves a task to tomorrow from the menu', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    renderTime();
    await user.click(
      await screen.findByRole('button', { name: 'Więcej: Raport miesięczny' }),
    );
    await user.click(
      await screen.findByRole('menuitem', {
        name: 'Przenieś na jutro: Raport miesięczny',
      }),
    );

    expect(
      await screen.findByText('Przeniesiono „Raport miesięczny” na jutro.'),
    ).toBeVisible();
    await waitFor(() => expect(backend.writes()).toHaveLength(1));
    expect(backend.writes()[0]!.body).toMatchObject({
      id: 't-1',
      day: '2026-10-21',
    });
  });

  it('moves a task to the next week from the menu', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    renderTime();
    await user.click(
      await screen.findByRole('button', { name: 'Więcej: Raport miesięczny' }),
    );
    await user.click(
      await screen.findByRole('menuitem', {
        name: 'Przenieś na następny tydzień: Raport miesięczny',
      }),
    );

    await waitFor(() => expect(backend.writes()).toHaveLength(1));
    expect(backend.writes()[0]!.body).toMatchObject({ day: '2026-10-26' });
  });

  it('puts a task in the backlog from the menu', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    renderTime();
    await user.click(
      await screen.findByRole('button', { name: 'Więcej: Raport miesięczny' }),
    );
    await user.click(
      await screen.findByRole('menuitem', {
        name: 'Wrzuć do backlogu: Raport miesięczny',
      }),
    );

    expect(
      await screen.findByText('Wrzucono „Raport miesięczny” do backlogu.'),
    ).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Więcej: Raport miesięczny' }),
    ).toBeNull();
    expect(
      screen.getByRole('button', { name: 'Backlog, zadań: 1' }),
    ).toBeVisible();
    await waitFor(() => expect(backend.writes()).toHaveLength(1));
    expect(backend.writes()[0]).toMatchObject({ method: 'POST' });
    expect(backend.writes()[0]!.url).toContain('/api/time/backlog/t-1/');
  });

  it('keeps the task on the board when the backlog move fails', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    backend.state.failWrites = true;
    renderTime();
    await user.click(
      await screen.findByRole('button', { name: 'Więcej: Raport miesięczny' }),
    );
    await user.click(
      await screen.findByRole('menuitem', {
        name: 'Wrzuć do backlogu: Raport miesięczny',
      }),
    );

    expect(await screen.findByText('TASK_BACKLOG_FAILED')).toBeVisible();
    expect(await row('Raport miesięczny')).toBeVisible();
  });

  it('offers no backlog move for a task made by a series', async () => {
    const user = userEvent.setup();
    backend.seed([task({ recurringId: 'r-1' })]);
    renderTime();
    await user.click(
      await screen.findByRole('button', { name: 'Więcej: Raport miesięczny' }),
    );

    expect(
      await screen.findByRole('menuitem', {
        name: 'Przenieś na jutro: Raport miesięczny',
      }),
    ).toBeVisible();
    expect(
      screen.queryByRole('menuitem', { name: /^Wrzuć do backlogu/ }),
    ).toBeNull();
  });

  it('keeps the task when deleting fails', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    backend.state.failWrites = true;
    renderTime();
    await user.click(await row('Raport miesięczny'));
    await user.click(
      within(await screen.findByRole('dialog')).getByRole('button', {
        name: 'Usuń',
      }),
    );
    await screen.findByText('Usunąć zadanie?');
    await user.click(
      within(screen.getAllByRole('dialog').at(-1)!).getByRole('button', {
        name: 'Usuń',
      }),
    );

    expect(await screen.findByText('TASK_DELETE_FAILED')).toBeVisible();
    expect(await row('Raport miesięczny')).toBeVisible();
  });
});

describe('time views', () => {
  it('week lists each day with its tasks', async () => {
    backend.seed([
      task(),
      task({ id: 't-2', title: 'Siłownia', day: '2026-10-22', at: '18:00' }),
    ]);
    renderTime('week');

    expect((await screen.findAllByText('Siłownia')).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Raport miesięczny').length).toBeGreaterThan(0);
  });

  it('month counts tasks per day', async () => {
    backend.seed([task(), task({ id: 't-2', title: 'Drugie' })]);
    renderTime('month');

    expect(
      await screen.findByLabelText('wtorek, 20 października, 2 zadania'),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('środa, 21 października, brak zadań'),
    ).toBeInTheDocument();
  });

  it('year counts tasks per month', async () => {
    backend.seed([task(), task({ id: 't-2', day: '2026-03-02' })]);
    renderTime('year');

    const october = (
      await screen.findByRole('heading', { name: 'Październik' })
    ).parentElement!;
    expect(within(october).getByText('1 zadanie')).toBeVisible();
    const march = screen.getByRole('heading', {
      name: 'Marzec',
    }).parentElement!;
    expect(within(march).getByText('1 zadanie')).toBeVisible();
  });
});

describe('time reloading', () => {
  it('keeps the shown tasks under a loading bar while the next period loads', async () => {
    const user = userEvent.setup();
    backend.seed([
      task(),
      task({ id: 't-2', title: 'Jutro', day: '2026-10-21' }),
    ]);
    backend.state.delayMs = 300;
    renderTime();
    await row('Raport miesięczny');
    await waitFor(() =>
      expect(screen.queryByText('Ładowanie danych')).toBeNull(),
    );

    await user.click(screen.getByRole('button', { name: 'Następny okres' }));

    expect(await screen.findByText('Ładowanie danych')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Edytuj zadanie: Raport miesięczny' }),
    ).toBeVisible();
    expect(screen.queryByRole('heading', { name: 'Brak zadań' })).toBeNull();
    expect(await row('Jutro')).toBeVisible();
    await waitFor(() =>
      expect(screen.queryByText('Ładowanie danych')).toBeNull(),
    );
  });

  it('keeps the shown view when switching the date back and forth', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    backend.state.delayMs = 200;
    renderTime();
    await row('Raport miesięczny');

    await user.click(screen.getByRole('button', { name: 'Poprzedni okres' }));
    expect(
      screen.getByRole('button', { name: 'Edytuj zadanie: Raport miesięczny' }),
    ).toBeVisible();
    expect(
      await screen.findByRole('heading', { name: 'Brak zadań' }),
    ).toBeVisible();
  });

  it('drops the modal of a task that does not exist', async () => {
    renderTime('day', TODAY, '&modal=task-edit:gone');
    await screen.findByRole('heading', { name: 'Brak zadań' });

    await waitFor(() => expect(window.location.search).not.toContain('modal'));
  });
});

describe('time add on list item', () => {
  it('opens the form with the day of the item and whole day checked', async () => {
    const user = userEvent.setup();
    backend.seed([task({ day: '2026-10-21' })]);
    renderTime('week');
    await screen.findAllByRole('button', {
      name: 'Edytuj zadanie: Raport miesięczny',
    });

    await user.click(
      screen.getAllByRole('button', {
        name: /Dodaj zadanie na .*22 października/,
      })[0]!,
    );

    const dialog = within(await screen.findByRole('dialog'));
    expect(dialog.getByLabelText('Dzień')).toHaveValue('2026-10-22');
    expect(dialog.getByRole('switch', { name: 'Cały dzień' })).toBeChecked();
  });
});

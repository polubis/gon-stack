import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderTime, TODAY } from './render-time';
import { task, setupTimeBackend } from './time-backend';

const backend = setupTimeBackend();

afterEach(() => vi.useRealTimers());

const row = (title: string) =>
  screen.findByRole('button', { name: `Edytuj zadanie: ${title}` });

const queryParams = (url: string) => new URL(url).searchParams;

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
        .getAllByRole('button', { name: /^Edytuj/ })
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
    const last = backend.reads().at(-1)!;
    expect(queryParams(last.url).get('from')).toBe('2026-10-21');
    expect(queryParams(last.url).get('to')).toBe('2026-10-21');
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
    await waitFor(() => {
      const last = backend.reads().at(-1)!;
      expect(queryParams(last.url).get('from')).toBe('2026-10-19');
    });
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

describe('time task creation', () => {
  it('shows the new task at once and confirms with a toast', async () => {
    const user = userEvent.setup();
    renderTime();
    await user.click(
      await screen.findByRole('button', { name: 'Dodaj zadanie' }),
    );

    const dialog = within(await screen.findByRole('dialog'));
    await user.type(dialog.getByRole('textbox', { name: 'Nazwa' }), 'Kurs');
    await user.click(dialog.getByRole('radio', { name: '9 - Wysoki' }));
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
    expect(box).not.toBeChecked();
    await user.click(box);

    expect(box).toBeChecked();
    await waitFor(() => expect(backend.writes()).toHaveLength(1));
    expect(backend.writes()[0]).toMatchObject({
      method: 'PUT',
      body: { id: 't-1', done: true },
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

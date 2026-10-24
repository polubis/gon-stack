import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderTime, TODAY } from './render-time';
import { backlogTask, setupTimeBackend, task } from './time-backend';

const backend = setupTimeBackend();

afterEach(() => vi.useRealTimers());

const openBacklog = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(await screen.findByRole('button', { name: /^Backlog/ }));
  return within(await screen.findByRole('dialog', { name: 'Backlog' }));
};

const closeBacklog = (user: ReturnType<typeof userEvent.setup>) =>
  user.click(screen.getByRole('button', { name: 'Zamknij' }));

const modalsInUrl = () =>
  new URLSearchParams(window.location.search).getAll('modal');

describe('backlog adding', () => {
  it('adds a task without a day from the add menu', async () => {
    const user = userEvent.setup();
    renderTime();
    await screen.findByRole('heading', { name: 'Brak zadań' });

    await user.click(screen.getAllByRole('button', { name: /^Dodaj$/ })[0]!);
    await user.click(
      await screen.findByRole('menuitem', { name: 'Do backlogu' }),
    );
    const form = within(await screen.findByRole('dialog'));
    await user.type(form.getByLabelText('Nazwa'), 'Umówić dentystę');
    await user.click(form.getByRole('button', { name: 'Dodaj' }));

    expect(await screen.findByText('Dodano do backlogu.')).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Backlog, zadań: 1' }),
    ).toBeVisible();
    await waitFor(() => expect(backend.writes()).toHaveLength(1));
    const [write] = backend.writes();
    expect(write!.url).toContain('/api/time/backlog/');
    expect(write!.body).toMatchObject({
      title: 'Umówić dentystę',
      categoryId: 'work',
      priorityId: 'medium',
    });
    expect(write!.body).not.toHaveProperty('day');
    expect(write!.body).not.toHaveProperty('at');
  });

  it('asks for a name before adding', async () => {
    const user = userEvent.setup();
    renderTime('day', TODAY, '&modal=backlog-new');

    const form = within(await screen.findByRole('dialog'));
    await user.click(form.getByRole('button', { name: 'Dodaj' }));

    expect(await form.findByText('Podaj nazwę zadania.')).toBeVisible();
    expect(backend.writes()).toHaveLength(0);
  });

  it('clears the name with the x button', async () => {
    const user = userEvent.setup();
    renderTime('day', TODAY, '&modal=backlog-new');

    const form = within(await screen.findByRole('dialog'));
    const name = form.getByLabelText('Nazwa');
    await user.type(name, 'Coś');
    await user.click(form.getByRole('button', { name: /^Wyczyść/ }));

    expect(name).toHaveValue('');
    expect(name).toHaveFocus();
  });

  it('keeps the backlog out of the board and restores it on a failed add', async () => {
    const user = userEvent.setup();
    backend.state.failWrites = true;
    renderTime('day', TODAY, '&modal=backlog-new');

    const form = within(await screen.findByRole('dialog'));
    await user.type(form.getByLabelText('Nazwa'), 'Zadanie');
    await user.click(form.getByRole('button', { name: 'Dodaj' }));

    expect(await screen.findByText('BACKLOG_CREATE_FAILED')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Backlog' })).toBeVisible();
  });
});

describe('backlog list', () => {
  it('shows an empty state with a way to add', async () => {
    const user = userEvent.setup();
    renderTime();

    const list = await openBacklog(user);

    expect(
      await list.findByRole('heading', { name: 'Backlog jest pusty' }),
    ).toBeVisible();
    await user.click(list.getByRole('button', { name: 'Dodaj do backlogu' }));
    expect(
      await screen.findByText('Zadanie bez terminu. Dzień wybierzesz później.'),
    ).toBeVisible();
  });

  it('lists waiting tasks and keeps the list in the address', async () => {
    const user = userEvent.setup();
    backend.seedBacklog([
      backlogTask(),
      backlogTask({ id: 'b-2', title: 'Kupić prezent' }),
    ]);
    renderTime();

    const list = await openBacklog(user);

    expect(await list.findByText('Umówić dentystę')).toBeVisible();
    expect(list.getByText('Kupić prezent')).toBeVisible();
    expect(modalsInUrl()).toEqual(['backlog']);
  });

  it('opens from a link to the list', async () => {
    backend.seedBacklog([backlogTask()]);
    renderTime('day', TODAY, '&modal=backlog');

    expect(
      await screen.findByRole('dialog', { name: 'Backlog' }),
    ).toBeVisible();
  });

  it('shows no board tasks for backlog items', async () => {
    backend.seedBacklog([backlogTask()]);
    renderTime();

    expect(
      await screen.findByRole('heading', { name: 'Brak zadań' }),
    ).toBeVisible();
    expect(
      screen.queryByRole('button', { name: /^Edytuj zadanie:/ }),
    ).toBeNull();
  });
});

describe('backlog moving', () => {
  it('puts a task on today with one click', async () => {
    const user = userEvent.setup();
    backend.seedBacklog([backlogTask()]);
    renderTime();
    const list = await openBacklog(user);

    await user.click(
      await list.findByRole('button', {
        name: 'Przenieś na dziś: Umówić dentystę',
      }),
    );

    expect(
      await screen.findByText('Przeniesiono „Umówić dentystę” na dziś.'),
    ).toBeVisible();
    expect(
      await list.findByRole('heading', { name: 'Backlog jest pusty' }),
    ).toBeVisible();
    await closeBacklog(user);
    expect(
      await screen.findByRole('button', {
        name: 'Edytuj zadanie: Umówić dentystę',
      }),
    ).toBeVisible();
    await waitFor(() => expect(backend.writes()).toHaveLength(1));
    const [write] = backend.writes();
    expect(write).toMatchObject({ method: 'PUT' });
    expect(write!.url).toContain('/api/time/tasks/b-1/');
    expect(write!.body).toMatchObject({ day: TODAY, at: null, done: false });
  });

  it('puts a task on tomorrow', async () => {
    const user = userEvent.setup();
    backend.seedBacklog([backlogTask()]);
    renderTime();
    const list = await openBacklog(user);

    await user.click(
      await list.findByRole('button', {
        name: 'Przenieś na jutro: Umówić dentystę',
      }),
    );

    await waitFor(() => expect(backend.writes()).toHaveLength(1));
    expect(backend.writes()[0]!.body).toMatchObject({ day: '2026-10-21' });
  });

  it('offers the viewed day when it is not today or tomorrow', async () => {
    const user = userEvent.setup();
    backend.seedBacklog([backlogTask()]);
    renderTime('week', '2026-10-24');
    const list = await openBacklog(user);

    await user.click(
      await list.findByRole('button', {
        name: 'Przenieś na 24.10: Umówić dentystę',
      }),
    );

    await waitFor(() => expect(backend.writes()).toHaveLength(1));
    expect(backend.writes()[0]!.body).toMatchObject({ day: '2026-10-24' });
    await closeBacklog(user);
    expect(
      await screen.findAllByRole('button', {
        name: 'Edytuj zadanie: Umówić dentystę',
      }),
    ).not.toHaveLength(0);
  });

  it('keeps the task in the backlog when moving fails', async () => {
    const user = userEvent.setup();
    backend.seedBacklog([backlogTask()]);
    backend.state.failWrites = true;
    renderTime();
    const list = await openBacklog(user);

    await user.click(
      await list.findByRole('button', {
        name: 'Przenieś na dziś: Umówić dentystę',
      }),
    );

    expect(await screen.findByText('BACKLOG_MOVE_FAILED')).toBeVisible();
    expect(await list.findByText('Umówić dentystę')).toBeVisible();
    expect(
      screen.queryByRole('button', { name: /^Edytuj zadanie:/ }),
    ).toBeNull();
  });

  it('keeps board tasks next to the moved one in time order', async () => {
    const user = userEvent.setup();
    backend.seed([task({ title: 'Raport', at: '09:00' })]);
    backend.seedBacklog([backlogTask()]);
    renderTime();
    const list = await openBacklog(user);

    await user.click(
      await list.findByRole('button', {
        name: 'Przenieś na dziś: Umówić dentystę',
      }),
    );

    await closeBacklog(user);
    const rows = await screen.findAllByRole('button', { name: /^Edytuj/ });
    expect(rows.map((b) => b.textContent)).toEqual([
      'Raport',
      'Umówić dentystę',
    ]);
  });
});

describe('backlog editing', () => {
  it('edits a task and keeps it in the backlog', async () => {
    const user = userEvent.setup();
    backend.seedBacklog([backlogTask()]);
    renderTime();
    const list = await openBacklog(user);

    await user.click(
      await list.findByRole('button', {
        name: 'Edytuj zadanie z backlogu: Umówić dentystę',
      }),
    );
    const form = within(
      await screen.findByRole('dialog', { name: 'Edytuj zadanie z backlogu' }),
    );
    expect(modalsInUrl()).toEqual(['backlog', 'backlog-edit:b-1']);
    const name = form.getByLabelText('Nazwa');
    expect(name).toHaveValue('Umówić dentystę');
    await user.clear(name);
    await user.type(name, 'Dentysta w piątek');
    await user.click(form.getByRole('radio', { name: 'Praca' }));
    await user.click(form.getByRole('button', { name: 'Zapisz' }));

    expect(await screen.findByText('Zapisano zmiany.')).toBeVisible();
    expect(await list.findByText('Dentysta w piątek')).toBeVisible();
    await waitFor(() => expect(backend.writes()).toHaveLength(1));
    const [write] = backend.writes();
    expect(write).toMatchObject({ method: 'PUT' });
    expect(write!.url).toContain('/api/time/backlog/b-1/');
    expect(write!.body).toMatchObject({
      title: 'Dentysta w piątek',
      categoryId: 'work',
    });
    expect(write!.body).not.toHaveProperty('day');
  });

  it('restores the task when saving fails', async () => {
    const user = userEvent.setup();
    backend.seedBacklog([backlogTask()]);
    backend.state.failWrites = true;
    renderTime('day', TODAY, '&modal=backlog&modal=backlog-edit:b-1');

    const form = within(
      await screen.findByRole('dialog', { name: 'Edytuj zadanie z backlogu' }),
    );
    const name = form.getByLabelText('Nazwa');
    await user.clear(name);
    await user.type(name, 'Inna nazwa');
    await user.click(form.getByRole('button', { name: 'Zapisz' }));

    expect(await screen.findByText('BACKLOG_UPDATE_FAILED')).toBeVisible();
    expect(await screen.findByText('Umówić dentystę')).toBeVisible();
  });
});

describe('backlog custom date', () => {
  it('moves a task to a picked day', async () => {
    const user = userEvent.setup();
    backend.seedBacklog([backlogTask()]);
    renderTime();
    const list = await openBacklog(user);

    fireEvent.change(
      await list.findByLabelText('Przenieś na wybrany dzień: Umówić dentystę'),
      { target: { value: '2026-10-30' } },
    );

    expect(
      await screen.findByText('Przeniesiono „Umówić dentystę” na 30.10.'),
    ).toBeVisible();
    await waitFor(() => expect(backend.writes()).toHaveLength(1));
    expect(backend.writes()[0]!.body).toMatchObject({
      day: '2026-10-30',
      at: null,
    });
    expect(
      await list.findByRole('heading', { name: 'Backlog jest pusty' }),
    ).toBeVisible();
  });
});

describe('backlog deleting', () => {
  it('removes a task only after confirmation', async () => {
    const user = userEvent.setup();
    backend.seedBacklog([backlogTask()]);
    renderTime();
    const list = await openBacklog(user);

    await user.click(
      await list.findByRole('button', {
        name: 'Usuń z backlogu: Umówić dentystę',
      }),
    );

    expect(await screen.findByText('Usunąć zadanie?')).toBeVisible();
    expect(backend.writes()).toHaveLength(0);
    await user.click(
      within(screen.getAllByRole('dialog').at(-1)!).getByRole('button', {
        name: 'Usuń',
      }),
    );

    expect(await screen.findByText('Usunięto zadanie.')).toBeVisible();
    await waitFor(() => expect(backend.writes()).toHaveLength(1));
    expect(backend.writes()[0]!.url).toContain('/api/time/tasks/b-1/');
    expect(
      await list.findByRole('heading', { name: 'Backlog jest pusty' }),
    ).toBeVisible();
  });
});

describe('backlog dialog scrolling', () => {
  it('has no scroll area of its own, the dialog is the only scroller', async () => {
    const user = userEvent.setup();
    backend.seedBacklog([backlogTask({ id: 'b1', title: 'Pierwsze' })]);
    renderTime();

    const dialog = await openBacklog(user);

    const list = dialog.getByRole('list');
    expect(list.className).not.toMatch(/overflow-y-(auto|scroll)/);
    expect(list.className).not.toMatch(/max-h-/);
  });
});

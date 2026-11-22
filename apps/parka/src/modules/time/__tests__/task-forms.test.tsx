import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { sortPriorities } from '../domain/priority';
import type { Priority, PriorityId } from '../domain/models';
import { renderTime } from './render-time';
import { task, setupTimeBackend } from './time-backend';
import { openEditor } from './edit-task';

const backend = setupTimeBackend();

afterEach(() => vi.useRealTimers());

const modalsInUrl = () =>
  new URLSearchParams(window.location.search).getAll('modal');

const dialogs = () => screen.queryAllByRole('dialog', { hidden: true });

const topDialog = () => within(dialogs().at(-1)!);

const priorityOptions = async (
  user: ReturnType<typeof userEvent.setup>,
  dialog: ReturnType<typeof within>,
) => {
  await user.click(dialog.getByRole('combobox', { name: 'Priorytet' }));
  const names = (await screen.findAllByRole('option')).map(
    (option) => option.textContent,
  );
  await user.keyboard('{Escape}');
  return names;
};

const ready = async () => {
  renderTime();
  await screen.findByRole('heading', { name: 'Brak zadań' });
};

const openFromMenu = async (
  user: ReturnType<typeof userEvent.setup>,
  option: 'Zadanie' | 'Zadanie cykliczne' | 'Kategorie' | 'Priorytety',
) => {
  await ready();
  const [trigger] = screen.getAllByRole('button', { name: /^Dodaj$/ });
  await user.click(trigger!);
  await user.click(await screen.findByRole('menuitem', { name: option }));
  return screen.findByRole('dialog');
};

describe('time dialogs focus', () => {
  it('does not focus any text input when a form opens', async () => {
    const user = userEvent.setup();

    const dialog = await openFromMenu(user, 'Zadanie');

    expect(
      within(dialog).getByRole('textbox', { name: 'Nazwa' }),
    ).not.toHaveFocus();
    expect(dialog.contains(document.activeElement)).toBe(true);
    expect(document.activeElement?.tagName).not.toBe('INPUT');
  });

  it('does not focus the name when a category or priority form opens', async () => {
    const user = userEvent.setup();

    const list = await openFromMenu(user, 'Kategorie');
    await user.click(within(list).getByRole('button', { name: 'Dodaj' }));
    await waitFor(() => expect(dialogs()).toHaveLength(2));

    const form = topDialog();
    expect(document.activeElement?.tagName).not.toBe('INPUT');
    expect(form.getByRole('textbox', { name: 'Nazwa' })).not.toHaveFocus();
  });
});

describe('time add menu', () => {
  it('offers task, recurring task, backlog, categories and priorities', async () => {
    const user = userEvent.setup();
    await ready();

    await user.click(screen.getAllByRole('button', { name: /^Dodaj$/ })[0]!);

    const items = await screen.findAllByRole('menuitem');
    expect(items.map((item) => item.textContent)).toEqual([
      'Zadanie',
      'Zadanie cykliczne',
      'Do backlogu',
      'Kategorie',
      'Priorytety',
      'Statusy zadań',
    ]);
  });

  const openAddMenu = async (user: ReturnType<typeof userEvent.setup>) => {
    await ready();
    await user.click(screen.getAllByRole('button', { name: /^Dodaj$/ })[0]!);
    await screen.findAllByRole('menuitem');
  };

  it('moves between options with arrows', async () => {
    const user = userEvent.setup();
    await openAddMenu(user);

    await user.keyboard('{ArrowDown}');

    expect(
      screen.getByRole('menuitem', { name: 'Zadanie cykliczne' }),
    ).toHaveFocus();
  });

  it('closes the options on Escape', async () => {
    const user = userEvent.setup();
    await openAddMenu(user);

    await user.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
  });

  it('opens the priorities list from the menu, leading to the form', async () => {
    const user = userEvent.setup();

    const list = within(await openFromMenu(user, 'Priorytety'));

    expect(modalsInUrl()).toEqual(['priorities']);
    expect(list.getByText('Wszystkie priorytety zadań.')).toBeVisible();
    await user.click(list.getByRole('button', { name: 'Dodaj' }));
    await waitFor(() =>
      expect(modalsInUrl()).toEqual(['priorities', 'priority-new']),
    );
    expect(screen.getByText('Nowy priorytet')).toBeVisible();
  });
});

describe('time task form', () => {
  it('opens the recurring task form with repeating on', async () => {
    const user = userEvent.setup();
    await openFromMenu(user, 'Zadanie cykliczne');

    expect(
      topDialog().getByRole('switch', { name: 'Powtarzaj' }),
    ).toBeChecked();
    expect(topDialog().getByText('Częstotliwość')).toBeVisible();
  });

  it('asks for a title before saving', async () => {
    const user = userEvent.setup();
    await openFromMenu(user, 'Zadanie');

    await user.click(topDialog().getByRole('button', { name: 'Dodaj' }));

    expect(await screen.findByText('Podaj nazwę zadania.')).toBeVisible();
    expect(modalsInUrl()).toEqual(['task-new']);
    expect(backend.writes()).toHaveLength(0);
  });

  it('lists priorities highest first, medium selected by default', async () => {
    const user = userEvent.setup();

    const dialog = within(await openFromMenu(user, 'Zadanie'));

    expect(
      dialog.getByRole('combobox', { name: 'Priorytet' }),
    ).toHaveTextContent('Średni');
    expect(await priorityOptions(user, dialog)).toEqual([
      'Wysoki',
      'Średni',
      'Niski',
    ]);
  });

  it('stacks the priorities list over the task form', async () => {
    const user = userEvent.setup();
    await openFromMenu(user, 'Zadanie');

    await user.click(
      screen.getByRole('button', { name: 'Zarządzaj priorytetami' }),
    );

    await waitFor(() => expect(dialogs()).toHaveLength(2));
    expect(modalsInUrl()).toEqual(['task-new', 'priorities']);
  });

  it('selects a new priority created over the task form', async () => {
    const user = userEvent.setup();
    await openFromMenu(user, 'Zadanie');
    await user.click(
      screen.getByRole('button', { name: 'Zarządzaj priorytetami' }),
    );
    await waitFor(() => expect(dialogs()).toHaveLength(2));
    await user.click(topDialog().getByRole('button', { name: 'Dodaj' }));
    await waitFor(() => expect(dialogs()).toHaveLength(3));
    const form = topDialog();

    await user.type(form.getByRole('textbox', { name: 'Nazwa' }), 'Pilny');
    await user.click(form.getByRole('radio', { name: '7' }));
    await user.click(form.getByRole('button', { name: 'Dodaj' }));

    await waitFor(() =>
      expect(modalsInUrl()).toEqual(['task-new', 'priorities']),
    );
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Zamknij',
      }),
    );
    await waitFor(() => expect(modalsInUrl()).toEqual(['task-new']));
    const form2 = within(screen.getByRole('dialog'));
    await waitFor(() =>
      expect(
        form2.getByRole('combobox', { name: 'Priorytet' }),
      ).toHaveTextContent('Pilny'),
    );
    expect(await priorityOptions(user, form2)).toEqual([
      'Wysoki',
      'Pilny',
      'Średni',
      'Niski',
    ]);
    await waitFor(() =>
      expect(backend.writes().map((call) => call.body)).toEqual([
        expect.objectContaining({ name: 'Pilny', value: 7 }),
      ]),
    );
  });

  it('offers category and priority selects, each with a manage link', async () => {
    const user = userEvent.setup();

    const dialog = within(await openFromMenu(user, 'Zadanie'));

    expect(dialog.getByRole('combobox', { name: 'Kategoria' })).toBeVisible();
    expect(
      dialog.getByRole('button', { name: 'Zarządzaj kategoriami' }),
    ).toBeVisible();
    expect(
      dialog.getByRole('button', { name: 'Zarządzaj priorytetami' }),
    ).toBeVisible();
    expect(dialog.queryByRole('button', { name: /^Nowy|^Nowa/ })).toBeNull();
    expect(dialog.queryByRole('button', { name: 'Wszystkie' })).toBeNull();
    expect(dialog.queryByRole('button', { name: 'Edytuj statusy' })).toBeNull();
  });

  it('picks a category from the select', async () => {
    const user = userEvent.setup();
    const dialog = within(await openFromMenu(user, 'Zadanie'));

    await user.click(dialog.getByRole('combobox', { name: 'Kategoria' }));
    await user.click(await screen.findByRole('option', { name: 'Dom' }));

    expect(
      dialog.getByRole('combobox', { name: 'Kategoria' }),
    ).toHaveTextContent('Dom');
  });
});

describe('time task edit', () => {
  it('opens a task with its saved priority selected', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    renderTime();

    await openEditor(user, 'Raport miesięczny');

    const dialog = within(await screen.findByRole('dialog'));
    expect(
      dialog.getByRole('combobox', { name: 'Priorytet' }),
    ).toHaveTextContent('Wysoki');
    expect(dialog.getByRole('button', { name: 'Zapisz' })).toBeVisible();
  });

  it('marks high and low priority tasks in the list', async () => {
    backend.seed([
      task(),
      task({ id: 't-2', title: 'Spacer', priorityId: 'low', at: '13:00' }),
    ]);
    renderTime();

    const rowOf = async (title: string) =>
      (
        await screen.findByRole('button', {
          name: `Szczegóły zadania: ${title}`,
        })
      ).closest('li')!;

    expect(
      within(await rowOf('Raport miesięczny')).getByText('Wysoki'),
    ).toBeInTheDocument();
    expect(
      within(await rowOf('Spacer')).getByText('Niski'),
    ).toBeInTheDocument();
  });
});

describe('priority sorting', () => {
  it('orders by value descending, ties keep order', () => {
    const priority = (id: string, name: string, value: number): Priority => ({
      id: id as PriorityId,
      name,
      value,
    });

    const sorted = sortPriorities([
      priority('a', 'B', 5),
      priority('b', 'A', 5),
      priority('c', 'C', 1),
      priority('d', 'D', 9),
    ]);

    expect(sorted.map((p) => p.id)).toEqual(['d', 'a', 'b', 'c']);
  });
});

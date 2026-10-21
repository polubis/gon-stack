import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { sortPriorities } from '../domain/priority';
import type { Priority, PriorityId } from '../domain/models';
import { renderTime } from './render-time';
import { task, setupTimeBackend } from './time-backend';

const backend = setupTimeBackend();

afterEach(() => vi.useRealTimers());

const modalsInUrl = () =>
  new URLSearchParams(window.location.search).getAll('modal');

const dialogs = () => screen.queryAllByRole('dialog', { hidden: true });

const topDialog = () => within(dialogs().at(-1)!);

const priorityLabels = (dialog: ReturnType<typeof within>) =>
  dialog
    .getAllByRole('radio')
    .filter((radio) => radio.getAttribute('name') === 'task-priority')
    .map((radio) => radio.closest('label')?.textContent);

const ready = async () => {
  renderTime();
  await screen.findByRole('heading', { name: 'Brak zadań' });
};

const openFromMenu = async (
  user: ReturnType<typeof userEvent.setup>,
  option: 'Zadanie' | 'Kategoria' | 'Priorytet',
) => {
  await ready();
  const [trigger] = screen.getAllByRole('button', { name: /^Dodaj$/ });
  await user.click(trigger!);
  await user.click(await screen.findByRole('menuitem', { name: option }));
  return screen.findByRole('dialog');
};

describe('time add menu', () => {
  it('offers task, backlog, category and priority', async () => {
    const user = userEvent.setup();
    await ready();

    await user.click(screen.getAllByRole('button', { name: /^Dodaj$/ })[0]!);

    const items = await screen.findAllByRole('menuitem');
    expect(items.map((item) => item.textContent)).toEqual([
      'Zadanie',
      'Do backlogu',
      'Kategoria',
      'Priorytet',
    ]);
  });

  it('moves between options with arrows and closes on Escape', async () => {
    const user = userEvent.setup();
    await ready();

    await user.click(screen.getAllByRole('button', { name: /^Dodaj$/ })[0]!);
    await screen.findAllByRole('menuitem');
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Do backlogu' })).toHaveFocus();

    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
  });

  it('opens the priority form from the menu', async () => {
    const user = userEvent.setup();

    await openFromMenu(user, 'Priorytet');

    expect(modalsInUrl()).toEqual(['priority-new']);
    expect(screen.getByText('Nowy priorytet')).toBeVisible();
  });
});

describe('time task form', () => {
  it('asks for a title before saving', async () => {
    const user = userEvent.setup();
    await openFromMenu(user, 'Zadanie');

    await user.click(topDialog().getByRole('button', { name: 'Dodaj' }));

    expect(await screen.findByText('Podaj nazwę zadania.')).toBeVisible();
    expect(modalsInUrl()).toEqual(['task-new']);
    expect(backend.writes()).toHaveLength(0);
  });

  it('lists priorities by value, medium selected by default', async () => {
    const user = userEvent.setup();

    const dialog = within(await openFromMenu(user, 'Zadanie'));

    expect(priorityLabels(dialog)).toEqual([
      '2 - Niski',
      '5 - Średni',
      '9 - Wysoki',
    ]);
    expect(dialog.getByRole('radio', { name: '5 - Średni' })).toBeChecked();
  });

  it('selects a new priority created over the task form', async () => {
    const user = userEvent.setup();
    await openFromMenu(user, 'Zadanie');

    await user.click(screen.getByRole('button', { name: 'Nowy priorytet' }));
    await waitFor(() => expect(dialogs()).toHaveLength(2));
    expect(modalsInUrl()).toEqual(['task-new', 'priority-new']);

    const form = topDialog();
    await user.type(form.getByRole('textbox', { name: 'Nazwa' }), 'Pilny');
    await user.click(form.getByRole('radio', { name: '7' }));
    await user.click(form.getByRole('button', { name: 'Dodaj priorytet' }));

    await waitFor(() => expect(modalsInUrl()).toEqual(['task-new']));
    const form2 = within(screen.getByRole('dialog'));
    expect(form2.getByRole('radio', { name: '7 - Pilny' })).toBeChecked();
    expect(priorityLabels(form2)).toEqual([
      '2 - Niski',
      '5 - Średni',
      '7 - Pilny',
      '9 - Wysoki',
    ]);
    await waitFor(() =>
      expect(backend.writes().map((call) => call.body)).toEqual([
        expect.objectContaining({ name: 'Pilny', value: 7 }),
      ]),
    );
  });

  it('selects a new category created over the task form', async () => {
    const user = userEvent.setup();
    await openFromMenu(user, 'Zadanie');

    await user.click(screen.getByRole('button', { name: 'Nowa kategoria' }));
    await waitFor(() => expect(dialogs()).toHaveLength(2));

    const form = topDialog();
    await user.click(form.getByRole('button', { name: 'Dodaj kategorię' }));
    expect(await form.findByText('Podaj nazwę kategorii.')).toBeVisible();

    await user.type(form.getByRole('textbox', { name: 'Nazwa' }), 'Finanse');
    await user.click(form.getByRole('button', { name: 'Dodaj kategorię' }));

    await waitFor(() => expect(modalsInUrl()).toEqual(['task-new']));
    expect(
      within(screen.getByRole('dialog')).getByRole('radio', {
        name: 'Finanse',
      }),
    ).toBeChecked();
    await waitFor(() =>
      expect(backend.writes().map((call) => call.body)).toEqual([
        expect.objectContaining({ name: 'Finanse' }),
      ]),
    );
  });

  it('browses categories stacked over the task form', async () => {
    const user = userEvent.setup();
    await openFromMenu(user, 'Zadanie');

    await user.click(screen.getByRole('button', { name: 'Wszystkie' }));

    await waitFor(() => expect(dialogs()).toHaveLength(2));
    expect(modalsInUrl()).toEqual(['task-new', 'categories']);
    expect(topDialog().getAllByRole('listitem')).toHaveLength(5);
  });
});

describe('time task edit', () => {
  it('opens a task with its saved priority selected', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    renderTime();

    await user.click(
      await screen.findByRole('button', {
        name: 'Edytuj zadanie: Raport miesięczny',
      }),
    );

    const dialog = within(await screen.findByRole('dialog'));
    expect(dialog.getByRole('radio', { name: '9 - Wysoki' })).toBeChecked();
    expect(dialog.getByRole('button', { name: 'Zapisz' })).toBeVisible();
  });

  it('marks high and low priority tasks in the list', async () => {
    backend.seed([
      task(),
      task({ id: 't-2', title: 'Spacer', priorityId: 'low', at: '13:00' }),
    ]);
    renderTime();

    expect(await screen.findByText('Priorytet 9: Wysoki')).toBeInTheDocument();
    expect(screen.getByText('Priorytet 2: Niski')).toBeInTheDocument();
  });
});

describe('priority sorting', () => {
  it('orders by value, then by name', () => {
    const priority = (id: string, name: string, value: number): Priority => ({
      id: id as PriorityId,
      name,
      value,
    });

    const sorted = sortPriorities([
      priority('a', 'B', 5),
      priority('b', 'A', 5),
      priority('c', 'C', 1),
    ]);

    expect(sorted.map((p) => p.id)).toEqual(['c', 'b', 'a']);
  });
});

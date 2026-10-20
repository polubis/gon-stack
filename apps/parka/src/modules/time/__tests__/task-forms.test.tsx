import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { sortPriorities } from '../domain/priority';
import { Main } from '../presentation/day';

const modalsInUrl = () =>
  new URLSearchParams(window.location.search).getAll('modal');

const openFromMenu = async (
  user: ReturnType<typeof userEvent.setup>,
  option: 'Zadanie' | 'Kategoria' | 'Priorytet',
) => {
  const [trigger] = screen.getAllByRole('button', { name: /^Dodaj$/ });
  await user.click(trigger!);
  await user.click(await screen.findByRole('menuitem', { name: option }));
  return screen.findByRole('dialog');
};

const dialogs = () => screen.queryAllByRole('dialog', { hidden: true });

const topDialog = () => within(dialogs().at(-1)!);

const priorityLabels = (dialog: ReturnType<typeof within>) =>
  dialog
    .getAllByRole('radio')
    .filter((radio) => radio.getAttribute('name') === 'task-priority')
    .map((radio) => radio.closest('label')?.textContent);

describe('time add menu', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/app/time/');
  });

  it('offers task, category and priority', async () => {
    const user = userEvent.setup();
    render(<Main />);

    await user.click(screen.getAllByRole('button', { name: /^Dodaj$/ })[0]!);

    const items = await screen.findAllByRole('menuitem');
    expect(items.map((item) => item.textContent)).toEqual([
      'Zadanie',
      'Kategoria',
      'Priorytet',
    ]);
  });

  it('moves between options with arrows and closes on Escape', async () => {
    const user = userEvent.setup();
    render(<Main />);

    await user.click(screen.getAllByRole('button', { name: /^Dodaj$/ })[0]!);
    await screen.findAllByRole('menuitem');
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Kategoria' })).toHaveFocus();

    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
  });

  it('opens the priority form from the menu', async () => {
    const user = userEvent.setup();
    render(<Main />);

    await openFromMenu(user, 'Priorytet');
    expect(modalsInUrl()).toEqual(['priority-new']);
    expect(screen.getByText('Nowy priorytet')).toBeVisible();
  });
});

describe('time task form', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/app/time/');
  });

  it('asks for a title before saving', async () => {
    const user = userEvent.setup();
    render(<Main />);

    await openFromMenu(user, 'Zadanie');
    await user.click(topDialog().getByRole('button', { name: 'Dodaj' }));

    expect(await screen.findByText('Podaj nazwę zadania.')).toBeVisible();
    expect(modalsInUrl()).toEqual(['task-new']);
  });

  it('lists priorities by value, medium selected by default', async () => {
    const user = userEvent.setup();
    render(<Main />);

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
    render(<Main />);
    await openFromMenu(user, 'Zadanie');

    await user.click(screen.getByRole('button', { name: 'Nowy priorytet' }));
    await waitFor(() => expect(dialogs()).toHaveLength(2));
    expect(modalsInUrl()).toEqual(['task-new', 'priority-new']);

    const form = topDialog();
    await user.type(form.getByRole('textbox', { name: 'Nazwa' }), 'Pilny');
    await user.click(form.getByRole('radio', { name: '7' }));
    await user.click(form.getByRole('button', { name: 'Dodaj priorytet' }));

    await waitFor(() => expect(modalsInUrl()).toEqual(['task-new']));
    const task = within(screen.getByRole('dialog'));
    expect(task.getByRole('radio', { name: '7 - Pilny' })).toBeChecked();
    expect(priorityLabels(task)).toEqual([
      '2 - Niski',
      '5 - Średni',
      '7 - Pilny',
      '9 - Wysoki',
    ]);
  });

  it('selects a new category created over the task form', async () => {
    const user = userEvent.setup();
    render(<Main />);
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
  });

  it('browses categories stacked over the task form', async () => {
    const user = userEvent.setup();
    render(<Main />);
    await openFromMenu(user, 'Zadanie');

    await user.click(screen.getByRole('button', { name: 'Wszystkie' }));

    await waitFor(() => expect(dialogs()).toHaveLength(2));
    expect(modalsInUrl()).toEqual(['task-new', 'categories']);
    expect(topDialog().getAllByRole('listitem')).toHaveLength(5);
  });
});

describe('time task edit', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/app/time/');
  });

  it('opens a task with its saved priority selected', async () => {
    const user = userEvent.setup();
    render(<Main />);

    await user.click(
      screen.getByRole('button', { name: 'Edytuj zadanie: Kurs angielskiego' }),
    );

    const dialog = within(await screen.findByRole('dialog'));
    expect(dialog.getByRole('radio', { name: '9 - Wysoki' })).toBeChecked();
    expect(dialog.getByRole('button', { name: 'Zapisz' })).toBeVisible();
  });

  it('marks high and low priority tasks in the list', () => {
    render(<Main />);

    expect(screen.getAllByText('Priorytet 9: Wysoki').length).toBeGreaterThan(
      0,
    );
    expect(screen.getAllByText('Priorytet 2: Niski').length).toBeGreaterThan(0);
  });
});

describe('priority sorting', () => {
  it('orders by value, then by name', () => {
    const sorted = sortPriorities([
      { id: 'a', name: 'B', value: 5 },
      { id: 'b', name: 'A', value: 5 },
      { id: 'c', name: 'C', value: 1 },
    ]);

    expect(sorted.map((p) => p.id)).toEqual(['c', 'b', 'a']);
  });
});

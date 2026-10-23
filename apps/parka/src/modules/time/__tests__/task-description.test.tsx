import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderTime } from './render-time';
import { backlogTask, setupTimeBackend, task } from './time-backend';

const backend = setupTimeBackend();

afterEach(() => vi.useRealTimers());

const modalsInUrl = () =>
  new URLSearchParams(window.location.search).getAll('modal');

const openNewTask = async (user: ReturnType<typeof userEvent.setup>) => {
  renderTime();
  await screen.findByRole('heading', { name: 'Brak zadań' });
  await user.click(screen.getAllByRole('button', { name: /^Dodaj$/ })[0]!);
  await user.click(await screen.findByRole('menuitem', { name: 'Zadanie' }));
  return within(await screen.findByRole('dialog'));
};

const LONG = Array.from({ length: 12 }, (_, i) => `Linia ${i + 1}`).join('\n');

describe('task title length', () => {
  it('accepts 160 characters and no more', async () => {
    const user = userEvent.setup();
    const form = await openNewTask(user);
    const name = form.getByLabelText('Nazwa');

    await user.click(name);
    await user.paste('x'.repeat(200));

    expect(name).toHaveValue('x'.repeat(160));
  });

  it('accepts 160 characters in a backlog task too', async () => {
    const user = userEvent.setup();
    renderTime();
    await screen.findByRole('heading', { name: 'Brak zadań' });
    await user.click(screen.getAllByRole('button', { name: /^Dodaj$/ })[0]!);
    await user.click(
      await screen.findByRole('menuitem', { name: 'Do backlogu' }),
    );
    const form = within(await screen.findByRole('dialog'));

    await user.click(form.getByLabelText('Nazwa'));
    await user.paste('y'.repeat(200));

    expect(form.getByLabelText('Nazwa')).toHaveValue('y'.repeat(160));
  });
});

describe('task description field', () => {
  it('counts characters and saves the text with the task', async () => {
    const user = userEvent.setup();
    const form = await openNewTask(user);

    await user.type(form.getByLabelText('Nazwa'), 'Raport');
    await user.type(form.getByLabelText('Opis (opcjonalnie)'), 'Dwa słowa');
    expect(form.getByText(/^9\/5000/)).toBeVisible();
    await user.click(form.getByRole('button', { name: 'Dodaj' }));

    await waitFor(() => expect(backend.writes()).toHaveLength(1));
    expect(backend.writes()[0]!.body).toMatchObject({
      title: 'Raport',
      description: 'Dwa słowa',
    });
  });

  it('sends no description when the field is blank', async () => {
    const user = userEvent.setup();
    const form = await openNewTask(user);

    await user.type(form.getByLabelText('Nazwa'), 'Raport');
    await user.type(form.getByLabelText('Opis (opcjonalnie)'), '   ');
    await user.click(form.getByRole('button', { name: 'Dodaj' }));

    await waitFor(() => expect(backend.writes()).toHaveLength(1));
    expect(backend.writes()[0]!.body).toMatchObject({ description: null });
  });

  it('limits the description to 5000 characters', async () => {
    const user = userEvent.setup();
    const form = await openNewTask(user);
    const field = form.getByLabelText('Opis (opcjonalnie)');

    await user.click(field);
    await user.paste('a'.repeat(5100));

    expect(field).toHaveValue('a'.repeat(5000));
  });

  it('clears the description with the x button and focuses the field', async () => {
    const user = userEvent.setup();
    const form = await openNewTask(user);
    const field = form.getByLabelText('Opis (opcjonalnie)');
    expect(form.queryByRole('button', { name: 'Wyczyść: Opis' })).toBeNull();

    await user.type(field, 'coś');
    await user.click(form.getByRole('button', { name: 'Wyczyść: Opis' }));

    expect(field).toHaveValue('');
    expect(field).toHaveFocus();
  });

  it('keeps an existing description when editing', async () => {
    const user = userEvent.setup();
    backend.seed([task({ description: 'Stare notatki' })]);
    renderTime();

    await user.click(
      await screen.findByRole('button', {
        name: 'Edytuj zadanie: Raport miesięczny',
      }),
    );
    const form = within(await screen.findByRole('dialog'));

    expect(form.getByLabelText('Opis (opcjonalnie)')).toHaveValue(
      'Stare notatki',
    );
  });
});

describe('fullscreen description editor', () => {
  it('opens over the form, syncs the text back and closes with Escape', async () => {
    const user = userEvent.setup();
    const form = await openNewTask(user);
    await user.type(form.getByLabelText('Opis (opcjonalnie)'), 'Start');

    await user.click(
      form.getByRole('button', { name: 'Edytuj opis na pełnym ekranie' }),
    );
    const editor = await screen.findByLabelText('Opis w pełnym ekranie');

    expect(modalsInUrl()).toEqual(['task-new', 'description-editor']);
    expect(editor).toHaveValue('Start');
    expect(editor).toHaveFocus();

    await user.type(editor, ' i dalej');
    await user.keyboard('{Escape}');

    await waitFor(() =>
      expect(screen.queryByLabelText('Opis w pełnym ekranie')).toBeNull(),
    );
    expect(modalsInUrl()).toEqual(['task-new']);
    expect(screen.getByLabelText('Opis (opcjonalnie)')).toHaveValue(
      'Start i dalej',
    );
  });

  it('closes with the done button', async () => {
    const user = userEvent.setup();
    const form = await openNewTask(user);

    await user.click(
      form.getByRole('button', { name: 'Edytuj opis na pełnym ekranie' }),
    );
    await user.click(await screen.findByRole('button', { name: 'Gotowe' }));

    await waitFor(() => expect(modalsInUrl()).toEqual(['task-new']));
  });
});

describe('task details', () => {
  const openDetails = async (
    user: ReturnType<typeof userEvent.setup>,
    title = 'Raport miesięczny',
  ) => {
    await user.click(
      await screen.findByRole('button', { name: `Więcej: ${title}` }),
    );
    await user.click(
      await screen.findByRole('menuitem', {
        name: `Szczegóły zadania: ${title}`,
      }),
    );
    return within(await screen.findByRole('dialog'));
  };

  it('shows a short description in full, with no show more', async () => {
    const user = userEvent.setup();
    backend.seed([task({ description: 'Krótka notatka' })]);
    renderTime();

    const details = await openDetails(user);

    expect(details.getByText('Krótka notatka')).toBeVisible();
    expect(
      details.queryByRole('button', { name: /Pokaż cały opis/ }),
    ).toBeNull();
  });

  it('shows no description section when there is none', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    renderTime();

    const details = await openDetails(user);

    expect(details.getByText('Raport miesięczny')).toBeVisible();
    expect(details.queryByRole('region', { name: 'Opis' })).toBeNull();
  });

  it('offers the whole text of a long description on show more', async () => {
    const user = userEvent.setup();
    backend.seed([task({ description: LONG })]);
    renderTime();

    const details = await openDetails(user);
    await user.click(
      details.getByRole('button', {
        name: 'Pokaż cały opis: Raport miesięczny',
      }),
    );

    expect(modalsInUrl()).toEqual(['task-view:t-1', 'task-description:t-1']);
    const full = await screen.findByRole('region', { name: 'Pełny opis' });
    expect(full).toHaveTextContent('Linia 1');
    expect(full).toHaveTextContent('Linia 12');
  });

  it('goes from details to the editor', async () => {
    const user = userEvent.setup();
    backend.seed([task({ description: 'Notatka' })]);
    renderTime();

    const details = await openDetails(user);
    await user.click(details.getByRole('button', { name: 'Edytuj' }));

    await waitFor(() => expect(modalsInUrl()).toEqual(['task-edit:t-1']));
    expect(await screen.findByLabelText('Opis (opcjonalnie)')).toHaveValue(
      'Notatka',
    );
  });

  it('never shows the description in the list', async () => {
    backend.seed([task({ description: 'Tajna notatka' })]);
    renderTime();

    await screen.findByRole('button', {
      name: 'Edytuj zadanie: Raport miesięczny',
    });

    expect(screen.queryByText('Tajna notatka')).toBeNull();
  });

  it('shows the description of a backlog task', async () => {
    const user = userEvent.setup();
    backend.seedBacklog([backlogTask({ description: 'Zadzwonić rano' })]);
    renderTime();

    await user.click(await screen.findByRole('button', { name: /^Backlog/ }));
    await user.click(
      await screen.findByRole('button', {
        name: 'Szczegóły zadania: Umówić dentystę',
      }),
    );

    expect(await screen.findByText('Zadzwonić rano')).toBeVisible();
  });
});

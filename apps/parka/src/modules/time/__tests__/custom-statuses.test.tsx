import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderTime } from './render-time';
import { setupTimeBackend, task } from './time-backend';

const backend = setupTimeBackend();

afterEach(() => vi.useRealTimers());

const REVIEW = { id: 'tstatus-review', name: 'Review' };

const box = () =>
  screen.findByRole('checkbox', { name: 'Zrobione: Raport miesięczny' });

const openEditor = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(
    (await screen.findAllByRole('button', { name: 'Dodaj' }))[0]!,
  );
  await user.click(
    await screen.findByRole('menuitem', { name: 'Statusy zadań' }),
  );
  return screen.findByRole('dialog', { name: 'Statusy zadań' });
};

describe('custom task statuses', () => {
  it('shows the current steps first, between the fixed start and end', async () => {
    const user = userEvent.setup();
    renderTime();

    const dialog = within(await openEditor(user));

    expect(dialog.getByText('Do zrobienia')).toBeVisible();
    expect(
      dialog.getByRole('textbox', { name: 'Nazwa statusu 1' }),
    ).toHaveValue('W trakcie');
    expect(dialog.getByText('Zrobione')).toBeVisible();
    expect(
      dialog.getByRole('button', { name: 'Usuń status: W trakcie' }),
    ).toBeDisabled();
  });

  it('saves a new step after the existing one', async () => {
    const user = userEvent.setup();
    renderTime();

    const dialog = within(await openEditor(user));
    await user.click(dialog.getByRole('button', { name: 'Dodaj status' }));
    await user.type(
      dialog.getByRole('textbox', { name: 'Nazwa statusu 2' }),
      'Review',
    );
    await user.click(dialog.getByRole('button', { name: 'Zapisz' }));

    expect(await screen.findByText('Zapisano statusy.')).toBeVisible();
    expect(backend.writes()).toHaveLength(1);
    expect(backend.writes()[0]).toMatchObject({
      body: {
        statuses: [
          { id: 'in_progress', name: 'W trakcie' },
          { id: expect.stringMatching(/^tstatus-/), name: 'Review' },
        ],
      },
    });
  });

  it('refuses an empty or repeated name', async () => {
    const user = userEvent.setup();
    renderTime();

    const dialog = within(await openEditor(user));
    await user.click(dialog.getByRole('button', { name: 'Dodaj status' }));
    await user.click(dialog.getByRole('button', { name: 'Zapisz' }));
    expect(await dialog.findByText('Podaj nazwę statusu.')).toBeVisible();

    await user.type(
      dialog.getByRole('textbox', { name: 'Nazwa statusu 2' }),
      'w trakcie',
    );
    await user.click(dialog.getByRole('button', { name: 'Zapisz' }));

    expect(
      await dialog.findByText('Status o takiej nazwie już istnieje.'),
    ).toBeVisible();
    expect(backend.writes()).toHaveLength(0);
  });

  it('moves a step up and saves the new order', async () => {
    const user = userEvent.setup();
    backend.statuses([{ id: 'in_progress', name: 'W trakcie' }, REVIEW]);
    renderTime();

    const dialog = within(await openEditor(user));
    await user.click(
      dialog.getByRole('button', { name: 'Przesuń wyżej: Review' }),
    );
    await user.click(dialog.getByRole('button', { name: 'Zapisz' }));

    await waitFor(() => expect(backend.writes()).toHaveLength(1));
    expect(backend.writes()[0]?.body).toMatchObject({
      statuses: [{ id: REVIEW.id }, { id: 'in_progress' }],
    });
  });

  it('goes through the custom step on each click of the task circle', async () => {
    const user = userEvent.setup();
    backend.statuses([{ id: 'in_progress', name: 'W trakcie' }, REVIEW]);
    backend.seed([task()]);
    renderTime();

    const circle = await box();
    await user.click(circle);
    await user.click(circle);
    expect(await screen.findByText('Zadanie: Review.')).toBeVisible();
    expect(await screen.findByText('Review')).toBeVisible();
    await user.click(circle);

    await waitFor(() => expect(backend.writes()).toHaveLength(3));
    expect(backend.writes().map((w) => w.body)).toMatchObject([
      { inProgress: true, statusId: null, done: false },
      { inProgress: true, statusId: REVIEW.id, done: false },
      { inProgress: false, statusId: null, done: true },
    ]);
  });

  it('sets a step from the task form', async () => {
    const user = userEvent.setup();
    backend.statuses([{ id: 'in_progress', name: 'W trakcie' }, REVIEW]);
    backend.seed([task()]);
    renderTime();

    await user.click(
      await screen.findByRole('button', {
        name: 'Edytuj zadanie: Raport miesięczny',
      }),
    );
    await user.click(await screen.findByRole('combobox', { name: 'Status' }));
    await user.click(await screen.findByRole('option', { name: 'Review' }));
    await user.click(screen.getByRole('button', { name: 'Zapisz' }));

    await waitFor(() => expect(backend.writes()).toHaveLength(1));
    expect(backend.writes()[0]?.body).toMatchObject({
      id: 't-1',
      inProgress: true,
      statusId: REVIEW.id,
      done: false,
    });
  });
});

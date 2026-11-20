import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderTime } from './render-time';
import { setupTimeBackend, task } from './time-backend';
import { openEditor as openTaskEditor } from './edit-task';

const backend = setupTimeBackend();

afterEach(() => vi.useRealTimers());

const REVIEW = { id: 'tstatus-review', name: 'Review' };

const box = () =>
  screen.findByRole('button', { name: 'Następny krok: Raport miesięczny' });

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
    await user.click(dialog.getByRole('button', { name: 'Dodaj' }));
    await user.type(
      dialog.getByRole('textbox', { name: 'Nazwa statusu 2' }),
      'Review',
    );
    await user.click(dialog.getByRole('button', { name: 'Zapisz' }));

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

  it('refuses an empty name', async () => {
    const user = userEvent.setup();
    renderTime();
    const dialog = within(await openEditor(user));
    await user.click(dialog.getByRole('button', { name: 'Dodaj' }));

    await user.click(dialog.getByRole('button', { name: 'Zapisz' }));

    expect(await dialog.findByText('Podaj nazwę statusu.')).toBeVisible();
    expect(backend.writes()).toHaveLength(0);
  });

  it('refuses a repeated name', async () => {
    const user = userEvent.setup();
    renderTime();
    const dialog = within(await openEditor(user));
    await user.click(dialog.getByRole('button', { name: 'Dodaj' }));
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

  it('goes through the custom step on each click of the advance button', async () => {
    const user = userEvent.setup();
    backend.statuses([{ id: 'in_progress', name: 'W trakcie' }, REVIEW]);
    backend.seed([task()]);
    renderTime();
    const advance = await box();

    await user.click(advance);
    await user.click(advance);
    await user.click(advance);

    await waitFor(() => expect(backend.writes()).toHaveLength(3));
    expect(backend.writes().map((w) => w.body)).toMatchObject([
      { inProgress: true, statusId: null, done: false },
      { inProgress: true, statusId: REVIEW.id, done: false },
      { inProgress: false, statusId: null, done: true },
    ]);
  });

  it('names the custom step on the task after two clicks of the advance', async () => {
    const user = userEvent.setup();
    backend.statuses([{ id: 'in_progress', name: 'W trakcie' }, REVIEW]);
    backend.seed([task()]);
    renderTime();
    const advance = await box();

    await user.click(advance);
    await user.click(advance);

    expect(await screen.findByText('Review')).toBeVisible();
  });

  it('sets a step from the task form', async () => {
    const user = userEvent.setup();
    backend.statuses([{ id: 'in_progress', name: 'W trakcie' }, REVIEW]);
    backend.seed([task()]);
    renderTime();

    await openTaskEditor(user, 'Raport miesięczny');
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

describe('task status label', () => {
  it('writes the step as n/N with its name as the status advances', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    renderTime();
    const item = within((await box()).closest('li')!);

    expect(item.getByText('1/3')).toBeVisible();
    expect(item.getByText('Do zrobienia')).toBeVisible();

    await user.click(await box());
    expect(item.getByText('2/3')).toBeVisible();
    expect(item.getByText('W trakcie')).toBeVisible();

    await user.click(await box());
    expect(item.getByText('3/3')).toBeVisible();
    expect(item.getByText('Zrobione')).toBeVisible();
  });

  it('counts a custom step in the n/N label', async () => {
    const user = userEvent.setup();
    backend.statuses([{ id: 'in_progress', name: 'W trakcie' }, REVIEW]);
    backend.seed([task()]);
    renderTime();
    const item = within((await box()).closest('li')!);

    expect(item.getByText('1/4')).toBeVisible();
    await user.click(await box());
    await user.click(await box());

    expect(item.getByText('3/4')).toBeVisible();
    expect(item.getByText('Review')).toBeVisible();
  });
});

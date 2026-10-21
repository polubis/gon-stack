import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderTime } from './render-time';
import { task, setupTimeBackend } from './time-backend';

const backend = setupTimeBackend();

afterEach(() => vi.useRealTimers());

const DEVICE = {
  id: 'device-phone-1',
  name: 'Telefon Ani',
  type: 'mobile',
  avatar: null,
  customName: 'Telefon Ani',
  photo: null,
  model: null,
  os: 'Android 14',
  browser: 'Chrome 130',
  screen: null,
};

const row = (title: string) =>
  screen.findByRole('button', { name: `Edytuj zadanie: ${title}` });

const openAddDialog = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(
    await screen.findByRole('button', { name: 'Dodaj zadanie' }),
  );
  return within(await screen.findByRole('dialog'));
};

describe('task device', () => {
  it('attaches the creating device to a new task', async () => {
    const user = userEvent.setup();
    renderTime();
    const dialog = await openAddDialog(user);
    await user.type(dialog.getByRole('textbox', { name: 'Nazwa' }), 'Kurs');
    await user.click(dialog.getByRole('button', { name: 'Dodaj' }));

    await waitFor(() => expect(backend.writes()).toHaveLength(1));
    expect(backend.writes()[0]!.body).toMatchObject({
      device: { id: expect.stringMatching(/^device-/) as string },
    });
  });

  it('shows the device of a task in the row and in its popup', async () => {
    const user = userEvent.setup();
    backend.seed([task({ device: DEVICE })]);
    renderTime();

    const line = (await row('Raport miesięczny')).closest('li')!;
    expect(within(line).getByText('Telefon Ani')).toBeInTheDocument();

    await user.click(await row('Raport miesięczny'));
    const dialog = within(await screen.findByRole('dialog'));
    expect(dialog.getByText('device-phone-1')).toBeVisible();
  });

  it('shows the same row with a done toggle on a week day', async () => {
    const user = userEvent.setup();
    backend.seed([task({ device: DEVICE, at: null })]);
    renderTime('week');

    const box = (
      await screen.findAllByRole('checkbox', {
        name: 'Zrobione: Raport miesięczny',
      })
    )[0]!;
    expect(box).toHaveAttribute('aria-checked', 'false');
    await user.click(box);
    await waitFor(() =>
      expect(
        screen.getAllByRole('checkbox', {
          name: 'Zrobione: Raport miesięczny',
        })[0],
      ).toHaveAttribute('aria-checked', 'true'),
    );
    expect(
      within(box.closest('li')!).getByText('Telefon Ani'),
    ).toBeInTheDocument();
  });

  it('keeps the original device when a task is edited', async () => {
    const user = userEvent.setup();
    backend.seed([task({ device: DEVICE })]);
    renderTime();
    await user.click(await row('Raport miesięczny'));
    const dialog = within(await screen.findByRole('dialog'));
    await user.click(dialog.getByRole('button', { name: 'Zapisz' }));

    await waitFor(() => expect(backend.writes()).toHaveLength(1));
    expect(backend.writes()[0]!.body).toMatchObject({
      device: { id: 'device-phone-1' },
    });
  });

  it('shows no device for a task made before devices were tracked', async () => {
    backend.seed([task()]);
    renderTime();

    const line = (await row('Raport miesięczny')).closest('li')!;
    expect(within(line).queryByText('Telefon Ani')).toBeNull();
  });
});

describe('recurring tasks', () => {
  it('adds a rule and shows the task it made', async () => {
    const user = userEvent.setup();
    renderTime();
    const dialog = await openAddDialog(user);
    await user.type(dialog.getByRole('textbox', { name: 'Nazwa' }), 'Siłownia');
    await user.click(dialog.getByRole('switch', { name: 'Powtarzaj' }));
    await user.click(dialog.getByRole('button', { name: 'Dodaj' }));

    expect(await row('Siłownia')).toBeVisible();
    expect(await screen.findByText('Dodano zadanie cykliczne.')).toBeVisible();
    const writes = backend.writes();
    expect(writes).toHaveLength(1);
    expect(writes[0]).toMatchObject({
      method: 'POST',
      url: expect.stringContaining('/api/time/recurring/') as string,
      body: {
        title: 'Siłownia',
        interval: 'weekly',
        startDate: '2026-10-20',
        endDate: null,
        at: null,
      },
    });
    expect(screen.getByText('Cykliczne')).toBeInTheDocument();
  });

  it('offers no repeat when editing a task', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    renderTime();
    await user.click(await row('Raport miesięczny'));
    const dialog = within(await screen.findByRole('dialog'));

    expect(dialog.queryByRole('switch', { name: 'Powtarzaj' })).toBeNull();
  });

  it('rejects an end before the first day', async () => {
    const user = userEvent.setup();
    renderTime();
    const dialog = await openAddDialog(user);
    await user.type(dialog.getByRole('textbox', { name: 'Nazwa' }), 'Siłownia');
    await user.click(dialog.getByRole('switch', { name: 'Powtarzaj' }));
    await user.type(
      dialog.getByLabelText('Koniec (opcjonalnie)'),
      '2026-10-01',
    );
    await user.click(dialog.getByRole('button', { name: 'Dodaj' }));

    expect(
      await dialog.findByText('Koniec nie może być przed pierwszym dniem.'),
    ).toBeVisible();
    expect(backend.writes()).toHaveLength(0);
  });

  it('ends the series from one of its tasks', async () => {
    const user = userEvent.setup();
    backend.seed([
      task({ recurringId: 'trec-1', occurrenceDate: '2026-10-20' }),
    ]);
    renderTime();
    await user.click(await row('Raport miesięczny'));
    const dialog = within(await screen.findByRole('dialog'));
    await user.click(dialog.getByRole('button', { name: 'Zakończ cykl' }));
    expect(backend.writes()).toHaveLength(0);
    const confirm = within(screen.getAllByRole('dialog').at(-1)!);
    await user.click(confirm.getByRole('button', { name: 'Zakończ cykl' }));

    expect(await screen.findByText('Zakończono cykl.')).toBeVisible();
    expect(backend.writes()).toHaveLength(1);
    expect(backend.writes()[0]).toMatchObject({
      method: 'DELETE',
      url: expect.stringContaining('/api/time/recurring/trec-1/') as string,
    });
    await waitFor(() =>
      expect(screen.queryByText('Cykliczne')).not.toBeInTheDocument(),
    );
  });
});

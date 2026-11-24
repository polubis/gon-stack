import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { openEditor } from './edit-task';
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
  screen.findByRole('button', { name: `Szczegóły zadania: ${title}` });

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

  it('shows the chosen device avatar on a new task without a reload', async () => {
    const user = userEvent.setup();
    backend.state.deviceProfile = { avatar: 'cat', customName: 'Kocia' };
    renderTime();
    const dialog = await openAddDialog(user);
    await user.type(dialog.getByRole('textbox', { name: 'Nazwa' }), 'Kurs');
    await user.click(dialog.getByRole('button', { name: 'Dodaj' }));

    await user.click(
      await screen.findByRole('button', { name: 'Więcej: Kurs' }),
    );
    expect(await screen.findByText('Kocia')).toBeInTheDocument();
  });

  it('shows the device of a task in the more menu', async () => {
    const user = userEvent.setup();
    backend.seed([task({ device: DEVICE })]);
    renderTime();

    await user.click(
      await screen.findByRole('button', { name: 'Więcej: Raport miesięczny' }),
    );

    expect(await screen.findByText('Telefon Ani')).toBeInTheDocument();
  });

  it('shows the device of a task in its popup', async () => {
    const user = userEvent.setup();
    backend.seed([task({ device: DEVICE })]);
    renderTime();

    await openEditor(user, 'Raport miesięczny');

    const dialog = within(await screen.findByRole('dialog'));
    expect(dialog.getByText('device-phone-1')).toBeVisible();
  });

  const weekBox = async () =>
    (
      await screen.findAllByRole('button', {
        name: 'Następny krok: Raport miesięczny',
      })
    )[0]!;

  it('advances a week day task to done and offers reopening', async () => {
    const user = userEvent.setup();
    backend.seed([task({ device: DEVICE, at: null })]);
    renderTime('week');
    const box = await weekBox();

    await user.click(box);
    await user.click(box);

    expect(
      (
        await screen.findAllByRole('button', {
          name: 'Otwórz ponownie: Raport miesięczny',
        })
      )[0],
    ).toBeVisible();
  });

  it('shows the device in the more menu of a week day row', async () => {
    const user = userEvent.setup();
    backend.seed([task({ device: DEVICE, at: null })]);
    renderTime('week');
    const box = await weekBox();

    await user.click(
      within(box.closest('li')!).getByRole('button', {
        name: 'Więcej: Raport miesięczny',
      }),
    );

    expect(await screen.findByText('Telefon Ani')).toBeInTheDocument();
  });

  it('keeps the original device when a task is edited', async () => {
    const user = userEvent.setup();
    backend.seed([task({ device: DEVICE })]);
    renderTime();
    await openEditor(user, 'Raport miesięczny');
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
    const writes = backend.writes();
    expect(writes).toHaveLength(1);
    expect(writes[0]).toMatchObject({
      body: {
        title: 'Siłownia',
        interval: 'weekly',
        startDate: '2026-10-20',
        endDate: null,
        at: null,
      },
    });
    expect(
      within((await row('Siłownia')).closest('li')!).getByText('Cykliczne'),
    ).toBeInTheDocument();
  });

  it('repeats a task every day', async () => {
    const user = userEvent.setup();
    renderTime();
    const dialog = await openAddDialog(user);
    await user.type(dialog.getByRole('textbox', { name: 'Nazwa' }), 'Woda');
    await user.click(dialog.getByRole('switch', { name: 'Powtarzaj' }));
    await user.click(dialog.getByRole('combobox', { name: 'Częstotliwość' }));
    await user.click(await screen.findByRole('option', { name: 'Co dzień' }));
    await user.click(dialog.getByRole('button', { name: 'Dodaj' }));

    expect(await row('Woda')).toBeVisible();
    expect(backend.writes()[0]).toMatchObject({
      body: { title: 'Woda', interval: 'daily' },
    });
  });

  it('offers no repeat when editing a task', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    renderTime();
    await openEditor(user, 'Raport miesięczny');
    const dialog = within(await screen.findByRole('dialog'));

    expect(dialog.queryByRole('switch', { name: 'Powtarzaj' })).toBeNull();
  });

  it('keeps a task repeating until the end day and says so', async () => {
    const user = userEvent.setup();
    renderTime();
    const dialog = await openAddDialog(user);
    await user.type(dialog.getByRole('textbox', { name: 'Nazwa' }), 'Siłownia');
    await user.click(dialog.getByRole('switch', { name: 'Powtarzaj' }));
    await user.type(
      dialog.getByLabelText('Koniec (opcjonalnie)'),
      '2026-11-25',
    );

    expect(
      await dialog.findByText(
        'Zadanie dodamy co tydzień od 2026-10-20 do 2026-11-25 włącznie.',
      ),
    ).toBeVisible();
    expect(dialog.getByRole('switch', { name: 'Powtarzaj' })).toBeChecked();

    await user.click(dialog.getByRole('button', { name: 'Dodaj' }));
    expect(await row('Siłownia')).toBeVisible();
    expect(backend.writes()[0]).toMatchObject({
      body: {
        interval: 'weekly',
        startDate: '2026-10-20',
        endDate: '2026-11-25',
      },
    });
    expect(
      within((await row('Siłownia')).closest('li')!).getByText('Cykliczne'),
    ).toBeInTheDocument();
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

  const openRecurringTask = async (
    user: ReturnType<typeof userEvent.setup>,
  ) => {
    backend.seed([
      task({ recurringId: 'trec-1', occurrenceDate: '2026-10-20' }),
    ]);
    renderTime();
    await openEditor(user, 'Raport miesięczny');
    return within(await screen.findByRole('dialog'));
  };

  const scopeDialog = () => within(screen.getAllByRole('dialog').at(-1)!);

  it('offers no separate way to end a series', async () => {
    const user = userEvent.setup();

    const dialog = await openRecurringTask(user);

    expect(
      dialog.queryByRole('button', { name: 'Zakończ cykl' }),
    ).not.toBeInTheDocument();
  });

  it('asks how far a delete reaches before sending anything', async () => {
    const user = userEvent.setup();
    const dialog = await openRecurringTask(user);

    await user.click(dialog.getByRole('button', { name: 'Usuń' }));

    expect(
      scopeDialog()
        .getAllByRole('radio')
        .map((radio) => radio.closest('label')?.textContent),
    ).toEqual([
      expect.stringContaining('Usuń wszystkie'),
      expect.stringContaining('Usuń tylko ten'),
      expect.stringContaining('Usuń ten i następne'),
      expect.stringContaining('Usuń tylko następne'),
    ]);
    expect(backend.writes()).toHaveLength(0);
  });

  it('deletes with the chosen scope', async () => {
    const user = userEvent.setup();
    const dialog = await openRecurringTask(user);
    await user.click(dialog.getByRole('button', { name: 'Usuń' }));

    await user.click(
      scopeDialog().getByRole('radio', { name: /Usuń ten i następne/ }),
    );
    await user.click(scopeDialog().getByRole('button', { name: 'Usuń' }));

    await waitFor(() => expect(backend.writes()).toHaveLength(1));
    expect(backend.writes()[0]).toMatchObject({
      method: 'DELETE',
      body: { scope: 'thisAndFollowing' },
    });
  });

  it('asks how far a save reaches and sends the choice with the task', async () => {
    const user = userEvent.setup();
    const dialog = await openRecurringTask(user);
    await user.clear(dialog.getByRole('textbox', { name: 'Nazwa' }));
    await user.type(dialog.getByRole('textbox', { name: 'Nazwa' }), 'Raport');
    await user.click(dialog.getByRole('button', { name: 'Zapisz' }));

    expect(backend.writes()).toHaveLength(0);
    await user.click(
      scopeDialog().getByRole('radio', { name: /Edytuj tylko następne/ }),
    );
    await user.click(
      scopeDialog().getByRole('button', { name: 'Zapisz zmiany' }),
    );

    await waitFor(() => expect(backend.writes()).toHaveLength(1));
    expect(backend.writes()[0]).toMatchObject({
      method: 'PUT',
      body: { title: 'Raport', scope: 'following' },
    });
  });

  it('saves an ordinary task without asking for a scope', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    renderTime();
    await openEditor(user, 'Raport miesięczny');
    await user.click(
      within(await screen.findByRole('dialog')).getByRole('button', {
        name: 'Zapisz',
      }),
    );

    await waitFor(() => expect(backend.writes()).toHaveLength(1));
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  });
});

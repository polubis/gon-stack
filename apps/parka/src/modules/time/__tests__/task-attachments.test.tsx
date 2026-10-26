import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderTime } from './render-time';
import { setupTimeBackend, task } from './time-backend';

const backend = setupTimeBackend();

afterEach(() => vi.useRealTimers());

const FILE = {
  id: 'a-1',
  name: 'umowa.pdf',
  size: 2048,
  mime: 'application/pdf',
};

const openDetails = async (user: ReturnType<typeof userEvent.setup>) => {
  renderTime();
  await user.click(
    await screen.findByRole('button', {
      name: 'Szczegóły zadania: Raport miesięczny',
    }),
  );
  return within(await screen.findByRole('dialog'));
};

const pick = (details: ReturnType<typeof within>, ...files: File[]) =>
  userEvent
    .setup({ applyAccept: false })
    .upload(details.getByLabelText('Wybierz pliki'), files);

describe('task attachments', () => {
  it('lists files with name, size and a link to open them', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    backend.state.attachments['t-1'] = [FILE];

    const details = await openDetails(user);

    const link = await details.findByRole('link', { name: 'umowa.pdf' });
    expect(link).toHaveAttribute('href', '/api/time/attachments/a-1/');
    expect(details.getByText('2 KB')).toBeVisible();
    expect(details.getByText('Załączniki (1/5)')).toBeVisible();
  });

  it('says there are no files yet', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);

    const details = await openDetails(user);

    expect(await details.findByText('Brak załączników')).toBeVisible();
  });

  it('adds a file and confirms it', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    const details = await openDetails(user);
    await details.findByText('Brak załączników');

    backend.state.uploadResult = {
      id: 'a-9',
      name: 'notatka.txt',
      size: 5,
      mime: 'text/plain',
    };

    await pick(
      details,
      new File(['hello'], 'notatka.txt', { type: 'text/plain' }),
    );

    expect(
      await details.findByRole('link', { name: 'notatka.txt' }),
    ).toBeVisible();
    expect(await screen.findByText('Dodano plik „notatka.txt”')).toBeVisible();
    expect(backend.state.attachments['t-1']).toHaveLength(1);
  });

  it('refuses a file of a type that is not allowed, without sending it', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    const details = await openDetails(user);
    await details.findByText('Brak załączników');

    await pick(
      details,
      new File(['MZ'], 'virus.exe', { type: 'application/x-msdownload' }),
    );

    expect(
      await screen.findByText('Nie dodano pliku „virus.exe”'),
    ).toBeVisible();
    expect(screen.getByText('ATTACHMENT_REJECTED')).toBeVisible();
    expect(backend.writes()).toHaveLength(0);
  });

  it('refuses a file over 5 MB', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    const details = await openDetails(user);
    await details.findByText('Brak załączników');

    await pick(
      details,
      new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'duzy.pdf', {
        type: 'application/pdf',
      }),
    );

    expect(await screen.findByText('Plik jest większy niż 5 MB')).toBeVisible();
    expect(backend.writes()).toHaveLength(0);
  });

  it('blocks adding once the task has 5 files', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    backend.state.attachments['t-1'] = Array.from({ length: 5 }, (_, i) => ({
      ...FILE,
      id: `a-${i}`,
      name: `plik-${i}.pdf`,
    }));

    const details = await openDetails(user);

    expect(await details.findByText('Załączniki (5/5)')).toBeVisible();
    expect(details.getByRole('button', { name: 'Dodaj plik' })).toBeDisabled();
  });

  it('shows an error toast with retry when the upload fails', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    const details = await openDetails(user);
    await details.findByText('Brak załączników');
    backend.state.failAttachmentWrites = true;

    await pick(details, new File(['x'], 'a.txt', { type: 'text/plain' }));

    expect(await screen.findByText('ATTACHMENT_UPLOAD')).toBeVisible();
    expect(screen.getByRole('button', { name: /ponownie/i })).toBeVisible();
    expect(details.queryByRole('link', { name: 'a.txt' })).toBeNull();
  });

  it('deletes a file only after confirmation', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    backend.state.attachments['t-1'] = [FILE];
    const details = await openDetails(user);

    await user.click(
      await details.findByRole('button', { name: 'Usuń plik umowa.pdf' }),
    );
    expect(backend.writes()).toHaveLength(0);
    expect(new URLSearchParams(window.location.search).getAll('modal')).toEqual(
      ['task-view:t-1', 'attachment-delete:a-1'],
    );

    const confirm = within(
      await screen.findByRole('dialog', { name: 'Usunąć plik?' }),
    );
    await user.click(confirm.getByRole('button', { name: 'Usuń' }));

    await waitFor(() =>
      expect(screen.queryByRole('link', { name: 'umowa.pdf' })).toBeNull(),
    );
    expect(backend.state.attachments['t-1']).toEqual([]);
    expect(await screen.findByText('Usunięto plik „umowa.pdf”')).toBeVisible();
  });

  it('keeps the file when the confirmation is cancelled', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    backend.state.attachments['t-1'] = [FILE];
    const details = await openDetails(user);

    await user.click(
      await details.findByRole('button', { name: 'Usuń plik umowa.pdf' }),
    );
    const confirm = within(
      await screen.findByRole('dialog', { name: 'Usunąć plik?' }),
    );
    await user.click(confirm.getByRole('button', { name: 'Anuluj' }));

    expect(
      await screen.findByRole('link', { name: 'umowa.pdf' }),
    ).toBeVisible();
    expect(backend.writes()).toHaveLength(0);
  });

  it('brings the file back when deleting fails', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    backend.state.attachments['t-1'] = [FILE];
    const details = await openDetails(user);
    backend.state.failAttachmentWrites = true;

    await user.click(
      await details.findByRole('button', { name: 'Usuń plik umowa.pdf' }),
    );
    const confirm = within(
      await screen.findByRole('dialog', { name: 'Usunąć plik?' }),
    );
    await user.click(confirm.getByRole('button', { name: 'Usuń' }));

    expect(await screen.findByText('ATTACHMENT_DELETE')).toBeVisible();
    expect(
      await screen.findByRole('link', { name: 'umowa.pdf' }),
    ).toBeVisible();
  });

  it('offers a retry when the list cannot be loaded', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    backend.state.failAttachmentReads = true;
    backend.state.attachments['t-1'] = [FILE];
    const details = await openDetails(user);

    expect(await details.findByText('ATTACHMENTS_LOAD')).toBeVisible();
    backend.state.failAttachmentReads = false;
    await user.click(details.getByRole('button', { name: 'Spróbuj ponownie' }));

    expect(
      await details.findByRole('link', { name: 'umowa.pdf' }),
    ).toBeVisible();
  });
});

const PHOTO = {
  id: 'a-2',
  name: 'wakacje.webp',
  size: 1024 * 1024,
  mime: 'image/webp',
};

const modalsInUrl = () =>
  new URLSearchParams(window.location.search).getAll('modal');

describe('image attachments', () => {
  it('shows a thumbnail only for images', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    backend.state.attachments['t-1'] = [FILE, PHOTO];

    const details = await openDetails(user);

    expect(
      await details.findByRole('button', {
        name: 'Otwórz podgląd: wakacje.webp',
      }),
    ).toBeVisible();
    expect(
      details.queryByRole('button', { name: 'Otwórz podgląd: umowa.pdf' }),
    ).toBeNull();
  });

  it('opens the image full screen in the URL stack and closes it with Esc', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    backend.state.attachments['t-1'] = [PHOTO];
    const details = await openDetails(user);

    await user.click(
      await details.findByRole('button', {
        name: 'Otwórz podgląd: wakacje.webp',
      }),
    );

    const viewer = await screen.findByRole('dialog', {
      name: 'wakacje.webp',
    });
    expect(
      within(viewer).getByRole('img', { name: 'wakacje.webp' }),
    ).toBeVisible();
    expect(modalsInUrl()).toEqual(['task-view:t-1', 'attachment-view:a-2']);
    expect(viewer).toContainElement(document.activeElement as HTMLElement);

    await user.keyboard('{Escape}');

    await waitFor(() => expect(modalsInUrl()).toEqual(['task-view:t-1']));
    expect(screen.queryByRole('dialog', { name: 'wakacje.webp' })).toBeNull();
  });

  it('closes the viewer with its close button and keeps the details open', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    backend.state.attachments['t-1'] = [PHOTO];
    const details = await openDetails(user);
    await user.click(
      await details.findByRole('button', {
        name: 'Otwórz podgląd: wakacje.webp',
      }),
    );

    await user.click(
      await screen.findByRole('button', { name: 'Zamknij podgląd' }),
    );

    await waitFor(() => expect(modalsInUrl()).toEqual(['task-view:t-1']));
    expect(
      screen.getByRole('dialog', { name: 'Szczegóły zadania' }),
    ).toBeVisible();
  });

  it('restores the viewer from a deep link', async () => {
    backend.seed([task()]);
    backend.state.attachments['t-1'] = [PHOTO];

    renderTime(
      'day',
      '2026-10-20',
      '&modal=task-view:t-1&modal=attachment-view:a-2',
    );

    expect(
      await screen.findByRole('dialog', { name: 'wakacje.webp' }),
    ).toBeVisible();
  });

  it('drops a viewer link to a file that is gone', async () => {
    backend.seed([task()]);

    renderTime(
      'day',
      '2026-10-20',
      '&modal=task-view:t-1&modal=attachment-view:nope',
    );

    await waitFor(() => expect(modalsInUrl()).toEqual(['task-view:t-1']));
  });

  it('tells how much a photo shrank after the upload', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    const details = await openDetails(user);
    await details.findByText('Brak załączników');
    backend.state.uploadResult = {
      ...PHOTO,
      originalSize: 8 * 1024 * 1024,
    };

    await userEvent
      .setup({ applyAccept: false })
      .upload(
        details.getByLabelText('Wybierz pliki'),
        new File(['x'], 'wakacje.jpg', { type: 'image/jpeg' }),
      );

    expect(
      await screen.findByText(
        'Dodano „wakacje.webp”, zmniejszono z 8.0 MB do 1.0 MB',
      ),
    ).toBeVisible();
  });

  it('refuses a photo over 5 MB', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    const details = await openDetails(user);
    await details.findByText('Brak załączników');

    await userEvent.setup({ applyAccept: false }).upload(
      details.getByLabelText('Wybierz pliki'),
      new File([new Uint8Array(6 * 1024 * 1024)], 'zdjecie.jpg', {
        type: 'image/jpeg',
      }),
    );

    expect(
      await screen.findByText('Zdjęcie jest większe niż 5 MB'),
    ).toBeVisible();
    expect(backend.writes()).toHaveLength(0);
  });

  it('shows the empty state with its add action', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);

    const details = await openDetails(user);

    const empty = await details.findByRole('status');
    expect(within(empty).getByText('Brak załączników')).toBeVisible();
    expect(
      within(empty).getByText(/Dodaj zdjęcie, PDF lub plik tekstowy/),
    ).toBeVisible();
    expect(
      within(empty).getByRole('button', { name: 'Dodaj plik' }),
    ).toBeVisible();
    expect(details.getAllByRole('button', { name: 'Dodaj plik' })).toHaveLength(
      1,
    );
  });

  it('puts the toast at the top while a popup is open', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    const details = await openDetails(user);
    await details.findByText('Brak załączników');

    await userEvent
      .setup({ applyAccept: false })
      .upload(
        details.getByLabelText('Wybierz pliki'),
        new File(['x'], 'virus.exe', { type: 'application/x-msdownload' }),
      );

    expect(await screen.findByRole('alert')).toHaveClass('top-4');
  });
});

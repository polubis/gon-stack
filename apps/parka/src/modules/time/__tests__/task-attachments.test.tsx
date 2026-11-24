import { act, screen, waitFor, within } from '@testing-library/react';
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
  status: 'ready',
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
      status: 'ready',
    };

    await pick(
      details,
      new File(['hello'], 'notatka.txt', { type: 'text/plain' }),
    );

    expect(
      await details.findByRole('link', { name: 'notatka.txt' }),
    ).toBeVisible();
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

  const askToDeleteFile = async (user: ReturnType<typeof userEvent.setup>) => {
    backend.seed([task()]);
    backend.state.attachments['t-1'] = [FILE];
    const details = await openDetails(user);
    await user.click(
      await details.findByRole('button', { name: 'Usuń plik umowa.pdf' }),
    );
  };

  it('asks before deleting a file', async () => {
    const user = userEvent.setup();

    await askToDeleteFile(user);

    expect(backend.writes()).toHaveLength(0);
    expect(new URLSearchParams(window.location.search).getAll('modal')).toEqual(
      ['task-view:t-1', 'attachment-delete:a-1'],
    );
  });

  it('deletes a file after confirmation', async () => {
    const user = userEvent.setup();
    await askToDeleteFile(user);
    const confirm = within(
      await screen.findByRole('dialog', { name: 'Usunąć plik?' }),
    );

    await user.click(confirm.getByRole('button', { name: 'Usuń' }));

    await waitFor(() =>
      expect(screen.queryByRole('link', { name: 'umowa.pdf' })).toBeNull(),
    );
    expect(backend.state.attachments['t-1']).toEqual([]);
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

  const openFailedAttachments = async (
    user: ReturnType<typeof userEvent.setup>,
  ) => {
    backend.seed([task()]);
    backend.state.failAttachmentReads = true;
    backend.state.attachments['t-1'] = [FILE];
    return openDetails(user);
  };

  it('shows an error when the list cannot be loaded', async () => {
    const user = userEvent.setup();

    const details = await openFailedAttachments(user);

    expect(await details.findByText('ATTACHMENTS_LOAD')).toBeVisible();
  });

  it('loads the list after the retry', async () => {
    const user = userEvent.setup();
    const details = await openFailedAttachments(user);
    await details.findByText('ATTACHMENTS_LOAD');
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
  status: 'ready',
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

  const openPhoto = async (user: ReturnType<typeof userEvent.setup>) => {
    backend.seed([task()]);
    backend.state.attachments['t-1'] = [PHOTO];
    const details = await openDetails(user);
    await user.click(
      await details.findByRole('button', {
        name: 'Otwórz podgląd: wakacje.webp',
      }),
    );
    return screen.findByRole('dialog', { name: 'wakacje.webp' });
  };

  it('opens the image full screen in the URL stack', async () => {
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
  });

  it('closes the full screen image with Esc', async () => {
    const user = userEvent.setup();
    await openPhoto(user);

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

    const empty = within(
      await details.findByRole('region', { name: 'Załączniki' }),
    ).getByRole('status');
    expect(within(empty).getByText('Brak załączników')).toBeVisible();
    expect(
      within(empty).getByText(
        /Dodaj zdjęcie, wideo \(do 20 MB\), PDF lub plik tekstowy/,
      ),
    ).toBeVisible();
    expect(
      within(empty).getByRole('button', { name: 'Dodaj plik' }),
    ).toBeVisible();
    expect(details.getAllByRole('button', { name: 'Dodaj plik' })).toHaveLength(
      1,
    );
  });

  it('shows the upload error outside the popup while it stays open', async () => {
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

    expect(await screen.findByRole('alert')).toBeVisible();
    expect(details.queryByRole('alert')).toBeNull();
  });
});

const CLIP = {
  id: 'a-3',
  name: 'demo.mp4',
  size: 3 * 1024 * 1024,
  mime: 'video/mp4',
  status: 'ready',
};

class FakeEventSource {
  static last: FakeEventSource | undefined;
  onmessage: ((event: { data: string }) => void) | null = null;
  onopen: (() => void) | null = null;
  constructor() {
    FakeEventSource.last = this;
  }
  close() {}
  emit(event: object) {
    this.onmessage?.({ data: JSON.stringify(event) });
  }
}

describe('video attachments', () => {
  it('shows a video as a first-frame preview that opens a player', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    backend.state.attachments['t-1'] = [CLIP];
    const details = await openDetails(user);

    await user.click(
      await details.findByRole('button', { name: 'Otwórz wideo: demo.mp4' }),
    );

    const viewer = await screen.findByRole('dialog', { name: 'demo.mp4' });
    const player = within(viewer).getByLabelText('demo.mp4');
    expect(player.tagName).toBe('VIDEO');
    expect(player).toHaveAttribute('controls');
    expect(player).not.toHaveAttribute('autoplay');
  });

  it('tells a video is still being saved and cannot be opened yet', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    backend.state.attachments['t-1'] = [{ ...CLIP, status: 'uploading' }];

    const details = await openDetails(user);

    expect(await details.findByText('Zapisywanie…')).toBeVisible();
    expect(details.queryByRole('link', { name: 'demo.mp4' })).toBeNull();
    expect(
      details.queryByRole('button', { name: 'Otwórz wideo: demo.mp4' }),
    ).toBeNull();
  });

  it('warns when a video could not be saved', async () => {
    vi.stubGlobal('EventSource', FakeEventSource);
    const user = userEvent.setup();
    backend.seed([task()]);
    backend.state.attachments['t-1'] = [{ ...CLIP, status: 'uploading' }];
    const details = await openDetails(user);
    await details.findByText('Zapisywanie…');

    act(() =>
      FakeEventSource.last?.emit({
        type: 'UPDATE',
        taskId: 't-1',
        attachment: { ...CLIP, status: 'failed' },
      }),
    );

    expect(
      await screen.findByText('Nie zapisano pliku „demo.mp4”'),
    ).toBeVisible();
    expect(await details.findByText('Błąd zapisu')).toBeVisible();
    vi.unstubAllGlobals();
  });

  it('asks for a trim before sending a picked video', async () => {
    URL.createObjectURL = vi.fn(() => 'blob:clip');
    URL.revokeObjectURL = vi.fn();
    const user = userEvent.setup();
    backend.seed([task()]);
    const details = await openDetails(user);
    await details.findByText('Brak załączników');
    backend.state.uploadResult = { ...CLIP, status: 'uploading' };

    await pick(
      details,
      new File(['frames'], 'demo.mp4', { type: 'video/mp4' }),
    );
    const trim = await screen.findByRole('dialog', { name: 'Przytnij wideo' });
    await user.click(
      within(trim).getByRole('button', { name: 'Dodaj bez przycinania' }),
    );

    expect(await details.findByText('Zapisywanie…')).toBeVisible();
    expect(backend.state.attachments['t-1']).toHaveLength(1);
  });

  it('drops the video when the trim step is cancelled', async () => {
    URL.createObjectURL = vi.fn(() => 'blob:clip');
    URL.revokeObjectURL = vi.fn();
    const user = userEvent.setup();
    backend.seed([task()]);
    const details = await openDetails(user);
    await details.findByText('Brak załączników');

    await pick(
      details,
      new File(['frames'], 'demo.mp4', { type: 'video/mp4' }),
    );
    const trim = await screen.findByRole('dialog', { name: 'Przytnij wideo' });
    await user.click(within(trim).getByRole('button', { name: 'Anuluj' }));

    await waitFor(() =>
      expect(
        screen.queryByRole('dialog', { name: 'Przytnij wideo' }),
      ).toBeNull(),
    );
    expect(backend.state.attachments['t-1'] ?? []).toHaveLength(0);
  });

  it('rejects a video over 20 MB', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    const details = await openDetails(user);
    await details.findByText('Brak załączników');
    const big = new File(['x'], 'big.mp4', { type: 'video/mp4' });
    Object.defineProperty(big, 'size', { value: 21 * 1024 * 1024 });

    await pick(details, big);

    expect(
      await screen.findByText('Wideo jest większe niż 20 MB'),
    ).toBeVisible();
  });

  it('cancels a file that is still being sent', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    backend.state.uploadDelayMs = 5000;
    const details = await openDetails(user);
    await details.findByText('Brak załączników');

    await pick(
      details,
      new File(['hello'], 'notatka.txt', { type: 'text/plain' }),
    );
    const cancel = await details.findByRole('button', {
      name: 'Anuluj wysyłanie pliku notatka.txt',
    });
    // The request needs a moment to leave the browser before it can be cut.
    await new Promise((resolve) => setTimeout(resolve, 100));
    await user.click(cancel);
    expect(details.queryByRole('progressbar')).toBeNull();
    expect(details.queryByRole('link', { name: 'notatka.txt' })).toBeNull();
  });

  it('settles a video that finished while the live feed was down', async () => {
    vi.stubGlobal('EventSource', FakeEventSource);
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    backend.seed([task()]);
    backend.state.attachments['t-1'] = [{ ...CLIP, status: 'uploading' }];
    const details = await openDetails(user);
    await details.findByText('Zapisywanie…');

    backend.state.attachments['t-1'] = [CLIP];
    act(() => FakeEventSource.last?.onopen?.());

    expect(
      await details.findByRole('button', { name: 'Otwórz wideo: demo.mp4' }),
    ).toBeVisible();
    vi.unstubAllGlobals();
  });

  it('shows two files first and the rest after show more', async () => {
    const user = userEvent.setup();
    backend.seed([task()]);
    backend.state.attachments['t-1'] = [1, 2, 3].map((n) => ({
      ...FILE,
      id: `a-${n}`,
      name: `plik-${n}.pdf`,
    }));

    const details = await openDetails(user);

    expect(
      await details.findByRole('link', { name: 'plik-2.pdf' }),
    ).toBeVisible();
    expect(
      details.queryByRole('link', { name: 'plik-3.pdf' }),
    ).not.toBeInTheDocument();
    await user.click(details.getByRole('button', { name: 'Pokaż więcej (1)' }));
    expect(details.getByRole('link', { name: 'plik-3.pdf' })).toBeVisible();
  });
});

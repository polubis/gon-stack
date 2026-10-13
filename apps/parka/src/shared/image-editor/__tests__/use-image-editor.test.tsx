import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { stubImageCanvas } from '@/__tests__/stub-image-canvas';
import { useImageEditor } from '../presentation/use-image-editor';

const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

const png = () =>
  new File([new Uint8Array(PNG)], 'me.png', { type: 'image/png' });

const Harness = ({ onDone }: { onDone: (file: File) => void }) => {
  const { select, editor } = useImageEditor('test', onDone);
  return (
    <>
      <input
        type="file"
        aria-label="Wybierz plik"
        onChange={(e) => e.target.files?.[0] && select(e.target.files[0])}
      />
      {editor}
    </>
  );
};

describe('image editor before upload', () => {
  const onDone = vi.fn();

  beforeEach(() => {
    onDone.mockReset();
    stubImageCanvas();
  });
  afterEach(() => vi.restoreAllMocks());

  it('opens for a valid image and hands back the edited file on confirm', async () => {
    render(<Harness onDone={onDone} />);

    await userEvent.upload(screen.getByLabelText('Wybierz plik'), png());
    await userEvent.click(
      await screen.findByRole('button', { name: 'Zatwierdź' }),
    );

    await waitFor(() => expect(onDone).toHaveBeenCalledTimes(1));
    const edited: File = onDone.mock.calls[0][0];
    expect(edited.name).toBe('me.png');
    expect(edited.type).toBe('image/png');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('drops the picture when cancelled', async () => {
    render(<Harness onDone={onDone} />);

    await userEvent.upload(screen.getByLabelText('Wybierz plik'), png());
    await userEvent.click(
      await screen.findByRole('button', { name: 'Anuluj' }),
    );

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(onDone).not.toHaveBeenCalled();
  });

  it('cancels with Escape', async () => {
    render(<Harness onDone={onDone} />);

    await userEvent.upload(screen.getByLabelText('Wybierz plik'), png());
    await screen.findByRole('dialog', { name: 'Przytnij zdjęcie' });
    await userEvent.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(onDone).not.toHaveBeenCalled();
  });

  it('offers zoom and rotation to the keyboard', async () => {
    render(<Harness onDone={onDone} />);

    await userEvent.upload(screen.getByLabelText('Wybierz plik'), png());
    const zoom = await screen.findByRole('slider', { name: 'Powiększenie' });
    await waitFor(() => expect(zoom).toBeEnabled());
    screen.getByRole('img', { name: 'Podgląd kadru' }).focus();
    await userEvent.keyboard('{+}');

    expect(
      Number(zoom.getAttribute('value') ?? (zoom as HTMLInputElement).value),
    ).toBeGreaterThan(1);
    expect(screen.getByRole('button', { name: 'Obróć w lewo' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Obróć w prawo' })).toBeEnabled();
  });

  it('skips the editor for a file that is not an image', async () => {
    render(<Harness onDone={onDone} />);
    const notes = new File(['hello'], 'notes.png', { type: 'image/png' });

    await userEvent.upload(screen.getByLabelText('Wybierz plik'), notes);

    await waitFor(() => expect(onDone).toHaveBeenCalledWith(notes));
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DeleteDialog } from '../presentation/delete-dialog';

const setup = () => {
  const onConfirm = vi.fn();
  const onClose = vi.fn();
  render(
    <DeleteDialog
      modal="delete"
      name="Food"
      onConfirm={onConfirm}
      onClose={onClose}
    />,
  );
  return { onConfirm, onClose };
};

describe('category delete confirmation', () => {
  it('asks about the category by name and warns about usage', () => {
    setup();

    expect(
      screen.getByRole('dialog', { name: 'Usunąć kategorię „Food”?' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/używanej przez wydatki lub limity nie da się usunąć/),
    ).toBeInTheDocument();
  });

  it('deletes only after the confirm button', async () => {
    const { onConfirm, onClose } = setup();

    await userEvent.click(screen.getByRole('button', { name: 'Usuń' }));

    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('keeps the category when cancelled', async () => {
    const { onConfirm, onClose } = setup();

    await userEvent.click(screen.getByRole('button', { name: 'Anuluj' }));

    expect(onClose).toHaveBeenCalledOnce();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('closes on Escape without deleting', async () => {
    const { onConfirm, onClose } = setup();

    await userEvent.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledOnce();
    expect(onConfirm).not.toHaveBeenCalled();
  });
});

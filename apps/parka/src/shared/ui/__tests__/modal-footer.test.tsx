import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ModalFooter } from '../modal-footer';

describe('ModalFooter', () => {
  it('shows its actions to the user', () => {
    render(
      <ModalFooter>
        <button type="button">Zapisz</button>
      </ModalFooter>,
    );

    expect(screen.getByRole('button', { name: 'Zapisz' })).toBeVisible();
  });

  it('stays stuck to the bottom of the modal and keeps caller layout', () => {
    render(
      <ModalFooter className="flex justify-end" data-testid="footer">
        <button type="button">Gotowe</button>
      </ModalFooter>,
    );

    expect(screen.getByTestId('footer')).toHaveClass(
      'sticky',
      'bottom-0',
      'bg-card',
      'flex',
      'justify-end',
    );
  });
});

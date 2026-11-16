import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { NumberInput } from '../number-input';

const Harness = ({
  initial = 0,
  integer = false,
}: {
  initial?: number;
  integer?: boolean;
}) => {
  const [value, setValue] = useState(initial);
  return (
    <>
      <NumberInput
        aria-label="Kwota"
        value={value}
        onValueChange={setValue}
        integer={integer}
      />
      <output aria-label="Wartość">{value}</output>
    </>
  );
};

describe('number input', () => {
  it('accepts a comma as the decimal separator', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(screen.getByRole('textbox', { name: 'Kwota' }), '12,5');

    expect(screen.getByRole('textbox', { name: 'Kwota' })).toHaveValue('12,5');
    expect(screen.getByLabelText('Wartość')).toHaveTextContent('12.5');
  });

  it('keeps a partial value while typing', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(screen.getByRole('textbox', { name: 'Kwota' }), '3,');

    expect(screen.getByRole('textbox', { name: 'Kwota' })).toHaveValue('3,');
  });

  it('ignores letters', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(screen.getByRole('textbox', { name: 'Kwota' }), '4a2');

    expect(screen.getByRole('textbox', { name: 'Kwota' })).toHaveValue('42');
  });

  it('can be cleared and then reports zero', async () => {
    const user = userEvent.setup();
    render(<Harness initial={7} />);

    await user.clear(screen.getByRole('textbox', { name: 'Kwota' }));

    expect(screen.getByRole('textbox', { name: 'Kwota' })).toHaveValue('');
    expect(screen.getByLabelText('Wartość')).toHaveTextContent('0');
  });

  it('refuses a decimal separator when only whole numbers are allowed', async () => {
    const user = userEvent.setup();
    render(<Harness integer />);

    await user.type(screen.getByRole('textbox', { name: 'Kwota' }), '5,9');

    expect(screen.getByRole('textbox', { name: 'Kwota' })).toHaveValue('59');
  });

  it('shows an empty field for zero and the initial value otherwise', () => {
    const { unmount } = render(<Harness />);
    expect(screen.getByRole('textbox', { name: 'Kwota' })).toHaveValue('');
    unmount();

    render(<Harness initial={19.9} />);
    expect(screen.getByRole('textbox', { name: 'Kwota' })).toHaveValue('19.9');
  });
});

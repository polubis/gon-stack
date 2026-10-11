import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ClearableInput } from '../clearable';
import { Field, Input, Select } from '../controls';
import { NumberInput } from '../number-input';

const TextForm = ({
  initial = 'Netflix',
  type,
}: {
  initial?: string;
  type?: 'text' | 'email' | 'password' | 'search';
}) => {
  const [value, setValue] = useState(initial);
  return (
    <Field label="Nazwa">
      <ClearableInput
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </Field>
  );
};

const CLEAR = { name: 'Wyczyść: Nazwa' };

describe('clear button on text inputs', () => {
  it('empties the input and focuses it', async () => {
    render(<TextForm />);

    await userEvent.click(screen.getByRole('button', CLEAR));

    expect(screen.getByLabelText('Nazwa')).toHaveValue('');
    expect(screen.getByLabelText('Nazwa')).toHaveFocus();
  });

  it.each(['email', 'password', 'search'] as const)(
    'is shown on a %s input',
    (type) => {
      render(<TextForm type={type} />);

      expect(screen.getByRole('button', CLEAR)).toBeVisible();
    },
  );

  it('hides the button while the input is empty', async () => {
    render(<TextForm initial="" />);

    expect(screen.queryByRole('button', { name: /Wyczyść/ })).toBeNull();

    await userEvent.type(screen.getByLabelText('Nazwa'), 'a');

    expect(screen.getByRole('button', CLEAR)).toBeVisible();
  });

  it('is reachable with the keyboard', async () => {
    render(<TextForm />);

    await userEvent.tab();
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');

    expect(screen.getByLabelText('Nazwa')).toHaveValue('');
  });

  it('is not shown on a read-only or disabled input', () => {
    render(
      <>
        <ClearableInput aria-label="A" value="x" readOnly />
        <ClearableInput aria-label="B" value="x" disabled onChange={() => {}} />
      </>,
    );

    expect(screen.queryByRole('button', { name: /Wyczyść/ })).toBeNull();
  });
});

describe('controls without a clear button', () => {
  it('has none on number, date and select controls', () => {
    render(
      <>
        <Field label="Kwota">
          <NumberInput value={12} onValueChange={() => {}} />
        </Field>
        <Field label="Data">
          <Input type="date" value="2026-01-01" onChange={() => {}} />
        </Field>
        <Field label="Kategoria">
          <Select value="a" onChange={() => {}}>
            <option value="a">Alfa</option>
          </Select>
        </Field>
        <ClearableInput
          aria-label="Data 2"
          type="date"
          value="2026-01-01"
          onChange={() => {}}
        />
      </>,
    );

    expect(screen.getByLabelText('Kwota')).toHaveValue('12');
    expect(screen.getByLabelText('Data')).toBeVisible();
    expect(screen.getByLabelText('Kategoria')).toBeVisible();
    expect(screen.queryByRole('button', { name: /Wyczyść/ })).toBeNull();
  });
});

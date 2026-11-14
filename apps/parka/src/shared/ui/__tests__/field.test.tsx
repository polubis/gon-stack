import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Field, Input } from '../controls';

describe('Field', () => {
  it('keeps the label name clean on a required field', () => {
    render(
      <Field label="Nazwa" required>
        <Input required />
      </Field>,
    );

    expect(screen.getByLabelText('Nazwa')).toBeRequired();
  });

  it('flags the label of a required field for the asterisk', () => {
    render(
      <Field label="Nazwa" required>
        <Input />
      </Field>,
    );

    expect(screen.getByText('Nazwa')).toHaveAttribute('data-required');
  });

  it('leaves an optional field label unflagged', () => {
    render(
      <Field label="Koniec (opcjonalnie)">
        <Input />
      </Field>,
    );

    expect(screen.getByText('Koniec (opcjonalnie)')).not.toHaveAttribute(
      'data-required',
    );
  });

  it('flags the label when an action sits on the label row', () => {
    render(
      <Field label="Priorytet" required action={<button>Nowy</button>}>
        <Input />
      </Field>,
    );

    expect(screen.getByText('Priorytet')).toHaveAttribute('data-required');
    expect(screen.getByRole('button', { name: 'Nowy' })).toBeInTheDocument();
  });
});

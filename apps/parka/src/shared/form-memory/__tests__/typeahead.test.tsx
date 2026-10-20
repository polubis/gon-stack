import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Field } from '@/shared/ui/controls';
import type { Suggestion } from '../domain/suggestions';
import { Typeahead } from '../presentation/typeahead';

const item = (value: string, patch: Partial<Suggestion> = {}): Suggestion => ({
  field: 'merchant',
  value,
  useCount: 1,
  lastUsed: null,
  ...patch,
});

const SUGGESTIONS = [
  item('Biedronka', { useCount: 8 }),
  item('Lidl', { useCount: 3 }),
  item('Bistro', { useCount: 1 }),
];

const setup = (suggestions: Suggestion[] = SUGGESTIONS, initial = '') => {
  const Host = () => {
    const [value, setValue] = useState(initial);
    return (
      <form onSubmit={(e) => e.preventDefault()}>
        <Field label="Sklep">
          <Typeahead
            field="merchant"
            value={value}
            suggestions={suggestions}
            onValueChange={setValue}
          />
        </Field>
      </form>
    );
  };
  const user = userEvent.setup();
  render(<Host />);
  return {
    user,
    input: screen.getByRole('combobox', { name: 'Sklep' }),
  };
};

const star = () => screen.getByRole('button', { name: 'Podpowiedzi: Sklep' });

const optionNames = () =>
  screen
    .queryAllByRole('option')
    .map((o) => o.textContent?.replace(/\d+×$/, ''));

describe('typeahead', () => {
  it('offers the most used values first from the star button', async () => {
    const { user } = setup();

    await user.click(star());

    expect(optionNames()).toEqual(['Biedronka', 'Lidl', 'Bistro']);
  });

  it('narrows the values while typing', async () => {
    const { user, input } = setup();

    await user.type(input, 'bi');

    expect(optionNames()).toEqual(['Biedronka', 'Bistro']);
  });

  it('shows no list when nothing matches the typed text', async () => {
    const { user, input } = setup();

    await user.type(input, 'xyz');

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it('shows no list for an account without remembered values', async () => {
    setup([]);

    expect(
      screen.queryByRole('button', { name: 'Podpowiedzi: Sklep' }),
    ).not.toBeInTheDocument();
  });

  it('fills the field with the clicked value', async () => {
    const { user, input } = setup();

    await user.click(star());
    await user.click(screen.getByRole('option', { name: /Lidl/ }));

    expect(input).toHaveValue('Lidl');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('picks a value with the keyboard only', async () => {
    const { user, input } = setup();

    await user.type(input, 'bi');
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');

    expect(input).toHaveValue('Bistro');
  });

  it('announces the highlighted value', async () => {
    const { user, input } = setup();

    await user.type(input, 'bi');
    await user.keyboard('{ArrowDown}');

    const active = screen.getByRole('option', { selected: true });
    expect(active).toHaveTextContent('Biedronka');
    expect(input).toHaveAttribute('aria-activedescendant', active.id);
  });

  it('wraps the highlight around with the arrows', async () => {
    const { user } = setup();

    await user.click(star());
    await user.keyboard('{ArrowUp}');

    expect(screen.getByRole('option', { selected: true })).toHaveTextContent(
      'Bistro',
    );
  });

  it('closes the list on Escape and keeps the typed text', async () => {
    const { user, input } = setup();

    await user.type(input, 'bi');
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(input).toHaveValue('bi');
  });

  it('reopens the list with the down arrow', async () => {
    const { user, input } = setup();

    await user.type(input, 'bi');
    await user.keyboard('{Escape}{ArrowDown}');

    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('hides the list once the typed text is the only remaining value', async () => {
    const { user, input } = setup();

    await user.type(input, 'Lidl');

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('clears the typed text and keeps the focus', async () => {
    const { user, input } = setup(SUGGESTIONS, 'Lidl');

    await user.click(screen.getByRole('button', { name: 'Wyczyść: Sklep' }));

    expect(input).toHaveValue('');
    expect(input).toHaveFocus();
  });

  it('does not open the list by merely focusing the field', async () => {
    const { user, input } = setup();

    await user.click(input);

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('lists every value from the star even when the field holds one of them', async () => {
    const { user } = setup(SUGGESTIONS, 'Lidl');

    await user.click(star());

    expect(optionNames()).toEqual(['Biedronka', 'Lidl', 'Bistro']);
  });

  it('closes the list when the star is pressed again', async () => {
    const { user } = setup();

    await user.click(star());
    await user.click(star());

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('moves the focus to the field after opening the list with the star', async () => {
    const { user, input } = setup();

    await user.click(star());

    expect(input).toHaveFocus();
    expect(star()).toHaveAttribute('aria-expanded', 'true');
  });

  it('keeps the star next to the clear button when filled', () => {
    setup(SUGGESTIONS, 'Lidl');

    expect(star()).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Wyczyść: Sklep' }),
    ).toBeInTheDocument();
  });
});

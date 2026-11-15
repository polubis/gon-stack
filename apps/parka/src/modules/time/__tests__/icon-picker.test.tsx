import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { IconPicker } from '../presentation/icon-picker';

describe('task category icon picker', () => {
  const open = async () => {
    const onChange = vi.fn();
    render(<IconPicker value="cart" color="#0f7a4f" onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: /Ikona/ }));
    return onChange;
  };

  it('explains an empty search with an empty state', async () => {
    await open();

    await userEvent.type(screen.getByLabelText('Szukaj ikony'), ' zzzz ');

    expect(screen.getByRole('heading', { name: 'Brak ikon' })).toBeTruthy();
    expect(screen.getByText('Brak ikon pasujących do „zzzz”.')).toBeTruthy();
  });

  it('brings the icons back after clearing a search with no results', async () => {
    await open();
    await userEvent.type(screen.getByLabelText('Szukaj ikony'), 'zzzz');

    await userEvent.click(
      screen.getByRole('button', { name: 'Wyczyść wyszukiwanie' }),
    );

    expect(screen.queryByRole('heading', { name: 'Brak ikon' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Kino' })).toBeTruthy();
    expect(
      (screen.getByLabelText('Szukaj ikony') as HTMLInputElement).value,
    ).toBe('');
  });

  it('picks an icon found by search', async () => {
    const onChange = await open();

    await userEvent.type(screen.getByLabelText('Szukaj ikony'), 'kino');
    await userEvent.click(screen.getByRole('button', { name: 'Kino' }));

    expect(onChange).toHaveBeenCalledWith('film');
  });
});

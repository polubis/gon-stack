import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { COLORS } from '../configuration/constraints';
import { ColorPicker } from '../presentation/color-picker';
import { IconPicker } from '../presentation/icon-picker';

describe('color picker', () => {
  it('picks a color from the popover and closes it', async () => {
    const onChange = vi.fn();
    render(<ColorPicker value={COLORS[0]} custom={null} onChange={onChange} />);

    await userEvent.click(screen.getByRole('button', { name: /Kolor/ }));
    await userEvent.click(
      screen.getByRole('button', { name: `Kolor ${COLORS[1]}` }),
    );

    expect(onChange).toHaveBeenCalledWith(COLORS[1]);
    expect(
      screen.queryByRole('button', { name: `Kolor ${COLORS[2]}` }),
    ).toBeNull();
  });

  it('offers a custom color the category already has', async () => {
    render(<ColorPicker value="#123456" custom="#123456" onChange={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: /Kolor/ }));

    expect(screen.getByRole('button', { name: 'Kolor #123456' })).toBeTruthy();
  });
});

describe('icon picker', () => {
  const open = async () => {
    const onChange = vi.fn();
    render(<IconPicker value="cart" color="#0f7a4f" onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: /Ikona/ }));
    return onChange;
  };

  it('finds an icon by search and picks it', async () => {
    const onChange = await open();

    await userEvent.type(screen.getByLabelText('Szukaj ikony'), 'kino');
    await userEvent.click(screen.getByRole('button', { name: 'Kino' }));

    expect(onChange).toHaveBeenCalledWith('film');
  });

  it('says what was not found', async () => {
    await open();

    await userEvent.type(screen.getByLabelText('Szukaj ikony'), ' zzzz ');

    expect(screen.getByText('Brak ikon pasujących do „zzzz”.')).toBeTruthy();
  });

  it('narrows the icons to a chosen group', async () => {
    await open();
    const group = screen.getByRole('group', { name: 'Grupy ikon' });
    const all = screen.getAllByRole('button', { pressed: false }).length;

    const [, first] = within(group).getAllByRole('button');
    await userEvent.click(first);

    expect(
      screen.getAllByRole('button', { pressed: false }).length,
    ).toBeLessThan(all);
  });
});

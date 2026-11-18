import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { BrainFill, type BrainFillArea } from '../presentation/brain-fill';

const areas: readonly BrainFillArea[] = [
  { id: 'frontal', fill: 1 },
  { id: 'parietal', fill: 0.5 },
  { id: 'temporal', fill: 0.25 },
];

describe('BrainFill', () => {
  it('announces total and per-area percent as one image', () => {
    render(<BrainFill areas={areas} />);

    const img = screen.getByRole('img');
    expect(img).toHaveAccessibleName(
      'Mózg wypełniony wiedzą w 29%: Płat czołowy 100%, Płat ciemieniowy 50%, Płat skroniowy 25%, Płat potyliczny 0%, Móżdżek 0%, Pień mózgu 0%',
    );
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('announces the given overall fill instead of the area mean', () => {
    render(<BrainFill areas={areas} total={0.6} />);

    expect(screen.getByRole('img')).toHaveAccessibleName(
      /^Mózg wypełniony wiedzą w 60%/,
    );
  });

  it('lists every area with its percent in the caption', () => {
    render(<BrainFill areas={areas} />);

    const items = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(items.map((item) => item.textContent)).toEqual([
      'Płat czołowy: 100%',
      'Płat ciemieniowy: 50%',
      'Płat skroniowy: 25%',
      'Płat potyliczny: 0%',
      'Móżdżek: 0%',
      'Pień mózgu: 0%',
    ]);
  });

  it('clamps out-of-range fills to 0..100%', () => {
    render(
      <BrainFill
        areas={[
          { id: 'frontal', fill: 7 },
          { id: 'parietal', fill: -2 },
          { id: 'temporal', fill: Number.NaN },
        ]}
      />,
    );

    expect(screen.getByText('Płat czołowy: 100%')).toBeInTheDocument();
    expect(screen.getByText('Płat ciemieniowy: 0%')).toBeInTheDocument();
    expect(screen.getByText('Płat skroniowy: 0%')).toBeInTheDocument();
  });

  it('exposes areas as buttons inside a group when selectable', async () => {
    const onSelectArea = vi.fn();
    render(<BrainFill areas={areas} onSelectArea={onSelectArea} />);

    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.getByRole('group', { name: /Mózg wypełniony/ })).toBeTruthy();
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(6);

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Obszar: Płat ciemieniowy, 50% wypełnienia',
      }),
    );

    expect(onSelectArea).toHaveBeenCalledWith('parietal');
  });

  it('selects an area from the keyboard with Enter and Space', async () => {
    const onSelectArea = vi.fn();
    render(<BrainFill areas={areas} onSelectArea={onSelectArea} />);
    const button = screen.getByRole('button', { name: /Płat skroniowy/ });

    button.focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');

    expect(onSelectArea).toHaveBeenNthCalledWith(1, 'temporal');
    expect(onSelectArea).toHaveBeenNthCalledWith(2, 'temporal');
  });

  it('forwards figure props', () => {
    render(<BrainFill areas={areas} aria-describedby="hint" />);

    expect(screen.getByRole('figure')).toHaveAttribute(
      'aria-describedby',
      'hint',
    );
  });
});

import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  changeProps,
  useEntrance,
  useListChanges,
  type ChangePhase,
} from '../list-changes';

type Row = { id: string; name: string };

const List = ({ rows, scope }: { rows: Row[]; scope?: string }) => {
  const entries = useListChanges(rows, (r) => r.id, scope);
  return (
    <ul>
      {entries.map(({ key, item, phase }) => {
        const change = changeProps(phase);
        return (
          <li
            key={key}
            aria-hidden={change['aria-hidden']}
            inert={change.inert}
            className={change.className}
          >
            {item.name}
          </li>
        );
      })}
    </ul>
  );
};

const Staggered = ({ rows }: { rows: Row[] }) => {
  const entries = useListChanges(rows, (r) => r.id);
  return (
    <ul>
      {entries.map(({ key, item, phase }) => (
        <Entering key={key} name={item.name} phase={phase} />
      ))}
    </ul>
  );
};

const Entering = ({ name, phase }: { name: string; phase: ChangePhase }) => {
  const entrance = useEntrance(phase);
  return <li className={entrance.entering ? 'enter' : ''}>{name}</li>;
};

const stubMotion = (reduce: boolean) =>
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: reduce })),
  );

const a = { id: 'a', name: 'Alpha' };
const b = { id: 'b', name: 'Beta' };

describe('list change transitions', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    stubMotion(false);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('keeps first render still', () => {
    render(<List rows={[a, b]} />);

    expect(screen.getByText('Alpha').className).toBe('');
  });

  it('slides a created row in', () => {
    const { rerender } = render(<List rows={[a]} />);

    rerender(<List rows={[a, b]} />);

    expect(screen.getByText('Beta')).toHaveClass('animate-row-in');
    expect(screen.getByText('Alpha').className).toBe('');
  });

  it('flashes an updated row', () => {
    const { rerender } = render(<List rows={[a, b]} />);

    rerender(<List rows={[{ ...a, name: 'Alpha 2' }, b]} />);

    expect(screen.getByText('Alpha 2')).toHaveClass('animate-row-flash');
    expect(screen.getByText('Beta').className).toBe('');
  });

  it('settles after flashing an updated row', () => {
    const { rerender } = render(<List rows={[a, b]} />);
    rerender(<List rows={[{ ...a, name: 'Alpha 2' }, b]} />);

    act(() => void vi.advanceTimersByTime(1300));

    expect(screen.getByText('Alpha 2').className).toBe('');
  });

  it('keeps a deleted row leaving and inert', () => {
    const { rerender } = render(<List rows={[a, b]} />);

    rerender(<List rows={[b]} />);

    const leaving = screen.getByText('Alpha');
    expect(leaving).toHaveClass('animate-row-out');
    expect(leaving).toHaveAttribute('aria-hidden', 'true');
    expect(leaving).toHaveAttribute('inert');
  });

  it('removes a deleted row once it left', () => {
    const { rerender } = render(<List rows={[a, b]} />);
    rerender(<List rows={[b]} />);

    act(() => void vi.advanceTimersByTime(400));

    expect(screen.queryByText('Alpha')).not.toBeInTheDocument();
  });

  it('stops clipping a created row once it has grown in', () => {
    const { rerender } = render(<List rows={[a]} />);

    rerender(<List rows={[a, b]} />);
    act(() => void vi.advanceTimersByTime(500));

    expect(screen.getByText('Beta').className).toBe('');
  });

  it('keeps a flash running past the growth of a created row', () => {
    const { rerender } = render(<List rows={[a, b]} />);

    const c = { id: 'c', name: 'Gamma' };
    rerender(<List rows={[a, b, c]} />);
    rerender(<List rows={[{ ...a, name: 'Alpha 2' }, b, c]} />);
    act(() => void vi.advanceTimersByTime(500));

    expect(screen.getByText('Alpha 2')).toHaveClass('animate-row-flash');
  });

  it('plays the entrance of the first render row', () => {
    render(<Staggered rows={[a]} />);

    expect(screen.getByText('Alpha')).toHaveClass('enter');
  });

  it('does not play the entrance of a row added later', () => {
    const { rerender } = render(<Staggered rows={[a]} />);

    rerender(<Staggered rows={[a, b]} />);

    expect(screen.getByText('Beta')).not.toHaveClass('enter');
  });

  it('never replays the entrance on a row that changed later', () => {
    const { rerender } = render(<Staggered rows={[a]} />);
    rerender(<Staggered rows={[a, b]} />);
    act(() => void vi.advanceTimersByTime(1500));

    rerender(<Staggered rows={[a, { ...b, name: 'Beta 2' }]} />);
    act(() => void vi.advanceTimersByTime(1500));

    expect(screen.getByText('Beta 2')).not.toHaveClass('enter');
  });

  it('swaps rows silently when the scope changes', () => {
    const { rerender } = render(<List rows={[a]} scope="week-1" />);

    rerender(<List rows={[b]} scope="week-2" />);

    expect(screen.queryByText('Alpha')).not.toBeInTheDocument();
    expect(screen.getByText('Beta').className).toBe('');
  });

  it('changes instantly under reduced motion', () => {
    stubMotion(true);
    const { rerender } = render(<List rows={[a]} />);

    rerender(<List rows={[b]} />);

    expect(screen.queryByText('Alpha')).not.toBeInTheDocument();
    expect(screen.getByText('Beta').className).toBe('');
  });
});

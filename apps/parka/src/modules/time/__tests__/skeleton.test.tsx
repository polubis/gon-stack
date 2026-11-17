import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ScreenSkeleton } from '../presentation/skeleton';

const WEEKDAYS = 7;

describe('time loading skeleton', () => {
  it('stays hidden from assistive tech', () => {
    render(<ScreenSkeleton kind="day" anchor="2026-11-17" />);

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });

  it.each([
    ['2026-11-17', 42],
    ['2027-02-10', 28],
    ['2026-10-05', 35],
  ])('month of %s holds as many cells as the calendar', (anchor, cells) => {
    const { container } = render(
      <ScreenSkeleton kind="month" anchor={anchor} />,
    );

    const calendar = container.querySelector('ul + ul');
    expect(calendar?.children).toHaveLength(cells);
    expect(calendar?.previousElementSibling?.children).toHaveLength(WEEKDAYS);
  });

  it('year holds one card per month', () => {
    const { container } = render(
      <ScreenSkeleton kind="year" anchor="2026-11-17" />,
    );

    expect(container.querySelectorAll('li.rounded-3xl')).toHaveLength(12);
  });
});

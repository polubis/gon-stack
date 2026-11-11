import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PriorityBadge } from '../presentation/priority-badge';

describe('PriorityBadge', () => {
  it('announces name and value on the 1-10 scale', () => {
    render(<PriorityBadge priority={{ name: 'Wysoki', value: 9 }} />);

    expect(screen.getByText(/Priorytet:/)).toBeInTheDocument();
    expect(screen.getByText(/, 9 z 10/)).toBeInTheDocument();
    expect(screen.getByText('Wysoki')).toBeInTheDocument();
  });

  it('shows the name next to the pips', () => {
    render(<PriorityBadge priority={{ name: 'Niski', value: 2 }} />);

    expect(screen.getByText('Niski')).toBeVisible();
  });

  it('compact keeps the name and scale for assistive tech', () => {
    render(<PriorityBadge priority={{ name: 'Wysoki', value: 9 }} compact />);

    expect(screen.getByText('Wysoki')).toBeInTheDocument();
    expect(screen.getByText(/, 9 z 10/)).toBeInTheDocument();
  });
});

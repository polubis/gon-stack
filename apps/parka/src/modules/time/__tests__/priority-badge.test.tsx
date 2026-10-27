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

  it('shows no visible number, only the pips', () => {
    const { container } = render(
      <PriorityBadge priority={{ name: 'Niski', value: 2 }} />,
    );

    expect(container.textContent).toBe('Priorytet: Niski, 2 z 10');
    expect(screen.getByText('Niski')).toBeVisible();
  });

  it('compact hides the name visually but keeps it announced', () => {
    const { container } = render(
      <PriorityBadge priority={{ name: 'Wysoki', value: 9 }} compact />,
    );

    expect(container.textContent).toBe('Priorytet: Wysoki, 9 z 10');
    expect(screen.getByText('Wysoki')).toHaveClass('sr-only');
  });

  it('fills as many pips as the value', () => {
    const { container } = render(
      <PriorityBadge priority={{ name: 'Średni', value: 5 }} />,
    );

    expect(container.querySelectorAll('[data-filled="true"]')).toHaveLength(5);
    expect(container.querySelectorAll('[data-filled="false"]')).toHaveLength(5);
  });

  it('uses no icon', () => {
    const { container } = render(
      <PriorityBadge priority={{ name: 'Wysoki', value: 10 }} />,
    );

    expect(container.querySelector('svg')).toBeNull();
  });
});

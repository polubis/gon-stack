import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Ring } from '../ring';

describe('progress ring', () => {
  it('announces how much is done', () => {
    render(<Ring pct={54} label="Wykorzystano 54% limitu" />);

    expect(
      screen.getByRole('progressbar', { name: 'Wykorzystano 54% limitu' }),
    ).toHaveAttribute('aria-valuenow', '54');
    screen.getByText('54%');
  });

  it('never goes past full', () => {
    render(<Ring pct={140} label="Limit przekroczony" />);

    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '100',
    );
    screen.getByText('100%');
  });

  it('never drops below empty', () => {
    render(<Ring pct={-5} label="Brak wydatków" />);

    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '0',
    );
  });

  it('shows a custom figure in the middle', () => {
    render(
      <Ring pct={33} label="Zrealizowano 33% zadań">
        1 z 3
      </Ring>,
    );

    screen.getByText('1 z 3');
    expect(screen.queryByText('33%')).not.toBeInTheDocument();
  });

  it('takes only known tones and surfaces', () => {
    // Type-level only: never rendered.
    const invalid = () => [
      // @ts-expect-error unknown tone
      <Ring key="tone" pct={1} label="a" tone="rainbow" />,
      // @ts-expect-error unknown surface
      <Ring key="surface" pct={1} label="b" surface="glass" />,
      // @ts-expect-error label is required
      <Ring key="label" pct={1} />,
    ];

    expect(invalid).toBeTypeOf('function');
  });
});

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Card } from '../layout';

describe('card', () => {
  it('shows content with the shared card spacing and radius', () => {
    render(
      <Card as="section" aria-label="Podsumowanie">
        <h2>Tytuł</h2>
      </Card>,
    );

    const card = screen.getByRole('region', { name: 'Podsumowanie' });
    expect(card).toHaveClass('p-4', 'rounded-3xl');
    expect(screen.getByRole('heading', { name: 'Tytuł' })).toBeVisible();
  });
});

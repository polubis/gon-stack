import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Main } from '../index';

describe('privacy page', () => {
  it('shows the heading and data promises', () => {
    render(<Main />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'RODO / Prywatność' }),
    ).toBeTruthy();
    expect(
      screen.getByText('Dane przechowywane w Unii Europejskiej.'),
    ).toBeTruthy();
  });

  it('links to data management', () => {
    render(<Main />);

    const link = screen.getByRole('link', { name: /Zarządzaj danymi/ });

    expect(link.getAttribute('href')).toBe('/app/data-export/');
  });
});

import { render, screen } from '@testing-library/react';
import { describe, it } from 'vitest';
import { Main } from '../presentation/main';

describe('Home landing works when', () => {
  it('introduces the product in one screen', () => {
    render(<Main />);

    screen.getByRole('heading', { name: 'Parka' });
    screen.getByText('Skanuj paragony');
  });

  it('sends new visitors to sign-up', () => {
    render(<Main />);

    expect(screen.getByRole('link', { name: 'Załóż konto' })).toHaveAttribute(
      'href',
      '/sign-up/',
    );
  });

  it('offers sign-in for existing accounts', () => {
    render(<Main />);

    expect(screen.getByRole('link', { name: 'Zaloguj się' })).toHaveAttribute(
      'href',
      '/sign-in/',
    );
  });
});

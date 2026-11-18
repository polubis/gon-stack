import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
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

    expect(screen.getByRole('link', { name: 'Zaloguj' })).toHaveAttribute(
      'href',
      '/sign-in/',
    );
  });

  it('keeps the sample screens out of the way of screen readers', () => {
    render(<Main />);

    screen.getByText('Zadania na dziś');
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.getAllByRole('heading')).toHaveLength(1);
  });

  it('lists everything the app helps with', () => {
    render(<Main />);

    const items = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(items.map((item) => item.textContent)).toEqual([
      'Skanuj paragony',
      'Pilnuj limitów',
      'Śledź płatności cykliczne',
    ]);
  });

  it('states the promise next to the name', () => {
    render(<Main />);

    screen.getByText('Twoje wydatki pod kontrolą.');
    screen.getByText('Prosto, przejrzyście, bez stresu.');
  });

  it('exposes only the real list, not the sample tasks', () => {
    render(<Main />);

    expect(screen.getAllByRole('list')).toHaveLength(1);
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getAllByRole('link')).toHaveLength(2);
  });

  it('shows no error screen when the landing renders fine', () => {
    render(<Main />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

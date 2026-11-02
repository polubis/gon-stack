import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Footer } from '../presentation/footer';

describe('Footer', () => {
  it('shows business identification', () => {
    render(<Footer />);

    const notice = screen.getByRole('region', { name: 'Dane przedsiębiorcy' });
    expect(notice).toHaveTextContent('NIP: 7393979495');
    expect(notice).toHaveTextContent('ul. Profesorska 9A');
  });

  it('links to privacy policy', () => {
    render(<Footer />);

    expect(
      screen.getByRole('link', { name: 'Polityka prywatności i cookies' }),
    ).toHaveAttribute('href', '/polityka-prywatnosci/');
  });

  it('has no link to a non-existent terms page', () => {
    render(<Footer />);

    expect(screen.queryByRole('link', { name: 'Regulamin' })).toBeNull();
  });
});

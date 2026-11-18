import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Main } from '../presentation/main';

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

    const link = screen.getByRole('link', { name: /Zarządzaj/ });

    expect(link.getAttribute('href')).toBe('/app/data-export/');
  });

  it('lists every data promise as one list', () => {
    render(<Main />);

    const items = within(screen.getByRole('list')).getAllByRole('listitem');

    expect(items.map((item) => item.textContent)).toEqual([
      'Dane przechowywane w Unii Europejskiej.',
      'Szyfrowane w spoczynku i podczas przesyłania.',
      'Pełna kontrola nad danymi — zgodność z RODO / GDPR.',
      'Możesz usunąć swoje dane w każdej chwili.',
    ]);
  });

  it('opens the privacy policy', () => {
    render(<Main />);

    const link = screen.getByRole('link', {
      name: 'Polityka',
    });

    expect(link.getAttribute('href')).toBe('/privacy-policy/');
  });

  it('goes back to settings', () => {
    render(<Main />);

    const back = screen.getByRole('link', { name: 'Wróć' });

    expect(back.getAttribute('href')).toBe('/app/settings/');
  });

  it('exposes a clean heading outline for screen readers', () => {
    render(<Main />);

    const headings = screen.getAllByRole('heading');

    expect(headings.map((h) => [h.tagName, h.textContent])).toEqual([
      ['H1', 'RODO / Prywatność'],
      ['H2', 'Twoje dane'],
      ['H2', 'Polityka prywatności'],
    ]);
    expect(screen.getAllByRole('main')).toHaveLength(1);
  });

  it('hides decorative icons from assistive tech', () => {
    const { container } = render(<Main />);

    const icons = container.querySelectorAll('svg');

    expect(icons.length).toBeGreaterThan(0);
    icons.forEach((icon) =>
      expect(icon.getAttribute('aria-hidden')).toBe('true'),
    );
  });
});

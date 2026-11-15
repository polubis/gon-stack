import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Main } from '../presentation/main';

describe('ai info page', () => {
  it('shows the heading and every AI step', () => {
    render(<Main />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'AI — jak to działa' }),
    ).toBeTruthy();
    expect(screen.getByText('Analiza treści paragonów')).toBeTruthy();
    expect(screen.getByText('Transparentny AI')).toBeTruthy();
  });

  it('offers a way back to settings', () => {
    render(<Main />);

    expect(
      screen.getByRole('link', { name: 'Wróć' }).getAttribute('href'),
    ).toBe('/app/settings/');
  });

  it('explains what the AI does in an intro', () => {
    render(<Main />);

    expect(
      screen.getByText(/AI analizuje paragony i pomaga w kategoryzacji/),
    ).toBeTruthy();
  });

  it('lists four steps, each with title and description', () => {
    render(<Main />);

    const items = within(screen.getByRole('list')).getAllByRole('listitem');

    expect(items).toHaveLength(4);
    expect(items.map((item) => item.textContent)).toEqual([
      expect.stringContaining('Analiza treści paragonów'),
      expect.stringContaining('Propozycje kategorii'),
      expect.stringContaining('Wykrywanie anomalii'),
      expect.stringContaining('Transparentny AI'),
    ]);
    expect(screen.getByText(/zawsze możesz ją poprawić/i)).toBeTruthy();
    expect(screen.getByText(/decyzje podejmujesz Ty/)).toBeTruthy();
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

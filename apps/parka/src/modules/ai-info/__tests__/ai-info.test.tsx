import { render, screen } from '@testing-library/react';
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
});

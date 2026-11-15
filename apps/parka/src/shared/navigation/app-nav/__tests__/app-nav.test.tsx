import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AppNav } from '../presentation/app-nav';

vi.mock('@/shared/auth/presentation/account-menu', () => ({
  AccountMenu: () => null,
}));

describe('bottom app nav', () => {
  it('marks only the current section as the current page', () => {
    render(<AppNav active="time" />);

    expect(screen.getByRole('link', { name: 'Czas' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: 'Finanse' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('shows icons only, no visible section titles', () => {
    render(<AppNav active="time" />);

    expect(screen.getByRole('link', { name: 'Czas' })).toHaveTextContent(
      /^Czas$/,
    );
    expect(screen.getByText('Czas')).toHaveClass('sr-only');
    expect(screen.getByText('Finanse')).toHaveClass('sr-only');
  });

  it('has no "Więcej" entry, settings live in the account panel', () => {
    render(<AppNav active={null} />);

    expect(screen.queryByRole('link', { name: 'Więcej' })).toBeNull();
    expect(screen.getAllByRole('link')).toHaveLength(2);
  });

  it('highlights nothing outside finances and time', () => {
    render(<AppNav active={null} />);

    expect(screen.queryByRole('link', { current: 'page' })).toBeNull();
  });
});

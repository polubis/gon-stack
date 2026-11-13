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
});

import { describe, expect, it } from 'vitest';
import { apiRoutes, moreSectionPaths, normalizePath, routes } from '../routes';

describe('page routes', () => {
  it('returns trailing-slash paths', () => {
    expect(routes.dashboard()).toBe('/dashboard/');
    expect(routes.signIn()).toBe('/sign-in/');
    expect(routes.home()).toBe('/');
  });

  it('builds the dashboard month query without manual string concat', () => {
    expect(routes.dashboard({ month: '2025-04' })).toBe(
      '/dashboard/?month=2025-04',
    );
  });

  it('omits empty query values', () => {
    expect(routes.dashboard({})).toBe('/dashboard/');
    expect(routes.dashboard({ month: '' })).toBe('/dashboard/');
  });
});

describe('api routes', () => {
  it('builds collection and by-id paths', () => {
    expect(apiRoutes.expenses()).toBe('/api/expenses/');
    expect(apiRoutes.expenseById('e-1')).toBe('/api/expenses/e-1/');
    expect(apiRoutes.dashboard({ month: '2025-04' })).toBe(
      '/api/dashboard/?month=2025-04',
    );
  });

  it('covers auth endpoints used by sign-in/up and logout', () => {
    expect(apiRoutes.authLogin()).toBe('/api/auth/login/');
    expect(apiRoutes.authRegister()).toBe('/api/auth/register/');
    expect(apiRoutes.authLogout()).toBe('/api/auth/logout/');
    expect(apiRoutes.authCallback()).toBe('/api/auth/callback/');
    expect(apiRoutes.authConfirm()).toBe('/api/auth/confirm/');
  });
});

describe('nav helpers', () => {
  it('normalizes paths with and without trailing slash', () => {
    expect(normalizePath('/dashboard')).toBe('/dashboard/');
    expect(normalizePath('/dashboard/')).toBe('/dashboard/');
    expect(normalizePath('/')).toBe('/');
  });

  it('lists more-section paths from the same builders as hrefs', () => {
    expect(moreSectionPaths()).toContain(routes.settings());
    expect(moreSectionPaths()).toContain(routes.categories());
  });
});

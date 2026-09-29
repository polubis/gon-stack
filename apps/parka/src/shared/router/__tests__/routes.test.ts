import { describe, expect, it } from 'vitest';
import {
  API_ROUTER,
  moreSectionPaths,
  normalizePath,
  APP_ROUTER,
} from '../routes';

describe('page routes', () => {
  it('returns trailing-slash paths', () => {
    expect(APP_ROUTER.dashboard()).toBe('/app/');
    expect(APP_ROUTER.signIn()).toBe('/sign-in/');
    expect(APP_ROUTER.home()).toBe('/');
  });

  it('builds the dashboard month query without manual string concat', () => {
    expect(APP_ROUTER.dashboard({ month: '2025-04' })).toBe(
      '/app/?month=2025-04',
    );
  });

  it('omits empty query values', () => {
    expect(APP_ROUTER.dashboard({})).toBe('/app/');
    expect(APP_ROUTER.dashboard({ month: '' })).toBe('/app/');
  });
});

describe('api routes', () => {
  it('builds collection and by-id paths', () => {
    expect(API_ROUTER.expenses()).toBe('/api/expenses/');
    expect(API_ROUTER.expenseById('e-1')).toBe('/api/expenses/e-1/');
    expect(API_ROUTER.dashboard({ month: '2025-04' })).toBe(
      '/api/dashboard/?month=2025-04',
    );
  });

  it('covers auth endpoints used by sign-in/up and logout', () => {
    expect(API_ROUTER.authLogin()).toBe('/api/auth/login/');
    expect(API_ROUTER.authRegister()).toBe('/api/auth/register/');
    expect(API_ROUTER.authLogout()).toBe('/api/auth/logout/');
    expect(API_ROUTER.authCallback()).toBe('/api/auth/callback/');
    expect(API_ROUTER.authConfirm()).toBe('/api/auth/confirm/');
  });
});

describe('nav helpers', () => {
  it('normalizes paths with and without trailing slash', () => {
    expect(normalizePath('/dashboard')).toBe('/dashboard/');
    expect(normalizePath('/dashboard/')).toBe('/dashboard/');
    expect(normalizePath('/')).toBe('/');
  });

  it('lists more-section paths from the same builders as hrefs', () => {
    expect(moreSectionPaths()).toContain(APP_ROUTER.settings());
    expect(moreSectionPaths()).toContain(APP_ROUTER.categories());
  });
});

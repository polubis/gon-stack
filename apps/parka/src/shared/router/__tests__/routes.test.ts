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
    expect(API_ROUTER.dashboard({ kind: 'week', from: '2025-04-07' })).toBe(
      '/api/dashboard/?kind=week&from=2025-04-07',
    );
  });

  it.each([
    ['authLogin', API_ROUTER.authLogin(), '/api/auth/login/'],
    ['authRegister', API_ROUTER.authRegister(), '/api/auth/register/'],
    ['authLogout', API_ROUTER.authLogout(), '/api/auth/logout/'],
    ['authMe', API_ROUTER.authMe(), '/api/auth/me/'],
    ['authAccounts', API_ROUTER.authAccounts(), '/api/auth/accounts/'],
    ['authSwitch', API_ROUTER.authSwitch(), '/api/auth/switch/'],
    ['authCallback', API_ROUTER.authCallback(), '/api/auth/callback/'],
    ['authConfirm', API_ROUTER.authConfirm(), '/api/auth/confirm/'],
  ])('builds the %s endpoint', (_name, path, expected) => {
    expect(path).toBe(expected);
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

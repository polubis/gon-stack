import { describe, expect, it } from 'vitest';
import { APP_ROUTER } from '@/shared/router/routes';
import { activeNavKeyFromPathname } from '../domain/active-nav-key';

describe('active nav section', () => {
  it('marks the dashboard as finances', () => {
    expect(activeNavKeyFromPathname(APP_ROUTER.dashboard())).toBe('finances');
  });

  it('marks every time view as time', () => {
    expect(activeNavKeyFromPathname(APP_ROUTER.timeWeek())).toBe('time');
  });

  it.each([APP_ROUTER.settings(), APP_ROUTER.notifications()])(
    'marks no section on %s',
    (path) => {
      expect(activeNavKeyFromPathname(path)).toBeNull();
    },
  );
});

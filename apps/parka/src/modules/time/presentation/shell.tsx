import { Outlet, useRouterState } from '@tanstack/react-router';
import { APP_ROUTER, normalizePath } from '@/shared/router/routes';
import type { TimeKind } from '../domain/models';
import { TimeScreen } from './screen';

const KIND_BY_PATH: Record<string, TimeKind> = {
  [APP_ROUTER.timeWeek()]: 'week',
  [APP_ROUTER.timeMonth()]: 'month',
  [APP_ROUTER.timeYear()]: 'year',
};

/**
 * Layout route of the four views: one store survives day -> week -> month ->
 * year, so switching the range never flashes a skeleton or loses a toast.
 */
export const Main = () => {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <TimeScreen kind={KIND_BY_PATH[normalizePath(pathname)] ?? 'day'}>
      <Outlet />
    </TimeScreen>
  );
};

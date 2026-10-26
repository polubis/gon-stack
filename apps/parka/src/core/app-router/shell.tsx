import { Outlet, useRouter, useRouterState } from '@tanstack/react-router';
import { useEffect } from 'react';
import {
  AccountProfileSync,
  ProfileEditModal,
} from '@/modules/settings/presentation/profile-modal';
import { Main as FinanceTour } from '@/modules/finance-tour/presentation/main';
import { AccountDrawer } from '@/shared/auth/presentation/account-drawer';
import { AccountSwitchToast } from '@/shared/auth/presentation/account-switch-toast';
import { ProtectedScreen } from '@/shared/auth/presentation/protected-screen';
import { withAuth } from '@/shared/auth/presentation/with-auth';
import { Provider as OverlayNavProvider } from '@/shared/navigation/overlay-nav/presentation/context';
import { NavSlot } from '@/shared/navigation/overlay-nav/presentation/nav-slot';
import { SyncedAppNav } from '@/shared/navigation/app-nav/presentation/synced-app-nav';
import { navigateTo, registerNavigator } from '@/shared/router/navigation';
import { normalizePath } from '@/shared/router/routes';
import { trackKeyboardInset } from '@/shared/ui/keyboard-inset';
import { APP_PAGES } from './pages';

const pathOf = (url: string): string => url.split('?')[0];

const isAppPath = (pathname: string): boolean =>
  APP_PAGES.some(({ url }) => normalizePath(pathname) === pathOf(url));

/** Turns plain in-app `<a href>` clicks into client-side navigation. */
const onDocumentClick = (event: MouseEvent) => {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  )
    return;
  const anchor = (event.target as Element).closest('a');
  if (!anchor || anchor.target || anchor.hasAttribute('download')) return;
  const url = new URL(anchor.href);
  if (url.origin !== window.location.origin || !isAppPath(url.pathname)) return;
  event.preventDefault();
  navigateTo(url.pathname + url.search + url.hash);
};

const Shell = () => {
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    registerNavigator({
      // flush: the browser URL must be current right after the call.
      push: (path, state) => {
        router.history.push(path, state);
        router.history.flush();
      },
      replace: (path, state) => {
        router.history.replace(path, state);
        router.history.flush();
      },
    });
    document.addEventListener('click', onDocumentClick);
    return () => {
      registerNavigator(null);
      document.removeEventListener('click', onDocumentClick);
    };
  }, [router]);

  useEffect(() => trackKeyboardInset(), []);

  useEffect(() => {
    const page = APP_PAGES.find(
      ({ url }) => pathOf(url) === normalizePath(pathname),
    );
    if (page) document.title = page.title;
  }, [pathname]);

  return (
    <OverlayNavProvider>
      <div className="flex h-dvh w-full flex-col overflow-hidden bg-surface lg:flex-row">
        <NavSlot placement="side">
          <SyncedAppNav placement="side" />
        </NavSlot>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto">
            <Outlet />
          </div>
          <NavSlot placement="bottom">
            <SyncedAppNav placement="bottom" />
          </NavSlot>
        </div>
        <AccountSwitchToast />
        <AccountProfileSync />
        <AccountDrawer />
        <ProfileEditModal />
        <FinanceTour />
      </div>
    </OverlayNavProvider>
  );
};

/** Renders the app only when signed in; signed-out users see a protected screen. */
export const AppShell = withAuth(Shell, {
  fallback: <ProtectedScreen />,
});

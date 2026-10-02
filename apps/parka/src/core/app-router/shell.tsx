import { Outlet, useRouter, useRouterState } from '@tanstack/react-router';
import { useEffect } from 'react';
import { AuthGuard } from '@/shared/auth';
import { SyncedAppNav } from '@/shared/navigation/app-nav';
import { navigateTo, normalizePath, registerNavigator } from '@/shared/router';
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

export const AppShell = () => {
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    registerNavigator({
      push: (path) => router.history.push(path),
      replace: (path) => router.history.replace(path),
    });
    document.addEventListener('click', onDocumentClick);
    return () => {
      registerNavigator(null);
      document.removeEventListener('click', onDocumentClick);
    };
  }, [router]);

  useEffect(() => {
    const page = APP_PAGES.find(
      ({ url }) => pathOf(url) === normalizePath(pathname),
    );
    if (page) document.title = page.title;
  }, [pathname]);

  return (
    <div className="min-h-screen w-full bg-surface lg:flex">
      <AuthGuard mode="protected" />
      <div className="sticky top-0 z-(--z-nav) hidden h-screen w-64 shrink-0 lg:block xl:w-72">
        <SyncedAppNav placement="side" />
      </div>
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <div className="flex min-h-0 w-full flex-1 flex-col">
          <Outlet />
        </div>
        <div className="sticky bottom-0 z-(--z-nav) mt-auto lg:hidden">
          <SyncedAppNav placement="bottom" />
        </div>
      </div>
    </div>
  );
};

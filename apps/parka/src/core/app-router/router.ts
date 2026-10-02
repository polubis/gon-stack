import {
  createRootRoute,
  createRoute,
  createRouter,
  lazyRouteComponent,
} from '@tanstack/react-router';
import type { ComponentType } from 'react';
import { APP_ROUTER } from '@/shared/router/routes';
import { AppShell } from './shell';

const rootRoute = createRootRoute({ component: AppShell });

const page = (path: string, load: () => Promise<{ Main: ComponentType }>) =>
  createRoute({
    getParentRoute: () => rootRoute,
    path,
    component: lazyRouteComponent(load, 'Main'),
  });

export const router = createRouter({
  routeTree: rootRoute.addChildren([
    page(
      APP_ROUTER.dashboard(),
      () => import('@/modules/dashboard/presentation/main'),
    ),
    page(
      APP_ROUTER.settings(),
      () => import('@/modules/settings/presentation/main'),
    ),
    page(
      APP_ROUTER.categories(),
      () => import('@/modules/categories/presentation/main'),
    ),
    page(
      APP_ROUTER.reports(),
      () => import('@/modules/reports/presentation/main'),
    ),
    page(
      APP_ROUTER.notifications(),
      () => import('@/modules/notifications/presentation/main'),
    ),
    page(
      APP_ROUTER.privacy(),
      () => import('@/modules/privacy/presentation/main'),
    ),
    page(
      APP_ROUTER.aiInfo(),
      () => import('@/modules/ai-info/presentation/main'),
    ),
    page(
      APP_ROUTER.dataExport(),
      () => import('@/modules/data-export/presentation/main'),
    ),
    page(
      APP_ROUTER.receiptScan(),
      () => import('@/modules/receipt/presentation/main'),
    ),
  ]),
  trailingSlash: 'always',
  scrollRestoration: true,
});

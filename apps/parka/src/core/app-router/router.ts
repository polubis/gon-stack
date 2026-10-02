import {
  createRootRoute,
  createRoute,
  createRouter,
  lazyRouteComponent,
} from '@tanstack/react-router';
import type { ComponentType } from 'react';
import { APP_ROUTER } from '@/shared/router';
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
    page(APP_ROUTER.dashboard(), () => import('@/modules/dashboard')),
    page(APP_ROUTER.settings(), () => import('@/modules/settings')),
    page(APP_ROUTER.categories(), () => import('@/modules/categories')),
    page(APP_ROUTER.limits(), () => import('@/modules/limits')),
    page(APP_ROUTER.recurring(), () => import('@/modules/recurring')),
    page(APP_ROUTER.reports(), () => import('@/modules/reports')),
    page(APP_ROUTER.notifications(), () => import('@/modules/notifications')),
    page(APP_ROUTER.privacy(), () => import('@/modules/privacy')),
    page(APP_ROUTER.aiInfo(), () => import('@/modules/ai-info')),
    page(APP_ROUTER.dataExport(), () => import('@/modules/data-export')),
    page(APP_ROUTER.receiptScan(), () => import('@/modules/receipt')),
  ]),
  trailingSlash: 'always',
  scrollRestoration: true,
});

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

/**
 * Categories pages share one layout route so a single store survives the
 * list -> editor navigation (optimistic updates and toasts keep working).
 */
const categoriesRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'categories-layout',
  component: lazyRouteComponent(
    () => import('@/modules/categories/presentation/shell'),
    'Main',
  ),
});

const categoriesChild = (
  path: string,
  load: () => Promise<{ Main: ComponentType }>,
) =>
  createRoute({
    getParentRoute: () => categoriesRoute,
    path,
    component: lazyRouteComponent(load, 'Main'),
  });

const categoriesTree = categoriesRoute.addChildren([
  categoriesChild(
    APP_ROUTER.categories(),
    () => import('@/modules/categories/presentation/main'),
  ),
  categoriesChild(
    APP_ROUTER.categoryNew(),
    () => import('@/modules/categories/presentation/editor'),
  ),
  categoriesChild(
    APP_ROUTER.categoryEdit(),
    () => import('@/modules/categories/presentation/editor'),
  ),
]);

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
    categoriesTree,
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
      APP_ROUTER.newExpense(),
      () => import('@/modules/expenses-management/presentation/main'),
    ),
    page(
      APP_ROUTER.expenseEdit(),
      () => import('@/modules/expenses-management/presentation/main'),
    ),
  ]),
  trailingSlash: 'always',
  scrollRestoration: true,
});

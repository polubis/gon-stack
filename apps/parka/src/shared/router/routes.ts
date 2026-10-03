type QueryValue = string | number | boolean | undefined | null;

type Query = Record<string, QueryValue>;

/** A literal path, or that same path with a `?query` suffix appended. */
type WithQuery<Path extends string> = Path | `${Path}?${string}`;

/** A literal base path with an id segment appended, trailing-slash terminated. */
type WithId<Base extends string> = `${Base}${string}/`;

const buildQuery = (query?: Query): string => {
  if (!query) return '';
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    params.set(key, String(value));
  }
  return params.toString();
};

/** Primitive: static route, no params. */
const route =
  <Path extends string>(path: Path) =>
  (): Path =>
    path;

/** Primitive: route with an optional query object appended as `?...`. */
const routeWithQuery =
  <Path extends string, Q extends Query = Query>(path: Path) =>
  (query?: Q): WithQuery<Path> => {
    const suffix = buildQuery(query);
    return (suffix ? `${path}?${suffix}` : path) as WithQuery<Path>;
  };

/** Primitive: route with a required query object appended as `?...`. */
const routeWithRequiredQuery =
  <Path extends string, Q extends Query>(path: Path) =>
  (query: Q): WithQuery<Path> => {
    const suffix = buildQuery(query);
    return (suffix ? `${path}?${suffix}` : path) as WithQuery<Path>;
  };

/** Primitive: route with a required id segment, e.g. `/api/expenses/e-1/`. */
const routeById =
  <Base extends string>(base: Base) =>
  (id: string): WithId<Base> =>
    `${base}${id}/` as WithId<Base>;

export type DashboardQuery = {
  month?: string;
  range?: string;
};

/**
 * Page routes for the Parka MPA. Single source of truth for every
 * `<a href>`, `Astro.redirect()`, and server `location:` string. Each
 * builder is composed from the `route` / `routeWithQuery` / `routeById`
 * primitives above, which infer their literal return type from the path
 * given — no per-route type alias to hand-maintain.
 */
export const APP_ROUTER = {
  home: route('/'),
  dashboard: routeWithQuery<'/app/', DashboardQuery>('/app/'),
  settings: route('/app/settings/'),
  categories: route('/app/categories/'),
  reports: route('/app/reports/'),
  notifications: route('/app/notifications/'),
  privacy: route('/app/privacy/'),
  privacyPolicy: route('/privacy-policy/'),
  aiInfo: route('/app/ai-info/'),
  dataExport: route('/app/data-export/'),
  receiptScan: route('/app/receipt-scan/'),
  signIn: route('/sign-in/'),
  signUp: route('/sign-up/'),
};

export type PageRouteKey = keyof typeof APP_ROUTER;

/** Union of every literal URL the page route builders can produce. */
export type PageUrl = ReturnType<(typeof APP_ROUTER)[PageRouteKey]>;

/** Paths that highlight the "Więcej" tab in the bottom nav. */
export const moreSectionPaths = (): readonly string[] => [
  APP_ROUTER.settings(),
  APP_ROUTER.categories(),
  APP_ROUTER.reports(),
  APP_ROUTER.notifications(),
  APP_ROUTER.privacy(),
  APP_ROUTER.aiInfo(),
  APP_ROUTER.dataExport(),
];

/**
 * Backend API routes. Mirrors `src/pages/api/**`. Same builders are used
 * by client `fetch()` calls and by server `redirectTo` / `emailRedirectTo`
 * origin suffixes, so client and server can never drift.
 */
export const API_ROUTER = {
  dashboard: routeWithRequiredQuery<'/api/dashboard/', { month: string }>(
    '/api/dashboard/',
  ),
  expenses: route('/api/expenses/'),
  expenseById: routeById('/api/expenses/'),
  scanReceipt: route('/api/receipts/scan/'),
  categories: route('/api/categories/'),
  categoryById: routeById('/api/categories/'),
  limits: route('/api/limits/'),
  limitById: routeById('/api/limits/'),
  notifications: route('/api/notifications/'),
  notificationById: routeById('/api/notifications/'),
  recurring: route('/api/recurring/'),
  recurringById: routeById('/api/recurring/'),
  settings: route('/api/settings/'),
  authLogin: route('/api/auth/login/'),
  authRegister: route('/api/auth/register/'),
  authLogout: route('/api/auth/logout/'),
  authCallback: route('/api/auth/callback/'),
  authConfirm: route('/api/auth/confirm/'),
};

export type ApiRouteKey = keyof typeof API_ROUTER;

export const normalizePath = (path: string): string => {
  if (!path || path === '/') return '/';
  return path.endsWith('/') ? path : `${path}/`;
};

export const PUBLIC_NAV_E2E_IDS = [
  'public-nav:main',
  'public-nav:home',
  'public-nav:sign-in',
  'public-nav:sign-up',
  'public-nav:app',
] as const;

export type PublicNavE2eId = (typeof PUBLIC_NAV_E2E_IDS)[number];

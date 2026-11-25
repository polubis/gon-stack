export const APP_NAV_E2E_IDS = ['app-nav:indicator'] as const;

export type AppNavE2eId = (typeof APP_NAV_E2E_IDS)[number];

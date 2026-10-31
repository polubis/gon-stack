export const APP_UPDATE_E2E_IDS = [
  'app-update:banner',
  'app-update:refresh',
  'app-update:dismiss',
] as const;

export type AppUpdateE2eId = (typeof APP_UPDATE_E2E_IDS)[number];

export const COOKIES_E2E_IDS = [
  'cookies:banner',
  'cookies:dismiss',
  'cookies:policy-link',
  'cookies:manage-preferences',
  'cookies:reject-optional',
  'cookies:accept-all',
  'cookies:preferences',
  'cookies:back',
  'cookies:close',
  'cookies:save-preferences',
  'cookies:saved-toast',
  'cookies:saved-dismiss',
  'cookies:reopen',
] as const;

export type CookiesE2eId = (typeof COOKIES_E2E_IDS)[number];

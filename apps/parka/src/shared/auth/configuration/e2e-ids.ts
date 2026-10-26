export const AUTH_E2E_IDS = [
  'account-menu:trigger',
  'account-menu:menu',
  'account-menu:name',
  'account-menu:edit',
  'account-menu:loading',
  'account-menu:load-error',
  'account-menu:add',
  'account-menu:logout',
  'account-menu:logout-all',
  'account-menu:switching',
  'account-menu:toast',
  'account-menu:switched-toast',
] as const;

export type AuthE2eDynamicId = `account-menu:account:${string}`;

export type AuthE2eId = (typeof AUTH_E2E_IDS)[number] | AuthE2eDynamicId;

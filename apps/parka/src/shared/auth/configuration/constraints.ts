/** How many accounts one browser can be signed in to at once. */
export const MAX_ACCOUNTS = 5;

export const SWITCH_TOAST_KEY = 'parka:account-switched';

export const ERROR_CODES = {
  load: 'ACCOUNTS_LOAD_FAILED',
  switch: 'ACCOUNT_SWITCH_FAILED',
  logout: 'ACCOUNT_LOGOUT_FAILED',
} as const;

/** URL ids of the account modals (see `shared/router/modal-stack`). */
export const ACCOUNT_MODAL = 'account';
export const PROFILE_MODAL = 'profile';

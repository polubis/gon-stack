export type E2eId =
  | 'home:main'
  | 'home:logo'
  | 'cookies:banner'
  | 'cookies:dismiss'
  | 'cookies:policy-link'
  | 'cookies:manage-preferences'
  | 'cookies:reject-optional'
  | 'cookies:accept-all'
  | 'cookies:preferences'
  | 'cookies:back'
  | 'cookies:close'
  | 'cookies:save-preferences'
  | 'cookies:saved-toast'
  | 'cookies:saved-dismiss'
  | 'cookies:reopen';

declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface DOMAttributes<T> {
    'data-e2e'?: E2eId;
  }
}

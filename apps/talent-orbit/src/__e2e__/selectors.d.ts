export type E2eId =
  | 'home:main'
  | 'home:logo'
  | 'home:continue'
  | 'home:join-exam'
  | `dashboard:${string}`
  | `sign-in:${string}`
  | `sign-up:${string}`
  | `knowledge-bank:${string}`
  | `organization:${string}`
  | `concept-details:${string}`
  | `questions-library:${string}`
  | `tests:${string}`
  | `exam:${string}`
  | `notes-report:${string}`
  | `roles:${string}`
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

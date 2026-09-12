import type { HomeE2eId } from '@/modules/home/configuration/e2e-ids';
import type { WalkthroughE2eId } from '@/shared/walkthrough/configuration/e2e-ids';

// Combines every module's own `data-e2e` id union into one type used for
// the global DOM attribute augmentation below and for `createE2eTest<E2eId>()`
// in `./test.ts`. Each module owns and type-checks its own ids in its
// `configuration/e2e-ids.ts` — this file only unions them, never declares
// one itself, so root-combining a new module never means editing anyone
// else's id list.
//
// Migration in progress: modules not yet listed by name below still fall
// back to a `${module}:${string}` wildcard, which compiles for any suffix
// and so isn't real type-safety — just a namespace reservation. Migrate one
// by adding that module's own `configuration/e2e-ids.ts` (see
// `shared/walkthrough` or `home` for the pattern) and importing its id type
// here instead of relying on the wildcard.
export type E2eId =
  | HomeE2eId
  | WalkthroughE2eId
  | `auth:${string}`
  | `dashboard:${string}`
  | `receipt:${string}`
  | `expenses:${string}`
  | `statistics:${string}`
  | `limits:${string}`
  | `goals:${string}`
  | `recurring:${string}`
  | `reports:${string}`
  | `notifications:${string}`
  | `settings:${string}`
  | `categories:${string}`
  | `privacy:${string}`
  | `ai-info:${string}`
  | `data-export:${string}`
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

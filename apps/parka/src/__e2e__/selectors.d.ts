import type { AuthE2eId } from '@/modules/auth/configuration/e2e-ids';
import type { CategoriesE2eId } from '@/modules/categories/configuration/e2e-ids';
import type { DashboardE2eId } from '@/modules/dashboard/configuration/e2e-ids';
import type { ExpensesE2eId } from '@/modules/expenses/configuration/e2e-ids';
import type { HomeE2eId } from '@/modules/home/configuration/e2e-ids';
import type {
  AiInfoE2eId,
  DataExportE2eId,
  PrivacyE2eId,
} from '@/modules/info/configuration/e2e-ids';
import type {
  GoalsE2eId,
  LimitsE2eId,
} from '@/modules/limits/configuration/e2e-ids';
import type { NotificationsE2eId } from '@/modules/notifications/configuration/e2e-ids';
import type { ReceiptE2eId } from '@/modules/receipt/configuration/e2e-ids';
import type { RecurringE2eId } from '@/modules/recurring/configuration/e2e-ids';
import type { ReportsE2eId } from '@/modules/reports/configuration/e2e-ids';
import type { SettingsE2eId } from '@/modules/settings/configuration/e2e-ids';
import type { StatisticsE2eId } from '@/modules/statistics/configuration/e2e-ids';
import type { CookiesE2eId } from '@/shared/cookies/configuration/e2e-ids';
import type { WalkthroughE2eId } from '@/shared/walkthrough/configuration/e2e-ids';

// Combines every module's own `data-e2e` id union into one type used for
// the global DOM attribute augmentation below and for `createE2eTest<E2eId>()`
// in `./test.ts`. Each module owns and type-checks its own ids in its
// `configuration/e2e-ids.ts` — this file only unions them, never declares
// one itself.
export type E2eId =
  | HomeE2eId
  | WalkthroughE2eId
  | AuthE2eId
  | DashboardE2eId
  | ReceiptE2eId
  | ExpensesE2eId
  | StatisticsE2eId
  | LimitsE2eId
  | GoalsE2eId
  | RecurringE2eId
  | ReportsE2eId
  | NotificationsE2eId
  | SettingsE2eId
  | CategoriesE2eId
  | PrivacyE2eId
  | AiInfoE2eId
  | DataExportE2eId
  | CookiesE2eId;

declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface DOMAttributes<T> {
    'data-e2e'?: E2eId;
  }
}

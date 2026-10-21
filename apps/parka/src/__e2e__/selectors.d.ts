import type { SignInE2eId } from '@/modules/sign-in/configuration/e2e-ids';
import type { SignUpE2eId } from '@/modules/sign-up/configuration/e2e-ids';
import type { CategoriesE2eId } from '@/modules/categories/configuration/e2e-ids';
import type { DashboardE2eId } from '@/modules/dashboard/configuration/e2e-ids';
import type { HomeE2eId } from '@/modules/home/configuration/e2e-ids';
import type { AiInfoE2eId } from '@/modules/ai-info/configuration/e2e-ids';
import type { DataExportE2eId } from '@/modules/data-export/configuration/e2e-ids';
import type { PrivacyE2eId } from '@/modules/privacy/configuration/e2e-ids';
import type { NotificationsE2eId } from '@/modules/notifications/configuration/e2e-ids';
import type { ExpensesManagementE2eId } from '@/modules/expenses-management/configuration/e2e-ids';
import type { ReportsE2eId } from '@/modules/reports/configuration/e2e-ids';
import type { TimeE2eId } from '@/modules/time/configuration/e2e-ids';
import type { AuthE2eId } from '@/shared/auth/configuration/e2e-ids';
import type { SettingsE2eId } from '@/modules/settings/configuration/e2e-ids';
import type { ExpenseFormE2eId } from '@/shared/expense-form/configuration/e2e-ids';
import type { FormMemoryE2eId } from '@/shared/form-memory/configuration/e2e-ids';
import type { CookiesE2eId } from '@/shared/cookies/configuration/e2e-ids';
import type { ImageEditorE2eId } from '@/shared/image-editor/configuration/e2e-ids';
import type { PublicNavE2eId } from '@/shared/navigation/public-nav/configuration/e2e-ids';
import type { FinanceTourE2eId } from '@/modules/finance-tour/configuration/e2e-ids';
import type { PeriodControlE2eId } from '@/shared/period-control/configuration/e2e-ids';
import type { WalkthroughE2eId } from '@/shared/walkthrough/configuration/e2e-ids';

// Combines every module's own `data-e2e` id union into one type used for
// the global DOM attribute augmentation below and for `createE2eTest<E2eId>()`
// in `./test.ts`. Each module owns and type-checks its own ids in its
// `configuration/e2e-ids.ts` — this file only unions them, never declares
// one itself.
export type E2eId =
  | HomeE2eId
  | WalkthroughE2eId
  | FinanceTourE2eId
  | SignInE2eId
  | SignUpE2eId
  | DashboardE2eId
  | ExpensesManagementE2eId
  | ExpenseFormE2eId
  | FormMemoryE2eId
  | ReportsE2eId
  | TimeE2eId
  | PeriodControlE2eId
  | NotificationsE2eId
  | SettingsE2eId
  | CategoriesE2eId
  | PrivacyE2eId
  | AiInfoE2eId
  | DataExportE2eId
  | CookiesE2eId
  | ImageEditorE2eId
  | PublicNavE2eId
  | AuthE2eId;

declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface DOMAttributes<T> {
    'data-e2e'?: E2eId;
  }
}

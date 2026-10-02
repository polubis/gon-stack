import { APP_ROUTER } from '@/shared/router/routes';
import { ErrorState } from '@/shared/ui/error-state';
import { Card } from '@/shared/ui/layout';
import { Skeleton } from '@/shared/ui/skeleton';
import { ERROR_CODES, LIMITS_SECTION_ID } from '../configuration/constraints';
import type { Month } from '../domain/models';
import { AddLimitButton } from './add-limit-button';
import { CategoryLimits } from './category-limits';
import { useContext } from './context';
import { Sheet } from '@/shared/ui/sheet';
import { LimitForm } from './limit-form';
import {
  categoryProgress,
  isCategoryLimit,
  totalProgress,
  withoutLimit,
  withRecurring,
} from './selectors';
import { TotalLimit, TotalLimitForm } from './total-limit';
import { useSheet } from '@/shared/ui/use-sheet';

type SheetKind = 'total' | 'limit' | `edit:${string}`;

/** Mirrors the loaded card: headline, then list rows. */
const LimitsSkeleton = () => (
  <div aria-hidden="true" className="space-y-4">
    <div className="space-y-2">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-2 w-full rounded-full" />
    </div>
    <Skeleton className="h-20 w-full rounded-xl" />
    <Skeleton className="h-20 w-full rounded-xl" />
  </div>
);

/**
 * Total limit as the headline, category limits scrolling below it. Fixed
 * height; the forms open as a sheet over the card, so nothing around it moves.
 */
export const LimitsCard = ({ month }: { month: Month }) => {
  const ctx = useContext();
  const limits = ctx.useLimits();
  const categories = ctx.useCategories();
  const expenses = withRecurring(ctx.useExpenses(), ctx.useRecurring(), month);
  const error = ctx.useLimitsError();
  const limitsInitializing = ctx.useLimitsInitializing();
  const expensesInitializing = ctx.useExpensesInitializing();
  const { sheet, open, close } = useSheet<SheetKind>();
  const initializing = limitsInitializing || expensesInitializing;
  const total = limits.find((l) => l.scope === 'total');
  const editing = sheet?.startsWith('edit:')
    ? limits.find((l) => isCategoryLimit(l) && `edit:${l.id}` === sheet)
    : undefined;
  const allCategoriesLimited =
    !initializing &&
    categories.length > 0 &&
    withoutLimit(categories, limits).length === 0;

  return (
    <Card
      as="section"
      id={LIMITS_SECTION_ID}
      aria-labelledby="limits-title"
      tabIndex={-1}
      className="relative flex h-112 scroll-mt-4 flex-col md:h-128 outline-none xl:col-span-4"
      data-e2e="dashboard:limits"
    >
      <div
        inert={sheet ? true : undefined}
        className="flex min-h-0 flex-1 flex-col gap-4"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 id="limits-title" className="text-base font-semibold">
            Limity
          </h2>
          <AddLimitButton
            blocked={allCategoriesLimited}
            loading={initializing}
            onClick={() => open('limit')}
          />
        </div>

        {error ? (
          <ErrorState
            data-e2e="dashboard:limits-error"
            title="Nie udało się wczytać limitów"
            code={ERROR_CODES.loadLimits}
            description={error}
            onRetry={ctx.loadLimits}
            backHref={APP_ROUTER.home()}
          />
        ) : null}

        {initializing ? (
          <LimitsSkeleton />
        ) : (
          <>
            <TotalLimit
              progress={totalProgress(limits, expenses, month)}
              month={month}
              onEdit={() => open('total')}
            />
            <div className="min-h-0 flex-1 overflow-y-auto pr-2">
              <CategoryLimits
                progress={categoryProgress(limits, expenses, month)}
                categories={categories}
                onEdit={(id) => open(`edit:${id}`)}
              />
            </div>
          </>
        )}
      </div>

      {sheet === 'total' && total ? (
        <Sheet title="Zmień limit miesięczny" onClose={close}>
          <TotalLimitForm limit={total} onDone={close} />
        </Sheet>
      ) : null}
      {sheet === 'limit' ? (
        <Sheet title="Nowy limit" onClose={close}>
          <LimitForm onDone={close} />
        </Sheet>
      ) : null}
      {editing && isCategoryLimit(editing) ? (
        <Sheet title="Edytuj limit" onClose={close}>
          <LimitForm limit={editing} onDone={close} />
        </Sheet>
      ) : null}
    </Card>
  );
};

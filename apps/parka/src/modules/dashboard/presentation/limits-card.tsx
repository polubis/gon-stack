import { Card } from '@/shared/ui/layout';
import { LIMITS_SECTION_ID } from '../configuration/constraints';
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

/**
 * Total limit as the headline, category limits scrolling below it. Fixed
 * height; the forms open as a sheet over the card, so nothing around it moves.
 */
export const LimitsCard = ({ month }: { month: Month }) => {
  const ctx = useContext();
  const limits = ctx.useLimits();
  const categories = ctx.useCategories();
  const expenses = withRecurring(ctx.useExpenses(), ctx.useRecurring(), month);
  const { sheet, open, close } = useSheet<SheetKind>();
  const total = limits.find((l) => l.scope === 'total');
  const editing = sheet?.startsWith('edit:')
    ? limits.find((l) => isCategoryLimit(l) && `edit:${l.id}` === sheet)
    : undefined;
  const allCategoriesLimited =
    categories.length > 0 && withoutLimit(categories, limits).length === 0;

  return (
    <Card
      as="section"
      id={LIMITS_SECTION_ID}
      aria-labelledby="limits-title"
      tabIndex={-1}
      className="relative flex h-112 scroll-mt-4 flex-col md:h-128 outline-none xl:col-span-4 xl:h-0 xl:min-h-full"
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
            onClick={() => open('limit')}
          />
        </div>

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
      </div>

      {sheet === 'total' ? (
        <Sheet
          title={total ? 'Zmień limit miesięczny' : 'Ustaw limit miesięczny'}
          onClose={close}
        >
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

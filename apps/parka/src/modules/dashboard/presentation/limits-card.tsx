import { Gauge, Plus } from 'lucide-react';
import { Button } from '@/shared/ui/controls';
import { EmptyState } from '@/shared/ui/empty-state';
import { Card } from '@/shared/ui/layout';
import { LIMITS_SECTION_ID } from '../configuration/constraints';
import type { Period } from '@/shared/period/period';
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
} from './selectors';
import { TotalLimit, TotalLimitForm } from './total-limit';
import { useSheet } from '@/shared/ui/use-sheet';

type SheetKind = 'total' | 'limit' | `edit:${string}`;

/**
 * Total limit as the headline, category limits scrolling below it. Fixed
 * height; the forms open as a sheet over the card, so nothing around it moves.
 */
export const LimitsCard = ({ period }: { period: Period }) => {
  const ctx = useContext();
  const limits = ctx.useLimits();
  const categories = ctx.useCategories();
  const expenses = ctx.useExpenses();
  const { sheet, open, close } = useSheet<SheetKind>();
  const total = limits.find((l) => l.scope === 'total');
  const editing = sheet?.startsWith('edit:')
    ? limits.find((l) => isCategoryLimit(l) && `edit:${l.id}` === sheet)
    : undefined;
  const progress = categoryProgress(limits, expenses, period);
  const totalProg = totalProgress(limits, expenses, period);
  const allCategoriesLimited =
    categories.length > 0 && withoutLimit(categories, limits).length === 0;

  return (
    <Card
      as="section"
      id={LIMITS_SECTION_ID}
      aria-labelledby="limits-title"
      tabIndex={-1}
      className="relative flex h-112 scroll-mt-4 flex-col outline-none md:h-auto md:max-h-128 md:min-h-96 xl:col-span-6 xl:col-start-7 xl:row-start-3 xl:h-0 xl:max-h-none xl:min-h-full"
      data-e2e="dashboard:limits"
    >
      <div
        inert={sheet ? true : undefined}
        className="flex min-h-0 flex-1 flex-col gap-4"
      >
        <div className="flex min-h-9 items-center justify-between gap-3">
          <h2 id="limits-title" className="text-base font-semibold">
            Limity
          </h2>
          {progress.length > 0 || !total ? (
            <AddLimitButton
              blocked={allCategoriesLimited}
              onClick={() => open('limit')}
            />
          ) : null}
        </div>

        {!totalProg && progress.length === 0 ? (
          <EmptyState
            variant="card"
            data-e2e="dashboard:limits-empty"
            className="min-h-0 flex-1"
            icon={Gauge}
            title="Brak limitów"
            description="Ustaw limit miesięczny, a potem ogranicz wydatki w wybranych kategoriach."
            action={
              <Button
                data-e2e="dashboard:limit-total-new"
                className="w-auto px-3 py-1.5"
                onClick={() => open('total')}
              >
                <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
                Ustaw limit miesięczny
              </Button>
            }
          />
        ) : (
          <>
            <TotalLimit
              progress={totalProg}
              period={period}
              monthly={total?.amount}
              onEdit={() => open('total')}
            />
            <div className="min-h-0 flex-1 overflow-y-auto pr-2">
              <CategoryLimits
                progress={progress}
                period={period}
                categories={categories}
                onAdd={() => open('limit')}
                onEdit={(id) => open(`edit:${id}`)}
              />
            </div>
          </>
        )}
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

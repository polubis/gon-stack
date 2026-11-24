import { Gauge, Plus } from 'lucide-react';
import { openModal } from '@/shared/router/modal-stack';
import { Button } from '@/shared/ui/controls';
import { EmptyState } from '@/shared/ui/empty-state';
import { Card } from '@/shared/ui/layout';
import { LIMITS_SECTION_ID } from '../configuration/constraints';
import type { Period } from '@/shared/period/period';
import { CategoryLimits } from './category-limits';
import { useContext } from './context';
import { LIMITS_MODAL, NEW_LIMIT_MODAL } from './modal-ids';
import { categoryProgress, totalProgress } from './selectors';
import { TotalLimit } from './total-limit';

/**
 * Total limit as the headline, category limits scrolling below it. Read only:
 * limits are added, edited and removed in the limits modal.
 */
export const LimitsCard = ({ period }: { period: Period }) => {
  const ctx = useContext();
  const limits = ctx.useLimits();
  const categories = ctx.useCategories();
  const expenses = ctx.useExpenses();
  const total = limits.find((l) => l.scope === 'total');
  const progress = categoryProgress(limits, expenses, period);
  const totalProg = totalProgress(limits, expenses, period);

  return (
    <Card
      as="section"
      id={LIMITS_SECTION_ID}
      aria-labelledby="limits-title"
      tabIndex={-1}
      className="relative flex h-112 scroll-mt-4 flex-col outline-none md:h-auto md:max-h-128 md:min-h-96 xl:col-span-6 xl:col-start-7 xl:row-start-2 xl:h-0 xl:max-h-none xl:min-h-full"
      data-e2e="dashboard:limits"
    >
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <div className="flex min-h-9 items-center justify-between gap-3">
          <h2 id="limits-title" className="text-base font-semibold">
            Limity
          </h2>
          <Button
            variant="ghost"
            className="w-auto min-w-0 px-3 py-1.5"
            aria-label="Zarządzaj limitami"
            data-e2e="dashboard:limits-manage"
            onClick={() => openModal(LIMITS_MODAL)}
          >
            <Gauge className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate">Zarządzaj</span>
          </Button>
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
                onClick={() => openModal(NEW_LIMIT_MODAL)}
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
            />
            <div className="min-h-0 flex-1 overflow-y-auto pr-2">
              <CategoryLimits
                progress={progress}
                period={period}
                categories={categories}
                onAdd={() => openModal(NEW_LIMIT_MODAL)}
              />
            </div>
          </>
        )}
      </div>
    </Card>
  );
};

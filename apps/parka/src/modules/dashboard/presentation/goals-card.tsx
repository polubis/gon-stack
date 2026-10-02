import { Plus } from 'lucide-react';
import { APP_ROUTER } from '@/shared/router/routes';
import { Button } from '@/shared/ui/controls';
import { ErrorState } from '@/shared/ui/error-state';
import { Card } from '@/shared/ui/layout';
import { Skeleton } from '@/shared/ui/skeleton';
import { ERROR_CODES, GOALS_SECTION_ID } from '../configuration/constraints';
import { useContext } from './context';
import { GoalsTab } from './goals-tab';
import { Sheet } from '@/shared/ui/sheet';
import { NewGoalForm } from './new-goal-form';
import { useSheet } from '@/shared/ui/use-sheet';

const GoalsSkeleton = () => (
  <div aria-hidden="true" className="space-y-3">
    <Skeleton className="h-20 w-full rounded-xl" />
    <Skeleton className="h-20 w-full rounded-xl" />
    <Skeleton className="h-20 w-full rounded-xl" />
  </div>
);

/** Savings goals. Fixed height, form opens as a sheet over the card. */
export const GoalsCard = () => {
  const ctx = useContext();
  const goals = ctx.useGoals();
  const error = ctx.useLimitsError();
  const initializing = ctx.useLimitsInitializing();
  const { sheet, open, close } = useSheet<'goal'>();

  return (
    <Card
      as="section"
      id={GOALS_SECTION_ID}
      aria-labelledby="goals-title"
      className="relative flex h-112 flex-col md:h-128 xl:col-span-4"
      data-e2e="dashboard:goals"
    >
      <div
        inert={sheet ? true : undefined}
        className="flex min-h-0 flex-1 flex-col gap-4"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 id="goals-title" className="text-base font-semibold">
            Cele
          </h2>
          <Button
            variant="ghost"
            className="w-auto px-3 py-1.5"
            disabled={initializing}
            data-e2e="dashboard:goal-new"
            onClick={() => open('goal')}
          >
            <Plus className="h-4 w-4" aria-hidden="true" /> Dodaj cel
          </Button>
        </div>

        {error ? (
          <ErrorState
            data-e2e="dashboard:goals-error"
            title="Nie udało się wczytać celów"
            code={ERROR_CODES.loadGoals}
            description={error}
            onRetry={ctx.loadLimits}
            backHref={APP_ROUTER.home()}
          />
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto pr-2">
          {initializing ? <GoalsSkeleton /> : <GoalsTab goals={goals} />}
        </div>
      </div>

      {sheet ? (
        <Sheet title="Nowy cel oszczędnościowy" onClose={close}>
          <NewGoalForm onDone={close} />
        </Sheet>
      ) : null}
    </Card>
  );
};

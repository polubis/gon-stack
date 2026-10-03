import { Plus } from 'lucide-react';
import { Button } from '@/shared/ui/controls';
import { Card } from '@/shared/ui/layout';
import { GOALS_SECTION_ID } from '../configuration/constraints';
import { useContext } from './context';
import { GoalsTab } from './goals-tab';
import { Sheet } from '@/shared/ui/sheet';
import { GoalForm } from './goal-form';
import { useSheet } from '@/shared/ui/use-sheet';

/** Vacation goals (CRUD). Fixed height, form opens as a sheet over the card. */
export const GoalsCard = () => {
  const ctx = useContext();
  const goals = ctx.useGoals();
  const { sheet, open, close } = useSheet<'goal' | `edit:${string}`>();
  const editing = sheet?.startsWith('edit:')
    ? goals.find((g) => `edit:${g.id}` === sheet)
    : undefined;

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
            Cele wakacyjne
          </h2>
          <Button
            variant="ghost"
            className="w-auto px-3 py-1.5"
            data-e2e="dashboard:goal-new"
            onClick={() => open('goal')}
          >
            <Plus className="h-4 w-4" aria-hidden="true" /> Dodaj cel
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pr-2">
          <GoalsTab goals={goals} onEdit={(id) => open(`edit:${id}`)} />
        </div>
      </div>

      {sheet === 'goal' ? (
        <Sheet title="Nowy cel wakacyjny" onClose={close}>
          <GoalForm onDone={close} />
        </Sheet>
      ) : null}
      {editing ? (
        <Sheet title="Edytuj cel wakacyjny" onClose={close}>
          <GoalForm goal={editing} onDone={close} />
        </Sheet>
      ) : null}
    </Card>
  );
};

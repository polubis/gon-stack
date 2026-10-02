import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button, ProgressBar } from '@/shared/ui/controls';
import { Card } from '@/shared/ui/layout';
import { money } from '../domain/format';
import type { Goal } from '../domain/models';
import { goalPct } from './selectors';
import { NewGoalForm } from './new-goal-form';

export const GoalsTab = ({ goals }: { goals: Goal[] }) => {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <ul
        className="grid gap-2 md:grid-cols-2 md:gap-4 xl:grid-cols-3"
        data-e2e="goals:list"
      >
        {goals.map((g) => {
          const pct = goalPct(g);
          return (
            <Card as="li" key={g.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{g.name}</span>
                <span className="text-sm tabular-nums">
                  {money(g.saved)} / {money(g.target)}
                </span>
              </div>
              <ProgressBar pct={pct} label={`${g.name}: ${Math.round(pct)}%`} />
              <p className="text-xs text-ink-soft">
                {Math.round(pct)}% · {g.months} mies.
              </p>
            </Card>
          );
        })}
      </ul>

      {showForm ? (
        <NewGoalForm onDone={() => setShowForm(false)} />
      ) : (
        <Button
          className="md:max-w-xs"
          data-e2e="goals:new"
          onClick={() => setShowForm(true)}
        >
          <Plus className="h-4 w-4" aria-hidden="true" /> Dodaj cel
        </Button>
      )}
    </>
  );
};

import { useState, type FormEvent } from 'react';
import { Button, Field, inputClass } from '@/shared/ui/controls';
import { NumberInput } from '@/shared/ui/number-input';
import {
  DEFAULT_GOAL_MONTHS,
  DEFAULT_GOAL_NAME,
  DEFAULT_GOAL_TARGET,
} from '../configuration/constraints';
import { newGoalId } from '../domain/ids';
import type { Goal } from '../domain/models';
import { useContext } from './context';

/** Creates a goal, or edits `goal` (can be removed). */
export const GoalForm = ({
  goal,
  onDone,
}: {
  goal?: Goal;
  onDone: () => void;
}) => {
  const ctx = useContext();
  const [name, setName] = useState(goal?.name ?? '');
  const [target, setTarget] = useState(goal?.target ?? DEFAULT_GOAL_TARGET);
  const [saved, setSaved] = useState(goal?.saved ?? 0);
  const [months, setMonths] = useState(goal?.months ?? DEFAULT_GOAL_MONTHS);

  const save = (event: FormEvent) => {
    event.preventDefault();
    const next = {
      name: name || DEFAULT_GOAL_NAME,
      target,
      saved,
      months: months || 1,
    };
    if (goal) {
      ctx.updateGoal({ ...goal, ...next });
    } else {
      ctx.createGoal({ id: newGoalId(), ...next });
    }
    onDone();
  };

  const remove = () => {
    if (!goal) return;
    ctx.removeGoal(goal.id);
    onDone();
  };

  return (
    <form onSubmit={save} className="space-y-3" data-e2e="dashboard:goal-form">
      <Field label="Nazwa">
        <input
          className={inputClass}
          value={name}
          data-e2e="dashboard:goal-form-name"
          onChange={(e) => setName(e.target.value)}
          placeholder="np. Wakacje w Grecji"
        />
      </Field>
      <Field label="Kwota docelowa">
        <NumberInput
          required
          value={target}
          data-e2e="dashboard:goal-form-target"
          onValueChange={setTarget}
        />
      </Field>
      <Field label="Odłożono">
        <NumberInput
          value={saved}
          data-e2e="dashboard:goal-form-saved"
          onValueChange={setSaved}
        />
      </Field>
      <Field label="Horyzont (miesiące)">
        <NumberInput
          integer
          required
          value={months}
          data-e2e="dashboard:goal-form-months"
          onValueChange={setMonths}
        />
      </Field>
      <div className="flex gap-2">
        <Button variant="ghost" onClick={onDone}>
          Anuluj
        </Button>
        <Button type="submit" data-e2e="dashboard:goal-form-save">
          Zapisz
        </Button>
      </div>
      {goal ? (
        <Button
          variant="danger"
          data-e2e="dashboard:goal-delete"
          onClick={remove}
        >
          Usuń cel
        </Button>
      ) : null}
    </form>
  );
};

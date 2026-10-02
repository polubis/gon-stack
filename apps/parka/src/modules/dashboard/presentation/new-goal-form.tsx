import { useState, type FormEvent } from 'react';
import { Button, Field, inputClass } from '@/shared/ui/controls';
import { NumberInput } from '@/shared/ui/number-input';
import {
  DEFAULT_GOAL_MONTHS,
  DEFAULT_GOAL_NAME,
  DEFAULT_GOAL_TARGET,
} from '../configuration/constraints';
import { newGoalId } from '../domain/ids';
import { useContext } from './context';

export const NewGoalForm = ({ onDone }: { onDone: () => void }) => {
  const ctx = useContext();
  const [name, setName] = useState('');
  const [target, setTarget] = useState(DEFAULT_GOAL_TARGET);
  const [months, setMonths] = useState(DEFAULT_GOAL_MONTHS);

  const save = (event: FormEvent) => {
    event.preventDefault();
    ctx.createGoal({
      id: newGoalId(),
      name: name || DEFAULT_GOAL_NAME,
      target,
      saved: 0,
      months: months || 1,
    });
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
          placeholder="np. Wakacje"
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
    </form>
  );
};

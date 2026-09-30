import { useState } from 'react';
import { Button, Card, Field, inputClass, NumberInput } from '@/shared/ui';
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

  const save = () => {
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
    <Card className="space-y-3 md:max-w-xl" data-e2e="goals:form">
      <h2 className="text-sm font-semibold">Nowy cel oszczędnościowy</h2>
      <Field label="Nazwa">
        <input
          className={inputClass}
          value={name}
          data-e2e="goals:form-name"
          onChange={(e) => setName(e.target.value)}
          placeholder="np. Wakacje"
        />
      </Field>
      <Field label="Kwota docelowa">
        <NumberInput
          value={target}
          data-e2e="goals:form-target"
          onValueChange={setTarget}
        />
      </Field>
      <Field label="Horyzont (miesiące)">
        <NumberInput
          integer
          value={months}
          data-e2e="goals:form-months"
          onValueChange={setMonths}
        />
      </Field>
      <div className="flex gap-2">
        <Button variant="ghost" onClick={onDone}>
          Anuluj
        </Button>
        <Button data-e2e="goals:form-save" onClick={save}>
          Zapisz
        </Button>
      </div>
    </Card>
  );
};

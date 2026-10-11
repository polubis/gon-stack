import { ClearableInput } from '@/shared/ui/clearable';
import { useState, type FormEvent, type ReactNode } from 'react';
import { categoryLabel } from '@/shared/i18n/category-label';
import { Trash2 } from 'lucide-react';
import { Button, Field, Input, Select } from '@/shared/ui/controls';
import { NumberInput } from '@/shared/ui/number-input';
import type { Period } from '@/shared/period/period';
import type {
  CategoryId,
  Recurring,
  RecurringInterval,
} from '../domain/models';
import { useContext } from './context';
import { DialogActions } from './detail-dialog';
import { intervalLabel } from './selectors';

const INTERVALS: RecurringInterval[] = ['weekly', 'monthly', 'yearly'];

/** Edits the rule `recurring` (expenses it already made stay); it can also be removed. */
export const RecurringForm = ({
  recurring,
  period,
  onDone,
  onRemove,
  children,
}: {
  recurring: Recurring;
  period: Period;
  onDone: () => void;
  /** Asks to remove the rule; the caller confirms first. */
  onRemove: () => void;
  /** Rendered between the fields and the buttons. */
  children?: ReactNode;
}) => {
  const ctx = useContext();
  const categories = ctx.useCategories();
  const [name, setName] = useState(recurring.name);
  const [cost, setCost] = useState(recurring.cost);
  const [frequency, setFrequency] = useState(recurring.interval);
  const [startDate, setStartDate] = useState(recurring.startDate);
  const [endDate, setEndDate] = useState(recurring.endDate ?? '');
  const [method, setMethod] = useState(recurring.paymentMethod);
  const [categoryId, setCategoryId] = useState<CategoryId | null>(
    recurring.categoryId,
  );

  const selected = categories.some((c) => c.id === categoryId)
    ? categoryId
    : categories[0]?.id;

  const save = (event: FormEvent) => {
    event.preventDefault();
    if (!selected) return;
    const values = {
      name: name.trim(),
      cost,
      interval: frequency,
      startDate,
      endDate: endDate || null,
      paymentMethod: method.trim(),
      categoryId: selected,
    };
    ctx.updateRecurring({ ...recurring, ...values }, period);
    onDone();
  };

  return (
    <form
      onSubmit={save}
      className="space-y-3"
      data-e2e="dashboard:recurring-form"
    >
      <Field label="Nazwa">
        <ClearableInput
          required
          value={name}
          placeholder="np. Netflix"
          data-e2e="dashboard:recurring-form-name"
          onChange={(e) => setName(e.target.value)}
        />
      </Field>
      <Field label="Koszt płatności">
        <NumberInput
          required
          value={cost}
          data-e2e="dashboard:recurring-form-cost"
          onValueChange={setCost}
        />
      </Field>
      <Field label="Częstotliwość">
        <Select
          value={frequency}
          data-e2e="dashboard:recurring-form-interval"
          onChange={(e) => setFrequency(e.target.value as RecurringInterval)}
        >
          {INTERVALS.map((value) => (
            <option key={value} value={value}>
              {intervalLabel(value)}
            </option>
          ))}
        </Select>
      </Field>
      <Field
        label="Pierwsza płatność"
        hint="Wydatek powstaje dopiero, gdy minie dzień płatności. Wcześniej jest tylko nadchodzący i nie liczy się do podsumowania."
      >
        <Input
          type="date"
          required
          value={startDate}
          data-e2e="dashboard:recurring-form-date"
          onChange={(e) => setStartDate(e.target.value)}
        />
      </Field>
      <Field
        label="Koniec (opcjonalnie)"
        hint="Po tym dniu płatność się nie powtarza. Puste = bez końca."
      >
        <Input
          type="date"
          value={endDate}
          min={startDate}
          data-e2e="dashboard:recurring-form-end"
          onChange={(e) => setEndDate(e.target.value)}
        />
      </Field>
      <Field label="Kategoria">
        <Select
          required
          value={selected ?? ''}
          data-e2e="dashboard:recurring-form-category"
          onChange={(e) => setCategoryId(e.target.value as CategoryId)}
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {categoryLabel(c.name)}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Metoda płatności">
        <ClearableInput
          value={method}
          placeholder="np. Karta"
          data-e2e="dashboard:recurring-form-method"
          onChange={(e) => setMethod(e.target.value)}
        />
      </Field>
      {children}
      <DialogActions
        danger={
          <Button
            variant="danger"
            className="w-auto"
            data-e2e="dashboard:recurring-delete"
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" /> Usuń
          </Button>
        }
      >
        <Button variant="ghost" className="w-auto" onClick={onDone}>
          Anuluj
        </Button>
        <Button
          type="submit"
          className="w-auto"
          data-e2e="dashboard:recurring-form-save"
          disabled={!selected}
        >
          Zapisz zmiany
        </Button>
      </DialogActions>
    </form>
  );
};

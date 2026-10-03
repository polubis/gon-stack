import { useState, type FormEvent } from 'react';
import { categoryLabel } from '@/shared/i18n/category-label';
import { Button, Field, inputClass } from '@/shared/ui/controls';
import { NumberInput } from '@/shared/ui/number-input';
import { fromDateInput, toDateInput } from '../domain/format';
import { newRecurringId } from '../domain/ids';
import type { CategoryId, Month, Recurring } from '../domain/models';
import { useContext } from './context';

/** Creates a recurring expense, or edits `recurring` (history kept, can be removed). */
export const RecurringForm = ({
  recurring,
  month,
  onDone,
}: {
  recurring?: Recurring;
  month: Month;
  onDone: () => void;
}) => {
  const ctx = useContext();
  const categories = ctx.useCategories();
  const [name, setName] = useState(recurring?.name ?? '');
  const [cost, setCost] = useState(recurring?.cost ?? 0);
  const [date, setDate] = useState(
    toDateInput(recurring?.nextPaymentDate ?? new Date().toISOString()),
  );
  const [method, setMethod] = useState(recurring?.paymentMethod ?? '');
  const [categoryId, setCategoryId] = useState<CategoryId | null>(
    recurring?.categoryId ?? null,
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
      nextPaymentDate: fromDateInput(date),
      paymentMethod: method.trim(),
      categoryId: selected,
    };
    if (recurring) {
      ctx.updateRecurring({ ...recurring, ...values }, month);
    } else {
      ctx.createRecurring(
        {
          id: newRecurringId(),
          active: true,
          history: [],
          ...values,
        },
        month,
      );
    }
    onDone();
  };

  const remove = () => {
    if (!recurring) return;
    ctx.removeRecurring(recurring.id, month);
    onDone();
  };

  return (
    <form
      onSubmit={save}
      className="space-y-3"
      data-e2e="dashboard:recurring-form"
    >
      <Field label="Nazwa">
        <input
          className={inputClass}
          required
          value={name}
          placeholder="np. Netflix"
          data-e2e="dashboard:recurring-form-name"
          onChange={(e) => setName(e.target.value)}
        />
      </Field>
      <Field label="Koszt miesięczny">
        <NumberInput
          required
          value={cost}
          data-e2e="dashboard:recurring-form-cost"
          onValueChange={setCost}
        />
      </Field>
      <Field
        label="Pierwsza płatność"
        hint="Co miesiąc w tym dniu naliczamy koszt do wydatków i limitów."
      >
        <input
          type="date"
          className={inputClass}
          required
          value={date}
          data-e2e="dashboard:recurring-form-date"
          onChange={(e) => setDate(e.target.value)}
        />
      </Field>
      <Field label="Kategoria">
        <select
          className={inputClass}
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
        </select>
      </Field>
      <Field label="Metoda płatności">
        <input
          className={inputClass}
          value={method}
          placeholder="np. Karta"
          data-e2e="dashboard:recurring-form-method"
          onChange={(e) => setMethod(e.target.value)}
        />
      </Field>
      <div className="flex gap-2">
        <Button variant="ghost" onClick={onDone}>
          Anuluj
        </Button>
        <Button
          type="submit"
          data-e2e="dashboard:recurring-form-save"
          disabled={!selected}
        >
          Zapisz
        </Button>
      </div>
      {recurring ? (
        <Button
          variant="danger"
          data-e2e="dashboard:recurring-delete"
          onClick={remove}
        >
          Usuń wydatek
        </Button>
      ) : null}
    </form>
  );
};

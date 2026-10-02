import { useState, type FormEvent } from 'react';
import { categoryLabel } from '@/shared/i18n/category-label';
import { Button, Field, inputClass, Toggle } from '@/shared/ui/controls';
import { NumberInput } from '@/shared/ui/number-input';
import { DEFAULT_CATEGORY_LIMIT } from '../configuration/constraints';
import { newLimitId } from '../domain/ids';
import type { CategoryId, CategoryLimit, Delivery } from '../domain/models';
import { categoryOf, withoutLimit } from './selectors';
import { useContext } from './context';

const DELIVERY_OPTIONS: { value: Delivery; label: string }[] = [
  { value: 'push', label: 'Push' },
  { value: 'email', label: 'Email' },
];

/** Creates a category limit, or edits `limit` (category fixed, can be removed). */
export const LimitForm = ({
  limit,
  onDone,
}: {
  limit?: CategoryLimit;
  onDone: () => void;
}) => {
  const ctx = useContext();
  const categories = ctx.useCategories();
  const limits = ctx.useLimits();
  const [categoryId, setCategoryId] = useState<CategoryId | null>(null);
  const [amount, setAmount] = useState(limit?.amount ?? DEFAULT_CATEGORY_LIMIT);
  const [alertAt80, setAlertAt80] = useState(limit?.alertAt80 ?? true);
  const [delivery, setDelivery] = useState<Delivery>(limit?.delivery ?? 'push');

  const available = limit
    ? [categoryOf(categories, limit.categoryId)]
    : withoutLimit(categories, limits);
  const selected = available.some((c) => c.id === categoryId)
    ? categoryId
    : available[0]?.id;

  const save = (event: FormEvent) => {
    event.preventDefault();
    if (limit) {
      ctx.updateLimit({ ...limit, amount, alertAt80, delivery });
    } else if (selected) {
      ctx.createLimit({
        id: newLimitId(),
        scope: 'category',
        categoryId: selected,
        amount,
        alertAt80,
        delivery,
      });
    } else {
      return;
    }
    onDone();
  };

  const remove = () => {
    if (!limit) return;
    ctx.removeLimit(limit.id);
    onDone();
  };

  return (
    <form onSubmit={save} className="space-y-3" data-e2e="dashboard:limit-form">
      <Field label="Kategoria">
        <select
          className={inputClass}
          required
          disabled={Boolean(limit)}
          value={selected ?? ''}
          data-e2e="dashboard:limit-form-category"
          onChange={(e) => setCategoryId(e.target.value as CategoryId)}
        >
          {available.map((c) => (
            <option key={c.id} value={c.id}>
              {categoryLabel(c.name)}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Limit miesięczny">
        <NumberInput
          required
          value={amount}
          data-e2e="dashboard:limit-form-amount"
          onValueChange={setAmount}
        />
      </Field>
      <div className="flex items-center justify-between">
        <span className="text-sm">Ostrzeżenie przy 80%</span>
        <Toggle
          checked={alertAt80}
          onChange={setAlertAt80}
          label="Ostrzeżenie przy 80%"
        />
      </div>
      <fieldset>
        <legend className="mb-1 text-sm font-medium text-ink-soft">
          Powiadomienia
        </legend>
        <div className="flex gap-4 text-sm">
          {DELIVERY_OPTIONS.map((option) => (
            <label key={option.value} className="flex items-center gap-2">
              <input
                type="radio"
                name="delivery"
                className="accent-brand"
                checked={delivery === option.value}
                onChange={() => setDelivery(option.value)}
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="flex gap-2">
        <Button variant="ghost" onClick={onDone}>
          Anuluj
        </Button>
        <Button
          type="submit"
          data-e2e="dashboard:limit-form-save"
          disabled={!selected}
        >
          Zapisz
        </Button>
      </div>
      {limit ? (
        <Button
          variant="danger"
          data-e2e="dashboard:limit-delete"
          onClick={remove}
        >
          Usuń limit
        </Button>
      ) : null}
    </form>
  );
};

import { useState } from 'react';
import { categoryLabel } from '@/shared/i18n/category-label';
import { Button, Field, inputClass, Toggle } from '@/shared/ui/controls';
import { Card } from '@/shared/ui/layout';
import { NumberInput } from '@/shared/ui/number-input';
import { DEFAULT_CATEGORY_LIMIT } from '../configuration/constraints';
import { newLimitId } from '../domain/ids';
import type { CategoryId, Delivery } from '../domain/models';
import { withoutLimit } from './selectors';
import { useContext } from './context';

const DELIVERY_OPTIONS: { value: Delivery; label: string }[] = [
  { value: 'push', label: 'Push' },
  { value: 'email', label: 'Email' },
];

export const NewLimitForm = ({ onDone }: { onDone: () => void }) => {
  const ctx = useContext();
  const categories = ctx.useCategories();
  const limits = ctx.useLimits();
  const [categoryId, setCategoryId] = useState<CategoryId | null>(null);
  const [amount, setAmount] = useState(DEFAULT_CATEGORY_LIMIT);
  const [alertAt80, setAlertAt80] = useState(true);
  const [delivery, setDelivery] = useState<Delivery>('push');

  const selected =
    categoryId ?? withoutLimit(categories, limits)[0]?.id ?? categories[0]?.id;

  const save = () => {
    if (!selected) return;
    ctx.createLimit({
      id: newLimitId(),
      scope: 'category',
      categoryId: selected,
      amount,
      alertAt80,
      delivery,
    });
    onDone();
  };

  return (
    <Card className="space-y-3 md:max-w-xl" data-e2e="limits:form">
      <h2 className="text-sm font-semibold">Nowy limit</h2>
      <Field label="Kategoria">
        <select
          className={inputClass}
          value={selected ?? ''}
          data-e2e="limits:form-category"
          onChange={(e) => setCategoryId(e.target.value as CategoryId)}
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {categoryLabel(c.name)}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Limit miesięczny">
        <NumberInput
          value={amount}
          data-e2e="limits:form-amount"
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
        <Button data-e2e="limits:form-save" onClick={save} disabled={!selected}>
          Zapisz
        </Button>
      </div>
    </Card>
  );
};

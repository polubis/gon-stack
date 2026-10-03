import { useState, type FormEvent } from 'react';
import { Check, LoaderCircle } from 'lucide-react';
import { categoryLabel } from '@/shared/i18n/category-label';
import { APP_ROUTER } from '@/shared/router/routes';
import { Button, Field, inputClass } from '@/shared/ui/controls';
import { Card } from '@/shared/ui/layout';
import { NumberInput } from '@/shared/ui/number-input';
import { fromDateInput, toDateInput } from '../domain/format';
import { newRecurringId } from '../domain/ids';
import type { CategoryId } from '../domain/models';
import { useContext } from './context';

/** Recurring expense: charged every month, counted into expenses and limits. */
export const RecurringForm = () => {
  const ctx = useContext();
  const categories = ctx.useCategories();
  const saving = ctx.useSaving();
  const [name, setName] = useState('');
  const [cost, setCost] = useState(0);
  const [date, setDate] = useState(toDateInput(new Date().toISOString()));
  const [method, setMethod] = useState('');
  const [categoryId, setCategoryId] = useState<CategoryId | null>(null);

  const selected = categories.some((c) => c.id === categoryId)
    ? categoryId
    : categories[0]?.id;

  const save = (event: FormEvent) => {
    event.preventDefault();
    if (!selected || saving) return;
    ctx.createRecurring({
      id: newRecurringId(),
      name: name.trim(),
      cost,
      nextPaymentDate: fromDateInput(date),
      active: true,
      paymentMethod: method.trim(),
      categoryId: selected,
      history: [],
    });
  };

  return (
    <form
      onSubmit={save}
      className="flex flex-1 flex-col"
      data-e2e="expenses-management:recurring-form"
    >
      <div className="flex flex-1 flex-col gap-4">
        {categories.length === 0 ? (
          <Card data-e2e="expenses-management:no-categories" role="status">
            <p className="text-sm text-ink-soft">
              Aby zapisać wydatek, dodaj najpierw kategorię (np. sugerowane).
            </p>
            <a
              href={APP_ROUTER.categories()}
              className="text-sm font-medium underline"
            >
              Dodaj kategorię
            </a>
          </Card>
        ) : null}

        <Card className="max-w-xl space-y-3">
          <p className="text-sm text-ink-soft">
            Naliczany co miesiąc do wydatków i limitów.
          </p>
          <Field label="Nazwa">
            <input
              className={inputClass}
              required
              value={name}
              placeholder="np. Netflix"
              data-e2e="expenses-management:recurring-name"
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <Field label="Koszt miesięczny">
            <NumberInput
              required
              value={cost}
              data-e2e="expenses-management:recurring-cost"
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
              data-e2e="expenses-management:recurring-date"
              onChange={(e) => setDate(e.target.value)}
            />
          </Field>
          <Field label="Kategoria">
            <select
              className={inputClass}
              required
              value={selected ?? ''}
              data-e2e="expenses-management:recurring-category"
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
              data-e2e="expenses-management:recurring-method"
              onChange={(e) => setMethod(e.target.value)}
            />
          </Field>
        </Card>
      </div>

      <div className="sticky bottom-0 -mx-4 mt-4 flex items-center justify-end border-t border-line bg-card px-4 py-3 md:-mx-8 md:px-8 lg:-mx-10 lg:px-10 xl:-mx-16 xl:px-16">
        <Button
          type="submit"
          className="w-auto px-6"
          data-e2e="expenses-management:recurring-save"
          disabled={saving || !selected}
        >
          {saving ? (
            <LoaderCircle
              className="h-4 w-4 animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
          ) : (
            <Check className="h-4 w-4" aria-hidden="true" />
          )}{' '}
          Dodaj wydatek cykliczny
        </Button>
      </div>
    </form>
  );
};
